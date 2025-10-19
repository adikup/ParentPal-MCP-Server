#!/usr/bin/env node

const http = require('http');

const MCP_SERVER_URL = 'localhost';
const MCP_PORT = 8001;
const MCP_SSE_PATH = '/mcp';
const MCP_POST_PATH = '/mcp/messages';

console.log('🧪 Carri MCP Server Test Suite');
console.log('================================\n');

// Test 1: Check if MCP server is running
function testServerRunning() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing MCP server connection...');
    
    const req = http.get(`http://${MCP_SERVER_URL}:${MCP_PORT}${MCP_SSE_PATH}`, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ MCP server is running and accessible');
        resolve(true);
      } else {
        console.log(`❌ MCP server responded with status: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`❌ Cannot connect to MCP server: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Connection timeout');
      resolve(false);
    });
  });
}

// Test 2: Test MCP initialization
function testMCPInitialization() {
  return new Promise((resolve) => {
    console.log('\n2️⃣ Testing MCP initialization...');
    
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

    const postData = JSON.stringify(initMessage);
    
    const options = {
      hostname: MCP_SERVER_URL,
      port: MCP_PORT,
      path: `${MCP_POST_PATH}?sessionId=test-session`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ MCP initialization successful');
          console.log('📄 Response:', data.substring(0, 200) + '...');
          resolve(true);
        } else {
          console.log(`❌ MCP initialization failed: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ MCP initialization error: ${error.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Test tools listing
function testToolsListing() {
  return new Promise((resolve) => {
    console.log('\n3️⃣ Testing tools listing...');
    
    const toolsMessage = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };

    const postData = JSON.stringify(toolsMessage);
    
    const options = {
      hostname: MCP_SERVER_URL,
      port: MCP_PORT,
      path: `${MCP_POST_PATH}?sessionId=test-session`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Tools listing successful');
          console.log('📄 Response:', data.substring(0, 300) + '...');
          resolve(true);
        } else {
          console.log(`❌ Tools listing failed: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Tools listing error: ${error.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 4: Test authentication tool
function testAuthenticationTool() {
  return new Promise((resolve) => {
    console.log('\n4️⃣ Testing authentication tool...');
    
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

    const postData = JSON.stringify(authMessage);
    
    const options = {
      hostname: MCP_SERVER_URL,
      port: MCP_PORT,
      path: `${MCP_POST_PATH}?sessionId=test-session`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Authentication tool test successful');
          console.log('📄 Response:', data.substring(0, 300) + '...');
          resolve(true);
        } else {
          console.log(`❌ Authentication tool test failed: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Authentication tool test error: ${error.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  const tests = [
    testServerRunning,
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
