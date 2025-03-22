import { createLogger } from './logger.js';
import type { Logger } from './logger.js';

/**
 * Base agent class that all agents should extend
 * Provides common functionality like logging
 */
export abstract class BaseAgent {
  protected logger: Logger;
  protected name: string;
  
  /**
   * Constructor for the base agent
   * @param name Name of the agent (used for logging)
   */
  constructor(name: string) {
    this.name = name;
    this.logger = createLogger(name);
    this.logger.info(`Initializing ${name} agent`);
  }
  
  /**
   * Abstract run method that all agents must implement
   * @param args Command line arguments
   */
  abstract run(args: string[]): Promise<void>;
  
  /**
   * Get the agent's logger
   * @returns Logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }
  
  /**
   * Get the log file path
   * @returns Path to the log file
   */
  getLogFilePath(): string {
    return this.logger.getLogFilePath();
  }
}

export default BaseAgent;
