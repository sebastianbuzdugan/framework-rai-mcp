const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_URL = 'http://localhost:3001';

async function testGenerateSuggestions() {
  try {
    console.log('Testing generateSuggestions function...');
    
    // Create a sample code snippet
    const sampleCode = `
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
    
    const codeSnippets = [
      {
        file: 'model.py',
        content: sampleCode
      }
    ];
    
    const response = await axios.post(`${API_URL}/mcp/generate-suggestions`, {
      codeSnippets
    });
    
    console.log('Suggestions received:');
    console.log('- Bias & Fairness:', response.data.bias_fairness ? response.data.bias_fairness.length : 0, 'suggestions');
    console.log('- Transparency:', response.data.transparency ? response.data.transparency.length : 0, 'suggestions');
    console.log('- Privacy & Security:', response.data.privacy_security ? response.data.privacy_security.length : 0, 'suggestions');
    console.log('- Testing & Monitoring:', response.data.testing_monitoring ? response.data.testing_monitoring.length : 0, 'suggestions');
    
    // Show first suggestion from each category
    if (response.data.bias_fairness && response.data.bias_fairness.length > 0) {
      console.log('\nSample bias & fairness suggestion:', response.data.bias_fairness[0]);
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

testGenerateSuggestions();
