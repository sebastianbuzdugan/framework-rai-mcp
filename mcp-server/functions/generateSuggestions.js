const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');
const { scanProject } = require('./scanProject');

/**
 * Generate suggestions based on project code
 */
async function generateSuggestions(projectPath, codeSnippets) {
  try {
    // Initialize OpenAI with the current API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    projectPath = projectPath || process.cwd();
    
    // If no code snippets provided, scan project for AI components
    if (!codeSnippets || codeSnippets.length === 0) {
      const aiComponents = await scanProject(projectPath);
      codeSnippets = [];
      
      // Get content from AI files
      for (const file of aiComponents.aiFiles.slice(0, 3)) { // Limit to 3 files to avoid token limits
        try {
          const content = await fs.readFile(file.path, 'utf-8');
          codeSnippets.push({
            file: file.path,
            content: content.slice(0, 1500) // Limit content size
          });
        } catch (error) {
          console.warn(`Error reading file ${file.path}:`, error);
        }
      }
    }
    
    // Prepare prompt for OpenAI
    const prompt = `
      I'm analyzing an AI project and need suggestions for responsible AI practices.
      Here are code snippets from the project:
      
      ${codeSnippets.map(snippet => `
      FILE: ${path.basename(snippet.file)}
      ---
      ${snippet.content}
      ---
      `).join('\n')}
      
      Based on these code snippets, provide 2-3 specific, actionable suggestions for each of these categories:
      1. Bias & Fairness: How to detect and mitigate potential biases in this specific code
      2. Transparency: How to improve model documentation and explainability for this specific implementation
      3. Privacy & Security: How to enhance data protection and security in this specific context
      4. Testing & Monitoring: How to implement effective monitoring for this specific AI system
      
      Format your response as JSON with these categories as keys and an array of suggestion strings for each.
      Example format:
      {
        "bias_fairness": ["suggestion 1", "suggestion 2"],
        "transparency": ["suggestion 1", "suggestion 2"],
        "privacy_security": ["suggestion 1", "suggestion 2"],
        "testing_monitoring": ["suggestion 1", "suggestion 2"]
      }
    `;
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('No OpenAI API key provided. Returning mock suggestions.');
      return {
        bias_fairness: ["Mock suggestion: Consider implementing bias detection methods", "Mock suggestion: Ensure diverse training data"],
        transparency: ["Mock suggestion: Add model documentation", "Mock suggestion: Implement explainability features"],
        privacy_security: ["Mock suggestion: Implement data anonymization", "Mock suggestion: Add access controls"],
        testing_monitoring: ["Mock suggestion: Create comprehensive test suite", "Mock suggestion: Implement monitoring dashboard"]
      };
    }
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI expert specializing in responsible AI practices. Provide specific, actionable suggestions based on code analysis." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Parse and return suggestions
    try {
      const suggestions = JSON.parse(response.choices[0].message.content);
      return suggestions;
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return {
        bias_fairness: ["Error generating suggestions"],
        transparency: ["Error generating suggestions"],
        privacy_security: ["Error generating suggestions"],
        testing_monitoring: ["Error generating suggestions"]
      };
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw error;
  }
}

module.exports = {
  generateSuggestions
}; 