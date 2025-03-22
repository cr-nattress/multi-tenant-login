#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Running Frontend Error Check Agent...');
  
  try {
    // Compile TypeScript to JavaScript
    await execPromise('npx tsc --esModuleInterop --target ES2020 --module NodeNext --moduleResolution NodeNext frontend-error-check.ts', {
      cwd: __dirname
    });
    
    // Run the compiled JavaScript
    const { stdout, stderr } = await execPromise('node frontend-error-check.js ../../src/frontend', {
      cwd: __dirname
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('Error check complete!');
  } catch (error) {
    console.error('Error running the agent:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
}

main();
