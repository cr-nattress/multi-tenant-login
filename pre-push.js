#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to increment minor version in a package.json file
function incrementMinorVersion(filePath) {
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      console.log(`Incrementing minor version in ${filePath}`);
      
      // Read and parse package.json
      const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const [major, minor, patch] = pkg.version.split('.');
      
      // Increment minor version, reset patch to 0
      pkg.version = `${major}.${parseInt(minor) + 1}.0`;
      
      // Write updated package.json
      fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Updated version to ${pkg.version} in ${filePath}`);
      
      // Stage and commit the modified package.json
      execSync(`git add "${filePath}"`);
      execSync(`git commit -m "chore: increment minor version in ${path.basename(filePath)}" --no-verify`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Get repository root directory
const rootDir = execSync('git rev-parse --show-toplevel').toString().trim();

// Increment version in main package.json
incrementMinorVersion(path.join(rootDir, 'package.json'));

// Increment version in frontend package.json
incrementMinorVersion(path.join(rootDir, 'src', 'frontend', 'package.json'));

// Increment version in backend package.json
incrementMinorVersion(path.join(rootDir, 'src', 'backend', 'package.json'));

// Continue with the push
process.exit(0);
