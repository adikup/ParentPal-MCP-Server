# Carri MCP Server

A Model Context Protocol (MCP) server that provides event management tools for the Carri family planning application, allowing users to fetch, view, and create family events through Claude AI.

## Features

- 🔐 **Firebase Authentication** - Real user login with email/password
- 📅 **Event Management** - Fetch events by category, child, or upcoming dates
- ➕ **Event Creation** - Create new family events with optional Google Calendar sync
- 🎨 **Beautiful Widgets** - Interactive React components for Claude AI
- 🔒 **Secure Data Access** - Firebase Firestore integration with proper permissions
- 🤖 **Claude AI Integration** - MCP tools for conversational event management

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

### `create-event`
Create a new family event with title, date, and type.

**Input:**
```json
{
  "userId": "firebase-uid",
  "title": "Emma's Birthday Party",
  "eventDate": "2024-12-25T16:00:00Z",
  "eventType": "birthday",
  "description": "Emma's 5th birthday celebration",
  "childId": "child-id",
  "isRecurring": false,
  "syncToGoogleCalendar": true
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

## Claude AI Integration

1. Configure MCP Server in Claude Desktop
2. Add Server: `./start-mcp.sh` (stdio transport)
3. Test with: "Show me birthday events for my children"

## Working Examples

Here are three example prompts that demonstrate core functionality:

### Example 1: Health Events Query
**Prompt:** "Show me my upcoming health events for the next 30 days"
**Expected Result:** Displays all health-related events (doctor appointments, vaccinations, checkups) for the specified time period.

### Example 2: Child-Specific Events
**Prompt:** "What events do I have scheduled for Emma this month?"
**Expected Result:** Shows all events specifically assigned to Emma, including birthdays, school events, and appointments.

### Example 3: Create New Event
**Prompt:** "Create a birthday party event for Neo on December 15th at 3 PM"
**Expected Result:** Creates a new birthday event in the calendar with the specified details and optionally syncs to Google Calendar.

## Privacy Policy

**Data Collection and Usage:**
- This MCP server connects to your Carri app's Firebase database
- We only access data necessary to perform event management functions
- No conversation data is collected or stored
- All data access requires user authentication
- Events are filtered by user permissions (only parents can access their children's events)

**Data Retention:**
- Event data is stored in Firebase Firestore as per your Carri app settings
- No additional data retention beyond what's in your Carri account
- You can delete events through the Carri app or this MCP server

**Security:**
- All connections use Firebase's secure authentication
- Data is encrypted in transit and at rest
- No personal data is logged or transmitted to third parties

**Contact:** For privacy concerns, email privacy@carri.app

## Contact & Support

**Developer Contact:**
- Email: support@carri.app
- GitHub Issues: [Report bugs or request features](https://github.com/carri-app/carri-mcp-server/issues)

**Support Channels:**
- Technical Issues: support@carri.app
- Privacy Concerns: privacy@carri.app
- General Questions: hello@carri.app

**Response Time:** We typically respond within 24-48 hours during business days.

## Testing Account

**Test Credentials:**
- Email: `test@carri.app`
- Password: `TestPassword123!`
- User ID: `test-user-anthropic-2024`

**Setup Test Data:**
```bash
cd parent-pal_server_node
pnpm run setup:test
```

**Cleanup Test Data:**
```bash
pnpm run cleanup:test
```

**Complete Testing Guide:** See [ANTHROPIC_TESTING_GUIDE.md](./ANTHROPIC_TESTING_GUIDE.md) for detailed testing instructions, sample data, and verification scenarios.

## API Ownership

We verify that we own and control the Firebase API endpoints used by this MCP server:
- Firebase Project: `parent-pal-97ae2` (Carri's official project)
- All endpoints are under our control and maintained by our development team
- Service account keys are securely managed and rotated regularly

## Project Structure

```
Carri-MCP-Server/
├── parent-pal_server_node/          # MCP Server
│   ├── src/
│   │   ├── server-stdio.ts         # Main MCP server (stdio)
│   │   ├── server.ts               # HTTP MCP server
│   │   ├── types.ts                # TypeScript data models
│   │   ├── firebase.ts             # Firebase configuration
│   │   ├── firebaseService.ts      # Firebase data service
│   │   └── mockData.ts             # Mock data for development
│   ├── package.json
│   ├── start-mcp.sh               # MCP startup script
│   └── tsconfig.json
├── assets/                          # Built Widgets
│   ├── carri-events.html
│   ├── carri-events.js
│   └── carri-events.css
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
- All data encrypted in transit and at rest

## Maintenance & Updates

**Current Status:** Actively maintained
**Update Schedule:** Regular updates with Carri app releases
**Issue Response:** Within 24-48 hours during business days
**Breaking Changes:** We provide advance notice for any breaking changes

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please contact:
- Email: support@carri.app
- GitHub Issues: [Report bugs or request features](https://github.com/carri-app/carri-mcp-server/issues)
