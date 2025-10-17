import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:8001';
const MCP_ENDPOINT = `${SERVER_URL}/mcp/messages`;

// Test user credentials (you'll need to replace these with real Firebase Auth users)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function testMCPServer() {
  console.log('🧪 Testing MCP Server with Firebase Authentication...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await fetch(`${SERVER_URL}/mcp`);
    if (healthCheck.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      return;
    }

    // Test 2: Test authentication tool
    console.log('\n2. Testing authentication...');
    const authRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'authenticate-user',
        arguments: {
          email: TEST_USER.email,
          password: TEST_USER.password
        }
      }
    };

    const authResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authRequest)
    });

    const authResult = await authResponse.json();
    console.log('Authentication result:', JSON.stringify(authResult, null, 2));

    // Test 3: Test get events by category (if we have a user ID)
    if (authResult.result && authResult.result.content) {
      console.log('\n3. Testing get events by category...');
      const eventsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'fetch-events-by-category',
          arguments: {
            category: 'birthday',
            userId: 'test-user-id' // You'll need to replace this with a real user ID
          }
        }
      };

      const eventsResponse = await fetch(MCP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventsRequest)
      });

      const eventsResult = await eventsResponse.json();
      console.log('Events result:', JSON.stringify(eventsResult, null, 2));
    }

    // Test 4: Test get nearest events
    console.log('\n4. Testing get nearest events...');
    const nearestEventsRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'fetch-nearest-events',
        arguments: {
          days: 30,
          userId: 'test-user-id' // You'll need to replace this with a real user ID
        }
      }
    };

    const nearestEventsResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nearestEventsRequest)
    });

    const nearestEventsResult = await nearestEventsResponse.json();
    console.log('Nearest events result:', JSON.stringify(nearestEventsResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testMCPServer();
