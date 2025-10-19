# Carri MCP Server - Railway Deployment

This is the Carri MCP (Model Context Protocol) server deployed on Railway.

## Environment Variables

Set these in your Railway project settings:

- `FIREBASE_API_KEY`: Your Firebase API key
- `PORT`: Port number (Railway will set this automatically)
- `NODE_ENV`: Set to `production`

## Deployment

This project is configured to deploy automatically on Railway when pushed to the main branch.

## Health Check

The server provides a health check endpoint at `/mcp` for Railway monitoring.

## MCP Tools

This server provides the following MCP tools:
- `authenticate-user`: Authenticate users with Carri
- `fetch-user-events`: Get all user events
- `fetch-nearest-events`: Get upcoming events
- `fetch-events-by-category`: Filter events by type
- And many more event management tools

## Usage with Claude Desktop

Configure Claude Desktop to connect to this remote MCP server using the Railway-provided URL.
