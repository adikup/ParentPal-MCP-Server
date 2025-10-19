#!/bin/bash

echo "🔍 Verifying Carri MCP Server Setup..."
echo ""

# Check if MCP config file exists
if [ -f ~/.config/claude-desktop/mcp_servers.json ]; then
    echo "✅ MCP configuration file exists"
    echo "📄 Content:"
    cat ~/.config/claude-desktop/mcp_servers.json
    echo ""
else
    echo "❌ MCP configuration file missing"
    exit 1
fi

# Check if server is running
if lsof -i :8001 > /dev/null 2>&1; then
    echo "✅ Carri MCP server is running on port 8001"
else
    echo "❌ Carri MCP server is not running"
    echo "💡 Run: cd parent-pal_server_node && FIREBASE_API_KEY=AIzaSyAWsZzPo4uvUyzgsu-Phq64yHeRRDtTczE pnpm start"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Install Claude Desktop from: https://claude.ai/download"
echo "2. Restart Claude Desktop completely"
echo "3. Look for 'Carri' tools in Claude's interface"
echo "4. Test with: 'Help me authenticate to my Carri account'"
