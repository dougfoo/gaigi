#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get git hash
let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
} catch (error) {
  console.warn('Warning: Could not get git hash');
}

// Get current timestamp
const buildDate = new Date().toISOString();

// Read package.json version
const packageJson = require('../package.json');

// Generate version file
const versionContent = `// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '${packageJson.version}',
  hash: '${gitHash}',
  buildDate: '${buildDate}',
};

export function getVersionString(): string {
  return VERSION.version;
}

export function getFullVersionString(): string {
  const shortHash = VERSION.hash.substring(0, 7);
  return \`\${VERSION.version}-\${shortHash}\`;
}

export function getBuildDate(): string {
  try {
    return new Date(VERSION.buildDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'October 13, 2025';
  }
}
`;

// Write to lib/version.ts
const versionPath = path.join(__dirname, '../lib/version.ts');
fs.writeFileSync(versionPath, versionContent);

console.log('Generated version file:');
console.log(`  Version: ${packageJson.version}`);
console.log(`  Git Hash: ${gitHash.substring(0, 7)}`);
console.log(`  Build Date: ${buildDate}`);
