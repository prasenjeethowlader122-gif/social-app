#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const testPatterns = [
  '__tests__',
  '__e2e__',
  '*.test.ts',
  '*.test.tsx',
  '*.test.js',
  '*.test.jsx',
  '*.spec.ts',
  '*.spec.tsx',
  '*.spec.js',
  '*.spec.jsx',
  'jest.config.js',
  'jest.config.ts',
  '.jestrc',
  '.jestrc.js',
  '.jestrc.json',
];

function removeTestFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      // Remove __tests__ and __e2e__ directories
      if (stat.isDirectory() && (file === '__tests__' || file === '__e2e__')) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed directory: ${fullPath}`);
      } else if (stat.isFile()) {
        // Remove test and spec files
        if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/) ||
            file.match(/^jest\.config\.(js|ts)$/) ||
            file === '.jestrc' ||
            file.match(/^\.jestrc\.(js|json)$/)) {
          fs.unlinkSync(fullPath);
          console.log(`Removed file: ${fullPath}`);
        }
      } else if (stat.isDirectory()) {
        // Recurse into subdirectories
        removeTestFiles(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error processing ${dir}:`, error.message);
  }
}

const rootDir = path.join(__dirname, '..');
console.log('Starting test cleanup...');
removeTestFiles(rootDir);
console.log('Test cleanup complete!');
