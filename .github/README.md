# Parent Pal MCP Server

A Model Context Protocol (MCP) server that provides event management tools for the Parent Pal application, allowing users to fetch and view their family events through ChatGPT.

## 🚀 Features

- **Firebase Authentication** - Real user login with email/password
- **Event Management** - Fetch events by category, child, or upcoming dates  
- **Beautiful Widgets** - Interactive React components for ChatGPT
- **Secure Data Access** - Firebase Firestore integration with proper permissions
- **ChatGPT Integration** - MCP tools for conversational event management

## 🛠️ Available Tools

- `authenticate-user` - Login with email/password
- `fetch-events-by-category` - Filter events by type (birthday, health, etc.)
- `fetch-events-by-child` - Get events for specific child
- `fetch-nearest-events` - Get upcoming events within X days

## ⚡ Quick Start

```bash
cd parent-pal_server_node
pnpm install
pnpm start
```

Server: http://localhost:8001

## 🤖 ChatGPT Integration

1. Open ChatGPT Developer Mode
2. Add MCP Server: `http://localhost:8001`
3. Test: "Show me birthday events for my children"

## 📁 Project Structure

- `parent-pal_server_node/` - MCP Server (Node.js/TypeScript)
- `parent-pal-events/` - React Widget Component
- `assets/` - Built Widget Files

## 🔧 Setup

1. Add Firebase service account key to `parent-pal_server_node/src/serviceAccountKey.json`
2. Configure Firebase in `parent-pal_server_node/src/firebase.ts`
3. Ensure Firestore indexes are created

## 🔒 Security

- User authentication required
- Events filtered by parent permissions
- Soft-deleted records excluded
- Firebase security rules compliance

## 📄 License

MIT License