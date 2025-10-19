#!/usr/bin/env node

import { spawn } from 'child_process';
import fetch from 'node-fetch';

const MCP_SERVER_URL = 'http://localhost:8001';
const MCP_SSE_PATH = '/mcp';
const MCP_POST_PATH = '/mcp/messages';

console.log('🧪 Carri MCP Server Test Suite');
console.log('================================\n');

// Test 1: Check if MCP server is running
async function testServerRunning() {
  console.log('1️⃣ Testing MCP server connection...');
  try {
    const response = await fetch(`${MCP_SERVER_URL}${MCP_SSE_PATH}`);
    if (response.ok) {
      console.log('✅ MCP server is running and accessible');
      return true;
    } else {
      console.log(`❌ MCP server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to MCP server: ${error.message}`);
    return false;
  }
}

// Test 2: Test SSE connection
async function testSSEConnection() {
  console.log('\n2️⃣ Testing SSE connection...');
  try {
    const response = await fetch(`${MCP_SERVER_URL}${MCP_SSE_PATH}`);
    if (response.ok) {
      console.log('✅ SSE endpoint is accessible');
      return true;
    } else {
      console.log(`❌ SSE endpoint failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ SSE connection failed: ${error.message}`);
    return false;
  }
}

// Test 3: Test MCP initialization
async function testMCPInitialization() {
  console.log('\n3️⃣ Testing MCP initialization...');
  
  const initMessage = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: "carri-test-client",
        version: "1.0.0"
      }
    }
  };

  try {
    const response = await fetch(`${MCP_SERVER_URL}${MCP_POST_PATH}?sessionId=test-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initMessage)
    });

    if (response.ok) {
      const data = await response.text();
      console.log('✅ MCP initialization successful');
      console.log('📄 Response:', data.substring(0, 200) + '...');
      return true;
    } else {
      console.log(`❌ MCP initialization failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ MCP initialization error: ${error.message}`);
    return false;
  }
}

// Test 4: Test tools listing
async function testToolsListing() {
  console.log('\n4️⃣ Testing tools listing...');
  
  const toolsMessage = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };

  try {
    const response = await fetch(`${MCP_SERVER_URL}${MCP_POST_PATH}?sessionId=test-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolsMessage)
    });

    if (response.ok) {
      const data = await response.text();
      console.log('✅ Tools listing successful');
      console.log('📄 Response:', data.substring(0, 300) + '...');
      return true;
    } else {
      console.log(`❌ Tools listing failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Tools listing error: ${error.message}`);
    return false;
  }
}

// Test 5: Test authentication tool
async function testAuthenticationTool() {
  console.log('\n5️⃣ Testing authentication tool...');
  
  const authMessage = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "authenticate-user",
      arguments: {
        email: "adi+testii33@gmail.com",
        password: "Neo123456!"
      }
    }
  };

  try {
    const response = await fetch(`${MCP_SERVER_URL}${MCP_POST_PATH}?sessionId=test-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authMessage)
    });

    if (response.ok) {
      const data = await response.text();
      console.log('✅ Authentication tool test successful');
      console.log('📄 Response:', data.substring(0, 300) + '...');
      return true;
    } else {
      console.log(`❌ Authentication tool test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication tool test error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const tests = [
    testServerRunning,
    testSSEConnection,
    testMCPInitialization,
    testToolsListing,
    testAuthenticationTool
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await test();
    if (result) passed++;
  }

  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Your Carri MCP server is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);
