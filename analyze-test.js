const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAnalyzeModel() {
  try {
    console.log('Testing analyzeModel function...');
    
    // Sample model code
    const modelCode = `
import numpy as np
from sklearn.linear_model import LogisticRegression

class CreditScoreModel:
    def __init__(self):
        self.model = LogisticRegression()
        
    def train(self, X, y):
        # Train the model on data
        self.model.fit(X, y)
        
    def predict(self, X):
        # Make predictions
        return self.model.predict(X)
        
    def evaluate(self, X, y):
        # Calculate accuracy
        return self.model.score(X, y)
`;
    
    const response = await axios.post(`${API_URL}/mcp/analyze-model`, {
      modelFile: modelCode,
      modelType: 'Credit Scoring Model'
    });
    
    console.log('Analysis received:');
    console.log('- Biases:', response.data.biases ? 'Present' : 'Missing');
    console.log('- Documentation:', response.data.documentation ? 'Present' : 'Missing');
    console.log('- Security & Privacy:', response.data.security_privacy ? 'Present' : 'Missing');
    console.log('- Testing & Validation:', response.data.testing_validation ? 'Present' : 'Missing');
    
    // Show a sample from the analysis
    if (response.data.biases) {
      console.log('\nBiases analysis (excerpt):', response.data.biases.substring(0, 100) + '...');
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

testAnalyzeModel();
