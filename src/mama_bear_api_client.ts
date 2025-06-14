// src/api/MamaBearApiClient.ts
import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

// Use global WebSocket if available, otherwise fallback
declare var WebSocket: any;

export interface MamaBearResponse {
    success: boolean;
    response?: any;
    error?: string;
    model_used?: string;
    processing_time_ms?: number;
}

export interface AgenticRequest {
    message: string;
    user_id: string;
    context?: any;
    allow_autonomous_actions?: boolean;
    express_mode?: boolean;
    model_preference?: string;
}

export interface CollaborativeSession {
    session_id: string;
    name: string;
    mode: string;
    participants: any;
    websocket_url: string;
}

export class MamaBearApiClient {
    private client: AxiosInstance;
    private websocket?: any; // Use any type for WebSocket compatibility
    private backendUrl: string;
    private userId: string;
    private sessionId: string;
    private serviceAccountAuth: boolean = true; // Use service accounts instead of API keys

    constructor(backendUrl: string = 'http://localhost:5000') {
        this.backendUrl = backendUrl;
        this.userId = this.generateUserId();
        this.sessionId = this.generateSessionId();

        this.client = axios.create({
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
        this.client.interceptors.response.use(
            response => response,
            error => {
                console.error('🐻 API Error:', error.message);
                vscode.window.showErrorMessage(`Mama Bear API Error: ${error.message}`);
                throw error;
            }
        );
    }

    // ============================================================================
    // CORE CHAT AND AGENTIC CAPABILITIES
    // ============================================================================

    async sendMessage(message: string, context?: any): Promise<MamaBearResponse> {
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to send message to Mama Bear'
            };
        }
    }

    async sendAgenticRequest(request: AgenticRequest): Promise<MamaBearResponse> {
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to process agentic request'
            };
        }
    }

    async expressMode(query: string): Promise<MamaBearResponse> {
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Express Mode request failed'
            };
        }
    }

    // ============================================================================
    // MULTIMODAL CHAT API - ACCESS TO ALL 15+ MODELS
    // ============================================================================

    async getAvailableModels(): Promise<any[]> {
        try {
            const response = await this.client.get('/api/multimodal-chat/models');
            return response.data.models || [];
        } catch (error) {
            console.error('Failed to get available models:', error);
            return [];
        }
    }

    async suggestOptimalModel(message: string): Promise<any> {
        try {
            const response = await this.client.post('/api/chat/suggest-model', {
                message,
                available_models: await this.getAvailableModels(),
                max_suggestions: 3
            });
            return response.data;
        } catch (error) {
            console.error('Failed to get model suggestions:', error);
            return { suggestions: [] };
        }
    }

    async streamChat(messages: any[], model?: string): Promise<ReadableStream> {
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
        } catch (error: any) {
            throw new Error(`Streaming failed: ${error.message}`);
        }
    }

    // ============================================================================
    // CODE ANALYSIS AND COMPLETION
    // ============================================================================

    async analyzeCode(code: string, fileName: string, analysis_type: string = 'general'): Promise<MamaBearResponse> {
        try {
            const response = await this.client.post('/api/multimodal-chat/code-assistance', {
                code,
                language: this.getLanguageFromFileName(fileName),
                task: analysis_type,
                context: `VS Code file: ${fileName}`
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Code analysis failed'
            };
        }
    }

    async getCodeCompletion(code: string, position: number, fileName: string): Promise<string[]> {
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
        } catch (error) {
            console.error('Code completion failed:', error);
            return [];
        }
    }

    async explainCode(code: string, fileName: string): Promise<MamaBearResponse> {
        return this.analyzeCode(code, fileName, 'explain');
    }

    async fixCode(code: string, fileName: string): Promise<MamaBearResponse> {
        return this.analyzeCode(code, fileName, 'debug');
    }

    async optimizeCode(code: string, fileName: string): Promise<MamaBearResponse> {
        return this.analyzeCode(code, fileName, 'optimize');
    }

    async generateTests(code: string, fileName: string): Promise<MamaBearResponse> {
        return this.analyzeCode(code, fileName, 'generate_tests');
    }

    // ============================================================================
    // PROJECT AND FILE ANALYSIS
    // ============================================================================

    async initializeProject(projectInfo: any): Promise<MamaBearResponse> {
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Project initialization failed'
            };
        }
    }

    async analyzeProject(): Promise<MamaBearResponse> {
        try {
            const projectInfo = await this.getWorkspaceInfo();

            const response = await this.client.post('/api/multimodal-chat/research-mode', {
                query: `Analyze this VS Code project: ${JSON.stringify(projectInfo)}`,
                type: 'analysis',
                depth: 'comprehensive'
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Project analysis failed'
            };
        }
    }

    // ============================================================================
    // COLLABORATIVE WORKSPACES
    // ============================================================================

    async createCollaborativeSession(sessionName: string, mode: string): Promise<CollaborativeSession | null> {
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
        } catch (error) {
            console.error('Failed to create collaborative session:', error);
            return null;
        }
    }

    async joinCollaborativeSession(sessionId: string): Promise<boolean> {
        try {
            const response = await this.client.post(`/api/workspaces/${sessionId}/join`, {
                user_id: this.userId,
                role: 'developer'
            });

            return response.data.success;
        } catch (error) {
            console.error('Failed to join collaborative session:', error);
            return false;
        }
    }

    // ============================================================================
    // MCP INTEGRATION
    // ============================================================================

    async getMcpAgents(): Promise<any[]> {
        try {
            const response = await this.client.get('/api/revolutionary-mcp/agents');
            return response.data.agents || [];
        } catch (error) {
            console.error('Failed to get MCP agents:', error);
            return [];
        }
    }

    async searchMcpAgents(query: string): Promise<any[]> {
        try {
            const response = await this.client.post('/api/revolutionary-mcp/search', {
                query,
                filters: { source: 'all' }
            });
            return response.data.agents || [];
        } catch (error) {
            console.error('Failed to search MCP agents:', error);
            return [];
        }
    }

    // ============================================================================
    // WEB SEARCH AND RESEARCH
    // ============================================================================

    async performWebSearch(query: string): Promise<MamaBearResponse> {
        try {
            const response = await this.client.post('/api/scout/search', {
                query,
                user_id: this.userId,
                context: 'vscode_research'
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Web search failed'
            };
        }
    }

    // ============================================================================
    // MEMORY AND CONTEXT MANAGEMENT
    // ============================================================================

    async saveContext(contextData: any): Promise<boolean> {
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
        } catch (error) {
            console.error('Failed to save context:', error);
            return false;
        }
    }

    async loadContext(): Promise<any[]> {
        try {
            const response = await this.client.post('/api/memory/search', {
                user_id: this.userId,
                query: 'vscode context',
                limit: 10
            });

            return response.data.memories || [];
        } catch (error) {
            console.error('Failed to load context:', error);
            return [];
        }
    }

    // ============================================================================
    // GITHUB INTEGRATION
    // ============================================================================

    async analyzeRepository(): Promise<MamaBearResponse> {
        try {
            const gitInfo = await this.getGitInfo();

            const response = await this.client.post('/api/multimodal-chat/research-mode', {
                query: `Analyze this GitHub repository: ${JSON.stringify(gitInfo)}`,
                type: 'analysis',
                depth: 'comprehensive'
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Repository analysis failed'
            };
        }
    }

    async generateCommitMessage(changes: string[]): Promise<string> {
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
        } catch (error) {
            console.error('Failed to generate commit message:', error);
            return 'Update: Various improvements';
        }
    }

    // ============================================================================
    // WEBSOCKET CONNECTION FOR REAL-TIME COLLABORATION
    // ============================================================================

    connectWebSocket(sessionId?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `ws://${this.backendUrl.replace('http://', '').replace('https://', '')}/ws/mama-bear/${sessionId || this.sessionId}`;

                // Use global WebSocket if available
                if (typeof WebSocket !== 'undefined') {
                    this.websocket = new WebSocket(wsUrl);

                    this.websocket.onopen = () => {
                        console.log('🐻 WebSocket connected to Mama Bear');
                        resolve(this.websocket!);
                    };

                    this.websocket.onerror = (error: any) => {
                        console.error('🐻 WebSocket error:', error);
                        reject(error);
                    };

                    this.websocket.onmessage = (event: any) => {
                        try {
                            const data = JSON.parse(event.data);
                            this.handleWebSocketMessage(data);
                        } catch (error) {
                            console.error('Failed to parse WebSocket message:', error);
                        }
                    };
                } else {
                    reject(new Error('WebSocket not available in this environment'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    private handleWebSocketMessage(data: any) {
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

    private generateUserId(): string {
        return `vscode_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionId(): string {
        return `vscode_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getLanguageFromFileName(fileName: string): string {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
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

    private async getWorkspaceInfo(): Promise<any> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return {};

        return {
            name: workspaceFolders[0].name,
            path: workspaceFolders[0].uri.fsPath,
            activeFile: vscode.window.activeTextEditor?.document.fileName,
            openFiles: vscode.window.tabGroups.all.flatMap(group =>
                group.tabs.map(tab => (tab.input as any)?.uri?.fsPath).filter(Boolean)
            )
        };
    }

    private async getGitInfo(): Promise<any> {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
                const git = gitExtension.exports.getAPI(1);
                const repo = git.repositories[0];
                if (repo) {
                    return {
                        branch: repo.state.HEAD?.name,
                        remotes: repo.state.remotes.map((remote: any) => ({
                            name: remote.name,
                            url: remote.fetchUrl
                        })),
                        changes: repo.state.workingTreeChanges.length,
                        staged: repo.state.indexChanges.length
                    };
                }
            }
        } catch (error) {
            console.error('Failed to get git info:', error);
        }
        return {};
    }

    private extractCompletions(response: string): string[] {
        // Extract code completions from Mama Bear's response
        const completions: string[] = [];

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

    private extractCommitMessage(response: string): string {
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
    async checkHealth(): Promise<boolean> {
        try {
            const response = await this.client.get('/api/health');
            return response.data.success;
        } catch (error) {
            return false;
        }
    }

    // ============================================================================
    // MULTIMODAL CAPABILITIES - FILE UPLOAD, IMAGE PROCESSING, VOICE RECORDING
    // ============================================================================

    async uploadFile(file: File | Buffer, fileName: string, fileType: string): Promise<MamaBearResponse> {
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to upload file'
            };
        }
    }

    async processImage(imageData: string | Buffer, prompt?: string): Promise<MamaBearResponse> {
        try {
            const response = await this.client.post('/api/multimodal/image', {
                image_data: imageData,
                prompt: prompt || 'Analyze this image',
                user_id: this.userId,
                session_id: this.sessionId,
                model: 'gemini-2.0-flash-exp' // Use vision-capable model
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to process image'
            };
        }
    }

    async processVoice(audioData: Buffer, transcribeOnly: boolean = false): Promise<MamaBearResponse> {
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to process voice'
            };
        }
    }

    async getFilePreview(fileId: string): Promise<any> {
        try {
            const response = await this.client.get(`/api/multimodal/preview/${fileId}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get file preview'
            };
        }
    }

    // ============================================================================
    // MCP INTEGRATION - MODEL CONTEXT PROTOCOL
    // ============================================================================

    async connectToDockerMCP(): Promise<MamaBearResponse> {
        try {
            const response = await this.client.post('/api/mcp/docker/connect', {
                host: 'localhost',
                port: 8811,
                network: 'revolutionary-dev-network',
                user_id: this.userId
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to connect to Docker MCP'
            };
        }
    }

    async getMCPTools(): Promise<any[]> {
        try {
            const response = await this.client.get('/api/mcp/tools');
            return response.data.tools || [];
        } catch (error) {
            console.error('Failed to get MCP tools:', error);
            return [];
        }
    }

    async executeMCPTool(toolName: string, parameters: any): Promise<MamaBearResponse> {
        try {
            const response = await this.client.post('/api/mcp/execute', {
                tool: toolName,
                parameters,
                user_id: this.userId,
                session_id: this.sessionId
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to execute MCP tool'
            };
        }
    }
}
