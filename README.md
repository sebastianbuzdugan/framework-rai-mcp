# Framework-RAI MCP Server

A Model Context Protocol (MCP) server for responsible AI development and documentation.

## Features

- **Project Scanning**: Automatically detect AI libraries, model files, and training scripts in your project
- **Responsible AI Suggestions**: Generate suggestions for improving bias mitigation, transparency, privacy, and monitoring
- **Model Analysis**: Analyze model code for potential issues related to bias, documentation, security, and testing
- **Documentation Management**: Create and update responsible AI documentation including checklists and model cards

## Installation

### Using Smithery (Recommended)

If you're using Cursor or another Smithery-compatible client, you can install this package directly:

```bash
npx -y @smithery/cli@latest install framework-rai-mcp --client cursor
```

When prompted by Smithery, you'll need to provide your OpenAI API key to use the AI-powered features.

### Manual Installation

You can also install the package globally:

```bash
npm install -g framework-rai-mcp
```

## Usage

### As a Smithery Plugin

Once installed via Smithery, the Framework-RAI functions will be available directly in your Smithery-compatible client like Cursor. The first time you use a function that requires OpenAI, you'll be prompted to enter your API key.

### As a Command Line Tool

Start the MCP server:

```bash
framework-rai-mcp
```

By default, the server runs on port 3001. You can specify a different port:

```bash
framework-rai-mcp --port=3003
```

### Setting Your OpenAI API Key

The AI-powered features require an OpenAI API key. You can provide it in several ways:

1. **Command line argument**:
   ```bash
   framework-rai-mcp --api-key=sk-your-openai-key
   ```

2. **Environment variable**:
   ```bash
   export OPENAI_API_KEY=sk-your-openai-key
   framework-rai-mcp
   ```

3. **Create a .env file** in your project directory:
   ```
   OPENAI_API_KEY=sk-your-openai-key
   ```

### API Endpoints

The server exposes the following MCP protocol endpoints:

- `GET /mcp/manifest`: Get the MCP manifest with available functions
- `POST /mcp/scan-project`: Scan a project for AI components
- `POST /mcp/generate-suggestions`: Generate responsible AI suggestions (requires OpenAI API key)
- `POST /mcp/analyze-model`: Analyze a model file for potential issues (requires OpenAI API key)
- `POST /mcp/get-documentation`: Get responsible AI documentation
- `POST /mcp/update-documentation`: Update responsible AI documentation

## Environment Variables

- `PORT`: Port number for the server (default: 3001)
- `OPENAI_API_KEY`: Your OpenAI API key (required for suggestions and analysis)

## Requirements

- Node.js 14 or higher
- OpenAI API key (for AI-powered features)

## License

MIT

## Author

Sebastian Buzdugan 