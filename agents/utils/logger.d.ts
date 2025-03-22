export interface Logger {
    /**
     * Log an info message
     * @param {string} message - Message to log
     * @param {any} [data] - Optional data to include
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     * @param {string} message - Message to log
     * @param {any} [data] - Optional data to include
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message
     * @param {string} message - Message to log
     * @param {Error|any} [error] - Optional error to include
     */
    error(message: string, error?: Error | any): void;
    /**
     * Log a debug message
     * @param {string} message - Message to log
     * @param {any} [data] - Optional data to include
     */
    debug(message: string, data?: any): void;
    /**
     * Get the path to the log file
     * @returns {string} - Path to the log file
     */
    getLogFilePath(): string;
    /**
     * Internal log method
     * @param {string} level - Log level
     * @param {string} message - Message to log
     * @param {any} [data] - Optional data to include
     */
    _log(level: string, message: string, data?: any): void;
}
/**
 * Logger utility for agents
 * @param {string} agentName - Name of the agent (used for log file name)
 * @returns {Logger} - Logger object with log, info, warn, error methods
 */
export declare function createLogger(agentName: string): Logger;
export default createLogger;
