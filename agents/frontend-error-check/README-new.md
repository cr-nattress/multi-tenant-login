# Frontend Error Check Agent

A powerful TypeScript-based utility that scans your SvelteKit application for common frontend errors and automatically fixes them when possible. This agent helps maintain code quality and prevents runtime issues by enforcing best practices in your frontend codebase.

## Features

The agent performs comprehensive checks across your frontend codebase:

1. **TypeScript Configuration Validation**
   - Identifies deprecated options in tsconfig.json (importsNotUsedAsValues, preserveValueImports)
   - Automatically replaces them with modern alternatives (verbatimModuleSyntax)
   - Ensures your TypeScript configuration follows current best practices

2. **Import Statement Optimization**
   - Detects file extensions in import statements that should be removed for TypeScript compatibility
   - Automatically fixes import paths to ensure proper module resolution
   - Prevents common import-related errors in TypeScript projects

3. **SvelteKit Alias Analysis**
   - Identifies relative imports that could use SvelteKit's built-in aliases ($lib, $components, etc.)
   - Suggests more maintainable import patterns using the framework's conventions
   - Improves code organization and reduces refactoring complexity

4. **TypeScript Syntax Detection**
   - Finds JavaScript files containing TypeScript syntax (interfaces, type annotations, etc.)
   - Can automatically create TypeScript versions of these files
   - Ensures proper type checking across your codebase

5. **Dependency Validation**
   - Scans for imports that might be missing from package.json
   - Helps prevent runtime errors from missing dependencies
   - Ensures all required packages are properly declared

6. **Svelte Component Best Practices**
   - Checks for missing TypeScript support in Svelte components
   - Identifies potential reactivity issues with stores
   - Automatically adds `lang="ts"` to script tags when needed
   - Ensures consistent TypeScript usage across components

## Implementation Details

The agent is built with a modular architecture:

- **ErrorCheck Interface**: Each check implements a common interface with check/fix methods
- **Comprehensive Logging**: Detailed logging of all operations with timestamps
- **Automatic Fixes**: Many issues can be fixed automatically without manual intervention
- **Detailed Reporting**: Clear console output with color-coded results
- **Configurable Scanning**: Customizable file patterns for targeted analysis

## Usage

### Windows (PowerShell)

Run the error check agent using the provided PowerShell script:

```powershell
.\agents\frontend-error-check\run-error-check.ps1
```

### Manual Execution

If you prefer to run the agent manually:

1. Navigate to the agent directory:
   ```
   cd agents\frontend-error-check
   ```

2. Install dependencies (first time only):
   ```
   npm install
   ```

3. Run the agent:
   ```
   npx ts-node frontend-error-check.ts [path-to-frontend-directory]
   ```
   
   If no path is provided, it defaults to `./src/frontend`.

## Configuration

The agent scans the following file types by default:
- `.svelte` files - Svelte components
- `.ts` files - TypeScript source files
- `.js` files - JavaScript source files
- `tsconfig.json` - TypeScript configuration

Excludes:
- `node_modules/**` - Third-party dependencies
- `.svelte-kit/**` - SvelteKit build artifacts

## Automatic Fixes

The agent can automatically fix several common issues:

| Issue | Fix Applied |
|-------|------------|
| Deprecated TypeScript options | Removes outdated options and adds `verbatimModuleSyntax: true` |
| File extensions in imports | Removes extensions for proper TypeScript module resolution |
| TypeScript syntax in JS files | Creates TypeScript (.ts) versions of the files |
| Missing `lang="ts"` in Svelte components | Adds the attribute to script tags |

Other detected issues will be reported in the output for manual resolution.

## Logs

Detailed logs are written to the `agents/logs` directory with timestamps for traceability. The log file path is displayed at the end of each run.

## Extending the Agent

You can add new checks by:

1. Creating a new method in the `FrontendErrorCheckAgent` class that returns an `ErrorCheck` object
2. Adding your check to the `errorChecks` array in the constructor
3. Implementing the `check` method and optionally a `fix` method

## Benefits

- **Improved Code Quality**: Enforces consistent patterns and best practices
- **Reduced Runtime Errors**: Catches potential issues before they cause problems
- **Faster Onboarding**: Helps new developers follow project conventions
- **Automated Maintenance**: Reduces manual work for common code fixes
- **TypeScript Compliance**: Ensures proper TypeScript usage throughout the codebase
