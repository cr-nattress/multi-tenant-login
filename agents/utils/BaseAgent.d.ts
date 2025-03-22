import type { Logger } from './logger.js';
/**
 * Base agent class that all agents should extend
 * Provides common functionality like logging
 */
export declare abstract class BaseAgent {
    protected logger: Logger;
    protected name: string;
    /**
     * Constructor for the base agent
     * @param name Name of the agent (used for logging)
     */
    constructor(name: string);
    /**
     * Abstract run method that all agents must implement
     * @param args Command line arguments
     */
    abstract run(args: string[]): Promise<void>;
    /**
     * Get the agent's logger
     * @returns Logger instance
     */
    getLogger(): Logger;
    /**
     * Get the log file path
     * @returns Path to the log file
     */
    getLogFilePath(): string;
}
export default BaseAgent;
