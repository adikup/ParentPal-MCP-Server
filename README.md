# Parent Pal MCP Server

A Model Context Protocol (MCP) server that provides event management tools for the Parent Pal application, allowing users to fetch and view their family events through ChatGPT.

## Features

- 🔐 **Firebase Authentication** - Real user login with email/password
- 📅 **Event Management** - Fetch events by category, child, or upcoming dates
- 🎨 **Beautiful Widgets** - Interactive React components for ChatGPT
- 🔒 **Secure Data Access** - Firebase Firestore integration with proper permissions
- 🤖 **ChatGPT Integration** - MCP tools for conversational event management

## Available Tools

### `authenticate-user`
Authenticate user with email and password to access their events.

**Input:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

### `fetch-events-by-category`
Fetch events filtered by category (birthday, health, education, etc.).

**Input:**
```json
{
  "category": "birthday",
  "userId": "firebase-uid"
}
```

### `fetch-events-by-child`
Fetch events for a specific child.

**Input:**
```json
{
  "childId": "child-id",
  "userId": "firebase-uid"
}
```

### `fetch-nearest-events`
Fetch upcoming events within specified days.

**Input:**
```json
{
  "days": 30,
  "userId": "firebase-uid"
}
```

## Quick Start

### 1. Install Dependencies
```bash
cd parent-pal_server_node
pnpm install
```

### 2. Configure Firebase
1. Add your Firebase service account key to `parent-pal_server_node/src/serviceAccountKey.json`
2. Update Firebase configuration in `parent-pal_server_node/src/firebase.ts`

### 3. Start the Server
```bash
cd parent-pal_server_node
pnpm start
```

Server will run on: http://localhost:8001

### 4. Test Authentication
```bash
curl -X POST "http://localhost:8001/mcp/messages?sessionId=test" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "authenticate-user",
      "arguments": {
        "email": "user@example.com",
        "password": "password"
      }
    }
  }'
```

## ChatGPT Integration

1. Open ChatGPT Developer Mode
2. Add MCP Server: `http://localhost:8001`
3. Test with: "Show me birthday events for my children"

## Project Structure

```
ParentPal-MCP-Server/
├── parent-pal_server_node/          # MCP Server
│   ├── src/
│   │   ├── server.ts               # Main MCP server
│   │   ├── types.ts                # TypeScript data models
│   │   ├── firebase.ts             # Firebase configuration
│   │   ├── firebaseService.ts      # Firebase data service
│   │   └── mockData.ts             # Mock data for development
│   ├── package.json
│   └── tsconfig.json
├── parent-pal-events/               # React Widget
│   └── index.jsx                   # Event list component
├── assets/                          # Built Widgets
│   ├── parent-pal-events.html
│   ├── parent-pal-events.js
│   └── parent-pal-events.css
└── README.md
```

## Firebase Setup

### Required Firestore Indexes
Ensure these indexes exist in your Firebase console:

- `events` collection: `parentIds` (array-contains), `eventType` (==), `isDeleted` (==)
- `events` collection: `parentIds` (array-contains), `childId` (==), `isDeleted` (==)
- `events` collection: `parentIds` (array-contains), `eventDate` (>=), `isDeleted` (==)

### Service Account Key
Add your Firebase service account key to `parent-pal_server_node/src/serviceAccountKey.json`:

```json
{
  "type": "service_account",
  "project_id": "parent-pal-97ae2",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "..."
}
```

## Development

### Building Widgets
```bash
# Build the React widget
cd parent-pal-events
# Widget is already built and available in assets/
```

### Testing
```bash
# Test server endpoints
curl http://localhost:8001/mcp

# View widget
open assets/parent-pal-events.html
```

## Security

- User authentication required for all data access
- Events filtered by `parentIds` array (user must be parent)
- Soft-deleted records excluded from queries
- Firebase security rules compliance

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.
