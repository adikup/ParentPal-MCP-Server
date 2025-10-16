#!/bin/bash

# Parent Pal MCP Server Setup Script

echo "🚀 Parent Pal MCP Server Setup"
echo "=============================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm is installed"

# Install dependencies
echo "📦 Installing dependencies..."
cd parent-pal_server_node
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check for service account key
if [ ! -f "src/serviceAccountKey.json" ]; then
    echo "⚠️  Firebase service account key not found"
    echo "📝 Please copy your Firebase service account key to:"
    echo "   parent-pal_server_node/src/serviceAccountKey.json"
    echo ""
    echo "💡 You can use the template:"
    echo "   cp src/serviceAccountKey.template.json src/serviceAccountKey.json"
    echo "   # Then edit with your actual Firebase credentials"
    echo ""
else
    echo "✅ Firebase service account key found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   cd parent-pal_server_node"
echo "   pnpm start"
echo ""
echo "🌐 Server will run on: http://localhost:8001"
echo ""
echo "🤖 For ChatGPT integration:"
echo "   1. Open ChatGPT Developer Mode"
echo "   2. Add MCP Server: http://localhost:8001"
echo "   3. Test: 'Show me birthday events for my children'"
