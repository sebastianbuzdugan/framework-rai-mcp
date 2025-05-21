const axios = require('axios');
const path = require('path');

const API_URL = 'http://localhost:3001';

async function testScanProject() {
  try {
    console.log('Testing scanProject function...');
    const response = await axios.post(`${API_URL}/mcp/scan-project`, {
      projectPath: path.resolve(__dirname, '..')
    });
    
    console.log('Scan result summary:', JSON.stringify(response.data.summary, null, 2));
    console.log('Number of AI files detected:', response.data.aiFiles.length);
    
    if (response.data.aiFiles.length > 0) {
      console.log('First AI file:', response.data.aiFiles[0].path);
    }
    
    console.log('Test successful!');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else {
      console.error('Full error:', error);
    }
  }
}

testScanProject(); 