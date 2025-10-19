#!/bin/bash

echo "🧪 Manual Carri MCP Server Testing"
echo "=================================="
echo ""

# Test 1: Check server status
echo "1️⃣ Testing server connection..."
curl -s http://localhost:8001/mcp > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    exit 1
fi

echo ""
echo "2️⃣ Testing MCP initialization..."
curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {"tools": {}},
      "clientInfo": {"name": "test-client", "version": "1.0.0"}
    }
  }' | head -200

echo ""
echo ""
echo "3️⃣ Testing tools listing..."
curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | head -200

echo ""
echo ""
echo "4️⃣ Testing authentication..."
curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "authenticate-user",
      "arguments": {
        "email": "adi+testii33@gmail.com",
        "password": "Neo123456!"
      }
    }
  }' | head -200

echo ""
echo ""
echo "5️⃣ Testing event fetching..."
curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "fetch-nearest-events",
      "arguments": {
        "days": 60,
        "userId": "ambLSTXQYiZNaWYSB6GKR06UyDw1"
      }
    }
  }' | head -200

echo ""
echo ""
echo "🎉 Manual testing complete!"
