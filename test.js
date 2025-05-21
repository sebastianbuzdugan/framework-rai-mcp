const axios = require('axios');
const path = require('path');

const API_URL = 'http://localhost:3002';

// Test scanProject function
async function testScanProject() {
  try {
    console.log('Testing scanProject...');
    const response = await axios.post(`${API_URL}/mcp/scan-project`, {
      projectPath: path.resolve(__dirname, '..')
    });
    console.log('Scan result summary:', response.data.summary);
    return response.data;
  } catch (error) {
    console.error('Error testing scanProject:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Test generateSuggestions function
async function testGenerateSuggestions(scanResults) {
  try {
    console.log('\nTesting generateSuggestions...');
    
    // Use the first AI file from scan results if available
    let codeSnippets = [];
    if (scanResults && scanResults.aiFiles && scanResults.aiFiles.length > 0) {
      const file = scanResults.aiFiles[0];
      console.log(`Using file for suggestions: ${file.path}`);
      codeSnippets = [{ file: file.path }];
    }
    
    const response = await axios.post(`${API_URL}/mcp/generate-suggestions`, {
      projectPath: path.resolve(__dirname, '..'),
      codeSnippets
    });
    console.log('Suggestions:', response.data);
  } catch (error) {
    console.error('Error testing generateSuggestions:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Test analyzeModel function
async function testAnalyzeModel(scanResults) {
  try {
    console.log('\nTesting analyzeModel...');
    
    // Use the first model file from scan results if available
    let modelFile = '';
    if (scanResults && scanResults.modelFiles && scanResults.modelFiles.length > 0) {
      modelFile = scanResults.modelFiles[0];
      console.log(`Using model file: ${modelFile}`);
    } else {
      // Use a sample model code if no model files found
      modelFile = `
class SimpleModel:
  def __init__(self, input_size, hidden_size, output_size):
    self.weights1 = np.random.randn(input_size, hidden_size)
    self.weights2 = np.random.randn(hidden_size, output_size)
    
  def forward(self, X):
    self.hidden = np.dot(X, self.weights1)
    self.output = np.dot(self.hidden, self.weights2)
    return self.output
    
  def train(self, X, y, epochs=1000):
    for i in range(epochs):
      output = self.forward(X)
      error = y - output
      # Simple gradient descent
      self.weights2 += np.dot(self.hidden.T, error)
      self.weights1 += np.dot(X.T, np.dot(error, self.weights2.T))
`;
    }
    
    const response = await axios.post(`${API_URL}/mcp/analyze-model`, {
      modelFile,
      modelType: 'Neural Network'
    });
    console.log('Analysis:', response.data);
  } catch (error) {
    console.error('Error testing analyzeModel:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Test getDocumentation function
async function testGetDocumentation() {
  try {
    console.log('\nTesting getDocumentation...');
    const response = await axios.post(`${API_URL}/mcp/get-documentation`, {
      type: 'checklist',
      projectPath: path.resolve(__dirname, '..')
    });
    console.log('Documentation exists:', response.data.exists);
    if (response.data.exists) {
      console.log('Documentation content (first 100 chars):', response.data.content.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('Error testing getDocumentation:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Test updateDocumentation function
async function testUpdateDocumentation() {
  try {
    console.log('\nTesting updateDocumentation...');
    const content = `# Test Documentation
    
This is a test documentation file created by the MCP server test script.
    
## Responsible AI Checklist
    
- [ ] Fairness assessment
- [ ] Transparency documentation
- [ ] Privacy considerations
- [ ] Security measures
`;
    
    const response = await axios.post(`${API_URL}/mcp/update-documentation`, {
      type: 'checklist',
      content,
      projectPath: path.resolve(__dirname, '..')
    });
    console.log('Update result:', response.data);
  } catch (error) {
    console.error('Error testing updateDocumentation:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run all tests
async function runTests() {
  try {
    // Test manifest endpoint
    console.log('Testing manifest endpoint...');
    const manifestResponse = await axios.get(`${API_URL}/mcp/manifest`);
    console.log('Manifest:', manifestResponse.data);
    
    // Run other tests
    const scanResults = await testScanProject();
    await testGenerateSuggestions(scanResults);
    await testAnalyzeModel(scanResults);
    await testGetDocumentation();
    await testUpdateDocumentation();
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error.message);
  }
}

// Run the tests
runTests(); 