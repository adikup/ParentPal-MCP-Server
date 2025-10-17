import { createServer } from 'http';

const port = 8001;

const httpServer = createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/mcp") {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('data: {"type":"connected"}\n\n');
      return;
    }

    if (req.method === "POST" && url.pathname === "/mcp/messages") {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "POST request received" }));
      return;
    }

    res.writeHead(404);
    res.end("Not Found");
  } catch (error) {
    console.error("Request handling error", error);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end();
    }
  }
});

httpServer.listen(port, () => {
  console.log(`Simple test server listening on http://localhost:${port}`);
  console.log(`  SSE stream: GET http://localhost:${port}/mcp`);
  console.log(`  Message post endpoint: POST http://localhost:${port}/mcp/messages`);
});
