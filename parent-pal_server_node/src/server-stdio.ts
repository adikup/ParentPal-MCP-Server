import { config } from 'dotenv';
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load environment variables
config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
  {
    id: "create-event",
    title: "Create Event",
    templateUri: "ui://widget/carri-events.html",
    invoking: "Creating new event",
    invoked: "Event created successfully",
    html: readWidgetHtml("carri-events"),
    responseText: "Event created successfully",
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

const createEventSchema = {
  type: "object",
  properties: {
    userId: {
      type: "string",
      description: "User ID creating the event",
    },
    title: {
      type: "string",
      description: "Event title",
    },
    eventDate: {
      type: "string",
      description: "Event date and time in ISO format (e.g., '2024-12-25T10:00:00Z')",
    },
    description: {
      type: "string",
      description: "Event description (optional)",
    },
    eventType: {
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
      description: "Type of event",
    },
    childId: {
      type: "string",
      description: "Child ID if this is a child-specific event (optional)",
    },
    isRecurring: {
      type: "boolean",
      description: "Whether this is a recurring event (optional, defaults to false)",
    },
    recurrenceRule: {
      type: "string",
      description: "RRULE for recurring events (optional, e.g., 'FREQ=YEARLY' for yearly)",
    },
    syncToGoogleCalendar: {
      type: "boolean",
      description: "Whether to sync this event to Google Calendar (optional, defaults to false)",
    },
  },
  required: ["userId", "title", "eventDate", "eventType"],
  additionalProperties: false,
} as const;

const tools: Tool[] = [
  {
    name: "authenticate-user",
    description: "Authenticate user with email and password to access their Carri family events and children data.",
    inputSchema: authenticateUserSchema,
    title: "Authenticate User",
    _meta: {
      ...widgetMeta(widgets[0]),
      _readOnlyHint_: "This tool only authenticates users and does not modify any data"
    },
  },
  {
    name: "fetch-events-by-category",
    description: "Fetch family events filtered by category (birthday, health, education, etc.).",
    inputSchema: fetchEventsByCategorySchema,
    title: "Fetch Events by Category",
    _meta: {
      ...widgetMeta(widgets[1]),
      _readOnlyHint_: "This tool only reads and displays events, it does not modify any data"
    },
  },
  {
    name: "fetch-events-by-child",
    description: "Fetch events for a specific child.",
    inputSchema: fetchEventsByChildSchema,
    title: "Fetch Events by Child",
    _meta: {
      ...widgetMeta(widgets[2]),
      _readOnlyHint_: "This tool only reads and displays events, it does not modify any data"
    },
  },
  {
    name: "fetch-nearest-events",
    description: "Fetch upcoming events within specified number of days.",
    inputSchema: fetchNearestEventsSchema,
    title: "Fetch Nearest Events",
    _meta: {
      ...widgetMeta(widgets[3]),
      _readOnlyHint_: "This tool only reads and displays events, it does not modify any data"
    },
  },
  {
    name: "create-event",
    description: "Create a new family event with title, date, and type.",
    inputSchema: createEventSchema,
    title: "Create Event",
    _meta: {
      ...widgetMeta(widgets[4]),
      _destructiveHint_: "This tool creates new events in your calendar and may sync to Google Calendar"
    },
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

async function main() {
  const server = new Server(
    {
      name: "carri-node",
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
      let children: any[] = [];

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
          
          events = await FirebaseEventService.getEventsByCategory(args.category as EventType, args.userId);
          user = await FirebaseEventService.getUserById(args.userId);
          children = await FirebaseEventService.getUserChildren(args.userId);
          break;
        }
        case "fetch-events-by-child": {
          const args = z.object({
            childId: z.string(),
            userId: z.string(),
          }).parse(request.params.arguments ?? {});
          
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
          
          process.stderr.write(`🔍 Fetching nearest events: ${args.days} days for user ${args.userId}\n`);
          events = await FirebaseEventService.getNearestEvents(args.days, args.userId);
          process.stderr.write(`📅 Found ${events.length} events\n`);
          user = await FirebaseEventService.getUserById(args.userId);
          children = await FirebaseEventService.getUserChildren(args.userId);
          process.stderr.write(`👨‍👩‍👧‍👦 Found ${children.length} children\n`);
          break;
        }
        case "create-event": {
          const args = z.object({
            userId: z.string(),
            title: z.string(),
            eventDate: z.string(),
            description: z.string().optional(),
            eventType: z.string(),
            childId: z.string().optional(),
            isRecurring: z.boolean().optional(),
            recurrenceRule: z.string().optional(),
            syncToGoogleCalendar: z.boolean().optional(),
          }).parse(request.params.arguments ?? {});
          
          process.stderr.write(`📝 Creating event: ${args.title} for user ${args.userId}\n`);
          
          // Parse the event date
          const eventDate = new Date(args.eventDate);
          if (isNaN(eventDate.getTime())) {
            throw new Error(`Invalid event date format: ${args.eventDate}. Please use ISO format (e.g., '2024-12-25T10:00:00Z')`);
          }
          
          // Create the event
          const newEvent = await FirebaseEventService.createEvent({
            parentIds: [args.userId],
            title: args.title,
            eventDate: eventDate,
            description: args.description,
            eventType: args.eventType as EventType,
            childId: args.childId,
            isRecurring: args.isRecurring || false,
            recurrenceRule: args.recurrenceRule,
          });
          
          // Try to sync to Google Calendar if requested
          if (args.syncToGoogleCalendar) {
            const syncResult = await FirebaseEventService.syncEventToGoogleCalendar(newEvent.id, args.userId);
            process.stderr.write(`🔄 Google Calendar sync result: ${syncResult.syncStatus}\n`);
          }
          
          events = [newEvent];
          user = await FirebaseEventService.getUserById(args.userId);
          children = await FirebaseEventService.getUserChildren(args.userId);
          
          process.stderr.write(`✅ Event created successfully: ${newEvent.id}\n`);
          break;
        }
        default:
          throw new Error(`Unhandled tool: ${request.params.name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: `${widget.responseText}\n\n${JSON.stringify({
              events,
              child,
              children,
              user,
              authenticatedUser,
              toolName: request.params.name,
            }, null, 2)}`,
          },
        ],
        structuredContent: {
          events,
          child,
          children,
          user,
          authenticatedUser,
          toolName: request.params.name,
        },
        _meta: widgetMeta(widget),
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write("Carri MCP server running on stdio\n");
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});

