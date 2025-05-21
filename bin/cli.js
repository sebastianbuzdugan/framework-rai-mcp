#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1] || 3001;
const apiKey = args.find(arg => arg.startsWith('--api-key='))?.split('=')[1];
const help = args.includes('--help') || args.includes('-h');

// Show help message
if (help) {
  console.log(`
Framework-RAI MCP Server

Usage:
  framework-rai-mcp [options]

Options:
  --port=PORT      Specify the port to run the server on (default: 3001)
  --api-key=KEY    Your OpenAI API key (can also be set via OPENAI_API_KEY env variable)
  --help, -h       Show this help message

Example:
  framework-rai-mcp --port=3001 --api-key=sk-your-openai-key
  
Description:
  This command starts the Framework-RAI MCP server, which provides
  responsible AI analysis and documentation tools for your projects.
  
  The server implements the Model Context Protocol (MCP) using JSON-RPC 2.0
  at the /mcp endpoint and can be used by Smithery-compatible clients like Cursor.
  
Available Tools:
  - scanProject: Scan a project for AI components
  - generateSuggestions: Generate responsible AI suggestions
  - analyzeModel: Analyze a model file for potential issues
  - getDocumentation: Get responsible AI documentation
  - updateDocumentation: Update responsible AI documentation
  `);
  process.exit(0);
}

// Get the path to the server script
const serverPath = path.join(__dirname, '..', 'index.js');

// Check if the server script exists
if (!fs.existsSync(serverPath)) {
  console.error(`Error: Server script not found at ${serverPath}`);
  process.exit(1);
}

// Set environment variables
process.env.PORT = port;
if (apiKey) {
  process.env.OPENAI_API_KEY = apiKey;
}

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('\nWARNING: No OpenAI API key provided. Some features will not work.');
  console.warn('Set your API key using --api-key=YOUR_KEY or the OPENAI_API_KEY environment variable.\n');
}

// Start the server
console.log(`Starting Framework-RAI MCP server on port ${port}...`);
console.log(`Server will be available at http://localhost:${port}/mcp`);
console.log('Press Ctrl+C to stop the server');

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

// Handle server exit
server.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nStopping server...');
  server.kill('SIGTERM');
}); 