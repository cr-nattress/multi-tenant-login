/**
 * Script to kill processes running on specific ports
 * Usage:
 *   - To kill all processes: node kill-processes.js
 *   - To kill processes on a specific port: node kill-processes.js 3000
 */

const find = require('find-process');
const { exec } = require('child_process');

// Get port from command line arguments
const port = process.argv[2];

// Define ports to kill if no specific port is provided
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 5000;

/**
 * Kill a process by PID
 * @param {number} pid - Process ID to kill
 * @param {string} name - Process name for logging
 */
async function killProcess(pid, name) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const killCommand = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
    
    console.log(`Attempting to kill process: ${name} (PID: ${pid})`);
    
    exec(killCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error killing process ${pid}: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Error output: ${stderr}`);
      }
      
      console.log(`Successfully killed process ${pid}`);
      resolve(stdout);
    });
  });
}

/**
 * Find and kill processes running on a specific port
 * @param {number} portToKill - Port to find and kill processes on
 */
async function findAndKillProcessesByPort(portToKill) {
  try {
    console.log(`Searching for processes on port ${portToKill}...`);
    const processes = await find('port', portToKill);
    
    if (processes.length === 0) {
      console.log(`No processes found running on port ${portToKill}`);
      return;
    }
    
    console.log(`Found ${processes.length} process(es) running on port ${portToKill}`);
    
    for (const proc of processes) {
      try {
        await killProcess(proc.pid, proc.name);
      } catch (err) {
        console.error(`Failed to kill process ${proc.pid}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error(`Error finding processes on port ${portToKill}: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    if (port) {
      // Kill processes on the specific port
      await findAndKillProcessesByPort(parseInt(port, 10));
    } else {
      // Kill processes on all predefined ports
      console.log('Killing all application processes...');
      await findAndKillProcessesByPort(FRONTEND_PORT);
      await findAndKillProcessesByPort(BACKEND_PORT);
    }
    
    console.log('Process cleanup completed.');
  } catch (error) {
    console.error(`Error during process cleanup: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
