const axios = require('axios');

// Function to test the MCP server
async function testMCPServer() {
  try {
    console.log('Testing MCP server initialize method...');
    
    // Initialize request
    const initResponse = await axios.post('http://localhost:3001/mcp', {
      jsonrpc: '2.0',
      id: '1',
      method: 'initialize',
      params: {
        config: {
          OPENAI_API_KEY: 'test-key'
        }
      }
    });
    
    console.log('Initialize response:', JSON.stringify(initResponse.data, null, 2));
    
    // Get session ID from the response
    const sessionId = initResponse.data.result.session_id;
    
    // Test tools/list
    console.log('\nTesting tools/list method...');
    const toolsResponse = await axios.post('http://localhost:3001/mcp', {
      jsonrpc: '2.0',
      id: '2',
      method: 'tools/list',
      params: {
        session_id: sessionId
      }
    });
    
    console.log('Tools list response:', JSON.stringify(toolsResponse.data, null, 2));
    
    // Test scanProject tool
    console.log('\nTesting scanProject tool...');
    const scanResponse = await axios.post('http://localhost:3001/mcp', {
      jsonrpc: '2.0',
      id: '3',
      method: 'tools/call',
      params: {
        session_id: sessionId,
        tool: 'scanProject',
        parameters: {
          projectPath: '.'
        }
      }
    });
    
    console.log('Scan project response:', JSON.stringify(scanResponse.data, null, 2));
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing MCP server:');
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
  }
}

// Run the test
testMCPServer(); 