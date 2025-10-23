import { config } from 'dotenv';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

// Load environment variables
config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { EventWidget, EventType } from "./types.js";
import { 
  getEventsByCategory, 
  getEventsByChild, 
  getNearestEvents,
  getChildById,
  getUserById 
} from "./mockData.js";
import { FirebaseEventService, authenticateUser } from "./firebaseService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const ASSETS_DIR = path.resolve(ROOT_DIR, "assets");

function readWidgetHtml(componentName: string): string {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(
      `Widget assets not found. Expected directory ${ASSETS_DIR}. Run "pnpm run build" before starting the server.`
    );
  }

  const directPath = path.join(ASSETS_DIR, `${componentName}.html`);
  let htmlContents: string | null = null;

  if (fs.existsSync(directPath)) {
    htmlContents = fs.readFileSync(directPath, "utf8");
  } else {
    // Try to find files with the component name prefix
    const candidates = fs
      .readdirSync(ASSETS_DIR)
      .filter(
        (file) => file.startsWith(`${componentName}-`) && file.endsWith(".html")
      )
      .sort();
    const fallback = candidates[candidates.length - 1];
    if (fallback) {
      htmlContents = fs.readFileSync(
        path.join(ASSETS_DIR, fallback),
        "utf8"
      );
    }
  }

  if (!htmlContents) {
    throw new Error(
      `Widget HTML for "${componentName}" not found in ${ASSETS_DIR}. Run "pnpm run build" to generate the assets.`
    );
  }

  return htmlContents;
}

function widgetMeta(widget: EventWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const widgets: EventWidget[] = [
  {
    id: "authenticate-user",
    title: "Authenticate User",
    templateUri: "ui://widget/carri-events.html",
    invoking: "Authenticating user",
    invoked: "User authenticated successfully",
    html: readWidgetHtml("carri-events"),
    responseText: "User authentication completed",
  },
  {
    id: "fetch-events-by-category",
    title: "Fetch Events by Category",
    templateUri: "ui://widget/carri-events.html",
    invoking: "Fetching events by category",
    invoked: "Retrieved events by category",
    html: readWidgetHtml("carri-events"),
    responseText: "Retrieved events filtered by category",
  },
  {
    id: "fetch-events-by-child",
    title: "Fetch Events by Child",
    templateUri: "ui://widget/carri-events.html",
    invoking: "Fetching events for child",
    invoked: "Retrieved events for child",
    html: readWidgetHtml("carri-events"),
    responseText: "Retrieved events for specific child",
  },
  {
    id: "fetch-nearest-events",
    title: "Fetch Nearest Events",
    templateUri: "ui://widget/carri-events.html",
    invoking: "Fetching upcoming events",
    invoked: "Retrieved upcoming events",
    html: readWidgetHtml("carri-events"),
    responseText: "Retrieved upcoming events",
  },
];

const widgetsById = new Map<string, EventWidget>();
const widgetsByUri = new Map<string, EventWidget>();

widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

// Tool input schemas
const authenticateUserSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      description: "User email address",
    },
    password: {
      type: "string",
      description: "User password",
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
} as const;

const fetchEventsByCategorySchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: [
        "birthday", "doctor_appointment", "school_event", "vaccination",
        "dental_checkup", "sports_activity", "playdate", "family_event",
        "education", "financial_benefits", "health", "birthday_wish",
        "prep", "baby_photo", "custom", "holiday", "school_pickup",
        "personal", "school_vacation", "school_show", "parent_meeting",
        "after_school", "field_trip", "registration", "registration_deadline",
        "homework", "photo", "wish", "other"
      ],
      description: "Event category to filter by",
    },
    userId: {
      type: "string",
      description: "User ID to fetch events for",
    },
  },
  required: ["category", "userId"],
  additionalProperties: false,
} as const;

const fetchEventsByChildSchema = {
  type: "object",
  properties: {
    childId: {
      type: "string",
      description: "Child ID to fetch events for",
    },
    userId: {
      type: "string",
      description: "User ID to fetch events for",
    },
  },
  required: ["childId", "userId"],
  additionalProperties: false,
} as const;

const fetchNearestEventsSchema = {
  type: "object",
  properties: {
    days: {
      type: "number",
      description: "Number of days ahead to fetch events for",
    },
    userId: {
      type: "string",
      description: "User ID to fetch events for",
    },
  },
  required: ["days", "userId"],
  additionalProperties: false,
} as const;

const tools: Tool[] = [
  {
    name: "authenticate-user",
    description: "Authenticate user with email and password to access their Carri family events and children data. Use this first to establish user session.",
    inputSchema: authenticateUserSchema,
    title: "Authenticate User",
    _meta: widgetMeta(widgets[0]),
  },
  {
    name: "fetch-events-by-category",
    description: "Fetch Carri family events by category. Categories include: birthday, health (doctor visits, vaccinations), education (school events), holiday, baby_photo, photo, birthday_wish, wish, birthday_prep, prep, school_pickup, after_school, financial_benefits, field_trip, school_vacation, school_show, parent_meeting, homework, registration_deadline. Perfect for finding specific types of events like 'health events' or 'birthday events'.",
    inputSchema: fetchEventsByCategorySchema,
    title: "Fetch Events by Category",
    _meta: widgetMeta(widgets[1]),
  },
  {
    name: "fetch-events-by-child",
    description: "Fetch Carri events for a specific child. Use this when user asks about events for a particular child by name or when you need child-specific information.",
    inputSchema: fetchEventsByChildSchema,
    title: "Fetch Events by Child",
    _meta: widgetMeta(widgets[2]),
  },
  {
    name: "fetch-nearest-events",
    description: "Fetch upcoming Carri events within specified number of days. Perfect for questions like 'what events do I have this week/month' or 'what's coming up soon'. Returns events with dates, titles, descriptions, and event types.",
    inputSchema: fetchNearestEventsSchema,
    title: "Fetch Nearest Events",
    _meta: widgetMeta(widgets[3]),
  },
];

const resources: Resource[] = widgets.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

const resourceTemplates: ResourceTemplate[] = widgets.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

function createParentPalServer(): Server {
  const server = new Server(
    {
      name: "parent-pal-node",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: ReadResourceRequest) => {
      const widget = widgetsByUri.get(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: "text/html+skybridge",
            text: widget.html,
            _meta: widgetMeta(widget),
          },
        ],
      };
    }
  );

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      const widget = widgetsById.get(request.params.name);

      if (!widget) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      let events: any[] = [];
      let child: any = null;
      let user: any = null;
      let authenticatedUser: any = null;

      switch (request.params.name) {
        case "authenticate-user": {
          const args = z.object({
            email: z.string(),
            password: z.string(),
          }).parse(request.params.arguments ?? {});
          
          authenticatedUser = await authenticateUser(args.email, args.password);
          if (!authenticatedUser) {
            throw new Error("Authentication failed. Invalid email or password.");
          }
          break;
        }
        case "fetch-events-by-category": {
          const args = z.object({
            category: z.string(),
            userId: z.string(),
          }).parse(request.params.arguments ?? {});
          
          // Use real Firebase data instead of mock data
          events = await FirebaseEventService.getEventsByCategory(args.category as EventType, args.userId);
          user = await FirebaseEventService.getUserById(args.userId);
          // Get children info for context
          const children = await FirebaseEventService.getUserChildren(args.userId);
          break;
        }
        case "fetch-events-by-child": {
          const args = z.object({
            childId: z.string(),
            userId: z.string(),
          }).parse(request.params.arguments ?? {});
          
          // Use real Firebase data instead of mock data
          events = await FirebaseEventService.getEventsByChild(args.childId, args.userId);
          child = await FirebaseEventService.getChildById(args.childId);
          user = await FirebaseEventService.getUserById(args.userId);
          break;
        }
        case "fetch-nearest-events": {
          const args = z.object({
            days: z.number(),
            userId: z.string(),
          }).parse(request.params.arguments ?? {});
          
          // Use real Firebase data instead of mock data
          events = await FirebaseEventService.getNearestEvents(args.days, args.userId);
          user = await FirebaseEventService.getUserById(args.userId);
          // Get children info for context
          const children = await FirebaseEventService.getUserChildren(args.userId);
          break;
        }
        default:
          throw new Error(`Unhandled tool: ${request.params.name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: widget.responseText,
          },
        ],
        structuredContent: {
          events,
          child,
          children: children || [],
          user,
          authenticatedUser,
          toolName: request.params.name,
        },
        _meta: widgetMeta(widget),
      };
    }
  );

  return server;
}

type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

const sessions = new Map<string, SessionRecord>();

const ssePath = "/mcp";
const postPath = "/mcp/messages";

async function handleSSERequest(req: IncomingMessage, res: ServerResponse) {
  // Check if headers are already sent
  if (res.headersSent) {
    process.stderr.write("Headers already sent, cannot create SSE transport\n");
    return;
  }

  try {
    // Don't set headers here - let SSEServerTransport handle them
    const transport = new SSEServerTransport(postPath, res);
    const sessionId = transport.sessionId;

    const server = createParentPalServer();
    sessions.set(sessionId, { server, transport });

    transport.onclose = async () => {
      sessions.delete(sessionId);
    };

    transport.onerror = (error) => {
      process.stderr.write(`SSE transport error: ${error}\n`);
    };

    await server.connect(transport);
  } catch (error) {
    process.stderr.write(`Failed to connect server to transport: ${error}\n`);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end();
    }
  }
}

async function handlePostRequest(req: IncomingMessage, res: ServerResponse) {
  const sessionId = req.url?.split("sessionId=")[1]?.split("&")[0];
  if (!sessionId) {
    res.writeHead(400);
    res.end("Missing sessionId query parameter");
    return;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    res.writeHead(404);
    res.end("Session not found");
    return;
  }

  await session.transport.handlePostMessage(req, res);
}

const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;

const httpServer = createServer(async (req, res) => {
  try {
    if (!req.url) {
      if (!res.headersSent) {
        res.writeHead(400);
        res.end();
      }
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "OPTIONS") {
      // CORS headers for OPTIONS
      if (!res.headersSent) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.writeHead(200);
        res.end();
      }
      return;
    }

    if (req.method === "GET" && url.pathname === ssePath) {
      // Let SSEServerTransport handle the headers
      try {
        await handleSSERequest(req, res);
      } catch (error) {
        process.stderr.write(`SSE request error: ${error}\n`);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end();
        }
      }
      return;
    }

    if (req.method === "POST" && url.pathname === postPath) {
      // CORS headers for POST
      if (!res.headersSent) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      }
      await handlePostRequest(req, res);
      return;
    }

    if (!res.headersSent) {
      res.writeHead(404);
      res.end("Not Found");
    }
  } catch (error) {
    process.stderr.write(`Request handling error: ${error}\n`);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end();
    }
  }
});

httpServer.listen(port, () => {
  process.stderr.write(`Carri MCP server listening on http://localhost:${port}\n`);
  process.stderr.write(`  SSE stream: GET http://localhost:${port}${ssePath}\n`);
  process.stderr.write(
    `  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...\n`
  );
});
