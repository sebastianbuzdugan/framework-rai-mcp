const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// AI libraries and frameworks to detect
const AI_LIBRARIES = {
  tensorflow: {
    patterns: ['import tensorflow', 'import tf', 'from tensorflow', 'tf.keras'],
    type: 'Deep Learning'
  },
  pytorch: {
    patterns: ['import torch', 'from torch', 'torch.nn'],
    type: 'Deep Learning'
  },
  sklearn: {
    patterns: ['from sklearn', 'import sklearn'],
    type: 'Machine Learning'
  },
  keras: {
    patterns: ['import keras', 'from keras'],
    type: 'Deep Learning'
  },
  huggingface: {
    patterns: ['from transformers', 'import transformers'],
    type: 'NLP'
  },
  openai: {
    patterns: ['import openai', 'from openai'],
    type: 'LLM/API'
  }
};

// Model definition patterns to detect
const MODEL_PATTERNS = {
  'Sequential Model': /model\s*=\s*.*Sequential\(/,
  'Class Model': /class\s+\w+\(.*Model.*\):/,
  'Functional API': /model\s*=\s*.*Model\(/,
  'Transformer': /\w+Transformer|from\s+transformers\s+import/,
  'Scikit-learn Model': /\w+\s*=\s*\w+Classifier\(|\w+\s*=\s*\w+Regressor\(/
};

/**
 * Scan project for AI components
 */
async function scanProject(projectPath) {
  try {
    projectPath = projectPath || process.cwd();
    
    const aiFiles = [];
    const modelFiles = [];
    const trainingFiles = [];
    const dataFiles = [];
    
    // Find Python, JavaScript, and notebook files
    const files = glob.sync('**/*.{py,js,jsx,ts,tsx,ipynb}', {
      cwd: projectPath,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/__pycache__/**'],
      absolute: true
    });
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const fileInfo = {
        path: file,
        name: path.basename(file),
        libraries: [],
        models: []
      };
      
      let isAIFile = false;
      
      // Check for AI libraries
      for (const [library, info] of Object.entries(AI_LIBRARIES)) {
        for (const pattern of info.patterns) {
          if (content.includes(pattern)) {
            fileInfo.libraries.push({
              name: library,
              type: info.type
            });
            isAIFile = true;
            break;
          }
        }
      }
      
      // Check for model patterns
      for (const [modelType, pattern] of Object.entries(MODEL_PATTERNS)) {
        if (pattern.test(content)) {
          fileInfo.models.push(modelType);
          modelFiles.push(file);
          isAIFile = true;
        }
      }
      
      // Check for training code
      if (/fit\(|train\(|\.compile\(/.test(content)) {
        trainingFiles.push(file);
        fileInfo.isTraining = true;
        isAIFile = true;
      }
      
      // Check for data loading/processing
      if (/load_data|read_csv|DataFrame|dataset|dataloader/i.test(content)) {
        dataFiles.push(file);
        fileInfo.isData = true;
      }
      
      if (isAIFile) {
        aiFiles.push(fileInfo);
      }
    }
    
    // Get project metadata
    const metadata = {
      projectName: path.basename(projectPath),
      aiComponents: {
        totalAIFiles: aiFiles.length,
        totalModelFiles: modelFiles.length,
        totalTrainingFiles: trainingFiles.length,
        totalDataFiles: dataFiles.length
      },
      modelTypes: [...new Set(aiFiles.flatMap(file => file.models))]
    };
    
    return {
      aiFiles,
      modelFiles,
      trainingFiles,
      dataFiles,
      summary: metadata
    };
  } catch (error) {
    console.error('Error scanning for AI components:', error);
    throw error;
  }
}

module.exports = {
  scanProject
}; 