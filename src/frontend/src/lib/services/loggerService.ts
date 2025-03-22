import { writable, type Writable } from 'svelte/store';

// Log levels
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
} as const;

// Define types for TypeScript
export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

// Log entry type
export interface LogEntry {
  level: LogLevelType;
  message: string;
  context: any | null;
  timestamp: number;
}

// Logger state type
export interface LoggerState {
  entries: LogEntry[];
  isVisible: boolean;
  maxEntries: number;
  filterLevel: LogLevelType | null;
}

class LogEntryImpl implements LogEntry {
  level: LogLevelType;
  message: string;
  context: any | null;
  timestamp: number;

  constructor(level: LogLevelType, message: string, context: any = null, timestamp = Date.now()) {
    this.level = level;
    this.message = message;
    this.context = context;
    this.timestamp = timestamp;
  }
}

// Define the Logger interface
export interface Logger {
  subscribe: Writable<LoggerState>['subscribe'];
  debug: (message: string, context?: any) => LogEntry;
  info: (message: string, context?: any) => LogEntry;
  warn: (message: string, context?: any) => LogEntry;
  error: (message: string, context?: any) => LogEntry;
  toggleVisibility: () => void;
  show: () => void;
  hide: () => void;
  clear: () => void;
  setFilterLevel: (level: LogLevelType) => void;
  clearFilterLevel: () => void;
  setMaxEntries: (maxEntries: number) => void;
}

// Create the log store
const createLogStore = (): Logger => {
  // Initialize the store with an empty array of log entries
  const store = writable<LoggerState>({
    entries: [],
    isVisible: false,
    maxEntries: 100,
    filterLevel: null
  });
  
  const { subscribe, update } = store;

  // Helper to add a log entry
  const addLogEntry = (level: LogLevelType, message: string, context: any = null): LogEntry => {
    const entry = new LogEntryImpl(level, message, context);
    
    // Log to console as well
    const consoleMethod = level === LogLevel.ERROR ? console.error :
                         level === LogLevel.WARN ? console.warn :
                         level === LogLevel.INFO ? console.info :
                         console.debug;
    
    consoleMethod(`[${level}] ${message}`, context);
    
    update(state => {
      // Add new entry to the beginning of the array
      const newEntries = [entry, ...state.entries];
      
      // Limit the number of entries
      if (newEntries.length > state.maxEntries) {
        newEntries.length = state.maxEntries;
      }
      
      return { ...state, entries: newEntries };
    });
    
    return entry;
  };

  return {
    subscribe,
    
    // Log methods
    debug: (message: string, context?: any) => addLogEntry(LogLevel.DEBUG, message, context),
    info: (message: string, context?: any) => addLogEntry(LogLevel.INFO, message, context),
    warn: (message: string, context?: any) => addLogEntry(LogLevel.WARN, message, context),
    error: (message: string, context?: any) => addLogEntry(LogLevel.ERROR, message, context),
    
    // Toggle logger visibility
    toggleVisibility: () => {
      update(state => ({ ...state, isVisible: !state.isVisible }));
    },
    
    // Show logger
    show: () => {
      update(state => ({ ...state, isVisible: true }));
    },
    
    // Hide logger
    hide: () => {
      update(state => ({ ...state, isVisible: false }));
    },
    
    // Clear all logs
    clear: () => {
      update(state => ({ ...state, entries: [] }));
    },
    
    // Set filter level
    setFilterLevel: (level: LogLevelType) => {
      update(state => ({ ...state, filterLevel: level }));
    },
    
    // Clear filter level
    clearFilterLevel: () => {
      update(state => ({ ...state, filterLevel: null }));
    },
    
    // Set max entries
    setMaxEntries: (maxEntries: number) => {
      update(state => {
        let newEntries = [...state.entries];
        if (newEntries.length > maxEntries) {
          newEntries.length = maxEntries;
        }
        return { ...state, maxEntries, entries: newEntries };
      });
    }
  };
};

// Export the logger as a singleton
export const logger = createLogStore();
