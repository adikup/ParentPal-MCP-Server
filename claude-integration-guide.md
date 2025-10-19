# Claude Desktop MCP Configuration

## Step 1: Install Claude Desktop
1. Download Claude Desktop from: https://claude.ai/download
2. Install and launch Claude Desktop

## Step 2: Configure MCP Server
Create a configuration file for Claude Desktop to connect to your MCP server.

## Step 3: MCP Configuration File
Create this file: `~/.config/claude-desktop/mcp_servers.json`

```json
{
  "mcpServers": {
    "parent-pal": {
      "command": "node",
      "args": ["/Users/adigoffer/CursorProject/ParentPal-MCP-Server/parent-pal_server_node/src/server.ts"],
      "env": {
        "FIREBASE_API_KEY": "AIzaSyAWsZzPo4uvUyzgsu-Phq64yHeRRDtTczE"
      }
    }
  }
}
```

## Step 4: Alternative Configuration (if above doesn't work)
Create: `~/.config/claude-desktop/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "parent-pal": {
      "command": "npx",
      "args": ["tsx", "/Users/adigoffer/CursorProject/ParentPal-MCP-Server/parent-pal_server_node/src/server.ts"],
      "env": {
        "FIREBASE_API_KEY": "AIzaSyAWsZzPo4uvUyzgsu-Phq64yHeRRDtTczE"
      }
    }
  }
}
```

## Step 5: Test Connection
1. Restart Claude Desktop
2. Look for "Parent Pal" in Claude's available tools
3. Test with: "Show me my upcoming events"

## Available Tools in Claude:
- `authenticate-user`: Login with email/password
- `fetch-events-by-category`: Get events by type (holiday, birthday, etc.)
- `fetch-events-by-child`: Get events for specific child
- `fetch-nearest-events`: Get upcoming events in next X days

## Example Claude Prompts:
- "Authenticate me with email adi+testii33@gmail.com"
- "Show me all my holiday events"
- "What events do I have in the next 60 days?"
- "Fetch events for my child"
