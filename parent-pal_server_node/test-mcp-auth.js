import fetch from 'node-fetch';

async function testFirebaseAuth() {
  const baseUrl = 'http://localhost:8001';
  
  try {
    // Step 1: Get session ID from SSE endpoint
    console.log('🔗 Establishing SSE connection...');
    const sseResponse = await fetch(`${baseUrl}/mcp`);
    const sseText = await sseResponse.text();
    
    // Extract session ID from SSE response
    const sessionIdMatch = sseText.match(/sessionId=([a-f0-9-]+)/);
    if (!sessionIdMatch) {
      throw new Error('Could not extract session ID from SSE response');
    }
    
    const sessionId = sessionIdMatch[1];
    console.log('✅ Session ID:', sessionId);
    
    // Step 2: Test authentication
    console.log('\n🔐 Testing Firebase authentication...');
    const authRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'authenticate-user',
        arguments: {
          email: 'adi+testii33@gmail.com',
          password: 'Neo123456!'
        }
      }
    };
    
    const authResponse = await fetch(`${baseUrl}/mcp/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authRequest)
    });
    
    const authResult = await authResponse.json();
    console.log('📋 Authentication result:', JSON.stringify(authResult, null, 2));
    
    // Step 3: Test getting events (if authentication successful)
    if (authResult.result && authResult.result.content) {
      console.log('\n📅 Testing get events...');
      const eventsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'fetch-events-by-category',
          arguments: {
            category: 'birthday',
            userId: 'test-user-id' // Replace with real user ID from auth response
          }
        }
      };
      
      const eventsResponse = await fetch(`${baseUrl}/mcp/messages?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventsRequest)
      });
      
      const eventsResult = await eventsResponse.json();
      console.log('📋 Events result:', JSON.stringify(eventsResult, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFirebaseAuth();
