// src/providers/MamaBearFileAnalyzer.ts
import * as vscode from 'vscode';
import { MamaBearApiClient } from './mama_bear_api_client';

export class MamaBearFileAnalyzer {
    private _apiClient: MamaBearApiClient;
    private _projectContext: Map<string, any> = new Map();
    private _analysisCache: Map<string, any> = new Map();
    private _isAnalyzing: boolean = false;

    constructor(apiClient: MamaBearApiClient) {
        this._apiClient = apiClient;
    }

    public async analyzeCurrentFile(activeEditor: vscode.TextEditor): Promise<void> {
        if (this._isAnalyzing) return;

        try {
            this._isAnalyzing = true;
            const document = activeEditor.document;
            const fileName = document.fileName;
            const code = document.getText();

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🐻 Mama Bear analyzing file...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: "Reading file..." });

                // Get file analysis from Mama Bear
                const response = await this._apiClient.analyzeCode(code, fileName, 'comprehensive');

                progress.report({ increment: 50, message: "Processing analysis..." });

                if (response.success) {
                    // Cache the analysis
                    this._analysisCache.set(fileName, {
                        analysis: response.response,
                        timestamp: Date.now(),
                        language: document.languageId
                    });

                    progress.report({ increment: 100, message: "Analysis complete!" });

                    // Show analysis in a new document
                    await this.showAnalysisResults(fileName, response.response);

                    // Update project context
                    await this.updateProjectContext(fileName, {
                        language: document.languageId,
                        size: code.length,
                        functions: this.extractFunctions(code, document.languageId),
                        imports: this.extractImports(code, document.languageId),
                        complexity: this.calculateComplexity(code)
                    });

                } else {
                    vscode.window.showErrorMessage(`Analysis failed: ${response.error}`);
                }
            });

        } catch (error: any) {
            vscode.window.showErrorMessage(`File analysis error: ${error.message}`);
        } finally {
            this._isAnalyzing = false;
        }
    }

    public async analyzeEntireProject(): Promise<void> {
        if (this._isAnalyzing) return;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }

        try {
            this._isAnalyzing = true;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🐻 Mama Bear analyzing project...",
                cancellable: true
            }, async (progress, token) => {
                progress.report({ increment: 0, message: "Scanning project files..." });

                // Get all relevant files
                const files = await this.getProjectFiles();
                const totalFiles = files.length;

                progress.report({ increment: 10, message: `Found ${totalFiles} files` });

                if (token.isCancellationRequested) return;

                // Analyze project structure
                const projectStructure = await this.analyzeProjectStructure(files);

                progress.report({ increment: 30, message: "Analyzing dependencies..." });

                // Get package.json and dependencies
                const dependencies = await this.analyzeDependencies();

                progress.report({ increment: 50, message: "Generating insights..." });

                // Get comprehensive project analysis from Mama Bear
                const projectData = {
                    structure: projectStructure,
                    dependencies: dependencies,
                    fileCount: totalFiles,
                    languages: this.getUsedLanguages(files),
                    workspace: workspaceFolders[0].name
                };

                const response = await this._apiClient.analyzeProject();

                progress.report({ increment: 90, message: "Preparing report..." });

                if (response.success) {
                    await this.showProjectAnalysis(projectData, response.response);
                } else {
                    vscode.window.showErrorMessage(`Project analysis failed: ${response.error}`);
                }

                progress.report({ increment: 100, message: "Analysis complete!" });
            });

        } catch (error: any) {
            vscode.window.showErrorMessage(`Project analysis error: ${error.message}`);
        } finally {
            this._isAnalyzing = false;
        }
    }

    public async onFileChanged(uri: vscode.Uri): Promise<void> {
        // Invalidate cache for changed file
        this._analysisCache.delete(uri.fsPath);

        // Update project context if it's a significant file
        const fileName = uri.fsPath;
        if (this.isSignificantFile(fileName)) {
            await this.updateFileInProjectContext(fileName);
        }
    }

    public async onFileCreated(uri: vscode.Uri): Promise<void> {
        // Add new file to project context
        await this.updateFileInProjectContext(uri.fsPath);

        // Optionally analyze new files automatically
        const config = vscode.workspace.getConfiguration('mamaBear');
        if (config.get('autoAnalyze')) {
            await this.quickAnalyzeFile(uri.fsPath);
        }
    }

    public async onFileDeleted(uri: vscode.Uri): Promise<void> {
        // Remove from caches
        this._analysisCache.delete(uri.fsPath);
        this._projectContext.delete(uri.fsPath);
    }

    private async showAnalysisResults(fileName: string, analysis: any): Promise<void> {
        const doc = await vscode.workspace.openTextDocument({
            content: this.formatAnalysisReport(fileName, analysis),
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: true
        });
    }

    private async showProjectAnalysis(projectData: any, analysis: any): Promise<void> {
        const content = this.formatProjectReport(projectData, analysis);

        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Active,
            preview: false
        });
    }

    private formatAnalysisReport(fileName: string, analysis: any): string {
        const shortName = fileName.split('/').pop() || fileName;

        return `# 🐻 Mama Bear File Analysis

## File: ${shortName}

**Path:** ${fileName}
**Analyzed:** ${new Date().toLocaleString()}

---

## Analysis

${typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}

---

## Context Information

- **Language:** ${this._analysisCache.get(fileName)?.language || 'Unknown'}
- **File Size:** ${this._projectContext.get(fileName)?.size || 'Unknown'} characters
- **Complexity Score:** ${this._projectContext.get(fileName)?.complexity || 'Unknown'}

## Quick Actions

- \`Ctrl+Shift+F\` - Fix issues in this file
- \`Ctrl+Shift+X\` - Explain selected code
- \`Alt+T\` - Generate tests for this file

---

*Generated by Mama Bear AI Assistant*`;
    }

    private formatProjectReport(projectData: any, analysis: any): string {
        return `# 🐻 Mama Bear Project Analysis

## Project: ${projectData.workspace}

**Analyzed:** ${new Date().toLocaleString()}

---

## Project Overview

${typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}

---

## Project Statistics

- **Total Files:** ${projectData.fileCount}
- **Languages:** ${projectData.languages.join(', ')}
- **Dependencies:** ${Object.keys(projectData.dependencies.dependencies || {}).length} production, ${Object.keys(projectData.dependencies.devDependencies || {}).length} development

## File Structure

\`\`\`
${this.formatProjectStructure(projectData.structure)}
\`\`\`

## Dependencies Analysis

### Production Dependencies
${Object.entries(projectData.dependencies.dependencies || {}).map(([name, version]) => `- ${name}: ${version}`).join('\n')}

### Development Dependencies
${Object.entries(projectData.dependencies.devDependencies || {}).map(([name, version]) => `- ${name}: ${version}`).join('\n')}

## Recommendations

🎯 **Next Steps:**
1. Review the analysis above
2. Use \`Ctrl+Shift+A\` for Agentic Takeover to auto-fix issues
3. Use \`Ctrl+Shift+E\` for Express Mode quick questions

---

*Generated by Mama Bear AI Assistant with full project context*`;
    }

    private async getProjectFiles(): Promise<string[]> {
        const files = await vscode.workspace.findFiles(
            '**/*.{ts,js,py,java,cpp,c,cs,go,rs,php,rb,swift,kt,scala,html,css,scss,json,yaml,yml,md}',
            '**/node_modules/**',
            1000
        );

        return files.map(file => file.fsPath);
    }

    private async analyzeProjectStructure(files: string[]): Promise<any> {
        const structure: any = {};

        for (const file of files) {
            const relativePath = vscode.workspace.asRelativePath(file);
            const parts = relativePath.split('/');

            let current = structure;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            const fileName = parts[parts.length - 1];
            const extension = fileName.split('.').pop();
            current[fileName] = { type: 'file', extension };
        }

        return structure;
    }

    private formatProjectStructure(structure: any, indent: string = ''): string {
        let result = '';

        for (const [key, value] of Object.entries(structure)) {
            if (typeof value === 'object' && value !== null) {
                if ((value as any).type === 'file') {
                    result += `${indent}📄 ${key}\n`;
                } else {
                    result += `${indent}📁 ${key}/\n`;
                    result += this.formatProjectStructure(value, indent + '  ');
                }
            }
        }

        return result;
    }

    private async analyzeDependencies(): Promise<any> {
        try {
            const packageFiles = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 5);
            if (packageFiles.length > 0) {
                const content = await vscode.workspace.fs.readFile(packageFiles[0]);
                return JSON.parse(content.toString());
            }
        } catch (error) {
            console.error('Failed to analyze dependencies:', error);
        }

        return { dependencies: {}, devDependencies: {} };
    }

    private getUsedLanguages(files: string[]): string[] {
        const languages = new Set<string>();
        const extensionMap: { [key: string]: string } = {
            'ts': 'TypeScript',
            'js': 'JavaScript',
            'py': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'cs': 'C#',
            'go': 'Go',
            'rs': 'Rust',
            'php': 'PHP',
            'rb': 'Ruby',
            'swift': 'Swift',
            'kt': 'Kotlin',
            'scala': 'Scala',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS'
        };

        for (const file of files) {
            const extension = file.split('.').pop()?.toLowerCase();
            if (extension && extensionMap[extension]) {
                languages.add(extensionMap[extension]);
            }
        }

        return Array.from(languages);
    }

    private extractFunctions(code: string, language: string): string[] {
        const functions: string[] = [];

        // Simple regex-based function extraction
        const patterns: { [key: string]: RegExp } = {
            'typescript': /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(\w+)\s*\([^)]*\)\s*{)/g,
            'javascript': /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(\w+)\s*\([^)]*\)\s*{)/g,
            'python': /def\s+(\w+)\s*\(/g,
            'java': /(?:public|private|protected)?\s*(?:static\s+)?(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{/g,
            'cpp': /(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{/g,
            'c': /(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{/g
        };

        const pattern = patterns[language];
        if (pattern) {
            let match;
            while ((match = pattern.exec(code)) !== null) {
                const funcName = match[1] || match[2] || match[3];
                if (funcName && funcName !== 'if' && funcName !== 'for' && funcName !== 'while') {
                    functions.push(funcName);
                }
            }
        }

        return functions;
    }

    private extractImports(code: string, language: string): string[] {
        const imports: string[] = [];

        const patterns: { [key: string]: RegExp } = {
            'typescript': /import\s+.*?from\s+['"]([^'"]+)['"]/g,
            'javascript': /import\s+.*?from\s+['"]([^'"]+)['"]/g,
            'python': /(?:import\s+(\w+)|from\s+(\w+)\s+import)/g,
            'java': /import\s+([^;]+);/g,
            'cpp': /#include\s+[<"]([^>"]+)[>"]/g,
            'c': /#include\s+[<"]([^>"]+)[>"]/g
        };

        const pattern = patterns[language];
        if (pattern) {
            let match;
            while ((match = pattern.exec(code)) !== null) {
                const importName = match[1] || match[2];
                if (importName) {
                    imports.push(importName);
                }
            }
        }

        return imports;
    }

    private calculateComplexity(code: string): number {
        // Simple complexity calculation based on control structures
        const controlStructures = [
            /\bif\s*\(/g,
            /\bfor\s*\(/g,
            /\bwhile\s*\(/g,
            /\bswitch\s*\(/g,
            /\bcatch\s*\(/g,
            /\?\s*.*?\s*:/g, // Ternary operators
            /&&|\|\|/g // Logical operators
        ];

        let complexity = 1; // Base complexity

        for (const pattern of controlStructures) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }

        return complexity;
    }

    private isSignificantFile(fileName: string): boolean {
        const significantExtensions = ['.ts', '.js', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs'];
        const significantFiles = ['package.json', 'tsconfig.json', 'requirements.txt', 'Cargo.toml'];

        const isSignificantExtension = significantExtensions.some(ext => fileName.endsWith(ext));
        const isSignificantFile = significantFiles.some(file => fileName.endsWith(file));

        return isSignificantExtension || isSignificantFile;
    }

    private async updateFileInProjectContext(fileName: string): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(fileName);
            const code = document.getText();

            await this.updateProjectContext(fileName, {
                language: document.languageId,
                size: code.length,
                functions: this.extractFunctions(code, document.languageId),
                imports: this.extractImports(code, document.languageId),
                complexity: this.calculateComplexity(code),
                lastModified: Date.now()
            });
        } catch (error) {
            console.error('Failed to update file in project context:', error);
        }
    }

    private async updateProjectContext(fileName: string, context: any): Promise<void> {
        this._projectContext.set(fileName, context);

        // Send context update to Mama Bear for persistent memory
        try {
            await this._apiClient.saveContext({
                type: 'file_context',
                fileName,
                context,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to save context to Mama Bear:', error);
        }
    }

    private async quickAnalyzeFile(fileName: string): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(fileName);
            const code = document.getText();

            // Quick analysis - just update context
            await this.updateProjectContext(fileName, {
                language: document.languageId,
                size: code.length,
                complexity: this.calculateComplexity(code),
                analyzed: Date.now()
            });

        } catch (error) {
            console.error('Quick file analysis failed:', error);
        }
    }

    // Public method to get cached analysis
    public getCachedAnalysis(fileName: string): any {
        return this._analysisCache.get(fileName);
    }

    // Public method to get project context
    public getProjectContext(): Map<string, any> {
        return this._projectContext;
    }

    // Clear all caches
    public clearCaches(): void {
        this._analysisCache.clear();
        this._projectContext.clear();
    }
}
