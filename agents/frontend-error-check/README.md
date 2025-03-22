# Frontend Error Check Agent

This tool scans your SvelteKit application for common errors and attempts to fix them automatically.

## Features

The agent checks for:

1. **TypeScript Configuration Issues** - Identifies deprecated options in tsconfig.json
2. **Import Extension Issues** - Finds file extensions in import statements that should be removed
3. **SvelteKit Alias Usage** - Suggests using SvelteKit aliases instead of relative imports
4. **TypeScript Syntax in JS Files** - Identifies TypeScript syntax in JavaScript files
5. **Missing Dependencies** - Finds imports that might be missing from package.json
6. **Svelte Component Issues** - Checks for common issues in Svelte components

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
   npx ts-node frontend-error-check.ts ../../src/frontend
   ```

## Configuration

The agent scans the following file types by default:
- `.svelte` files
- `.ts` files
- `.js` files
- `tsconfig.json`

You can modify the `frontend-error-check.ts` file to add more checks or customize existing ones.

## Automatic Fixes

The agent can automatically fix some issues:

- Removing deprecated TypeScript options
- Removing file extensions from import statements
- Converting JavaScript files with TypeScript syntax to TypeScript files
- Adding `lang="ts"` to Svelte script tags

Other issues will require manual intervention and will be reported in the output.
