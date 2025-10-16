#!/usr/bin/env node

// Simple test script to test Parent Pal MCP server
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:8001';

async function testMCPServer() {
  try {
    console.log('🚀 Testing Parent Pal MCP Server...\n');

    // Step 1: Establish SSE connection to get session ID
    console.log('1. Establishing SSE connection...');
    const sseResponse = await fetch(`${SERVER_URL}/mcp`);
    
    if (!sseResponse.ok) {
      throw new Error(`SSE connection failed: ${sseResponse.status}`);
    }

    // Read the first few lines to get session ID
    const reader = sseResponse.body.getReader();
    const decoder = new TextDecoder();
    let sessionId = null;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data.includes('sessionId=')) {
              sessionId = data.split('sessionId=')[1];
              console.log(`✅ Session established: ${sessionId}`);
              break;
            }
          }
        }
        
        if (sessionId) break;
      }
    } finally {
      reader.releaseLock();
    }

    if (!sessionId) {
      throw new Error('Could not establish session');
    }

    // Step 2: Test tools/list
    console.log('\n2. Testing tools/list...');
    const toolsResponse = await fetch(`${SERVER_URL}/mcp/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });

    const toolsData = await toolsResponse.json();
    console.log('✅ Available tools:', toolsData.result?.tools?.map(t => t.name));

    // Step 3: Test fetch-events-by-category
    console.log('\n3. Testing fetch-events-by-category...');
    const categoryResponse = await fetch(`${SERVER_URL}/mcp/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'fetch-events-by-category',
          arguments: {
            category: 'birthday',
            userId: 'mock-user-123'
          }
        }
      })
    });

    const categoryData = await categoryResponse.json();
    console.log('✅ Birthday events found:', categoryData.result?.structuredContent?.events?.length || 0);

    // Step 4: Test fetch-events-by-child
    console.log('\n4. Testing fetch-events-by-child...');
    const childResponse = await fetch(`${SERVER_URL}/mcp/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'fetch-events-by-child',
          arguments: {
            childId: 'child-1',
            userId: 'mock-user-123'
          }
        }
      })
    });

    const childData = await childResponse.json();
    console.log('✅ Child events found:', childData.result?.structuredContent?.events?.length || 0);

    // Step 5: Test fetch-nearest-events
    console.log('\n5. Testing fetch-nearest-events...');
    const nearestResponse = await fetch(`${SERVER_URL}/mcp/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'fetch-nearest-events',
          arguments: {
            days: 30,
            userId: 'mock-user-123'
          }
        }
      })
    });

    const nearestData = await nearestResponse.json();
    console.log('✅ Upcoming events found:', nearestData.result?.structuredContent?.events?.length || 0);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Birthday events: ${categoryData.result?.structuredContent?.events?.length || 0}`);
    console.log(`- Child events: ${childData.result?.structuredContent?.events?.length || 0}`);
    console.log(`- Upcoming events: ${nearestData.result?.structuredContent?.events?.length || 0}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMCPServer();
