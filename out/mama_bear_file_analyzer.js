"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MamaBearFileAnalyzer = void 0;
// src/providers/MamaBearFileAnalyzer.ts
const vscode = __importStar(require("vscode"));
class MamaBearFileAnalyzer {
    constructor(apiClient) {
        this._projectContext = new Map();
        this._analysisCache = new Map();
        this._isAnalyzing = false;
        this._apiClient = apiClient;
    }
    async analyzeCurrentFile(activeEditor) {
        if (this._isAnalyzing)
            return;
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
                }
                else {
                    vscode.window.showErrorMessage(`Analysis failed: ${response.error}`);
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`File analysis error: ${error.message}`);
        }
        finally {
            this._isAnalyzing = false;
        }
    }
    async analyzeEntireProject() {
        if (this._isAnalyzing)
            return;
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
                if (token.isCancellationRequested)
                    return;
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
                }
                else {
                    vscode.window.showErrorMessage(`Project analysis failed: ${response.error}`);
                }
                progress.report({ increment: 100, message: "Analysis complete!" });
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Project analysis error: ${error.message}`);
        }
        finally {
            this._isAnalyzing = false;
        }
    }
    async onFileChanged(uri) {
        // Invalidate cache for changed file
        this._analysisCache.delete(uri.fsPath);
        // Update project context if it's a significant file
        const fileName = uri.fsPath;
        if (this.isSignificantFile(fileName)) {
            await this.updateFileInProjectContext(fileName);
        }
    }
    async onFileCreated(uri) {
        // Add new file to project context
        await this.updateFileInProjectContext(uri.fsPath);
        // Optionally analyze new files automatically
        const config = vscode.workspace.getConfiguration('mamaBear');
        if (config.get('autoAnalyze')) {
            await this.quickAnalyzeFile(uri.fsPath);
        }
    }
    async onFileDeleted(uri) {
        // Remove from caches
        this._analysisCache.delete(uri.fsPath);
        this._projectContext.delete(uri.fsPath);
    }
    async showAnalysisResults(fileName, analysis) {
        const doc = await vscode.workspace.openTextDocument({
            content: this.formatAnalysisReport(fileName, analysis),
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: true
        });
    }
    async showProjectAnalysis(projectData, analysis) {
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
    formatAnalysisReport(fileName, analysis) {
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
    formatProjectReport(projectData, analysis) {
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
    async getProjectFiles() {
        const files = await vscode.workspace.findFiles('**/*.{ts,js,py,java,cpp,c,cs,go,rs,php,rb,swift,kt,scala,html,css,scss,json,yaml,yml,md}', '**/node_modules/**', 1000);
        return files.map(file => file.fsPath);
    }
    async analyzeProjectStructure(files) {
        const structure = {};
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
    formatProjectStructure(structure, indent = '') {
        let result = '';
        for (const [key, value] of Object.entries(structure)) {
            if (typeof value === 'object' && value !== null) {
                if (value.type === 'file') {
                    result += `${indent}📄 ${key}\n`;
                }
                else {
                    result += `${indent}📁 ${key}/\n`;
                    result += this.formatProjectStructure(value, indent + '  ');
                }
            }
        }
        return result;
    }
    async analyzeDependencies() {
        try {
            const packageFiles = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 5);
            if (packageFiles.length > 0) {
                const content = await vscode.workspace.fs.readFile(packageFiles[0]);
                return JSON.parse(content.toString());
            }
        }
        catch (error) {
            console.error('Failed to analyze dependencies:', error);
        }
        return { dependencies: {}, devDependencies: {} };
    }
    getUsedLanguages(files) {
        const languages = new Set();
        const extensionMap = {
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
    extractFunctions(code, language) {
        const functions = [];
        // Simple regex-based function extraction
        const patterns = {
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
    extractImports(code, language) {
        const imports = [];
        const patterns = {
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
    calculateComplexity(code) {
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
    isSignificantFile(fileName) {
        const significantExtensions = ['.ts', '.js', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs'];
        const significantFiles = ['package.json', 'tsconfig.json', 'requirements.txt', 'Cargo.toml'];
        const isSignificantExtension = significantExtensions.some(ext => fileName.endsWith(ext));
        const isSignificantFile = significantFiles.some(file => fileName.endsWith(file));
        return isSignificantExtension || isSignificantFile;
    }
    async updateFileInProjectContext(fileName) {
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
        }
        catch (error) {
            console.error('Failed to update file in project context:', error);
        }
    }
    async updateProjectContext(fileName, context) {
        this._projectContext.set(fileName, context);
        // Send context update to Mama Bear for persistent memory
        try {
            await this._apiClient.saveContext({
                type: 'file_context',
                fileName,
                context,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Failed to save context to Mama Bear:', error);
        }
    }
    async quickAnalyzeFile(fileName) {
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
        }
        catch (error) {
            console.error('Quick file analysis failed:', error);
        }
    }
    // Public method to get cached analysis
    getCachedAnalysis(fileName) {
        return this._analysisCache.get(fileName);
    }
    // Public method to get project context
    getProjectContext() {
        return this._projectContext;
    }
    // Clear all caches
    clearCaches() {
        this._analysisCache.clear();
        this._projectContext.clear();
    }
}
exports.MamaBearFileAnalyzer = MamaBearFileAnalyzer;
//# sourceMappingURL=mama_bear_file_analyzer.js.map