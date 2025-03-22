#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';
class FrontendErrorCheckAgent {
    constructor(rootDir) {
        this.results = [];
        this.rootDir = rootDir;
        this.errorChecks = [
            this.createTypeScriptConfigCheck(),
            this.createImportExtensionCheck(),
            this.createSvelteKitAliasCheck(),
            this.createTypeScriptSyntaxInJSCheck(),
            this.createMissingDependencyCheck(),
            this.createSvelteComponentCheck()
        ];
    }
    createTypeScriptConfigCheck() {
        return {
            name: 'TypeScript Config Check',
            description: 'Checks for deprecated options in tsconfig.json',
            check: async (content, filePath) => {
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
                        return {
                            hasError: true,
                            message: `Deprecated TypeScript options found: ${deprecatedOptions.join(', ')}. These should be replaced with 'verbatimModuleSyntax'.`
                        };
                    }
                    return { hasError: false };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    return {
                        hasError: true,
                        message: `Error parsing tsconfig.json: ${errorMessage}`
                    };
                }
            },
            fix: async (content, filePath) => {
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
                        return {
                            fixed: true,
                            newContent: JSON.stringify(config, null, 2),
                            message: 'Removed deprecated TypeScript options and added verbatimModuleSyntax.'
                        };
                    }
                    return { fixed: false };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    return {
                        fixed: false,
                        message: `Error fixing tsconfig.json: ${errorMessage}`
                    };
                }
            }
        };
    }
    createImportExtensionCheck() {
        return {
            name: 'Import Extension Check',
            description: 'Checks for file extensions in import statements that should be removed',
            check: async (content, filePath) => {
                if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
                    return { hasError: false };
                }
                const importRegex = /import .* from ['"]([\.\w\/]+\.(js|ts|svelte))['"];?/g;
                const matches = [...content.matchAll(importRegex)];
                if (matches.length > 0) {
                    return {
                        hasError: true,
                        message: `Found ${matches.length} import statements with file extensions. These should be removed in TypeScript projects.`
                    };
                }
                return { hasError: false };
            },
            fix: async (content, filePath) => {
                if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
                    return { fixed: false };
                }
                const importRegex = /import .* from ['"]([\.\w\/]+\.(js|ts|svelte))['"];?/g;
                const matches = [...content.matchAll(importRegex)];
                if (matches.length === 0) {
                    return { fixed: false };
                }
                let newContent = content;
                let count = 0;
                for (const match of matches) {
                    const fullImport = match[0];
                    const importPath = match[1];
                    const extension = path.extname(importPath);
                    const pathWithoutExtension = importPath.slice(0, -extension.length);
                    const newImport = fullImport.replace(importPath, pathWithoutExtension);
                    newContent = newContent.replace(fullImport, newImport);
                    count++;
                }
                return {
                    fixed: true,
                    newContent,
                    message: `Removed file extensions from ${count} import statements.`
                };
            }
        };
    }
    createSvelteKitAliasCheck() {
        return {
            name: 'SvelteKit Alias Check',
            description: 'Checks for proper use of SvelteKit aliases ($lib, $components, etc.)',
            check: async (content, filePath) => {
                if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
                    return { hasError: false };
                }
                const relativeImportRegex = /import .* from ['"]\.\.\/.+['"];?/g;
                const matches = [...content.matchAll(relativeImportRegex)];
                if (matches.length > 0) {
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
    createTypeScriptSyntaxInJSCheck() {
        return {
            name: 'TypeScript Syntax in JS Check',
            description: 'Checks for TypeScript syntax in JavaScript files',
            check: async (content, filePath) => {
                if (!filePath.endsWith('.js')) {
                    return { hasError: false };
                }
                const tsPatterns = [
                    /interface\s+\w+\s*\{/, // interface declarations
                    /type\s+\w+\s*=/, // type aliases
                    /:\s*\w+(?:\[\])?\s*[,=)]/, // type annotations
                    /as\s+\w+/, // type assertions
                    /<\w+>/, // generic type parameters
                    /\w+\?:/ // optional properties
                ];
                for (const pattern of tsPatterns) {
                    if (pattern.test(content)) {
                        return {
                            hasError: true,
                            message: 'TypeScript syntax found in JavaScript file. Consider renaming to .ts extension.'
                        };
                    }
                }
                return { hasError: false };
            },
            fix: async (content, filePath) => {
                if (!filePath.endsWith('.js')) {
                    return { fixed: false };
                }
                const tsPatterns = [
                    /interface\s+\w+\s*\{/, // interface declarations
                    /type\s+\w+\s*=/, // type aliases
                    /:\s*\w+(?:\[\])?\s*[,=)]/, // type annotations
                    /as\s+\w+/, // type assertions
                    /<\w+>/, // generic type parameters
                    /\w+\?:/ // optional properties
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
                        return {
                            fixed: true,
                            message: `Created TypeScript version at ${tsFilePath}. You should update imports and remove the JS file.`
                        };
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
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
    createMissingDependencyCheck() {
        return {
            name: 'Missing Dependency Check',
            description: 'Checks for imports of packages that might be missing from package.json',
            check: async (content, filePath) => {
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
                        return {
                            hasError: true,
                            message: `Potentially missing dependencies: ${missingDependencies.join(', ')}`
                        };
                    }
                    return { hasError: false };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    return {
                        hasError: false,
                        message: `Error checking dependencies: ${errorMessage}`
                    };
                }
            }
            // No automatic fix as installing dependencies requires user confirmation
        };
    }
    createSvelteComponentCheck() {
        return {
            name: 'Svelte Component Check',
            description: 'Checks for common issues in Svelte components',
            check: async (content, filePath) => {
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
                    return {
                        hasError: true,
                        message: issues.join(' ')
                    };
                }
                return { hasError: false };
            },
            fix: async (content, filePath) => {
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
    async scanFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const result = { filePath, errors: [] };
            for (const check of this.errorChecks) {
                const checkResult = await check.check(content, filePath);
                if (checkResult.hasError) {
                    const errorEntry = {
                        checkName: check.name,
                        message: checkResult.message || 'Unknown error',
                        fixed: false,
                        fixMessage: undefined
                    };
                    if (check.fix) {
                        const fixResult = await check.fix(content, filePath);
                        if (fixResult.fixed && fixResult.newContent) {
                            await fs.writeFile(filePath, fixResult.newContent);
                            errorEntry.fixed = true;
                            errorEntry.fixMessage = fixResult.message;
                        }
                        else if (fixResult.fixed) {
                            errorEntry.fixed = true;
                            errorEntry.fixMessage = fixResult.message;
                        }
                    }
                    result.errors.push(errorEntry);
                }
            }
            if (result.errors.length > 0) {
                this.results.push(result);
                return result;
            }
            return null;
        }
        catch (error) {
            console.error(`Error scanning file ${filePath}:`, error);
            return null;
        }
    }
    async scan(patterns = ['**/*.svelte', '**/*.ts', '**/*.js', '**/tsconfig.json']) {
        const files = [];
        for (const pattern of patterns) {
            const matches = await glob(pattern, { cwd: this.rootDir, ignore: ['node_modules/**', '.svelte-kit/**'] });
            files.push(...matches.map(file => path.join(this.rootDir, file)));
        }
        const uniqueFiles = [...new Set(files)];
        let scannedCount = 0;
        for (const file of uniqueFiles) {
            await this.scanFile(file);
            scannedCount++;
            if (scannedCount % 10 === 0) {
                console.log(`Scanned ${scannedCount}/${uniqueFiles.length} files...`);
            }
        }
        return this.results;
    }
    printResults() {
        console.log(chalk.bold('\nFrontend Error Check Results:'));
        console.log(`Scanned ${this.results.length} files with issues.\n`);
        if (this.results.length === 0) {
            console.log(chalk.green('No issues found!'));
            return;
        }
        for (const result of this.results) {
            console.log(chalk.underline(`\nFile: ${path.relative(this.rootDir, result.filePath)}`));
            for (const error of result.errors) {
                console.log(`  ${chalk.yellow('•')} ${chalk.bold(error.checkName)}: ${error.message}`);
                if (error.fixed) {
                    console.log(`    ${chalk.green('✓')} Fixed: ${error.fixMessage || 'Issue resolved'}`);
                }
                else {
                    console.log(`    ${chalk.red('✗')} Not fixed automatically. Manual intervention required.`);
                }
            }
        }
        console.log('\n');
    }
}
async function main() {
    const rootDir = process.argv[2] || path.join(process.cwd(), 'src', 'frontend');
    console.log(chalk.bold('Frontend Error Check Agent'));
    console.log(`Scanning directory: ${rootDir}\n`);
    const agent = new FrontendErrorCheckAgent(rootDir);
    await agent.scan();
    agent.printResults();
}
main().catch(error => {
    console.error('Error running Frontend Error Check Agent:', error);
    process.exit(1);
});
