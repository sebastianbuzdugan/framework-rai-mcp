const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testManifest() {
  try {
    console.log('Testing manifest endpoint...');
    const response = await axios.get(`${API_URL}/mcp/manifest`);
    console.log('Manifest:', response.data);
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

testManifest();
