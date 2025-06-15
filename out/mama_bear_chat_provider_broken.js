"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MamaBearChatProvider = void 0;
class MamaBearChatProvider {
    constructor(context, apiClient) {
        this._conversationHistory = [];
        this._currentModel = 'gemini-2.5-flash';
        this._availableModels = {};
        this._modelRegistry = {};
        this._context = context;
        this._apiClient = apiClient;
        this.loadModelRegistry();
        this.loadAvailableModels();
    }
    resolveWebviewView(webviewView, context, _token) {
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
    async loadModelRegistry() {
        try {
            const modelRegistryPath = vscode.Uri.joinPath(this._context.extensionUri, 'config', 'models', 'mama-bear-models.json');
            const registryData = await vscode.workspace.fs.readFile(modelRegistryPath);
            this._modelRegistry = JSON.parse(registryData.toString());
            // Set default model from registry
            if (this._modelRegistry.model_registry?.recommended_defaults?.general) {
                this._currentModel = this._modelRegistry.model_registry.recommended_defaults.general;
            }
        }
        catch (error) {
            console.error('Failed to load model registry:', error);
            // Fallback to embedded model list
            this._modelRegistry = this.getDefaultModelRegistry();
        }
    }
    getDefaultModelRegistry() {
        return {
            model_registry: {
                models: {
                    'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', capabilities: ['fast', 'coding'] },
                    'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', capabilities: ['reasoning', 'code'] },
                    'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', capabilities: ['ultra_fast'] }
                },
                recommended_defaults: {
                    general: 'gemini-2.5-flash',
                    coding: 'claude-3-5-sonnet',
                    fast: 'gemini-2.0-flash'
                }
            }
        };
    }
    async loadAvailableModels() {
        try {
            this._availableModels = await this._apiClient.getAvailableModels();
        }
        catch (error) {
            console.error('Failed to load available models:', error);
            // Use registry as fallback
            this._availableModels = this._modelRegistry.model_registry?.models || {};
        }
    }
    async sendInitialData() {
        if (!this._view)
            return;
        await this._view.webview.postMessage({
            type: 'initialData',
            models: this._availableModels,
            currentModel: this._currentModel,
            history: this._conversationHistory
        });
    }
    async handleUserMessage(message) {
        if (!this._view)
            return;
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
            const context = {
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
            }
            else {
                await this._view.webview.postMessage({
                    type: 'error',
                    message: response.error || 'Sorry, I encountered an error processing your request.'
                });
            }
        }
        catch (error) {
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
    async processExpressMode(query) {
        if (!this._view)
            return;
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
            }
            else {
                throw new Error(response.error || 'Express Mode failed');
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'error',
                message: `Express Mode Error: ${error.message}`
            });
        }
        finally {
            await this._view.webview.postMessage({
                type: 'expressMode',
                active: false
            });
        }
    }
    async changeModel(modelId) {
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
    async showModelSelector() {
        const models = Object.keys(this._availableModels);
        const selected = await vscode.window.showQuickPick(models, {
            placeHolder: 'Select AI model for Mama Bear',
            title: '🤖 Choose Mama Bear\'s Model'
        });
        if (selected) {
            await this.changeModel(selected);
        }
    }
    async explainCode(selectedText) {
        const message = `🔍 Please explain this code:\n\n\`\`\`\n${selectedText}\n\`\`\``;
        await this.handleUserMessage(message);
    }
    async fixCode(selectedText, fileName) {
        const message = `🔧 Please analyze and fix any issues in this code from ${fileName}:\n\n\`\`\`\n${selectedText}\n\`\`\``;
        await this.handleUserMessage(message);
    }
    async optimizeFile(document) {
        const code = document.getText();
        const message = `⚡ Please optimize this ${document.languageId} file (${document.fileName}):\n\n\`\`\`${document.languageId}\n${code}\n\`\`\``;
        await this.handleUserMessage(message);
    }
    async generateTests(document) {
        const code = document.getText();
        const message = `🧪 Please generate comprehensive tests for this ${document.languageId} code:\n\n\`\`\`${document.languageId}\n${code}\n\`\`\``;
        await this.handleUserMessage(message);
    }
    async initiateAgenticTakeover(task) {
        if (!this._view)
            return;
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
            }
            else {
                throw new Error(response.error || 'Agentic takeover failed');
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'error',
                message: `Agentic Takeover Error: ${error.message}`
            });
        }
        finally {
            await this._view.webview.postMessage({
                type: 'agenticTakeover',
                active: false
            });
        }
    }
    async performWebSearch(query) {
        if (!this._view)
            return;
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
            }
            else {
                throw new Error(response.error || 'Web search failed');
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'error',
                message: `Web Search Error: ${error.message}`
            });
        }
        finally {
            await this._view.webview.postMessage({
                type: 'webSearch',
                active: false
            });
        }
    }
    async analyzeCurrentFile() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return;
        }
        const document = activeEditor.document;
        const message = `📋 Please analyze this ${document.languageId} file (${document.fileName}):\n\n\`\`\`${document.languageId}\n${document.getText()}\n\`\`\``;
        await this.handleUserMessage(message);
    }
    async saveCurrentContext() {
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
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to save context: ${error.message}`);
        }
    }
    async loadSavedContext() {
        try {
            const contexts = await this._apiClient.loadContext();
            if (contexts.length > 0) {
                // Show context selection if multiple available
                if (contexts.length > 1) {
                    const selected = await vscode.window.showQuickPick(contexts.map((ctx, index) => ({
                        label: `Context ${index + 1}`,
                        description: new Date(ctx.timestamp).toLocaleString(),
                        context: ctx
                    })), { placeHolder: 'Select context to load' });
                    if (selected) {
                        this.loadContextData(selected.context);
                    }
                }
                else {
                    this.loadContextData(contexts[0]);
                }
            }
            else {
                vscode.window.showInformationMessage('No saved contexts found');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load context: ${error.message}`);
        }
    }
    loadContextData(contextData) {
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
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to apply context: ${error.message}`);
        }
    }
    async browseMcpAgents() {
        try {
            const agents = await this._apiClient.getMcpAgents();
            if (agents.length > 0 && this._view) {
                await this._view.webview.postMessage({
                    type: 'mcpAgents',
                    agents
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to browse MCP agents: ${error.message}`);
        }
    }
    clearConversation() {
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
    async handleFileUpload(file, fileName, fileType) {
        if (!this._view)
            return;
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
            }
            else {
                await this._view.webview.postMessage({
                    type: 'uploadError',
                    fileName,
                    error: response.error
                });
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'uploadError',
                fileName,
                error: error.message
            });
        }
    }
    async handleImagePaste(imageData, prompt) {
        if (!this._view)
            return;
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
            }
            else {
                await this._view.webview.postMessage({
                    type: 'error',
                    error: response.error
                });
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
    async handleVoiceRecording(audioData) {
        if (!this._view)
            return;
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
            }
            else {
                await this._view.webview.postMessage({
                    type: 'voiceError',
                    error: response.error
                });
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'voiceError',
                error: error.message
            });
        }
    }
    // ============================================================================
    // MCP INTEGRATION
    // ============================================================================
    async connectToMCP() {
        if (!this._view)
            return;
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
            }
            else {
                await this._view.webview.postMessage({
                    type: 'mcpError',
                    error: response.error
                });
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'mcpError',
                error: error.message
            });
        }
    }
    async executeMCPTool(toolName, parameters) {
        if (!this._view)
            return;
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
            }
            else {
                await this._view.webview.postMessage({
                    type: 'mcpError',
                    tool: toolName,
                    error: response.error
                });
            }
        }
        catch (error) {
            await this._view.webview.postMessage({
                type: 'mcpError',
                tool: toolName,
                error: error.message
            });
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mama Bear AI Assistant</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-editor-foreground, #d4d4d4);
            height: 100vh;
            overflow: hidden;
        }

        .main-container {
            display: flex;
            height: 100vh;
            position: relative;
        }

        /* Clean Chat Area - Main Focus */
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--vscode-editor-background, #1e1e1e);
            position: relative;
        }

        /* Top Header Bar with Inlaid Controls */
        .top-header {
            display: flex;
            align-items: center;
            padding: 8px 20px;
            background: var(--vscode-titleBar-activeBackground, #3c3c3c);
            border-bottom: 1px solid var(--vscode-panel-border, #2d2d30);
            position: relative;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .header-center {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        /* Inlaid Header Icons */
        .header-icon {
            width: 28px;
            height: 28px;
            background: none;
            border: none;
            color: var(--vscode-foreground, #cccccc);
            cursor: pointer;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s ease;
            position: relative;
        }

        .header-icon:hover {
            background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.05));
            transform: translateY(-1px);
        }

        /* Mode Toggles */
        .mode-toggles {
            display: flex;
            gap: 12px;
        }

        .mode-toggle {
            padding: 4px 12px;
            background: var(--vscode-button-secondaryBackground, rgba(255,255,255,0.05));
            border: none;
            border-radius: 12px;
            color: var(--vscode-foreground, #cccccc);
            font-size: 11px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .mode-toggle.active {
            background: var(--vscode-button-background, #0e639c);
            color: white;
            box-shadow: 0 2px 8px rgba(14, 99, 156, 0.3);
        }

        /* Model Selector */
        .model-selector {
            background: var(--vscode-dropdown-background, #3c3c3c);
            border: 1px solid var(--vscode-dropdown-border, #3c3c3c);
            border-radius: 8px;
            padding: 6px 12px;
            color: var(--vscode-dropdown-foreground, #cccccc);
            font-size: 11px;
            cursor: pointer;
            min-width: 120px;
        }

        /* Chat Messages Area */
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            scroll-behavior: smooth;
        }

        .message {
            margin-bottom: 20px;
            display: flex;
            gap: 12px;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
            flex-direction: row-reverse;
        }

        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .message.user .message-avatar {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .message.assistant .message-avatar {
            background: linear-gradient(135deg, #f59e0b, #f97316);
        }

        .message-content {
            background: var(--vscode-chat-requestBackground, #2d2d30);
            border-radius: 16px 16px 16px 4px;
            padding: 16px 20px;
            max-width: 80%;
            position: relative;
        }

        .message.user .message-content {
            background: var(--vscode-chat-slashCommandBackground, #553c9a);
            border-radius: 16px 16px 4px 16px;
        }

        .message-meta {
            font-size: 11px;
            color: var(--vscode-descriptionForeground, #969696);
            margin-top: 8px;
            display: flex;
            gap: 12px;
        }

        /* Enhanced Chat Input with Inlaid Border Controls */
        .chat-input-container {
            padding: 20px 24px;
            background: var(--vscode-input-background, #3c3c3c);
            border-top: 1px solid var(--vscode-panel-border, #2d2d30);
        }

        .input-wrapper {
            position: relative;
            background: var(--vscode-editor-background, #1e1e1e);
            border-radius: 24px;
            border: 3px solid var(--vscode-input-border, #3c3c3c);
            transition: all 0.3s ease;
            display: flex;
            align-items: flex-end;
            min-height: 48px;
        }

        .input-wrapper:focus-within {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        /* Left Border Controls */
        .left-controls {
            display: flex;
            align-items: center;
            padding: 0 4px 0 8px;
            gap: 4px;
        }

        /* Right Border Controls */
        .right-controls {
            display: flex;
            align-items: center;
            padding: 0 8px 0 4px;
            gap: 4px;
        }

        /* Inlaid Border Buttons */
        .border-btn {
            width: 32px;
            height: 32px;
            background: none;
            border: none;
            color: var(--vscode-foreground, #aaa);
            cursor: pointer;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.2s ease;
            opacity: 0.7;
        }

        .border-btn:hover {
            background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.05));
            opacity: 1;
            transform: scale(1.05);
        }

        .border-btn.recording {
            color: #ef4444;
            opacity: 1;
            animation: pulse 1s infinite;
        }

        .border-btn.send {
            background: #6366f1;
            color: white;
            opacity: 1;
        }

        .border-btn.send:hover {
            background: #5855eb;
        }

        .border-btn.send:disabled {
            background: #374151;
            cursor: not-allowed;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        /* Main Text Input */
        .main-input {
            flex: 1;
            background: none;
            border: none;
            color: var(--vscode-input-foreground, #cccccc);
            font-size: 14px;
            resize: none;
            outline: none;
            min-height: 32px;
            max-height: 120px;
            line-height: 1.5;
            padding: 8px 12px;
        }

        .main-input::placeholder {
            color: var(--vscode-input-placeholderForeground, #888);
        }

        /* Popup Menus */
        .popup-menu {
            position: absolute;
            background: var(--vscode-menu-background, #3c3c3c);
            border: 1px solid var(--vscode-menu-border, #454545);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 1000;
            display: none;
            backdrop-filter: blur(20px);
            max-height: 400px;
            overflow-y: auto;
        }

        .popup-menu.show {
            display: block;
            animation: popupIn 0.2s ease;
        }

        @keyframes popupIn {
            from { opacity: 0; transform: translateY(-10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Status Pills */
        .status-pills {
            display: flex;
            gap: 6px;
            margin-left: 12px;
        }

        .status-pill {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .pill-memory {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .pill-mcp {
            background: rgba(139, 92, 246, 0.2);
            color: #8b5cf6;
            border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .pill-express {
            background: rgba(255, 215, 0, 0.2);
            color: #ffd700;
            border: 1px solid rgba(255, 215, 0, 0.3);
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

        /* Multimodal Upload Zone */
        .upload-zone {
            margin-bottom: 16px;
            padding: 20px;
            border: 2px dashed var(--vscode-input-border, #3c3c3c);
            border-radius: 12px;
            text-align: center;
            transition: all 0.3s ease;
            display: none;
        }

        .upload-zone.active {
            display: block;
        }

        .upload-zone.dragover {
            border-color: #6366f1;
            background: rgba(99, 102, 241, 0.05);
        }

        .file-preview {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }

        .file-tag {
            background: var(--vscode-badge-background, #0e639c);
            color: var(--vscode-badge-foreground, white);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .remove-file {
            cursor: pointer;
            opacity: 0.7;
        }

        .remove-file:hover {
            opacity: 1;
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

        /* Tooltips */
        [data-tooltip] {
            position: relative;
        }

        [data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 1000;
            margin-bottom: 4px;
        }

        [data-tooltip]:hover::after {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="main-container">
        <!-- Clean Chat Area -->
        <div class="chat-area">
            <!-- Top Header with Inlaid Controls -->
            <div class="top-header">
                <div class="header-left">
                    <button class="header-icon" data-tooltip="New Chat" onclick="newChat()">💬</button>
                    <button class="header-icon" data-tooltip="Chat History" onclick="toggleChatHistory()">📚</button>
                </div>

                <div class="header-center">
                    <select class="model-selector" id="modelSelect">
                        <option value="gemini-2.0-flash-exp">🔥 Gemini 2.5 Flash</option>
                        <option value="claude-3.5-sonnet">🧠 Claude 3.5 Sonnet</option>
                        <option value="gpt-4o">⚡ GPT-4o</option>
                    </select>

                    <!-- Mode Toggles -->
                    <div class="mode-toggles">
                        <button class="mode-toggle" id="expressMode" onclick="toggleMode('express')">⚡ Express</button>
                        <button class="mode-toggle" id="agenticMode" onclick="toggleMode('agentic')">🤖 Agentic</button>
                    </div>

                    <!-- Status Pills -->
                    <div class="status-pills">
                        <div class="status-pill pill-memory">MEM0</div>
                        <div class="status-pill pill-mcp">MCP</div>
                        <div class="status-pill pill-express" style="display: none;" id="expressPill">EXPRESS</div>
                    </div>
                </div>

                <div class="header-right">
                    <button class="header-icon" data-tooltip="MCP Tools" onclick="toggleMcpTools()">🔧</button>
                    <button class="header-icon" data-tooltip="Background Terminal" onclick="openTerminal()">💻</button>
                    <button class="header-icon" data-tooltip="Settings" onclick="openSettings()">⚙️</button>
                </div>
            </div>

            <!-- Chat Messages -->
            <div class="chat-messages" id="chatMessages">
                <div class="message assistant">
                    <div class="message-avatar">🐻</div>
                    <div class="message-content">
                        <div>Welcome to Mama Bear AI! I'm ready to help with coding, analysis, and creative tasks. All your multimodal features are active!</div>
                        <div class="message-meta">
                            <span>gemini-2.0-flash-exp</span>
                            <span>156ms</span>
                            <span>MEM0 Enhanced</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Typing Indicator -->
            <div class="typing-indicator" id="typingIndicator">
                🐻 Mama Bear is thinking...
            </div>

            <!-- Enhanced Chat Input with Inlaid Border Controls -->
            <div class="chat-input-container">
                <!-- Multimodal Upload Zone -->
                <div class="upload-zone" id="uploadZone">
                    <div>📁 Drop files here or click to browse</div>
                    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">
                        Supports: Images, PDFs, Documents, Code files
                    </div>
                </div>

                <!-- File Preview -->
                <div class="file-preview" id="filePreview"></div>

                <div class="input-wrapper">
                    <!-- Left Border Controls -->
                    <div class="left-controls">
                        <button class="border-btn" data-tooltip="Upload File" onclick="toggleUploadZone()">📁</button>
                        <button class="border-btn" data-tooltip="Add Context" onclick="toggleContextMenu()">📎</button>
                        <button class="border-btn" data-tooltip="Voice Input" onclick="toggleVoice()" id="micBtn">🎙️</button>
                    </div>

                    <!-- Main Input -->
                    <textarea class="main-input" id="mainInput" placeholder="Ask Mama Bear anything..." rows="1" oninput="autoResize(this)" onkeydown="handleKeydown(event)" onpaste="handlePaste(event)"></textarea>

                    <!-- Right Border Controls -->
                    <div class="right-controls">
                        <button class="border-btn" data-tooltip="Emoji" onclick="toggleEmojiPicker()">😊</button>
                        <button class="border-btn send" id="sendBtn" data-tooltip="Send Message" onclick="sendMessage()">→</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentModel = 'gemini-2.0-flash-exp';
        let isExpressMode = false;
        let isAgenticMode = false;
        let isRecording = false;
        let uploadedFiles = [];

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('mainInput').focus();
        });

        // VS Code Extension Communication
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'userMessage':
                    addMessage('user', message.message.content, message.message);
                    break;
                case 'assistantMessage':
                    addMessage('assistant', message.message.content, message.message);
                    break;
                case 'typing':
                    setTyping(message.isTyping);
                    break;
                case 'fileUploaded':
                    handleFileUploaded(message.fileName, message.response);
                    break;
                case 'imageProcessed':
                    handleImageProcessed(message.imageData, message.response);
                    break;
                case 'voiceProcessed':
                    handleVoiceProcessed(message.transcript, message.response);
                    break;
                case 'mcpConnected':
                    updateMcpStatus(true);
                    break;
                case 'expressMode':
                    setExpressMode(message.active);
                    break;
                case 'error':
                    showError(message.error || message.message);
                    break;
            }
        });

        // UI Functions
        function addMessage(role, content, metadata = {}) {
            const container = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            
            const avatar = role === 'user' ? '👤' : '🐻';
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            let metaInfo = '';
            if (role === 'assistant') {
                metaInfo = \`
                    <div class="message-meta">
                        <span>\${metadata.model || currentModel}</span>
                        \${metadata.processingTime ? \`<span>\${metadata.processingTime}ms</span>\` : ''}
                        <span>MEM0 Enhanced</span>
                    </div>
                \`;
            } else {
                metaInfo = \`<div class="message-meta"><span>\${time}</span></div>\`;
            }
            
            messageDiv.innerHTML = \`
                <div class="message-avatar">\${avatar}</div>
                <div class="message-content">
                    <div>\${formatMessage(content)}</div>
                    \${metaInfo}
                </div>
            \`;
            
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
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

        function setTyping(isTyping) {
            const indicator = document.getElementById('typingIndicator');
            indicator.classList.toggle('active', isTyping);
        }

        function setExpressMode(active) {
            const pill = document.getElementById('expressPill');
            pill.style.display = active ? 'block' : 'none';
        }

        function sendMessage() {
            const input = document.getElementById('mainInput');
            const message = input.value.trim();
            
            if (!message && uploadedFiles.length === 0) return;
            
            // Send to VS Code extension
            vscode.postMessage({
                type: 'sendMessage',
                message: message,
                files: uploadedFiles,
                expressMode: isExpressMode,
                agenticMode: isAgenticMode
            });
            
            // Clear input
            input.value = '';
            autoResize(input);
            uploadedFiles = [];
            updateFilePreview();
        }

        function handleKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }

        function handlePaste(event) {
            const items = event.clipboardData.items;
            
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        vscode.postMessage({
                            type: 'pasteImage',
                            imageData: e.target.result,
                            prompt: 'Analyze this pasted image'
                        });
                    };
                    reader.readAsDataURL(file);
                    event.preventDefault();
                }
            }
        }

        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }

        function toggleMode(mode) {
            if (mode === 'express') {
                isExpressMode = !isExpressMode;
                document.getElementById('expressMode').classList.toggle('active', isExpressMode);
            } else if (mode === 'agentic') {
                isAgenticMode = !isAgenticMode;
                document.getElementById('agenticMode').classList.toggle('active', isAgenticMode);
            }
        }

        function toggleUploadZone() {
            const zone = document.getElementById('uploadZone');
            zone.classList.toggle('active');
        }

        function toggleVoice() {
            isRecording = !isRecording;
            const micBtn = document.getElementById('micBtn');
            
            if (isRecording) {
                micBtn.classList.add('recording');
                micBtn.innerHTML = '⏹️';
                vscode.postMessage({ type: 'startRecording' });
            } else {
                micBtn.classList.remove('recording');
                micBtn.innerHTML = '🎙️';
                vscode.postMessage({ type: 'stopRecording' });
            }
        }

        function updateFilePreview() {
            const preview = document.getElementById('filePreview');
            preview.innerHTML = uploadedFiles.map(file => \`
                <div class="file-tag">
                    📄 \${file.name}
                    <span class="remove-file" onclick="removeFile('\${file.name}')">×</span>
                </div>
            \`).join('');
        }

        function removeFile(fileName) {
            uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
            updateFilePreview();
        }

        function handleFileUploaded(fileName, response) {
            uploadedFiles.push({ name: fileName, response });
            updateFilePreview();
        }

        function handleImageProcessed(imageData, response) {
            addMessage('assistant', response);
        }

        function handleVoiceProcessed(transcript, response) {
            if (transcript) {
                addMessage('user', \`🎙️ \${transcript}\`);
            }
            if (response) {
                addMessage('assistant', response);
            }
        }

        function updateMcpStatus(connected) {
            const pill = document.querySelector('.pill-mcp');
            pill.style.opacity = connected ? 1 : 0.5;
        }

        function showError(error) {
            addMessage('assistant', \`❌ Error: \${error}\`);
        }

        // Placeholder functions for remaining features
        function newChat() { vscode.postMessage({ type: 'clearChat' }); }
        function toggleChatHistory() { console.log('Chat history'); }
        function toggleMcpTools() { vscode.postMessage({ type: 'mcpConnect' }); }
        function toggleContextMenu() { console.log('Context menu'); }
        function toggleEmojiPicker() { console.log('Emoji picker'); }
        function openTerminal() { vscode.postMessage({ type: 'backgroundTerminal' }); }
        function openSettings() { console.log('Settings'); }
    </script>
</body>
</html>`;
    }
}
exports.MamaBearChatProvider = MamaBearChatProvider;
MamaBearChatProvider.viewType = 'mamaBearChat';
-size;
12;
px;
autonomous - actions;
ul;
{
    margin: 0;
    padding - left;
    16;
    px;
}
/style>
    < /head>
    < body >
    class {
    };
"header" >
    class {
    };
"title" > ;
Mama;
Bear;
AI < /div>
    < select;
class {
}
"model-selector";
id = "modelSelector" >
    value;
"" > Loading;
models;
/option>
    < /select>
    < /div>
    < div;
class {
}
"status-indicator express";
id = "expressIndicator" > ;
Express;
Mode < /div>
    < div;
class {
}
"status-indicator agentic";
id = "agenticIndicator" > ;
Agentic;
Mode < /div>
    < div;
class {
}
"status-indicator web-search";
id = "webSearchIndicator" > ;
Web;
Search < /div>
    < div;
class {
}
"chat-container" >
    class {
    };
"messages";
id = "messages" >
    class {
    };
"message system" >
;
Hi;
I;
'm Mama Bear, your AI assistant. I have access to 15+ AI models, my own RAG system, web search, and agentic capabilities. How can I help you today?
    < /div>
    < /div>
    < div;
class {
}
"typing-indicator";
id = "typingIndicator" >
;
Mama;
Bear;
is;
thinking;
/div>
    < /div>
    < div;
class {
}
"input-container" >
    class {
    };
"input-row" >
    class {
    };
"message-input";
id = "messageInput";
placeholder = "Ask Mama Bear anything...";
rows = "1" > /textarea>
    < button;
class {
}
"send-button";
id = "sendButton" > Send < /button>
    < /div>
    < div;
class {
}
"action-buttons" >
    class {
    };
"action-button";
id = "expressBtn" > ;
Express < /button>
    < button;
class {
}
"action-button";
id = "agenticBtn" > ;
Agentic < /button>
    < button;
class {
}
"action-button";
id = "analyzeBtn" > ;
Analyze;
File < /button>
    < button;
class {
}
"action-button";
id = "searchBtn" > ;
Web;
Search < /button>
    < button;
class {
}
"action-button";
id = "saveBtn" > ;
Save < /button>
    < button;
class {
}
"action-button";
id = "loadBtn" > ;
Load < /button>
    < button;
class {
}
"action-button";
id = "clearBtn" > ;
Clear < /button>
    < /div>
    < (/div>);
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
    if (!message)
        return;
    vscode.postMessage({
        type: 'sendMessage',
        message: message
    });
    messageInput.value = '';
}
function addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = ;
    `message \${message.role}\`;

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
//# sourceMappingURL=mama_bear_chat_provider_broken.js.map