<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { logger, LogLevel, type LogLevelType, type LogEntry, type LoggerState } from '../services/loggerService';
  
  let loggerState: LoggerState | undefined;
  let unsubscribe: Function | undefined;
  
  // Filter options
  let selectedLevel: LogLevelType | null = null;
  let searchTerm = '';
  
  // Subscribe to logger store
  onMount(() => {
    unsubscribe = logger.subscribe((state: LoggerState) => {
      loggerState = state;
    });
    
    // Add keyboard shortcut (Alt+L) to toggle logger
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'l') {
        logger.toggleVisibility();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
  
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
  
  // Filter logs based on level and search term
  $: filteredLogs = loggerState?.entries.filter((entry: LogEntry) => {
    // Filter by level if selected
    if (selectedLevel && entry.level !== selectedLevel) {
      return false;
    }
    
    // Filter by search term if provided
    if (searchTerm && !entry.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Helper to get the appropriate CSS class for log level
  function getLevelClass(level: LogLevelType): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'bg-red-900 text-red-100';
      case LogLevel.WARN:
        return 'bg-yellow-900 text-yellow-100';
      case LogLevel.INFO:
        return 'bg-blue-900 text-blue-100';
      case LogLevel.DEBUG:
        return 'bg-gray-700 text-gray-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  }
  
  // Format timestamp
  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }
  
  // Toggle logger visibility
  function toggleLogger(): void {
    logger.toggleVisibility();
  }
  
  // Clear all logs
  function clearLogs(): void {
    logger.clear();
  }
  
  // Set filter level
  function setFilterLevel(level: LogLevelType): void {
    selectedLevel = selectedLevel === level ? null : level;
  }
</script>

<!-- Logger toggle button (always visible) -->
<button 
  class="fixed bottom-4 right-4 bg-netflix-dark-gray p-2 rounded-full shadow-lg z-50 hover:bg-netflix-red transition-colors duration-200"
  on:click={toggleLogger}
  title="Toggle Logger (Alt+L)"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
</button>

<!-- Logger panel -->
{#if loggerState?.isVisible}
  <div class="fixed inset-x-0 bottom-0 bg-netflix-black border-t border-gray-700 z-40 shadow-lg max-h-96 flex flex-col">
    <!-- Logger header -->
    <div class="flex justify-between items-center p-2 border-b border-gray-700 bg-netflix-dark-gray">
      <div class="flex items-center space-x-2">
        <h3 class="text-lg font-semibold">Logger</h3>
        <span class="text-xs bg-gray-700 px-2 py-1 rounded">{filteredLogs.length} entries</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Filter buttons -->
        <button 
          class="px-2 py-1 rounded text-xs font-medium {selectedLevel === LogLevel.ERROR ? getLevelClass(LogLevel.ERROR) : 'bg-gray-800 hover:bg-gray-700'}"
          on:click={() => setFilterLevel(LogLevel.ERROR)}
        >
          Errors
        </button>
        <button 
          class="px-2 py-1 rounded text-xs font-medium {selectedLevel === LogLevel.WARN ? getLevelClass(LogLevel.WARN) : 'bg-gray-800 hover:bg-gray-700'}"
          on:click={() => setFilterLevel(LogLevel.WARN)}
        >
          Warnings
        </button>
        <button 
          class="px-2 py-1 rounded text-xs font-medium {selectedLevel === LogLevel.INFO ? getLevelClass(LogLevel.INFO) : 'bg-gray-800 hover:bg-gray-700'}"
          on:click={() => setFilterLevel(LogLevel.INFO)}
        >
          Info
        </button>
        <button 
          class="px-2 py-1 rounded text-xs font-medium {selectedLevel === LogLevel.DEBUG ? getLevelClass(LogLevel.DEBUG) : 'bg-gray-800 hover:bg-gray-700'}"
          on:click={() => setFilterLevel(LogLevel.DEBUG)}
        >
          Debug
        </button>
        
        <!-- Search input -->
        <input 
          type="text" 
          bind:value={searchTerm} 
          placeholder="Search logs..." 
          class="bg-gray-800 text-white px-2 py-1 rounded text-sm w-48"
        />
        
        <!-- Clear button -->
        <button 
          class="px-2 py-1 rounded text-xs font-medium bg-red-800 hover:bg-red-700 text-white"
          on:click={clearLogs}
        >
          Clear
        </button>
        
        <!-- Close button -->
        <button 
          class="p-1 rounded hover:bg-gray-700"
          on:click={toggleLogger}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Logger content -->
    <div class="overflow-y-auto flex-1 font-mono text-sm">
      {#if filteredLogs.length === 0}
        <div class="p-4 text-center text-gray-500">
          No log entries to display.
        </div>
      {:else}
        <table class="w-full">
          <thead class="sticky top-0 bg-netflix-black">
            <tr class="border-b border-gray-700">
              <th class="p-2 text-left w-24">Time</th>
              <th class="p-2 text-left w-20">Level</th>
              <th class="p-2 text-left">Message</th>
              <th class="p-2 text-left w-1/4">Context</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredLogs as entry}
              <tr class="border-b border-gray-800 hover:bg-gray-900">
                <td class="p-2 text-gray-400">{formatTime(entry.timestamp)}</td>
                <td class="p-2">
                  <span class="px-2 py-1 rounded-full text-xs font-medium {getLevelClass(entry.level)}">
                    {entry.level}
                  </span>
                </td>
                <td class="p-2">{entry.message}</td>
                <td class="p-2 text-gray-400">
                  {#if entry.context}
                    <pre class="whitespace-pre-wrap">{JSON.stringify(entry.context, null, 2)}</pre>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
{/if}
