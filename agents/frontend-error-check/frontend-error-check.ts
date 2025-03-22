#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

// Import the logger
import { createLogger, type Logger } from '../utils/logger.js';

// Create a logger instance for this agent
const logger: Logger = createLogger('frontend-error-check');

interface ErrorCheck {
  name: string;
  description: string;
  check: (content: string, filePath: string) => Promise<{ hasError: boolean; message?: string }>;
  fix?: (content: string, filePath: string) => Promise<{ fixed: boolean; newContent?: string; message?: string }>;
}

interface ErrorResult {
  filePath: string;
  errors: {
    checkName: string;
    message: string;
    fixed: boolean;
    fixMessage: string;
  }[];
}

class FrontendErrorCheckAgent {
  private rootDir: string;
  private errorChecks: ErrorCheck[];
  private results: ErrorResult[] = [];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    logger.info(`Initializing agent with root directory: ${rootDir}`);
    this.errorChecks = [
      this.createTypeScriptConfigCheck(),
      this.createImportExtensionCheck(),
      this.createSvelteKitAliasCheck(),
      this.createTypeScriptSyntaxInJSCheck(),
      this.createMissingDependencyCheck(),
      this.createSvelteComponentCheck()
    ];
    logger.info(`Registered ${this.errorChecks.length} error checks`);
  }

  private createTypeScriptConfigCheck(): ErrorCheck {
    return {
      name: 'TypeScript Config Check',
      description: 'Checks for deprecated options in tsconfig.json',
      check: async (content: string, filePath: string) => {
        if (!filePath.endsWith('tsconfig.json')) {
          return { hasError: false };
        }

        try {
          const config = JSON.parse(content);
          const deprecatedOptions = [];

          if (config.compilerOptions?.importsNotUsedAsValues) {
            deprecatedOptions.push('importsNotUsedAsValues');
          }

          if (config.compilerOptions?.preserveValueImports) {
            deprecatedOptions.push('preserveValueImports');
          }

          if (deprecatedOptions.length > 0) {
            logger.warn(`Found deprecated TypeScript options in ${filePath}`, { deprecatedOptions });
            return {
              hasError: true,
              message: `Deprecated TypeScript options found: ${deprecatedOptions.join(', ')}. These should be replaced with 'verbatimModuleSyntax'.`
            };
          }

          return { hasError: false };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`Error parsing tsconfig.json: ${filePath}`, error);
          return {
            hasError: true,
            message: `Error parsing tsconfig.json: ${errorMessage}`
          };
        }
      },
      fix: async (content: string, filePath: string) => {
        if (!filePath.endsWith('tsconfig.json')) {
          return { fixed: false };
        }

        try {
          const config = JSON.parse(content);
          let modified = false;

          if (config.compilerOptions) {
            if (config.compilerOptions.importsNotUsedAsValues) {
              delete config.compilerOptions.importsNotUsedAsValues;
              modified = true;
            }

            if (config.compilerOptions.preserveValueImports) {
              delete config.compilerOptions.preserveValueImports;
              modified = true;
            }

            if (modified && !config.compilerOptions.verbatimModuleSyntax) {
              config.compilerOptions.verbatimModuleSyntax = true;
            }
          }

          if (modified) {
            logger.info(`Fixed deprecated TypeScript options in ${filePath}`);
            return {
              fixed: true,
              newContent: JSON.stringify(config, null, 2),
              message: 'Removed deprecated TypeScript options and added verbatimModuleSyntax.'
            };
          }

          return { fixed: false };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`Error fixing tsconfig.json: ${filePath}`, error);
          return {
            fixed: false,
            message: `Error fixing tsconfig.json: ${errorMessage}`
          };
        }
      }
    };
  }

  private createImportExtensionCheck(): ErrorCheck {
    return {
      name: 'Import Extension Check',
      description: 'Checks for file extensions in import statements that should be removed',
      check: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
          return { hasError: false };
        }

        const importRegex = /import .* from ['"]([\.\w\/][^'"]*)['"];?/g;
        const matches = [...content.matchAll(importRegex)];

        if (matches.length > 0) {
          logger.warn(`Found ${matches.length} import statements with file extensions in ${filePath}`);
          return {
            hasError: true,
            message: `Found ${matches.length} import statements with file extensions. These should be removed in TypeScript projects.`
          };
        }

        return { hasError: false };
      },
      fix: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
          return { fixed: false };
        }

        const importRegex = /import .* from ['"]([\.\w\/][^'"]*)['"];?/g;
        const matches = [...content.matchAll(importRegex)];

        if (matches.length === 0) {
          return { fixed: false };
        }

        let newContent = content;
        let count = 0;

        for (const match of matches) {
          const fullImport = match[0];
          const importPath = match[1];
          const pathWithoutExtension = importPath.replace(/\.[^/.]+$/, '');
          const newImport = fullImport.replace(importPath, pathWithoutExtension);
          
          newContent = newContent.replace(fullImport, newImport);
          count++;
        }

        logger.info(`Removed file extensions from ${count} import statements in ${filePath}`);
        return {
          fixed: true,
          newContent,
          message: `Removed file extensions from ${count} import statements.`
        };
      }
    };
  }

  private createSvelteKitAliasCheck(): ErrorCheck {
    return {
      name: 'SvelteKit Alias Check',
      description: 'Checks for proper use of SvelteKit aliases ($lib, $components, etc.)',
      check: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
          return { hasError: false };
        }

        const relativeImportRegex = /import .* from ['"]\.\.\/.+['"];?/g;
        const matches = [...content.matchAll(relativeImportRegex)];

        if (matches.length > 0) {
          logger.warn(`Found ${matches.length} relative imports in ${filePath} that could use SvelteKit aliases`);
          return {
            hasError: true,
            message: `Found ${matches.length} relative imports that could potentially use SvelteKit aliases.`
          };
        }

        return { hasError: false };
      }
      // No automatic fix for this as it requires understanding the project structure
    };
  }

  private createTypeScriptSyntaxInJSCheck(): ErrorCheck {
    return {
      name: 'TypeScript Syntax in JS Check',
      description: 'Checks for TypeScript syntax in JavaScript files',
      check: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.js')) {
          return { hasError: false };
        }

        const tsPatterns = [
          /interface\s+\w+\s*\{/,      // interface declarations
          /type\s+\w+\s*=/,           // type aliases
          /:\s*\w+(?:\[\])?\s*[,=)]/,  // type annotations
          /as\s+\w+/,                 // type assertions
          /<\w+>/,                    // generic type parameters
          /\w+\?:/                    // optional properties
        ];

        for (const pattern of tsPatterns) {
          if (pattern.test(content)) {
            logger.warn(`TypeScript syntax found in JavaScript file: ${filePath}`);
            return {
              hasError: true,
              message: 'TypeScript syntax found in JavaScript file. Consider renaming to .ts extension.'
            };
          }
        }

        return { hasError: false };
      },
      fix: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.js')) {
          return { fixed: false };
        }

        const tsPatterns = [
          /interface\s+\w+\s*\{/,      // interface declarations
          /type\s+\w+\s*=/,           // type aliases
          /:\s*\w+(?:\[\])?\s*[,=)]/,  // type annotations
          /as\s+\w+/,                 // type assertions
          /<\w+>/,                    // generic type parameters
          /\w+\?:/                    // optional properties
        ];

        let hasTypeScriptSyntax = false;
        for (const pattern of tsPatterns) {
          if (pattern.test(content)) {
            hasTypeScriptSyntax = true;
            break;
          }
        }

        if (hasTypeScriptSyntax) {
          const tsFilePath = filePath.replace(/\.js$/, '.ts');
          try {
            await fs.access(tsFilePath).catch(() => {
              // If TS file doesn't exist, create it
              return fs.writeFile(tsFilePath, content);
            });

            logger.info(`Created TypeScript version of ${filePath} at ${tsFilePath}`);
            return {
              fixed: true,
              message: `Created TypeScript version at ${tsFilePath}. You should update imports and remove the JS file.`
            };
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error creating TypeScript file for ${filePath}`, error);
            return {
              fixed: false,
              message: `Error creating TypeScript file: ${errorMessage}`
            };
          }
        }

        return { fixed: false };
      }
    };
  }

  private createMissingDependencyCheck(): ErrorCheck {
    return {
      name: 'Missing Dependency Check',
      description: 'Checks for imports of packages that might be missing from package.json',
      check: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
          return { hasError: false };
        }

        try {
          const packageJsonPath = path.join(this.rootDir, 'package.json');
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
          const packageJson = JSON.parse(packageJsonContent);
          
          const allDependencies = {
            ...packageJson.dependencies || {},
            ...packageJson.devDependencies || {}
          };

          const importRegex = /import .* from ['"]([\.\w\/][^'"]*)['"]/g;
          const matches = [...content.matchAll(importRegex)];
          const missingDependencies = [];

          for (const match of matches) {
            const packageName = match[1].split('/')[0];
            if (packageName && !allDependencies[packageName] && !packageName.startsWith('$')) {
              missingDependencies.push(packageName);
            }
          }

          if (missingDependencies.length > 0) {
            logger.warn(`Potentially missing dependencies in ${filePath}`, { missingDependencies });
            return {
              hasError: true,
              message: `Potentially missing dependencies: ${missingDependencies.join(', ')}`
            };
          }

          return { hasError: false };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`Error checking dependencies for ${filePath}`, error);
          return {
            hasError: false,
            message: `Error checking dependencies: ${errorMessage}`
          };
        }
      }
      // No automatic fix as installing dependencies requires user confirmation
    };
  }

  private createSvelteComponentCheck(): ErrorCheck {
    return {
      name: 'Svelte Component Check',
      description: 'Checks for common issues in Svelte components',
      check: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.svelte')) {
          return { hasError: false };
        }

        const issues = [];

        // Check for missing script lang="ts"
        if (content.includes('<script>') && !content.includes('<script lang="ts">')) {
          issues.push('Script tag is missing lang="ts" attribute for TypeScript support.');
        }

        // Check for potential reactivity issues
        const storeImports = content.includes('import { writable') || content.includes('import { readable');
        const storeUsage = /\$\w+/.test(content);
        
        if (storeUsage && !storeImports && !content.includes('import { derived')) {
          issues.push('Component uses store values ($) but may be missing store imports.');
        }

        if (issues.length > 0) {
          logger.warn(`Found Svelte component issues in ${filePath}`, { issues });
          return {
            hasError: true,
            message: issues.join(' ')
          };
        }

        return { hasError: false };
      },
      fix: async (content: string, filePath: string) => {
        if (!filePath.endsWith('.svelte')) {
          return { fixed: false };
        }

        let newContent = content;
        let fixed = false;
        const fixMessages = [];

        // Fix missing script lang="ts"
        if (newContent.includes('<script>') && !newContent.includes('<script lang="ts">')) {
          newContent = newContent.replace('<script>', '<script lang="ts">');
          fixed = true;
          fixMessages.push('Added lang="ts" to script tag');
          logger.info(`Added lang="ts" to script tag in ${filePath}`);
        }

        if (fixed) {
          return {
            fixed: true,
            newContent,
            message: fixMessages.join('. ')
          };
        }

        return { fixed: false };
      }
    };
  }

  async scanFile(filePath: string): Promise<ErrorResult | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const result: ErrorResult = { filePath, errors: [] };

      for (const check of this.errorChecks) {
        const checkResult = await check.check(content, filePath);
        
        if (checkResult.hasError) {
          const errorEntry = {
            checkName: check.name,
            message: checkResult.message || 'Unknown error',
            fixed: false,
            fixMessage: ''
          };

          if (check.fix) {
            const fixResult = await check.fix(content, filePath);
            
            if (fixResult.newContent) {
              await fs.writeFile(filePath, fixResult.newContent);
              errorEntry.fixed = true;
              errorEntry.fixMessage = fixResult.message || 'Fixed automatically';
              logger.info(`Fixed issue in ${filePath}: ${check.name}`);
            } else if (fixResult.fixed) {
              errorEntry.fixed = true;
              errorEntry.fixMessage = fixResult.message || 'Fixed automatically';
              logger.info(`Fixed issue in ${filePath}: ${check.name}`);
            }
          }

          result.errors.push(errorEntry);
        }
      }

      if (result.errors.length > 0) {
        this.results.push(result);
        logger.info(`Found ${result.errors.length} issues in ${filePath}`);
        return result;
      }

      return null;
    } catch (error) {
      logger.error(`Error scanning file ${filePath}:`, error);
      console.error(`Error scanning file ${filePath}:`, error);
      return null;
    }
  }

  async scan(patterns: string[] = ['**/*.svelte', '**/*.ts', '**/*.js', '**/tsconfig.json']): Promise<ErrorResult[]> {
    const files = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: this.rootDir, ignore: ['node_modules/**', '.svelte-kit/**'] });
      files.push(...matches.map(file => path.join(this.rootDir, file)));
    }

    const uniqueFiles = [...new Set(files)];
    let scannedCount = 0;
    
    logger.info(`Starting scan of ${uniqueFiles.length} files`);
    
    for (const file of uniqueFiles) {
      await this.scanFile(file);
      scannedCount++;
      
      if (scannedCount % 10 === 0) {
        logger.info(`Scanned ${scannedCount}/${uniqueFiles.length} files...`);
        console.log(`Scanned ${scannedCount}/${uniqueFiles.length} files...`);
      }
    }

    logger.info(`Scan complete. Found issues in ${this.results.length} files.`);
    return this.results;
  }

  printResults(): void {
    console.log(chalk.bold('\nFrontend Error Check Results:'));
    console.log(`Scanned ${this.results.length} files with issues.\n`);

    if (this.results.length === 0) {
      console.log(chalk.green('No issues found!'));
      logger.info('No issues found!');
      return;
    }

    for (const result of this.results) {
      console.log(chalk.underline(`\nFile: ${path.relative(this.rootDir, result.filePath)}`));
      
      for (const error of result.errors) {
        console.log(`  ${chalk.yellow('u2022')} ${chalk.bold(error.checkName)}: ${error.message}`);
        
        if (error.fixed) {
          console.log(`    ${chalk.green('u2713')} Fixed: ${error.fixMessage}`);
        } else {
          console.log(`    ${chalk.red('u2717')} Not fixed automatically. Manual intervention required.`);
        }
      }
    }

    logger.info('Results printed to console');
    console.log('\n');
    console.log(`Full logs available at: ${logger.getLogFilePath()}`);
  }
}

async function main() {
  const rootDir = process.argv[2] || path.join(process.cwd(), 'src', 'frontend');
  
  console.log(chalk.bold('Frontend Error Check Agent'));
  console.log(`Scanning directory: ${rootDir}\n`);
  
  logger.info(`Starting Frontend Error Check Agent for directory: ${rootDir}`);
  const agent = new FrontendErrorCheckAgent(rootDir);
  await agent.scan();
  agent.printResults();
  logger.info('Frontend Error Check Agent completed');
}

main().catch(error => {
  logger.error('Error running Frontend Error Check Agent:', error);
  console.error('Error running Frontend Error Check Agent:', error);
  process.exit(1);
});
