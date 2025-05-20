const fs = require('fs-extra');
const path = require('path');

// Valid documentation types
const VALID_DOC_TYPES = ['checklist', 'model_card', 'risk_file'];

/**
 * Get specific documentation file
 */
async function getDocumentation(type, projectPath) {
  try {
    projectPath = projectPath || process.cwd();
    
    if (!VALID_DOC_TYPES.includes(type)) {
      throw new Error(`Invalid documentation type: ${type}`);
    }
    
    const fileName = `${type === 'model_card' ? 'model_card' : type}.md`;
    const filePath = path.join(projectPath, fileName);
    
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        exists: true,
        content,
        path: filePath
      };
    } else {
      return {
        exists: false,
        content: '',
        path: filePath
      };
    }
  } catch (error) {
    console.error(`Error getting ${type} documentation:`, error);
    throw error;
  }
}

module.exports = {
  getDocumentation
}; 