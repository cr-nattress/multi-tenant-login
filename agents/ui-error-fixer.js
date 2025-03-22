import { execSync, spawn } from 'child_process';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import puppeteer from 'puppeteer';

// Configuration
const MAX_RUNTIME_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const FRONTEND_URL = 'http://localhost:3001';
const LOGS_DIR = join(process.cwd(), 'agents', 'logs');

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

// Create a log file with timestamp
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const logFile = join(LOGS_DIR, `ui-error-fixer_${timestamp}.log`);
const logStream = createWriteStream(logFile);

// Helper function to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

// Helper function to kill processes on specific ports
function killProcessOnPort(port) {
  try {
    log(`Attempting to kill process on port ${port}...`);
    execSync(`npx kill-port ${port}`, { stdio: 'inherit' });
    log(`Successfully killed process on port ${port}`);
  } catch (error) {
    log(`No process found on port ${port} or failed to kill: ${error.message}`);
  }
}

// Start the frontend server
async function startFrontend() {
  // First, kill any existing process on the frontend port
  killProcessOnPort(3001);
  
  log('Starting frontend server...');
  const frontendProcess = spawn('npm', ['run', 'frontend:dev'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe'
  });

  // Log stdout and stderr
  frontendProcess.stdout.on('data', (data) => {
    log(`Frontend stdout: ${data}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    log(`Frontend stderr: ${data}`);
  });

  // Wait for the server to start
  return new Promise((resolve) => {
    let serverStarted = false;
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && output.includes('http://localhost:3001')) {
        if (!serverStarted) {
          serverStarted = true;
          log('Frontend server started successfully');
          resolve(frontendProcess);
        }
      }
    });

    // If server doesn't start in 30 seconds, resolve anyway
    setTimeout(() => {
      if (!serverStarted) {
        log('Warning: Frontend server might not have started properly, proceeding anyway');
        resolve(frontendProcess);
      }
    }, 30000);
  });
}

// Analyze browser logs and fix errors
async function analyzeBrowserLogs() {
  log('Launching browser to analyze logs...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Collect console logs, errors, and warnings
  const consoleMessages = [];
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    consoleMessages.push({ type, text });
    log(`Browser ${type}: ${text}`);
  });

  // Collect JavaScript errors
  page.on('pageerror', (error) => {
    consoleMessages.push({ type: 'error', text: error.message });
    log(`Browser JS error: ${error.message}`);
  });

  // Navigate to the frontend
  try {
    log(`Navigating to ${FRONTEND_URL}...`);
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    log('Page loaded successfully');
    
    // Wait a bit to collect any async errors
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    log(`Error navigating to page: ${error.message}`);
  }

  await browser.close();
  log('Browser closed');

  return consoleMessages;
}

// Fix identified issues
async function fixIssues(consoleMessages) {
  const errors = consoleMessages.filter(msg => msg.type === 'error');
  const warnings = consoleMessages.filter(msg => msg.type === 'warning');
  
  log(`Found ${errors.length} errors and ${warnings.length} warnings`);
  
  if (errors.length === 0 && warnings.length === 0) {
    log('No issues to fix!');
    return true;
  }
  
  // Group similar errors
  const uniqueErrors = new Map();
  errors.forEach(error => {
    uniqueErrors.set(error.text, (uniqueErrors.get(error.text) || 0) + 1);
  });
  
  log('Unique errors:');
  for (const [errorText, count] of uniqueErrors.entries()) {
    log(`[${count}x] ${errorText}`);
  }
  
  // Implement fixes for common issues
  let fixesApplied = false;
  
  // Check for module import errors
  if (Array.from(uniqueErrors.keys()).some(err => 
      err.includes('Failed to load') || 
      err.includes('Cannot find module') || 
      err.includes('import'))) {
    log('Attempting to fix module import errors...');
    // Run npm install to ensure all dependencies are installed
    try {
      log('Running npm install...');
      execSync('npm install', { cwd: join(process.cwd(), 'src', 'frontend'), stdio: 'inherit' });
      fixesApplied = true;
    } catch (error) {
      log(`Error running npm install: ${error.message}`);
    }
  }
  
  // Check for Tailwind CSS errors
  if (Array.from(uniqueErrors.keys()).some(err => 
      err.includes('tailwind') || 
      err.includes('css'))) {
    log('Attempting to fix Tailwind CSS errors...');
    try {
      log('Rebuilding Tailwind CSS...');
      execSync('npx tailwindcss -i ./src/app.css -o ./src/app.css', 
        { cwd: join(process.cwd(), 'src', 'frontend'), stdio: 'inherit' });
      fixesApplied = true;
    } catch (error) {
      log(`Error rebuilding Tailwind CSS: ${error.message}`);
    }
  }
  
  return fixesApplied;
}

// Main function with timeout
async function main() {
  const startTime = Date.now();
  let iteration = 1;
  let allFixed = false;
  
  log('Starting UI Error Fixer agent...');
  
  try {
    // Install puppeteer if not already installed
    try {
      log('Checking if puppeteer is installed...');
      require.resolve('puppeteer');
      log('Puppeteer is already installed');
    } catch (e) {
      log('Installing puppeteer...');
      execSync('npm install puppeteer', { stdio: 'inherit' });
      log('Puppeteer installed successfully');
    }
    
    // Start the frontend server
    const frontendProcess = await startFrontend();
    
    // Iterate until all issues are fixed or timeout is reached
    while (!allFixed && (Date.now() - startTime) < MAX_RUNTIME_MS) {
      log(`\n--- Iteration ${iteration} ---`);
      
      // Wait for the server to be ready
      log('Waiting for server to be fully ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Analyze browser logs
      const consoleMessages = await analyzeBrowserLogs();
      
      // Fix issues
      const fixesApplied = await fixIssues(consoleMessages);
      
      // Check if we're done
      if (consoleMessages.filter(msg => msg.type === 'error').length === 0) {
        log('All errors have been fixed!');
        allFixed = true;
      } else if (!fixesApplied) {
        log('No fixes could be applied for the remaining errors');
        break;
      }
      
      iteration++;
      
      // Check timeout
      if ((Date.now() - startTime) >= MAX_RUNTIME_MS) {
        log('Timeout reached!');
        break;
      }
    }
    
    // Clean up
    log('Cleaning up...');
    frontendProcess.kill();
    
  } catch (error) {
    log(`Error in main process: ${error.message}`);
    log(error.stack);
  } finally {
    const runtime = (Date.now() - startTime) / 1000;
    log(`\nAgent completed after ${runtime.toFixed(2)} seconds`);
    log(`Log file saved to: ${logFile}`);
    logStream.end();
  }
}

// Run the main function
main();
