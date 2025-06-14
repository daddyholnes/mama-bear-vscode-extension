// src/providers/MamaBearChatProvider.ts
import * as vscode from 'vscode';
import { MamaBearApiClient, MamaBearResponse } from './mama_bear_api_client';

export class MamaBearChatProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'mamaBearChat';
    private _view?: vscode.WebviewView;
    private _context: vscode.ExtensionContext;
    private _apiClient: MamaBearApiClient;
    private _conversationHistory: any[] = [];
    private _currentModel: string = 'gemini-2.0-flash-exp';
    private _availableModels: any = {};

    constructor(context: vscode.ExtensionContext, apiClient: MamaBearApiClient) {
        this._context = context;
        this._apiClient = apiClient;
        this.loadAvailableModels();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleUserMessage(data.message);
                    break;
                case 'selectModel':
                    await this.changeModel(data.model);
                    break;
                case 'expressMode':
                    await this.processExpressMode(data.message);
                    break;
                case 'clearChat':
                    this.clearConversation();
                    break;
                case 'saveContext':
                    await this.saveCurrentContext();
                    break;
                case 'loadContext':
                    await this.loadSavedContext();
                    break;
                case 'agenticTakeover':
                    await this.initiateAgenticTakeover(data.task);
                    break;
                case 'webSearch':
                    await this.performWebSearch(data.query);
                    break;
                case 'analyzeFile':
                    await this.analyzeCurrentFile();
                    break;
                case 'ready':
                    // Send initial data when webview is ready
                    await this.sendInitialData();
                    break;
                case 'uploadFile':
                    await this.handleFileUpload(data.file, data.fileName, data.fileType);
                    break;
                case 'pasteImage':
                    await this.handleImagePaste(data.imageData, data.prompt);
                    break;
                case 'recordVoice':
                    await this.handleVoiceRecording(data.audioData);
                    break;
                case 'mcpConnect':
                    await this.connectToMCP();
                    break;
                case 'mcpExecute':
                    await this.executeMCPTool(data.tool, data.parameters);
                    break;
            }
        });
    }

    private async loadAvailableModels() {
        try {
            this._availableModels = await this._apiClient.getAvailableModels();
        } catch (error) {
            console.error('Failed to load available models:', error);
        }
    }

    private async sendInitialData() {
        if (!this._view) return;

        await this._view.webview.postMessage({
            type: 'initialData',
            models: this._availableModels,
            currentModel: this._currentModel,
            history: this._conversationHistory
        });
    }

    public async handleUserMessage(message: string) {
        if (!this._view) return;

        // Add user message to history
        this._conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Show user message in chat
        await this._view.webview.postMessage({
            type: 'userMessage',
            message: {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            }
        });

        // Show typing indicator
        await this._view.webview.postMessage({
            type: 'typing',
            isTyping: true
        });

        try {
            // Get active file context
            const activeEditor = vscode.window.activeTextEditor;
            const context: any = {
                activeFile: activeEditor?.document.fileName,
                selectedText: activeEditor?.selection ? activeEditor.document.getText(activeEditor.selection) : null,
                language: activeEditor?.document.languageId,
                conversationHistory: this._conversationHistory.slice(-10) // Last 10 messages
            };

            // Send to Mama Bear
            const response = await this._apiClient.sendMessage(message, context);

            // Hide typing indicator
            await this._view.webview.postMessage({
                type: 'typing',
                isTyping: false
            });

            if (response.success) {
                const assistantMessage = {
                    role: 'assistant',
                    content: response.response?.content || response.response,
                    timestamp: new Date().toISOString(),
                    model: response.model_used || this._currentModel,
                    processingTime: response.processing_time_ms
                };

                // Add to history
                this._conversationHistory.push(assistantMessage);

                // Show assistant response
                await this._view.webview.postMessage({
                    type: 'assistantMessage',
                    message: assistantMessage
                });

                // Show additional metadata if available
                if (response.response?.agentic_metadata) {
                    await this._view.webview.postMessage({
                        type: 'agenticInfo',
                        metadata: response.response.agentic_metadata
                    });
                }

            } else {
                await this._view.webview.postMessage({
                    type: 'error',
                    message: response.error || 'Sorry, I encountered an error processing your request.'
                });
            }

        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'typing',
                isTyping: false
            });

            await this._view.webview.postMessage({
                type: 'error',
                message: `Error: ${error.message}`
            });
        }
    }

    public async processExpressMode(query: string) {
        if (!this._view) return;

        // Show express mode indicator
        await this._view.webview.postMessage({
            type: 'expressMode',
            active: true
        });

        try {
            const response = await this._apiClient.expressMode(query);

            if (response.success) {
                const expressMessage = {
                    role: 'assistant',
                    content: response.response?.content || response.response,
                    timestamp: new Date().toISOString(),
                    model: 'Express Mode',
                    processingTime: response.processing_time_ms,
                    isExpress: true
                };

                await this._view.webview.postMessage({
                    type: 'assistantMessage',
                    message: expressMessage
                });

                this._conversationHistory.push(expressMessage);
            } else {
                throw new Error(response.error || 'Express Mode failed');
            }

        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'error',
                message: `Express Mode Error: ${error.message}`
            });
        } finally {
            await this._view.webview.postMessage({
                type: 'expressMode',
                active: false
            });
        }
    }

    public async changeModel(modelId: string) {
        this._currentModel = modelId;

        if (this._view) {
            await this._view.webview.postMessage({
                type: 'modelChanged',
                model: modelId
            });

            // Add system message about model change
            const systemMessage = {
                role: 'system',
                content: `🤖 Switched to ${modelId}`,
                timestamp: new Date().toISOString(),
                model: modelId
            };

            await this._view.webview.postMessage({
                type: 'systemMessage',
                message: systemMessage
            });
        }
    }

    public async showModelSelector() {
        const models = Object.keys(this._availableModels);
        const selected = await vscode.window.showQuickPick(models, {
            placeHolder: 'Select AI model for Mama Bear',
            title: '🤖 Choose Mama Bear\'s Model'
        });

        if (selected) {
            await this.changeModel(selected);
        }
    }

    public async explainCode(selectedText: string) {
        const message = `🔍 Please explain this code:\n\n\`\`\`\n${selectedText}\n\`\`\``;
        await this.handleUserMessage(message);
    }

    public async fixCode(selectedText: string, fileName: string) {
        const message = `🔧 Please analyze and fix any issues in this code from ${fileName}:\n\n\`\`\`\n${selectedText}\n\`\`\``;
        await this.handleUserMessage(message);
    }

    public async optimizeFile(document: vscode.TextDocument) {
        const code = document.getText();
        const message = `⚡ Please optimize this ${document.languageId} file (${document.fileName}):\n\n\`\`\`${document.languageId}\n${code}\n\`\`\``;
        await this.handleUserMessage(message);
    }

    public async generateTests(document: vscode.TextDocument) {
        const code = document.getText();
        const message = `🧪 Please generate comprehensive tests for this ${document.languageId} code:\n\n\`\`\`${document.languageId}\n${code}\n\`\`\``;
        await this.handleUserMessage(message);
    }

    public async initiateAgenticTakeover(task: string) {
        if (!this._view) return;

        // Show agentic takeover indicator
        await this._view.webview.postMessage({
            type: 'agenticTakeover',
            active: true,
            task
        });

        try {
            const response = await this._apiClient.sendAgenticRequest({
                message: `🤖 Agentic Takeover: ${task}`,
                user_id: 'vscode_user',
                allow_autonomous_actions: true,
                express_mode: true
            });

            if (response.success) {
                const agenticMessage = {
                    role: 'assistant',
                    content: response.response?.response || response.response,
                    timestamp: new Date().toISOString(),
                    model: 'Agentic Mode',
                    isAgentic: true,
                    autonomousActions: response.response?.agentic_metadata?.autonomous_actions_taken || []
                };

                await this._view.webview.postMessage({
                    type: 'assistantMessage',
                    message: agenticMessage
                });

                this._conversationHistory.push(agenticMessage);

                // Show autonomous actions if any
                if (agenticMessage.autonomousActions.length > 0) {
                    await this._view.webview.postMessage({
                        type: 'autonomousActions',
                        actions: agenticMessage.autonomousActions
                    });
                }

            } else {
                throw new Error(response.error || 'Agentic takeover failed');
            }

        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'error',
                message: `Agentic Takeover Error: ${error.message}`
            });
        } finally {
            await this._view.webview.postMessage({
                type: 'agenticTakeover',
                active: false
            });
        }
    }

    public async performWebSearch(query: string) {
        if (!this._view) return;

        await this._view.webview.postMessage({
            type: 'webSearch',
            active: true,
            query
        });

        try {
            const response = await this._apiClient.performWebSearch(query);

            if (response.success) {
                const searchMessage = {
                    role: 'assistant',
                    content: response.response?.content || response.response,
                    timestamp: new Date().toISOString(),
                    model: 'Web Search',
                    isWebSearch: true
                };

                await this._view.webview.postMessage({
                    type: 'assistantMessage',
                    message: searchMessage
                });

                this._conversationHistory.push(searchMessage);
            } else {
                throw new Error(response.error || 'Web search failed');
            }

        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'error',
                message: `Web Search Error: ${error.message}`
            });
        } finally {
            await this._view.webview.postMessage({
                type: 'webSearch',
                active: false
            });
        }
    }

    public async analyzeCurrentFile() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return;
        }

        const document = activeEditor.document;
        const message = `📋 Please analyze this ${document.languageId} file (${document.fileName}):\n\n\`\`\`${document.languageId}\n${document.getText()}\n\`\`\``;
        await this.handleUserMessage(message);
    }

    public async saveCurrentContext() {
        try {
            const contextData = {
                conversationHistory: this._conversationHistory,
                currentModel: this._currentModel,
                timestamp: new Date().toISOString(),
                workspace: vscode.workspace.workspaceFolders?.[0]?.name
            };

            const success = await this._apiClient.saveContext(contextData);

            if (success && this._view) {
                await this._view.webview.postMessage({
                    type: 'contextSaved',
                    message: 'Context saved successfully! 💾'
                });
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to save context: ${error.message}`);
        }
    }

    public async loadSavedContext() {
        try {
            const contexts = await this._apiClient.loadContext();

            if (contexts.length > 0) {
                // Show context selection if multiple available
                if (contexts.length > 1) {
                    const selected = await vscode.window.showQuickPick(
                        contexts.map((ctx, index) => ({
                            label: `Context ${index + 1}`,
                            description: new Date(ctx.timestamp).toLocaleString(),
                            context: ctx
                        })),
                        { placeHolder: 'Select context to load' }
                    );

                    if (selected) {
                        this.loadContextData(selected.context);
                    }
                } else {
                    this.loadContextData(contexts[0]);
                }
            } else {
                vscode.window.showInformationMessage('No saved contexts found');
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to load context: ${error.message}`);
        }
    }

    private loadContextData(contextData: any) {
        try {
            this._conversationHistory = contextData.conversationHistory || [];
            this._currentModel = contextData.currentModel || this._currentModel;

            if (this._view) {
                this._view.webview.postMessage({
                    type: 'contextLoaded',
                    history: this._conversationHistory,
                    model: this._currentModel
                });
            }

            vscode.window.showInformationMessage('Context loaded successfully! 📂');

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to apply context: ${error.message}`);
        }
    }

    public async browseMcpAgents() {
        try {
            const agents = await this._apiClient.getMcpAgents();

            if (agents.length > 0 && this._view) {
                await this._view.webview.postMessage({
                    type: 'mcpAgents',
                    agents
                });
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to browse MCP agents: ${error.message}`);
        }
    }

    public clearConversation() {
        this._conversationHistory = [];

        if (this._view) {
            this._view.webview.postMessage({
                type: 'clearChat'
            });
        }
    }

    // ============================================================================
    // MULTIMODAL CAPABILITIES
    // ============================================================================

    public async handleFileUpload(file: any, fileName: string, fileType: string) {
        if (!this._view) return;

        try {
            // Show upload progress
            await this._view.webview.postMessage({
                type: 'uploadProgress',
                fileName,
                status: 'uploading'
            });

            const response = await this._apiClient.uploadFile(file, fileName, fileType);

            if (response.success) {
                // Add file message to conversation
                this._conversationHistory.push({
                    role: 'user',
                    content: `📁 Uploaded file: ${fileName}`,
                    fileName,
                    fileType,
                    timestamp: new Date().toISOString()
                });

                await this._view.webview.postMessage({
                    type: 'fileUploaded',
                    fileName,
                    response: response.response
                });
            } else {
                await this._view.webview.postMessage({
                    type: 'uploadError',
                    fileName,
                    error: response.error
                });
            }
        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'uploadError',
                fileName,
                error: error.message
            });
        }
    }

    public async handleImagePaste(imageData: string, prompt?: string) {
        if (!this._view) return;

        try {
            await this._view.webview.postMessage({
                type: 'typing',
                isTyping: true
            });

            const response = await this._apiClient.processImage(imageData, prompt);

            await this._view.webview.postMessage({
                type: 'typing',
                isTyping: false
            });

            if (response.success) {
                // Add image message to conversation
                this._conversationHistory.push({
                    role: 'user',
                    content: prompt || '🖼️ Pasted image',
                    imageData,
                    timestamp: new Date().toISOString()
                });

                // Add AI response
                this._conversationHistory.push({
                    role: 'assistant',
                    content: response.response,
                    model: response.model_used,
                    timestamp: new Date().toISOString()
                });

                await this._view.webview.postMessage({
                    type: 'imageProcessed',
                    imageData,
                    response: response.response
                });
            } else {
                await this._view.webview.postMessage({
                    type: 'error',
                    error: response.error
                });
            }
        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }

    public async handleVoiceRecording(audioData: any) {
        if (!this._view) return;

        try {
            await this._view.webview.postMessage({
                type: 'voiceProcessing',
                status: 'processing'
            });

            const response = await this._apiClient.processVoice(audioData);

            if (response.success) {
                // Add voice message to conversation
                this._conversationHistory.push({
                    role: 'user',
                    content: `🎙️ Voice message: ${response.response?.transcript}`,
                    hasAudio: true,
                    timestamp: new Date().toISOString()
                });

                await this._view.webview.postMessage({
                    type: 'voiceProcessed',
                    transcript: response.response?.transcript,
                    response: response.response?.ai_response
                });

                // If there's an AI response, add it to conversation
                if (response.response?.ai_response) {
                    this._conversationHistory.push({
                        role: 'assistant',
                        content: response.response.ai_response,
                        model: response.model_used,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                await this._view.webview.postMessage({
                    type: 'voiceError',
                    error: response.error
                });
            }
        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'voiceError',
                error: error.message
            });
        }
    }

    // ============================================================================
    // MCP INTEGRATION
    // ============================================================================

    public async connectToMCP() {
        if (!this._view) return;

        try {
            const response = await this._apiClient.connectToDockerMCP();

            if (response.success) {
                await this._view.webview.postMessage({
                    type: 'mcpConnected',
                    status: 'connected'
                });

                // Load available MCP tools
                const tools = await this._apiClient.getMCPTools();
                await this._view.webview.postMessage({
                    type: 'mcpTools',
                    tools
                });
            } else {
                await this._view.webview.postMessage({
                    type: 'mcpError',
                    error: response.error
                });
            }
        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'mcpError',
                error: error.message
            });
        }
    }

    public async executeMCPTool(toolName: string, parameters: any) {
        if (!this._view) return;

        try {
            await this._view.webview.postMessage({
                type: 'mcpExecuting',
                tool: toolName
            });

            const response = await this._apiClient.executeMCPTool(toolName, parameters);

            if (response.success) {
                // Add tool execution to conversation
                this._conversationHistory.push({
                    role: 'system',
                    content: `🔧 Executed MCP tool: ${toolName}`,
                    tool: toolName,
                    result: response.response,
                    timestamp: new Date().toISOString()
                });

                await this._view.webview.postMessage({
                    type: 'mcpResult',
                    tool: toolName,
                    result: response.response
                });
            } else {
                await this._view.webview.postMessage({
                    type: 'mcpError',
                    tool: toolName,
                    error: response.error
                });
            }
        } catch (error: any) {
            await this._view.webview.postMessage({
                type: 'mcpError',
                tool: toolName,
                error: error.message
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mama Bear AI Assistant</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 8px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 8px;
        }

        .title {
            font-weight: bold;
            color: var(--vscode-foreground);
        }

        .model-selector {
            font-size: 11px;
            padding: 2px 6px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }

        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 4px 0;
            scroll-behavior: smooth;
        }

        .message {
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 6px;
            word-wrap: break-word;
        }

        .message.user {
            background: var(--vscode-inputValidation-infoBackground);
            border-left: 3px solid var(--vscode-inputValidation-infoBorder);
        }

        .message.assistant {
            background: var(--vscode-textCodeBlock-background);
            border-left: 3px solid var(--vscode-focusBorder);
        }

        .message.system {
            background: var(--vscode-inputValidation-warningBackground);
            border-left: 3px solid var(--vscode-inputValidation-warningBorder);
            font-size: 12px;
            opacity: 0.8;
        }

        .message.express {
            border-left: 3px solid #FFD700;
            background: var(--vscode-textCodeBlock-background);
        }

        .message.agentic {
            border-left: 3px solid #FF6B6B;
            background: var(--vscode-textCodeBlock-background);
        }

        .message-meta {
            font-size: 10px;
            opacity: 0.7;
            margin-top: 4px;
            display: flex;
            justify-content: space-between;
        }

        .input-container {
            padding: 8px 0;
            border-top: 1px solid var(--vscode-panel-border);
        }

        .input-row {
            display: flex;
            gap: 4px;
            margin-bottom: 4px;
        }

        .message-input {
            flex: 1;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            resize: vertical;
            min-height: 20px;
            max-height: 100px;
            font-family: inherit;
        }

        .send-button, .action-button {
            padding: 8px 12px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
        }

        .action-buttons {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }

        .action-button {
            padding: 4px 8px;
            font-size: 11px;
        }

        .typing-indicator {
            display: none;
            font-size: 12px;
            opacity: 0.7;
            padding: 4px 8px;
        }

        .typing-indicator.active {
            display: block;
        }

        .status-indicator {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 3px;
            margin: 2px;
            display: none;
        }

        .status-indicator.active {
            display: inline-block;
        }

        .status-indicator.express {
            background: #FFD700;
            color: #000;
        }

        .status-indicator.agentic {
            background: #FF6B6B;
            color: #fff;
        }

        .status-indicator.web-search {
            background: #4CAF50;
            color: #fff;
        }

        code {
            background: var(--vscode-textCodeBlock-background);
            padding: 1px 4px;
            border-radius: 2px;
            font-family: var(--vscode-editor-font-family);
        }

        pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: var(--vscode-editor-font-family);
        }

        .autonomous-actions {
            margin-top: 8px;
            padding: 8px;
            background: var(--vscode-inputValidation-warningBackground);
            border-radius: 4px;
            font-size: 12px;
        }

        .autonomous-actions h4 {
            margin: 0 0 4px 0;
            font-size: 12px;
        }

        .autonomous-actions ul {
            margin: 0;
            padding-left: 16px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🐻 Mama Bear AI</div>
        <select class="model-selector" id="modelSelector">
            <option value="">Loading models...</option>
        </select>
    </div>

    <div class="status-indicator express" id="expressIndicator">⚡ Express Mode</div>
    <div class="status-indicator agentic" id="agenticIndicator">🤖 Agentic Mode</div>
    <div class="status-indicator web-search" id="webSearchIndicator">🔍 Web Search</div>

    <div class="chat-container">
        <div class="messages" id="messages">
            <div class="message system">
                🐻 Hi! I'm Mama Bear, your AI assistant. I have access to 15+ AI models, my own RAG system, web search, and agentic capabilities. How can I help you today?
            </div>
        </div>

        <div class="typing-indicator" id="typingIndicator">
            🐻 Mama Bear is thinking...
        </div>
    </div>

    <div class="input-container">
        <div class="input-row">
            <textarea class="message-input" id="messageInput" placeholder="Ask Mama Bear anything..." rows="1"></textarea>
            <button class="send-button" id="sendButton">Send</button>
        </div>

        <div class="action-buttons">
            <button class="action-button" id="expressBtn">⚡ Express</button>
            <button class="action-button" id="agenticBtn">🤖 Agentic</button>
            <button class="action-button" id="analyzeBtn">📋 Analyze File</button>
            <button class="action-button" id="searchBtn">🔍 Web Search</button>
            <button class="action-button" id="saveBtn">💾 Save</button>
            <button class="action-button" id="loadBtn">📂 Load</button>
            <button class="action-button" id="clearBtn">🗑️ Clear</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentModel = 'gemini-2.0-flash-exp';
        let availableModels = {};

        // DOM elements
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const modelSelector = document.getElementById('modelSelector');
        const typingIndicator = document.getElementById('typingIndicator');

        // Status indicators
        const expressIndicator = document.getElementById('expressIndicator');
        const agenticIndicator = document.getElementById('agenticIndicator');
        const webSearchIndicator = document.getElementById('webSearchIndicator');

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        modelSelector.addEventListener('change', (e) => {
            if (e.target.value) {
                vscode.postMessage({
                    type: 'selectModel',
                    model: e.target.value
                });
            }
        });

        // Action buttons
        document.getElementById('expressBtn').addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                vscode.postMessage({
                    type: 'expressMode',
                    message: message
                });
                messageInput.value = '';
            }
        });

        document.getElementById('agenticBtn').addEventListener('click', () => {
            const task = messageInput.value.trim() || 'Take autonomous action to help with the current task';
            vscode.postMessage({
                type: 'agenticTakeover',
                task: task
            });
            messageInput.value = '';
        });

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'analyzeFile' });
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            const query = messageInput.value.trim();
            if (query) {
                vscode.postMessage({
                    type: 'webSearch',
                    query: query
                });
                messageInput.value = '';
            }
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'saveContext' });
        });

        document.getElementById('loadBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'loadContext' });
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'clearChat' });
            messagesDiv.innerHTML = '<div class="message system">🐻 Chat cleared. How can I help you?</div>';
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            vscode.postMessage({
                type: 'sendMessage',
                message: message
            });

            messageInput.value = '';
        }

        function addMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.role}\`;

            if (message.isExpress) messageDiv.classList.add('express');
            if (message.isAgentic) messageDiv.classList.add('agentic');

            messageDiv.innerHTML = \`
                <div>\${formatMessage(message.content)}</div>
                <div class="message-meta">
                    <span>\${message.model || 'Unknown'}</span>
                    <span>\${new Date(message.timestamp).toLocaleTimeString()}</span>
                    \${message.processingTime ? \`<span>\${message.processingTime}ms</span>\` : ''}
                </div>
            \`;

            if (message.autonomousActions && message.autonomousActions.length > 0) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'autonomous-actions';
                actionsDiv.innerHTML = \`
                    <h4>🤖 Autonomous Actions Taken:</h4>
                    <ul>
                        \${message.autonomousActions.map(action => \`<li>\${action}</li>\`).join('')}
                    </ul>
                \`;
                messageDiv.appendChild(actionsDiv);
            }

            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function formatMessage(content) {
            // Basic markdown-like formatting
            return content
                .replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>')
                .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
                .replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*([^\\*]+)\\*/g, '<em>$1</em>')
                .replace(/\\n/g, '<br>');
        }

        function updateModelSelector(models) {
            modelSelector.innerHTML = '';

            Object.keys(models).forEach(category => {
                if (typeof models[category] === 'object' && models[category] !== null) {
                    Object.keys(models[category]).forEach(subcategory => {
                        if (Array.isArray(models[category][subcategory])) {
                            models[category][subcategory].forEach(model => {
                                const option = document.createElement('option');
                                option.value = model.id;
                                option.textContent = \`\${model.name} (\${model.provider})\`;
                                if (model.id === currentModel) {
                                    option.selected = true;
                                }
                                modelSelector.appendChild(option);
                            });
                        }
                    });
                }
            });
        }

        // Message handlers
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'initialData':
                    availableModels = message.models;
                    currentModel = message.currentModel;
                    updateModelSelector(message.models);

                    if (message.history) {
                        message.history.forEach(msg => addMessage(msg));
                    }
                    break;

                case 'userMessage':
                case 'assistantMessage':
                case 'systemMessage':
                    addMessage(message.message);
                    break;

                case 'typing':
                    typingIndicator.classList.toggle('active', message.isTyping);
                    break;

                case 'expressMode':
                    expressIndicator.classList.toggle('active', message.active);
                    break;

                case 'agenticTakeover':
                    agenticIndicator.classList.toggle('active', message.active);
                    break;

                case 'webSearch':
                    webSearchIndicator.classList.toggle('active', message.active);
                    break;

                case 'modelChanged':
                    currentModel = message.model;
                    for (let option of modelSelector.options) {
                        option.selected = option.value === message.model;
                    }
                    break;

                case 'error':
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'message system';
                    errorDiv.innerHTML = \`❌ \${message.message}\`;
                    messagesDiv.appendChild(errorDiv);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    break;

                case 'contextSaved':
                case 'contextLoaded':
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'message system';
                    infoDiv.innerHTML = message.message;
                    messagesDiv.appendChild(infoDiv);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    break;

                case 'clearChat':
                    messagesDiv.innerHTML = '<div class="message system">🐻 Chat cleared. How can I help you?</div>';
                    break;
            }
        });

        // Send ready message when webview loads
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
    }
}
