#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration for replacements
const replacements = [
  // Package names
  { from: /@bsky\.app/g, to: '@parallaxa-app' },
  { from: /bsky\.app/g, to: 'parallaxa.app' },
  
  // String references
  { from: /Bluesky/g, to: 'Parallaxa' },
  { from: /bluesky/g, to: 'parallaxa' },
  { from: /"Bluesky"/g, to: '"Parallaxa"' },
  
  // UI text (case sensitive)
  { from: /Blue Sky/g, to: 'Parallaxa' },
  { from: /blue sky/g, to: 'parallaxa' },
  
  // Package identifiers
  { from: /xyz\.blueskyweb/g, to: 'xyz.parallaxa' },
  { from: /xyz\.bluesky/g, to: 'xyz.parallaxa' },
  
  // Domain references
  { from: /staging\.bsky\.app/g, to: 'staging.parallaxa.app' },
  { from: /updates\.bsky\.app/g, to: 'updates.parallaxa.app' },
  { from: /go\.bsky\.app/g, to: 'go.parallaxa.app' },
  
  // App group identifiers
  { from: /group\.app\.bsky/g, to: 'group.app.parallaxa' },
  
  // Organization references
  { from: /blueskysocial/g, to: 'parallaxa-team' },
];

// Files/directories to exclude from processing
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.next/,
  /__tests__/,
  /__e2e__/,
  /\.po$/,  // Translation files
  /\.lock$/,
  /yarn\.lock/,
  /package-lock\.json/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.webp$/,
  /\.mp3$/,
  /\.aiff$/,
  /\.icon$/,
];

// Only process these file extensions
const includeExtensions = [
  '.ts', '.tsx', '.js', '.jsx', '.json',
  '.swift', '.kt', '.gradle', '.podspec',
  '.xml', '.plist', '.go', '.html', '.sh',
];

function shouldProcessFile(filePath) {
  // Check if file matches exclude patterns
  for (const pattern of excludePatterns) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  
  // Check if file has allowed extension
  const ext = path.extname(filePath);
  if (includeExtensions.length > 0 && !includeExtensions.includes(ext)) {
    return false;
  }
  
  return true;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const replacement of replacements) {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    if (error.code !== 'EISDIR') {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    
    if (!shouldProcessFile(filePath)) {
      continue;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else {
      processFile(filePath);
    }
  }
}

// Start processing from project root
const projectRoot = path.resolve(__dirname, '..');
console.log(`Starting Bluesky → Parallaxa rename in: ${projectRoot}\n`);

processDirectory(projectRoot);

console.log('\n✓ Rename complete!');
