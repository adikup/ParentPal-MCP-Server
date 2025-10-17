# 🔥 Firebase Authentication Setup Guide

## Prerequisites
- Firebase project: `parent-pal-97ae2`
- Firebase Console access
- Service account key file

## Step 1: Get Firebase Service Account Key

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `parent-pal-97ae2`
3. **Go to Project Settings** (gear icon in left sidebar)
4. **Click "Service Accounts" tab**
5. **Click "Generate new private key"**
6. **Download the JSON file**
7. **Rename it to**: `serviceAccountKey.json`
8. **Place it in**: `/Users/adigoffer/CursorProject/ParentPal-MCP-Server/parent-pal_server_node/src/`

## Step 2: Set Up Environment Variables

1. **Copy the environment template**:
   ```bash
   cp env.template .env
   ```

2. **Edit `.env` file** with your Firebase API key:
   ```bash
   FIREBASE_API_KEY=AIzaSyAWsZzPo4uvUyzgsu-Phq64yHeRRDtTczE
   PORT=8001
   NODE_ENV=development
   ```

## Step 3: Install Dependencies

```bash
cd /Users/adigoffer/CursorProject/ParentPal-MCP-Server/parent-pal_server_node
pnpm install
```

## Step 4: Test Authentication

### Test with Real User Credentials

1. **Start the server**:
   ```bash
   pnpm start
   ```

2. **Test authentication** with Postman:
   ```bash
   curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/call",
       "params": {
         "name": "authenticate-user",
         "arguments": {
           "email": "your-real-email@example.com",
           "password": "your-real-password"
         }
       }
     }'
   ```

### Expected Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "User authenticated successfully!"
      }
    ],
    "structuredContent": {
      "authenticatedUser": {
        "id": "firebase-uid",
        "displayName": "User Name",
        "email": "user@example.com",
        "parentIds": ["firebase-uid"]
      },
      "toolName": "authenticate-user"
    }
  }
}
```

## Step 5: Test Event Fetching

After successful authentication, test fetching events:

### Fetch Events by Category
```bash
curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "fetch-events-by-category",
      "arguments": {
        "category": "health",
        "userId": "firebase-uid-from-auth"
      }
    }
  }'
```

### Fetch Nearest Events
```bash
curl -X POST http://localhost:8001/mcp/messages?sessionId=test-session \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "fetch-nearest-events",
      "arguments": {
        "days": 7,
        "userId": "firebase-uid-from-auth"
      }
    }
  }'
```

## Troubleshooting

### Common Issues

1. **"Service account key not found"**
   - Ensure `serviceAccountKey.json` is in the correct location
   - Check file permissions

2. **"Authentication failed"**
   - Verify email/password are correct
   - Check Firebase API key in `.env`
   - Ensure user exists in Firebase Auth

3. **"User document not found"**
   - User exists in Firebase Auth but not in Firestore
   - Check Firestore collections structure

4. **"Permission denied"**
   - Service account needs proper Firestore permissions
   - Check Firebase project settings

### Debug Mode

Add debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed logs in the console.

## Security Notes

- **Never commit** `serviceAccountKey.json` to version control
- **Use environment variables** for sensitive data
- **Rotate service account keys** regularly
- **Limit service account permissions** to minimum required

## Next Steps

1. ✅ **Authentication working**
2. ✅ **Event fetching working**
3. 🔄 **Add event creation tools**
4. 🔄 **Add event editing tools**
5. 🔄 **Add event deletion tools**
6. 🔄 **Add user management tools**
