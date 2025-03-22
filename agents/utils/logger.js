import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
/**
 * Logger utility for agents
 * @param {string} agentName - Name of the agent (used for log file name)
 * @returns {Logger} - Logger object with log, info, warn, error methods
 */
export function createLogger(agentName) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const logFile = path.join(logsDir, `${agentName}_${timestamp}.log`);
    // Create log file
    fs.writeFileSync(logFile, `=== ${agentName} Log Started at ${new Date().toISOString()} ===\n\n`);
    const logger = {
        /**
         * Log a message with level
         * @param {string} level - Log level (INFO, WARN, ERROR)
         * @param {string} message - Message to log
         * @param {Object} [data] - Optional data to include
         */
        _log(level, message, data) {
            const timestamp = new Date().toISOString();
            let logMessage = `[${timestamp}] [${level}] ${message}`;
            if (data) {
                logMessage += `\n${JSON.stringify(data, null, 2)}`;
            }
            // Write to console
            console.log(logMessage);
            // Write to file
            fs.appendFileSync(logFile, logMessage + '\n');
        },
        /**
         * Log an info message
         * @param {string} message - Message to log
         * @param {Object} [data] - Optional data to include
         */
        info(message, data) {
            this._log('INFO', message, data);
        },
        /**
         * Log a warning message
         * @param {string} message - Message to log
         * @param {Object} [data] - Optional data to include
         */
        warn(message, data) {
            this._log('WARN', message, data);
        },
        /**
         * Log an error message
         * @param {string} message - Message to log
         * @param {Object|Error} [error] - Optional error to include
         */
        error(message, error) {
            if (error instanceof Error) {
                this._log('ERROR', message, {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
            }
            else {
                this._log('ERROR', message, error);
            }
        },
        /**
         * Log a debug message
         * @param {string} message - Message to log
         * @param {Object} [data] - Optional data to include
         */
        debug(message, data) {
            this._log('DEBUG', message, data);
        },
        /**
         * Get the path to the log file
         * @returns {string} - Path to the log file
         */
        getLogFilePath() {
            return logFile;
        }
    };
    return logger;
}
export default createLogger;
