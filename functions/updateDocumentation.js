const fs = require('fs-extra');
const path = require('path');

// Valid documentation types
const VALID_DOC_TYPES = ['checklist', 'model_card', 'risk_file'];

/**
 * Update documentation file
 */
async function updateDocumentation(type, content, projectPath) {
  try {
    projectPath = projectPath || process.cwd();
    
    if (!VALID_DOC_TYPES.includes(type)) {
      throw new Error(`Invalid documentation type: ${type}`);
    }
    
    const fileName = `${type === 'model_card' ? 'model_card' : type}.md`;
    const filePath = path.join(projectPath, fileName);
    
    await fs.writeFile(filePath, content);
    
    return {
      success: true,
      path: filePath
    };
  } catch (error) {
    console.error(`Error updating ${type} documentation:`, error);
    throw error;
  }
}

module.exports = {
  updateDocumentation
}; 