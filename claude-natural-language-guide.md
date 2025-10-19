# 🤖 Claude Desktop Integration Guide - Carri

## 🎯 **Natural Language Examples**

Once Claude Desktop is set up, users can interact naturally with your Carri family management system:

### **Health Events & Doctor Finding**
```
User: "What's my nearest health event?"
Claude: *calls fetch-nearest-events with category=health*
Claude: "You have a vaccination appointment for Neo in 2 weeks. Would you like me to help you find a pediatrician in your area?"

User: "Find me a doctor for my 12-month-old in Tel Aviv"
Claude: *uses child age and city from children data*
Claude: "I found several pediatricians in Tel Aviv specializing in 12-month-old care..."
```

### **Event Management**
```
User: "Show me all my holiday events"
Claude: *calls fetch-events-by-category with category=holiday*
Claude: "You have 67 holiday events coming up, starting with Hanukkah on December 15th..."

User: "What events do I have this month?"
Claude: *calls fetch-nearest-events with days=30*
Claude: "You have no events in the next 30 days, but Hanukkah starts in 59 days..."

User: "What's coming up for my child Neo?"
Claude: *calls fetch-events-by-child with Neo's ID*
Claude: "Neo has a vaccination appointment and a birthday party coming up..."
```

### **Smart Context Awareness**
```
User: "I need to schedule a checkup for my baby"
Claude: *knows child age from children data*
Claude: "For your 12-month-old, I recommend scheduling a well-baby checkup. Based on your location in Tel Aviv, here are some recommended pediatricians..."

User: "What school events are coming up?"
Claude: *calls fetch-events-by-category with category=education*
Claude: "You have parent-teacher meetings and field trips scheduled..."
```

## 🔧 **Setup Instructions**

### **1. Install Claude Desktop**
- Download from: https://claude.ai/download
- Install and launch Claude Desktop

### **2. Configuration is Ready**
The MCP configuration file is already created at:
`~/.config/claude-desktop/mcp_servers.json`

### **3. Restart Claude Desktop**
- Close Claude Desktop completely
- Reopen Claude Desktop
- Look for "Carri" tools in Claude's interface

### **4. Test Natural Language**
Start with: "Help me authenticate to my Carri account"

## 📊 **Available Data Context**

Claude will have access to:
- **User Info**: Email, display name, city, language preference
- **Children Info**: Names, ages, birth dates, photos
- **Events**: Titles, dates, descriptions, categories, child associations
- **Event Types**: Health, education, holidays, birthdays, etc.

## 🎯 **Example User Journey**

1. **Authentication**: "Log me into Carri"
2. **Health Query**: "What health events do I have coming up?"
3. **Doctor Search**: "Find me a pediatrician for my 2-year-old in Jerusalem"
4. **Event Planning**: "What events do I have this month?"
5. **Child-Specific**: "Show me all events for my daughter Sarah"

## 🚀 **Advanced Features**

Claude can help with:
- **Event Planning**: "What's my schedule like next week?"
- **Health Reminders**: "When is my child's next vaccination due?"
- **Location-Based Services**: "Find doctors near me"
- **Age-Appropriate Recommendations**: "What activities are good for my 3-year-old?"
- **Multi-Child Management**: "Show me events for all my children"

## 🔍 **Debugging**

If Claude doesn't see the tools:
1. Check Claude Desktop logs
2. Verify MCP server is running: `pnpm start`
3. Test with web client first: `open mcp-web-client.html`
4. Restart Claude Desktop completely
