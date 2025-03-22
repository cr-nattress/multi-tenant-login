import { createLogger } from './logger.js';
/**
 * Base agent class that all agents should extend
 * Provides common functionality like logging
 */
export class BaseAgent {
    /**
     * Constructor for the base agent
     * @param name Name of the agent (used for logging)
     */
    constructor(name) {
        this.name = name;
        this.logger = createLogger(name);
        this.logger.info(`Initializing ${name} agent`);
    }
    /**
     * Get the agent's logger
     * @returns Logger instance
     */
    getLogger() {
        return this.logger;
    }
    /**
     * Get the log file path
     * @returns Path to the log file
     */
    getLogFilePath() {
        return this.logger.getLogFilePath();
    }
}
export default BaseAgent;
