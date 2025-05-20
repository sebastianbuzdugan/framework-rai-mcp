const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const API_URL = 'http://localhost:3001';
const TEST_DIR = path.join(__dirname, 'test-docs');

async function setupTestDirectory() {
  try {
    // Create test directory if it doesn't exist
    await fs.ensureDir(TEST_DIR);
    console.log(`Created test directory: ${TEST_DIR}`);
  } catch (error) {
    console.error('Error setting up test directory:', error);
  }
}

async function testUpdateDocumentation() {
  try {
    console.log('\nTesting updateDocumentation function...');
    
    const testContent = `# Test Checklist

## Responsible AI Checklist for Testing

This is a test document created by the MCP server test script.

### Fairness Considerations
- [ ] Test item 1
- [ ] Test item 2

### Transparency
- [ ] Test item 3
- [ ] Test item 4

### Last Updated: ${new Date().toISOString()}
`;
    
    const response = await axios.post(`${API_URL}/mcp/update-documentation`, {
      type: 'checklist',
      content: testContent,
      projectPath: TEST_DIR
    });
    
    console.log('Update result:', response.data);
    console.log('Test successful!');
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else {
      console.error('Full error:', error);
    }
  }
}

async function testGetDocumentation() {
  try {
    console.log('\nTesting getDocumentation function...');
    
    const response = await axios.post(`${API_URL}/mcp/get-documentation`, {
      type: 'checklist',
      projectPath: TEST_DIR
    });
    
    console.log('Documentation exists:', response.data.exists);
    if (response.data.exists) {
      console.log('Documentation content (first 100 chars):', 
        response.data.content.substring(0, 100) + '...');
    }
    
    console.log('Test successful!');
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else {
      console.error('Full error:', error);
    }
  }
}

async function cleanupTestDirectory() {
  try {
    // Remove the test directory
    await fs.remove(TEST_DIR);
    console.log(`\nRemoved test directory: ${TEST_DIR}`);
  } catch (error) {
    console.error('Error cleaning up test directory:', error);
  }
}

async function runTests() {
  try {
    await setupTestDirectory();
    
    // First update documentation
    await testUpdateDocumentation();
    
    // Then get the documentation
    await testGetDocumentation();
    
    // Clean up
    await cleanupTestDirectory();
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
