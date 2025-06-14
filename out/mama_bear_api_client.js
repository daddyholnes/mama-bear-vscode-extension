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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MamaBearApiClient = void 0;
// src/api/MamaBearApiClient.ts
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class MamaBearApiClient {
    constructor(backendUrl = 'http://localhost:5000') {
        this.serviceAccountAuth = true; // Use service accounts instead of API keys
        this.backendUrl = backendUrl;
        this.userId = this.generateUserId();
        this.sessionId = this.generateSessionId();
        this.client = axios_1.default.create({
            baseURL: backendUrl,
            timeout: 60000, // 60 seconds for complex requests
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MamaBear-VSCode/1.0.0',
                'X-Service-Account-Auth': 'true', // Signal to backend to use service accounts
                'X-Client-Type': 'vscode-extension'
            }
        });
        // Add request interceptor for logging
        this.client.interceptors.request.use(request => {
            console.log('🐻 API Request:', request.method?.toUpperCase(), request.url);
            return request;
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use(response => response, error => {
            console.error('🐻 API Error:', error.message);
            vscode.window.showErrorMessage(`Mama Bear API Error: ${error.message}`);
            throw error;
        });
    }
    // ============================================================================
    // CORE CHAT AND AGENTIC CAPABILITIES
    // ============================================================================
    async sendMessage(message, context) {
        try {
            const response = await this.client.post('/api/mama-bear/chat', {
                message,
                user_id: this.userId,
                session_id: this.sessionId,
                page_context: 'vscode_extension',
                context: {
                    ...context,
                    workspace: vscode.workspace.workspaceFolders?.[0]?.name,
                    active_file: vscode.window.activeTextEditor?.document.fileName
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to send message to Mama Bear'
            };
        }
    }
    async sendAgenticRequest(request) {
        try {
            const response = await this.client.post('/api/agentic/process', {
                ...request,
                session_id: this.sessionId,
                context: {
                    ...request.context,
                    vscode_environment: true,
                    workspace_info: await this.getWorkspaceInfo()
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to process agentic request'
            };
        }
    }
    async expressMode(query) {
        try {
            const response = await this.client.post('/api/express-mode/ultra-fast', {
                message: query,
                user_id: this.userId,
                context: {
                    vscode_extension: true,
                    workspace: vscode.workspace.workspaceFolders?.[0]?.name
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Express Mode request failed'
            };
        }
    }
    // ============================================================================
    // MULTIMODAL CHAT API - ACCESS TO ALL 15+ MODELS
    // ============================================================================
    async getAvailableModels() {
        try {
            const response = await this.client.get('/api/multimodal-chat/models');
            return response.data.models || [];
        }
        catch (error) {
            console.error('Failed to get available models:', error);
            return [];
        }
    }
    async suggestOptimalModel(message) {
        try {
            const response = await this.client.post('/api/chat/suggest-model', {
                message,
                available_models: await this.getAvailableModels(),
                max_suggestions: 3
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to get model suggestions:', error);
            return { suggestions: [] };
        }
    }
    async streamChat(messages, model) {
        try {
            const response = await fetch(`${this.backendUrl}/api/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    model: model || 'gemini-2.0-flash-exp',
                    user_id: this.userId,
                    session_id: this.sessionId
                })
            });
            if (!response.body) {
                throw new Error('No response body');
            }
            return response.body;
        }
        catch (error) {
            throw new Error(`Streaming failed: ${error.message}`);
        }
    }
    // ============================================================================
    // CODE ANALYSIS AND COMPLETION
    // ============================================================================
    async analyzeCode(code, fileName, analysis_type = 'general') {
        try {
            const response = await this.client.post('/api/multimodal-chat/code-assistance', {
                code,
                language: this.getLanguageFromFileName(fileName),
                task: analysis_type,
                context: `VS Code file: ${fileName}`
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Code analysis failed'
            };
        }
    }
    async getCodeCompletion(code, position, fileName) {
        try {
            const response = await this.client.post('/api/multimodal-chat/code-assistance', {
                code: code.substring(0, position),
                language: this.getLanguageFromFileName(fileName),
                task: 'complete',
                context: `Auto-completion at position ${position} in ${fileName}`
            });
            if (response.data.success) {
                // Extract completion suggestions from response
                const completions = this.extractCompletions(response.data.response);
                return completions;
            }
            return [];
        }
        catch (error) {
            console.error('Code completion failed:', error);
            return [];
        }
    }
    async explainCode(code, fileName) {
        return this.analyzeCode(code, fileName, 'explain');
    }
    async fixCode(code, fileName) {
        return this.analyzeCode(code, fileName, 'debug');
    }
    async optimizeCode(code, fileName) {
        return this.analyzeCode(code, fileName, 'optimize');
    }
    async generateTests(code, fileName) {
        return this.analyzeCode(code, fileName, 'generate_tests');
    }
    // ============================================================================
    // PROJECT AND FILE ANALYSIS
    // ============================================================================
    async initializeProject(projectInfo) {
        try {
            const response = await this.client.post('/api/mama-bear/context', {
                key: 'project_info',
                value: projectInfo
            });
            // Also save to memory for persistent context
            await this.client.post('/api/memory/save', {
                user_id: this.userId,
                content: `VS Code project initialized: ${JSON.stringify(projectInfo)}`,
                memory_type: 'project_context',
                metadata: {
                    project_name: projectInfo.name,
                    project_path: projectInfo.path,
                    vscode_extension: true
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Project initialization failed'
            };
        }
    }
    async analyzeProject() {
        try {
            const projectInfo = await this.getWorkspaceInfo();
            const response = await this.client.post('/api/multimodal-chat/research-mode', {
                query: `Analyze this VS Code project: ${JSON.stringify(projectInfo)}`,
                type: 'analysis',
                depth: 'comprehensive'
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Project analysis failed'
            };
        }
    }
    // ============================================================================
    // COLLABORATIVE WORKSPACES
    // ============================================================================
    async createCollaborativeSession(sessionName, mode) {
        try {
            const response = await this.client.post('/api/workspaces/create', {
                session_name: sessionName,
                mode,
                creator_id: this.userId,
                agentic_control_level: 0.8 // High autonomy for VS Code
            });
            if (response.data.success) {
                return response.data.session;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to create collaborative session:', error);
            return null;
        }
    }
    async joinCollaborativeSession(sessionId) {
        try {
            const response = await this.client.post(`/api/workspaces/${sessionId}/join`, {
                user_id: this.userId,
                role: 'developer'
            });
            return response.data.success;
        }
        catch (error) {
            console.error('Failed to join collaborative session:', error);
            return false;
        }
    }
    // ============================================================================
    // MCP INTEGRATION
    // ============================================================================
    async getMcpAgents() {
        try {
            const response = await this.client.get('/api/revolutionary-mcp/agents');
            return response.data.agents || [];
        }
        catch (error) {
            console.error('Failed to get MCP agents:', error);
            return [];
        }
    }
    async searchMcpAgents(query) {
        try {
            const response = await this.client.post('/api/revolutionary-mcp/search', {
                query,
                filters: { source: 'all' }
            });
            return response.data.agents || [];
        }
        catch (error) {
            console.error('Failed to search MCP agents:', error);
            return [];
        }
    }
    // ============================================================================
    // WEB SEARCH AND RESEARCH
    // ============================================================================
    async performWebSearch(query) {
        try {
            const response = await this.client.post('/api/scout/search', {
                query,
                user_id: this.userId,
                context: 'vscode_research'
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Web search failed'
            };
        }
    }
    // ============================================================================
    // MEMORY AND CONTEXT MANAGEMENT
    // ============================================================================
    async saveContext(contextData) {
        try {
            const response = await this.client.post('/api/memory/save', {
                user_id: this.userId,
                content: JSON.stringify(contextData),
                memory_type: 'vscode_context',
                metadata: {
                    timestamp: new Date().toISOString(),
                    workspace: vscode.workspace.workspaceFolders?.[0]?.name
                }
            });
            return response.data.success;
        }
        catch (error) {
            console.error('Failed to save context:', error);
            return false;
        }
    }
    async loadContext() {
        try {
            const response = await this.client.post('/api/memory/search', {
                user_id: this.userId,
                query: 'vscode context',
                limit: 10
            });
            return response.data.memories || [];
        }
        catch (error) {
            console.error('Failed to load context:', error);
            return [];
        }
    }
    // ============================================================================
    // GITHUB INTEGRATION
    // ============================================================================
    async analyzeRepository() {
        try {
            const gitInfo = await this.getGitInfo();
            const response = await this.client.post('/api/multimodal-chat/research-mode', {
                query: `Analyze this GitHub repository: ${JSON.stringify(gitInfo)}`,
                type: 'analysis',
                depth: 'comprehensive'
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Repository analysis failed'
            };
        }
    }
    async generateCommitMessage(changes) {
        try {
            const response = await this.client.post('/api/multimodal-chat/code-assistance', {
                code: changes.join('\n'),
                task: 'generate_commit_message',
                context: 'Git commit message generation'
            });
            if (response.data.success) {
                return this.extractCommitMessage(response.data.response);
            }
            return 'Update: Various improvements';
        }
        catch (error) {
            console.error('Failed to generate commit message:', error);
            return 'Update: Various improvements';
        }
    }
    // ============================================================================
    // WEBSOCKET CONNECTION FOR REAL-TIME COLLABORATION
    // ============================================================================
    connectWebSocket(sessionId) {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `ws://${this.backendUrl.replace('http://', '').replace('https://', '')}/ws/mama-bear/${sessionId || this.sessionId}`;
                // Use global WebSocket if available
                if (typeof WebSocket !== 'undefined') {
                    this.websocket = new WebSocket(wsUrl);
                    this.websocket.onopen = () => {
                        console.log('🐻 WebSocket connected to Mama Bear');
                        resolve(this.websocket);
                    };
                    this.websocket.onerror = (error) => {
                        console.error('🐻 WebSocket error:', error);
                        reject(error);
                    };
                    this.websocket.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            this.handleWebSocketMessage(data);
                        }
                        catch (error) {
                            console.error('Failed to parse WebSocket message:', error);
                        }
                    };
                }
                else {
                    reject(new Error('WebSocket not available in this environment'));
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
    handleWebSocketMessage(data) {
        // Handle real-time messages from Mama Bear
        switch (data.type) {
            case 'agentic_assistance':
                vscode.window.showInformationMessage(`🤖 Mama Bear: ${data.message}`);
                break;
            case 'collaboration_update':
                // Handle collaborative session updates
                break;
            case 'context_update':
                // Handle context changes
                break;
        }
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    generateUserId() {
        return `vscode_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateSessionId() {
        return `vscode_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getLanguageFromFileName(fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap = {
            'ts': 'typescript',
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'rb': 'ruby',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown',
            'sql': 'sql',
            'sh': 'bash',
            'ps1': 'powershell'
        };
        return languageMap[extension || ''] || 'text';
    }
    async getWorkspaceInfo() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return {};
        return {
            name: workspaceFolders[0].name,
            path: workspaceFolders[0].uri.fsPath,
            activeFile: vscode.window.activeTextEditor?.document.fileName,
            openFiles: vscode.window.tabGroups.all.flatMap(group => group.tabs.map(tab => tab.input?.uri?.fsPath).filter(Boolean))
        };
    }
    async getGitInfo() {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
                const git = gitExtension.exports.getAPI(1);
                const repo = git.repositories[0];
                if (repo) {
                    return {
                        branch: repo.state.HEAD?.name,
                        remotes: repo.state.remotes.map((remote) => ({
                            name: remote.name,
                            url: remote.fetchUrl
                        })),
                        changes: repo.state.workingTreeChanges.length,
                        staged: repo.state.indexChanges.length
                    };
                }
            }
        }
        catch (error) {
            console.error('Failed to get git info:', error);
        }
        return {};
    }
    extractCompletions(response) {
        // Extract code completions from Mama Bear's response
        const completions = [];
        // Look for code blocks or inline code
        const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
        const inlineCodeRegex = /`([^`]+)`/g;
        let match;
        while ((match = codeBlockRegex.exec(response)) !== null) {
            const code = match[1].trim();
            if (code && code.length < 200) { // Reasonable completion length
                completions.push(code);
            }
        }
        while ((match = inlineCodeRegex.exec(response)) !== null) {
            const code = match[1].trim();
            if (code && code.length < 100) {
                completions.push(code);
            }
        }
        return completions.slice(0, 5); // Limit to 5 suggestions
    }
    extractCommitMessage(response) {
        // Extract commit message from response
        const lines = response.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('*')) {
                return trimmed;
            }
        }
        return 'Update: Various improvements';
    }
    // Health check
    async checkHealth() {
        try {
            const response = await this.client.get('/api/health');
            return response.data.success;
        }
        catch (error) {
            return false;
        }
    }
    // ============================================================================
    // MULTIMODAL CAPABILITIES - FILE UPLOAD, IMAGE PROCESSING, VOICE RECORDING
    // ============================================================================
    async uploadFile(file, fileName, fileType) {
        try {
            // Use axios form data approach instead of FormData
            const data = {
                file: file,
                fileName: fileName,
                fileType: fileType,
                userId: this.userId,
                sessionId: this.sessionId
            };
            const response = await this.client.post('/api/multimodal/upload', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to upload file'
            };
        }
    }
    async processImage(imageData, prompt) {
        try {
            const response = await this.client.post('/api/multimodal/image', {
                image_data: imageData,
                prompt: prompt || 'Analyze this image',
                user_id: this.userId,
                session_id: this.sessionId,
                model: 'gemini-2.0-flash-exp' // Use vision-capable model
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to process image'
            };
        }
    }
    async processVoice(audioData, transcribeOnly = false) {
        try {
            // Use JSON approach instead of FormData for Node.js compatibility
            const data = {
                audio: audioData.toString('base64'),
                transcribeOnly: transcribeOnly,
                userId: this.userId,
                sessionId: this.sessionId
            };
            const response = await this.client.post('/api/multimodal/voice', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to process voice'
            };
        }
    }
    async getFilePreview(fileId) {
        try {
            const response = await this.client.get(`/api/multimodal/preview/${fileId}`);
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to get file preview'
            };
        }
    }
    // ============================================================================
    // MCP INTEGRATION - MODEL CONTEXT PROTOCOL
    // ============================================================================
    async connectToDockerMCP() {
        try {
            const response = await this.client.post('/api/mcp/docker/connect', {
                host: 'localhost',
                port: 8811,
                network: 'revolutionary-dev-network',
                user_id: this.userId
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to connect to Docker MCP'
            };
        }
    }
    async getMCPTools() {
        try {
            const response = await this.client.get('/api/mcp/tools');
            return response.data.tools || [];
        }
        catch (error) {
            console.error('Failed to get MCP tools:', error);
            return [];
        }
    }
    async executeMCPTool(toolName, parameters) {
        try {
            const response = await this.client.post('/api/mcp/execute', {
                tool: toolName,
                parameters,
                user_id: this.userId,
                session_id: this.sessionId
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to execute MCP tool'
            };
        }
    }
}
exports.MamaBearApiClient = MamaBearApiClient;
//# sourceMappingURL=mama_bear_api_client.js.map