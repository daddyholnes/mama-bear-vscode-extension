// src/providers/MamaBearCodeCompletionProvider.ts
import * as vscode from 'vscode';
import { MamaBearApiClient } from './mama_bear_api_client';

export class MamaBearCodeCompletionProvider implements vscode.InlineCompletionItemProvider {
    private _apiClient: MamaBearApiClient;
    private _isProcessing: boolean = false;
    private _cache: Map<string, vscode.InlineCompletionItem[]> = new Map();
    private _lastRequestTime: number = 0;
    private _debounceMs: number = 300; // Debounce delay

    constructor(apiClient: MamaBearApiClient) {
        this._apiClient = apiClient;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined> {

        // Avoid concurrent requests
        if (this._isProcessing) {
            return [];
        }

        // Debounce rapid requests
        const now = Date.now();
        if (now - this._lastRequestTime < this._debounceMs) {
            return [];
        }
        this._lastRequestTime = now;

        try {
            this._isProcessing = true;

            // Get context around cursor
            const line = document.lineAt(position.line);
            const textBeforeCursor = document.getText(new vscode.Range(
                new vscode.Position(Math.max(0, position.line - 10), 0),
                position
            ));
            const textAfterCursor = document.getText(new vscode.Range(
                position,
                new vscode.Position(Math.min(document.lineCount - 1, position.line + 5), 0)
            ));

            // Create cache key
            const cacheKey = this.createCacheKey(textBeforeCursor, position, document.fileName);

            // Check cache first
            if (this._cache.has(cacheKey)) {
                return this._cache.get(cacheKey);
            }

            // Determine if we should provide completion
            if (!this.shouldProvideCompletion(textBeforeCursor, line.text, position)) {
                return [];
            }

            // Get completion from Mama Bear
            const completions = await this.getCompletionFromMamaBear(
                textBeforeCursor,
                textAfterCursor,
                document,
                position,
                token
            );

            // Cache results
            this._cache.set(cacheKey, completions);

            // Clean cache if it gets too large
            if (this._cache.size > 50) {
                const firstKey = this._cache.keys().next().value;
                if (firstKey) {
                    this._cache.delete(firstKey);
                }
            }

            return completions;

        } catch (error) {
            console.error('Code completion error:', error);
            return [];
        } finally {
            this._isProcessing = false;
        }
    }

    private shouldProvideCompletion(
        textBeforeCursor: string,
        currentLine: string,
        position: vscode.Position
    ): boolean {
        // Don't complete if we're in a comment
        if (currentLine.trim().startsWith('//') ||
            currentLine.trim().startsWith('#') ||
            currentLine.trim().startsWith('*')) {
            return false;
        }

        // Don't complete if we're in a string (basic check)
        const beforePosition = currentLine.substring(0, position.character);
        const stringIndicators = ['"', "'", '`'];
        let inString = false;

        for (const indicator of stringIndicators) {
            const count = (beforePosition.match(new RegExp(indicator, 'g')) || []).length;
            if (count % 2 === 1) {
                inString = true;
                break;
            }
        }

        if (inString) {
            return false;
        }

        // Provide completion if:
        // 1. We're at the end of a line with some meaningful code
        // 2. We're typing after certain keywords
        // 3. We're in function parameters or similar contexts
        const meaningfulKeywords = [
            'function', 'class', 'const', 'let', 'var', 'if', 'for', 'while',
            'def', 'import', 'from', 'async', 'await', 'return', 'export'
        ];

        const lastWords = textBeforeCursor.trim().split(/\s+/).slice(-3);
        const hasMeaningfulContext = lastWords.some(word =>
            meaningfulKeywords.includes(word) || word.includes('.')
        );

        // Also provide completion if we have at least some code context
        const hasCodeContext = textBeforeCursor.trim().length > 10;

        return hasMeaningfulContext || hasCodeContext;
    }

    private async getCompletionFromMamaBear(
        textBeforeCursor: string,
        textAfterCursor: string,
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[]> {

        // Check if request was cancelled
        if (token.isCancellationRequested) {
            return [];
        }

        try {
            // Prepare context for Mama Bear
            const context = {
                fileName: document.fileName,
                language: document.languageId,
                position: {
                    line: position.line,
                    character: position.character
                },
                textBeforeCursor: textBeforeCursor.slice(-1000), // Last 1000 chars for context
                textAfterCursor: textAfterCursor.slice(0, 200), // Next 200 chars
                fileExtension: document.fileName.split('.').pop(),
                isCompletionRequest: true
            };

            // Create completion prompt
            const prompt = this.createCompletionPrompt(
                textBeforeCursor,
                textAfterCursor,
                document.languageId,
                position
            );

            // Get completion from Mama Bear (use Express Mode for speed)
            const response = await this._apiClient.expressMode(prompt);

            if (response.success && response.response) {
                const completionText = this.extractCompletionFromResponse(response.response);

                if (completionText && completionText.trim().length > 0) {
                    const item = new vscode.InlineCompletionItem(
                        completionText,
                        new vscode.Range(position, position)
                    );

                    // Add command to track acceptance
                    item.command = {
                        command: 'mamaBear.completionAccepted',
                        title: 'Completion Accepted',
                        arguments: [completionText, document.fileName]
                    };

                    return [item];
                }
            }

            return [];

        } catch (error) {
            console.error('Mama Bear completion request failed:', error);
            return [];
        }
    }

    private createCompletionPrompt(
        textBeforeCursor: string,
        textAfterCursor: string,
        language: string,
        position: vscode.Position
    ): string {
        return `🚀 CODE COMPLETION REQUEST

Language: ${language}
Position: Line ${position.line + 1}, Column ${position.character + 1}

Code before cursor:
\`\`\`${language}
${textBeforeCursor.slice(-500)}
\`\`\`

Code after cursor:
\`\`\`${language}
${textAfterCursor.slice(0, 100)}
\`\`\`

Please provide a smart code completion that:
1. Fits naturally at the cursor position
2. Follows best practices for ${language}
3. Is contextually appropriate
4. Is concise (1-3 lines max)
5. Maintains proper indentation

Return ONLY the completion text, no explanations or markdown.`;
    }

    private extractCompletionFromResponse(response: string): string {
        // Remove any markdown formatting
        let completion = response.trim();

        // Remove code block markers
        completion = completion.replace(/```[\w]*\n?/g, '');
        completion = completion.replace(/```/g, '');

        // Remove any explanatory text (look for code-like patterns)
        const lines = completion.split('\n');
        const codeLikeLines = lines.filter(line => {
            const trimmed = line.trim();
            // Keep lines that look like code
            return trimmed.length > 0 && (
                trimmed.includes('(') ||
                trimmed.includes('{') ||
                trimmed.includes('=') ||
                trimmed.includes(';') ||
                trimmed.includes(':') ||
                /^[a-zA-Z_$][a-zA-Z0-9_$]*/.test(trimmed) ||
                /^\s+/.test(line) // Indented lines
            );
        });

        if (codeLikeLines.length > 0) {
            completion = codeLikeLines.slice(0, 3).join('\n'); // Max 3 lines
        }

        // Clean up any remaining non-code text
        completion = completion.replace(/^[^a-zA-Z0-9\s{(=;:._$-]+/gm, '');

        return completion.trim();
    }

    private createCacheKey(
        textBeforeCursor: string,
        position: vscode.Position,
        fileName: string
    ): string {
        const contextHash = this.simpleHash(textBeforeCursor.slice(-200));
        return `${fileName}:${position.line}:${position.character}:${contextHash}`;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Clear cache when document changes significantly
    public clearCache() {
        this._cache.clear();
    }

    // Update debounce settings
    public setDebounceMs(ms: number) {
        this._debounceMs = ms;
    }
}

// Additional provider for hover information
export class MamaBearHoverProvider implements vscode.HoverProvider {
    private _apiClient: MamaBearApiClient;

    constructor(apiClient: MamaBearApiClient) {
        this._apiClient = apiClient;
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {

        // Get word at position
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }

        const word = document.getText(wordRange);
        if (word.length < 2) {
            return undefined;
        }

        try {
            // Get context around the word
            const line = document.lineAt(position.line);
            const contextRange = new vscode.Range(
                new vscode.Position(Math.max(0, position.line - 2), 0),
                new vscode.Position(Math.min(document.lineCount - 1, position.line + 2), 0)
            );
            const context = document.getText(contextRange);

            // Ask Mama Bear to explain the symbol
            const prompt = `🔍 SYMBOL EXPLANATION

Language: ${document.languageId}
Symbol: "${word}"
Context:
\`\`\`${document.languageId}
${context}
\`\`\`

Please provide a brief explanation of what this symbol represents in this context. Keep it concise (1-2 sentences).`;

            const response = await this._apiClient.expressMode(prompt);

            if (response.success && response.response) {
                const explanation = response.response.trim();
                if (explanation.length > 0 && explanation.length < 500) {
                    return new vscode.Hover([
                        new vscode.MarkdownString(`🐻 **Mama Bear**: ${explanation}`)
                    ]);
                }
            }

        } catch (error) {
            console.error('Hover provider error:', error);
        }

        return undefined;
    }
}

// Code action provider for Mama Bear suggestions
export class MamaBearCodeActionProvider implements vscode.CodeActionProvider {
    private _apiClient: MamaBearApiClient;

    constructor(apiClient: MamaBearApiClient) {
        this._apiClient = apiClient;
    }

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        const actions: vscode.CodeAction[] = [];

        // Add Mama Bear actions
        if (range.isEmpty) {
            // Cursor position actions
            actions.push(this.createCodeAction(
                '🐻 Explain this line',
                'mamaBear.explainLine',
                [document.uri, range.start.line]
            ));

            actions.push(this.createCodeAction(
                '🔧 Optimize this function',
                'mamaBear.optimizeFunction',
                [document.uri, range.start.line]
            ));

        } else {
            // Selection actions
            const selectedText = document.getText(range);

            actions.push(this.createCodeAction(
                '🐻 Explain selected code',
                'mamaBear.explainSelection',
                [selectedText, document.fileName]
            ));

            actions.push(this.createCodeAction(
                '🔧 Fix selected code',
                'mamaBear.fixSelection',
                [selectedText, document.fileName]
            ));

            actions.push(this.createCodeAction(
                '⚡ Optimize selected code',
                'mamaBear.optimizeSelection',
                [selectedText, document.fileName]
            ));

            actions.push(this.createCodeAction(
                '🧪 Generate tests',
                'mamaBear.generateTestsForSelection',
                [selectedText, document.fileName]
            ));
        }

        // Add error-specific actions if there are diagnostics
        if (context.diagnostics.length > 0) {
            actions.push(this.createCodeAction(
                '🔍 Mama Bear: Analyze all errors',
                'mamaBear.analyzeErrors',
                [document.uri, context.diagnostics]
            ));
        }

        return actions;
    }

    private createCodeAction(
        title: string,
        command: string,
        args: any[]
    ): vscode.CodeAction {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        action.command = {
            command,
            title,
            arguments: args
        };
        return action;
    }
}
