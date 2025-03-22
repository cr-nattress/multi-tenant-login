#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to increment patch version in a package.json file
function incrementPatchVersion(filePath) {
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      console.log(`Incrementing patch version in ${filePath}`);
      
      // Read and parse package.json
      const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const [major, minor, patch] = pkg.version.split('.');
      
      // Increment patch version
      pkg.version = `${major}.${minor}.${parseInt(patch) + 1}`;
      
      // Write updated package.json
      fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Updated version to ${pkg.version} in ${filePath}`);
      
      // Stage the modified package.json
      execSync(`git add "${filePath}"`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Get repository root directory
const rootDir = execSync('git rev-parse --show-toplevel').toString().trim();

// Increment version in main package.json
incrementPatchVersion(path.join(rootDir, 'package.json'));

// Increment version in frontend package.json
incrementPatchVersion(path.join(rootDir, 'src', 'frontend', 'package.json'));

// Increment version in backend package.json
incrementPatchVersion(path.join(rootDir, 'src', 'backend', 'package.json'));

// Continue with the commit
process.exit(0);
