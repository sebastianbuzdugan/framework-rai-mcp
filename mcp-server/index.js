const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');

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

// Session storage
const sessions = new Map();

// MCP JSON-RPC endpoint at root path
app.post('/', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body;
  
  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32600,
        message: 'Invalid Request',
        data: 'Expected JSON-RPC 2.0'
      }
    });
  }
  
  console.log(`Received method: ${method}`);
  
  try {
    // Handle different JSON-RPC methods
    switch (method) {
      case 'initialize': {
        // Create a new session
        const sessionId = uuidv4();
        const emitter = new EventEmitter();
        
        // Store session config
        const config = params?.config || {};
        if (config.OPENAI_API_KEY) {
          process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;
        }
        
        sessions.set(sessionId, { 
          config, 
          emitter,
          createdAt: Date.now()
        });
        
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            session_id: sessionId,
            protocolVersion: '0.3',
            serverInfo: {
              name: 'framework-rai-mcp',
              version: '1.0.2',
              vendor: 'Sebastian Buzdugan'
            },
            capabilities: {
              streaming: false
            }
          }
        });
      }
      
      case 'tools/list': {
        const { session_id } = params;
        if (!sessions.has(session_id)) {
          return res.status(400).json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32602,
              message: 'Invalid params',
              data: 'Invalid session_id'
            }
          });
        }
        
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
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
          }
        });
      }
      
      case 'tools/call': {
        const { session_id, tool, parameters } = params;
        if (!sessions.has(session_id)) {
          return res.status(400).json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32602,
              message: 'Invalid params',
              data: 'Invalid session_id'
            }
          });
        }
        
        let result;
        
        switch (tool) {
          case 'scanProject':
            result = await scanProject(parameters.projectPath);
            break;
            
          case 'generateSuggestions':
            result = await generateSuggestions(parameters.projectPath, parameters.codeSnippets);
            break;
            
          case 'analyzeModel':
            result = await analyzeModel(parameters.modelFile, parameters.modelType);
            break;
            
          case 'getDocumentation':
            result = await getDocumentation(parameters.type, parameters.projectPath);
            break;
            
          case 'updateDocumentation':
            result = await updateDocumentation(parameters.type, parameters.content, parameters.projectPath);
            break;
            
          default:
            return res.status(400).json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: 'Method not found',
                data: `Tool '${tool}' not found`
              }
            });
        }
        
        return res.json({
          jsonrpc: '2.0',
          id,
          result
        });
      }
      
      case 'shutdown': {
        const { session_id } = params;
        if (sessions.has(session_id)) {
          sessions.delete(session_id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          id,
          result: null
        });
      }
      
      default:
        return res.status(400).json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Method '${method}' not found`
          }
        });
    }
  } catch (error) {
    console.error(`Error handling method ${method}:`, error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: 'Server error',
        data: error.message
      }
    });
  }
});

// For backward compatibility, keep the /mcp endpoint
app.post('/mcp', (req, res) => {
  // Forward the request to the root endpoint
  req.url = '/';
  app._router.handle(req, res);
});

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    // Remove sessions older than 2 hours
    if (now - session.createdAt > 2 * 60 * 60 * 1000) {
      sessions.delete(sessionId);
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// Start the server
app.listen(PORT, () => {
  console.log(`Framework-RAI MCP server running on port ${PORT}`);
}); 