const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { scanProject } = require('./functions/scanProject');
const { generateSuggestions } = require('./functions/generateSuggestions');
const { analyzeModel } = require('./functions/analyzeModel');
const { getDocumentation } = require('./functions/getDocumentation');
const { updateDocumentation } = require('./functions/updateDocumentation');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Handle Smithery configuration
app.use('/mcp', (req, res, next) => {
  if (req.query.config) {
    try {
      // Decode base64 config
      const configStr = Buffer.from(req.query.config, 'base64').toString();
      const config = JSON.parse(configStr);
      
      // Apply configuration
      if (config.OPENAI_API_KEY) {
        process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;
      }
      
      console.log('Received configuration from Smithery');
    } catch (error) {
      console.error('Error parsing configuration:', error);
    }
  }
  next();
});

// MCP Protocol endpoints
app.post('/mcp/scan-project', async (req, res) => {
  try {
    const { projectPath } = req.body;
    const result = await scanProject(projectPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mcp/generate-suggestions', async (req, res) => {
  try {
    const { projectPath, codeSnippets } = req.body;
    const result = await generateSuggestions(projectPath, codeSnippets);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mcp/analyze-model', async (req, res) => {
  try {
    const { modelFile, modelType } = req.body;
    const result = await analyzeModel(modelFile, modelType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mcp/get-documentation', async (req, res) => {
  try {
    const { type, projectPath } = req.body;
    const result = await getDocumentation(type, projectPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mcp/update-documentation', async (req, res) => {
  try {
    const { type, content, projectPath } = req.body;
    const result = await updateDocumentation(type, content, projectPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP manifest endpoint
app.get('/mcp/manifest', (req, res) => {
  res.json({
    name: 'framework-rai',
    version: '1.0.2',
    description: 'Responsible AI framework for project analysis and documentation',
    functions: [
      {
        name: 'scanProject',
        description: 'Scan project for AI components',
        parameters: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project to scan'
            }
          }
        }
      },
      {
        name: 'generateSuggestions',
        description: 'Generate responsible AI suggestions based on project code',
        parameters: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project'
            },
            codeSnippets: {
              type: 'array',
              description: 'Optional code snippets to analyze',
              items: {
                type: 'object',
                properties: {
                  file: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          }
        }
      },
      {
        name: 'analyzeModel',
        description: 'Analyze a model file for potential issues',
        parameters: {
          type: 'object',
          properties: {
            modelFile: {
              type: 'string',
              description: 'Path to the model file or model content'
            },
            modelType: {
              type: 'string',
              description: 'Type of model (optional)'
            }
          }
        }
      },
      {
        name: 'getDocumentation',
        description: 'Get responsible AI documentation',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Documentation type (checklist, model_card, risk_file)'
            },
            projectPath: {
              type: 'string',
              description: 'Path to the project'
            }
          }
        }
      },
      {
        name: 'updateDocumentation',
        description: 'Update responsible AI documentation',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Documentation type (checklist, model_card, risk_file)'
            },
            content: {
              type: 'string',
              description: 'Documentation content'
            },
            projectPath: {
              type: 'string',
              description: 'Path to the project'
            }
          }
        }
      }
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Framework-RAI MCP server running on port ${PORT}`);
});

// Unified MCP endpoint for Smithery
app.all('/mcp', async (req, res) => {
  try {
    // GET request for manifest
    if (req.method === 'GET') {
      return res.json({
        name: 'framework-rai',
        version: '1.0.2',
        description: 'Responsible AI framework for project analysis and documentation',
        functions: [
          {
            name: 'scanProject',
            description: 'Scan project for AI components',
            parameters: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the project to scan'
                }
              }
            }
          },
          {
            name: 'generateSuggestions',
            description: 'Generate responsible AI suggestions based on project code',
            parameters: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the project'
                },
                codeSnippets: {
                  type: 'array',
                  description: 'Optional code snippets to analyze',
                  items: {
                    type: 'object',
                    properties: {
                      file: { type: 'string' },
                      content: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          {
            name: 'analyzeModel',
            description: 'Analyze a model file for potential issues',
            parameters: {
              type: 'object',
              properties: {
                modelFile: {
                  type: 'string',
                  description: 'Path to the model file or model content'
                },
                modelType: {
                  type: 'string',
                  description: 'Type of model (optional)'
                }
              }
            }
          },
          {
            name: 'getDocumentation',
            description: 'Get responsible AI documentation',
            parameters: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Documentation type (checklist, model_card, risk_file)'
                },
                projectPath: {
                  type: 'string',
                  description: 'Path to the project'
                }
              }
            }
          },
          {
            name: 'updateDocumentation',
            description: 'Update responsible AI documentation',
            parameters: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Documentation type (checklist, model_card, risk_file)'
                },
                content: {
                  type: 'string',
                  description: 'Documentation content'
                },
                projectPath: {
                  type: 'string',
                  description: 'Path to the project'
                }
              }
            }
          }
        ]
      });
    }
    
    // POST request for function calls
    if (req.method === 'POST') {
      const { function: functionName, parameters } = req.body;
      
      switch (functionName) {
        case 'scanProject':
          return res.json(await scanProject(parameters.projectPath));
          
        case 'generateSuggestions':
          return res.json(await generateSuggestions(parameters.projectPath, parameters.codeSnippets));
          
        case 'analyzeModel':
          return res.json(await analyzeModel(parameters.modelFile, parameters.modelType));
          
        case 'getDocumentation':
          return res.json(await getDocumentation(parameters.type, parameters.projectPath));
          
        case 'updateDocumentation':
          return res.json(await updateDocumentation(parameters.type, parameters.content, parameters.projectPath));
          
        default:
          return res.status(400).json({ error: `Unknown function: ${functionName}` });
      }
    }
    
    // Method not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    return res.status(500).json({ error: error.message });
  }
}); 