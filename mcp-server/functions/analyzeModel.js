const fs = require('fs-extra');
const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze model for potential issues
 */
async function analyzeModel(modelFile, modelType) {
  try {
    let fileContent;
    
    if (typeof modelFile === 'string' && await fs.pathExists(modelFile)) {
      fileContent = await fs.readFile(modelFile, 'utf-8');
    } else {
      fileContent = modelFile; // Assume modelFile is the content string
    }
    
    // Limit content size to avoid token limits
    fileContent = fileContent.slice(0, 2500);
    
    // Prepare prompt for OpenAI
    const prompt = `
      Analyze this ${modelType || 'AI'} model code for potential issues:
      
      ${fileContent}
      
      Provide a detailed analysis including:
      1. Potential biases in the model architecture or training approach
      2. Missing documentation or transparency elements
      3. Potential security or privacy concerns
      4. Suggestions for testing and validation
      
      Format your response as JSON with these categories as keys and detailed analysis as values.
      Example format:
      {
        "biases": "Detailed analysis of biases...",
        "documentation": "Analysis of documentation issues...",
        "security_privacy": "Security and privacy concerns...",
        "testing_validation": "Testing and validation suggestions..."
      }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI expert specializing in responsible AI practices. Provide detailed analysis of model code." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Parse and return analysis
    try {
      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return {
        biases: "Error analyzing model",
        documentation: "Error analyzing model",
        security_privacy: "Error analyzing model",
        testing_validation: "Error analyzing model"
      };
    }
  } catch (error) {
    console.error('Error analyzing model:', error);
    throw error;
  }
}

module.exports = {
  analyzeModel
}; 