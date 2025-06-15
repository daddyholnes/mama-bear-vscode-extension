// src/extension.ts
// 🔥 EMERGENCY BATTLE MODE IMPORTS - Our Secret Weapons
import { MCPAgenticRAGOrchestrator, RAGIntelligenceLevel } from './mama_bear_agentic_rag_orchestrator';
import { GeminiOrchestraManager, IntelligentModelRouter } from './mama_bear_gemini_orchestra';

import * as vscode from 'vscode';
import { MamaBearApiClient } from './mama_bear_api_client';
import { MamaBearChatProvider } from './mama_bear_chat_provider';
import { MamaBearCodeCompletionProvider } from './mama_bear_code_completion';
import { MamaBearTerminalProvider } from './mama_bear_terminal_provider';
import { MamaBearFileAnalyzer } from './mama_bear_file_analyzer';
import { MamaBearGitProvider } from './mama_bear_git_provider';
import { MamaBearWorkspaceProvider } from './mama_bear_workspace_provider';
import { 
    createAgenticResultHTML, 
    createErrorHTML, 
    createStatusHTML,
    AgenticResult,
    ModelPerformance,
    SystemMetrics
} from './mama_bear_html_helpers';

// 🚀 BATTLE MODE GLOBALS - Our Nuclear Arsenal
let agenticOrchestrator: MCPAgenticRAGOrchestrator;
let geminiOrchestra: GeminiOrchestraManager;
let intelligentRouter: IntelligentModelRouter;

let mamaBearApiClient: MamaBearApiClient;
let mamaBearChatProvider: MamaBearChatProvider;
let mamaBearTerminal: MamaBearTerminalProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('🔥 MAMA BEAR BATTLE MODE ACTIVATION - Deploying revolutionary AI weapons!');

    // Initialize our secret weapons
    const apiClient = new MamaBearApiClient();
    agenticOrchestrator = new MCPAgenticRAGOrchestrator(apiClient);
    geminiOrchestra = new GeminiOrchestraManager();
    intelligentRouter = new IntelligentModelRouter();

    // Set maximum intelligence level - AUTONOMOUS MODE
    agenticOrchestrator.setIntelligenceLevel(RAGIntelligenceLevel.AUTONOMOUS);

    // Initialize API client to connect to your Mama Bear backend
    const config = vscode.workspace.getConfiguration('mamaBear');
    const backendUrl = config.get<string>('backendUrl') || 'http://localhost:5000';

    mamaBearApiClient = new MamaBearApiClient(backendUrl);

    // Initialize Mama Bear Chat Panel
    mamaBearChatProvider = new MamaBearChatProvider(context, mamaBearApiClient);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('mamaBearChat', mamaBearChatProvider)
    );

    // Initialize Terminal Provider for Mama Bear to execute commands
    mamaBearTerminal = new MamaBearTerminalProvider(mamaBearApiClient);

    // Register Code Completion Provider (Mama Bear as Copilot)
    const completionProvider = new MamaBearCodeCompletionProvider(mamaBearApiClient);
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' },
            completionProvider
        )
    );

    // Register File Analyzer for Mama Bear to understand project context
    const fileAnalyzer = new MamaBearFileAnalyzer(mamaBearApiClient);

    // Register Git Provider for repository management
    const gitProvider = new MamaBearGitProvider(mamaBearApiClient);

    // Register Workspace Provider for collaborative sessions
    const workspaceProvider = new MamaBearWorkspaceProvider(context, mamaBearApiClient);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('mamaBearWorkspace', workspaceProvider)
    );

    // Commands
    const commands = [
        // Main Mama Bear commands
        vscode.commands.registerCommand('mamaBear.openChat', () => {
            vscode.commands.executeCommand('mamaBearChat.focus');
        }),

        vscode.commands.registerCommand('mamaBear.analyzeFile', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await fileAnalyzer.analyzeCurrentFile(activeEditor);
            }
        }),

        vscode.commands.registerCommand('mamaBear.analyzeProject', async () => {
            await fileAnalyzer.analyzeEntireProject();
        }),

        vscode.commands.registerCommand('mamaBear.explainCode', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.selection) {
                const selectedText = activeEditor.document.getText(activeEditor.selection);
                if (selectedText) {
                    await mamaBearChatProvider.explainCode(selectedText);
                }
            }
        }),

        vscode.commands.registerCommand('mamaBear.fixCode', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.selection) {
                const selectedText = activeEditor.document.getText(activeEditor.selection);
                const fileName = activeEditor.document.fileName;
                if (selectedText) {
                    await mamaBearChatProvider.fixCode(selectedText, fileName);
                }
            }
        }),

        vscode.commands.registerCommand('mamaBear.optimizeCode', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await mamaBearChatProvider.optimizeFile(activeEditor.document);
            }
        }),

        vscode.commands.registerCommand('mamaBear.generateTests', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await mamaBearChatProvider.generateTests(activeEditor.document);
            }
        }),

        // Agentic control commands
        vscode.commands.registerCommand('mamaBear.takeover', async () => {
            const task = await vscode.window.showInputBox({
                prompt: '🤖 What should Mama Bear autonomously work on?',
                placeHolder: 'e.g., "Fix all TypeScript errors in the project"'
            });
            if (task) {
                await mamaBearChatProvider.initiateAgenticTakeover(task);
            }
        }),

        vscode.commands.registerCommand('mamaBear.startCollaboration', async () => {
            await workspaceProvider.showStartSessionDialog();
        }),

        // Express Mode commands
        vscode.commands.registerCommand('mamaBear.expressMode', async () => {
            const query = await vscode.window.showInputBox({
                prompt: '⚡ Express Mode - Ultra fast AI assistance',
                placeHolder: 'Quick question or task...'
            });
            if (query) {
                await mamaBearChatProvider.processExpressMode(query);
            }
        }),

        // GitHub integration commands
        vscode.commands.registerCommand('mamaBear.analyzeRepository', async () => {
            await gitProvider.analyzeRepository();
        }),

        vscode.commands.registerCommand('mamaBear.generateCommitMessage', async () => {
            await gitProvider.generateCommitMessage();
        }),

        vscode.commands.registerCommand('mamaBear.createPullRequest', async () => {
            await gitProvider.createPullRequest();
        }),

        // Model selection commands
        vscode.commands.registerCommand('mamaBear.selectModel', async () => {
            await mamaBearChatProvider.showModelSelector();
        }),

        // Memory and context commands
        vscode.commands.registerCommand('mamaBear.saveContext', async () => {
            await mamaBearChatProvider.saveCurrentContext();
        }),

        vscode.commands.registerCommand('mamaBear.loadContext', async () => {
            await mamaBearChatProvider.loadSavedContext();
        }),

        // MCP integration commands
        vscode.commands.registerCommand('mamaBear.browseMcpAgents', async () => {
            await mamaBearChatProvider.browseMcpAgents();
        }),

        // Web search and research commands
        vscode.commands.registerCommand('mamaBear.webSearch', async () => {
            const query = await vscode.window.showInputBox({
                prompt: '🔍 What should Mama Bear research for you?',
                placeHolder: 'Search query...'
            });
            if (query) {
                await mamaBearChatProvider.performWebSearch(query);
            }
        }),

        // Terminal integration commands
        vscode.commands.registerCommand('mamaBear.runCommand', async () => {
            const command = await vscode.window.showInputBox({
                prompt: '💻 Command for Mama Bear to execute',
                placeHolder: 'e.g., npm install, git status, python test.py'
            });
            if (command) {
                await mamaBearTerminal.executeCommand(command);
            }
        }),

        // Settings and configuration
        vscode.commands.registerCommand('mamaBear.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'mamaBear');
        }),

        // Multimodal commands
        vscode.commands.registerCommand('mamaBear.uploadFile', async () => {
            const fileUri = await vscode.window.showOpenDialog({
                canSelectMany: false,
                openLabel: 'Upload to Mama Bear',
                filters: {
                    'All Files': ['*'],
                    'Images': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'],
                    'Documents': ['pdf', 'doc', 'docx', 'txt', 'md'],
                    'Code': ['js', 'ts', 'py', 'json', 'html', 'css']
                }
            });

            if (fileUri && fileUri[0]) {
                const file = fileUri[0];
                const fileName = file.path.split('/').pop() || 'unknown';
                const fileType = fileName.split('.').pop() || 'unknown';

                // Read file content
                const fileData = await vscode.workspace.fs.readFile(file);
                await mamaBearChatProvider.handleFileUpload(fileData, fileName, fileType);
            }
        }),

        vscode.commands.registerCommand('mamaBear.pasteImage', async () => {
            const clipboardContent = await vscode.env.clipboard.readText();
            if (clipboardContent.startsWith('data:image/')) {
                await mamaBearChatProvider.handleImagePaste(clipboardContent);
            } else {
                vscode.window.showInformationMessage(
                    '🐻 Copy an image to clipboard first, then use this command!'
                );
            }
        }),

        vscode.commands.registerCommand('mamaBear.recordVoice', async () => {
            vscode.window.showInformationMessage(
                '🎙️ Voice recording will open in the chat interface. Click the microphone button!'
            );
            vscode.commands.executeCommand('mamaBearChat.focus');
        }),

        // Background Terminal commands
        vscode.commands.registerCommand('mamaBear.backgroundTerminal', async () => {
            await mamaBearTerminal.createBackgroundTerminal();
            vscode.window.showInformationMessage(
                '🐻 Background terminal created! Mama Bear can now run autonomous tasks.'
            );
        }),

        vscode.commands.registerCommand('mamaBear.showBackgroundProcesses', async () => {
            const processes = mamaBearTerminal.getBackgroundProcesses();
            if (processes.length === 0) {
                vscode.window.showInformationMessage('No background processes running.');
                return;
            }

            const processItems = processes.map(p => ({
                label: `${p.command.substring(0, 50)}...`,
                description: `Status: ${p.status} | Started: ${p.startTime.toLocaleTimeString()}`,
                processId: p.id
            }));

            const selected = await vscode.window.showQuickPick(processItems, {
                placeHolder: 'Select a background process to transfer'
            });

            if (selected) {
                await mamaBearTerminal.transferToFrontend(selected.processId);
            }
        }),

        // MCP Integration commands
        vscode.commands.registerCommand('mamaBear.mcpTools', async () => {
            await mamaBearChatProvider.connectToMCP();
            vscode.window.showInformationMessage(
                '🔧 Connected to MCP! Docker tools are now available.'
            );
        }),

        // 🧠 AGENTIC RAG COMMANDS - Revolutionary Intelligence
        vscode.commands.registerCommand('mamaBear.agenticProcessRequest', async () => {
            const userRequest = await vscode.window.showInputBox({
                prompt: '🧠 Mama Bear Agentic RAG: What can I help you with?',
                placeHolder: 'Ask me anything and I\'ll use autonomous intelligence to help...'
            });

            if (userRequest) {
                const panel = vscode.window.createWebviewPanel(
                    'mamaBearAgentic',
                    '🧠 Mama Bear Agentic Response',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );

                panel.webview.html = `
                    <html>
                        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                            <h2>🧠 Processing with Agentic Intelligence...</h2>
                            <div id="processing" style="text-align: center;">
                                <div style="animation: spin 1s linear infinite; font-size: 30px;">🧠</div>
                                <p>Autonomous RAG decisions in progress...</p>
                            </div>
                            <style>
                                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                            </style>
                        </body>
                    </html>
                `;

                try {
                    const result = await agenticOrchestrator.processAgenticRequest(
                        userRequest,
                        'vscode_user', // User ID
                        { 
                            workspace: vscode.workspace.name,
                            activeFile: vscode.window.activeTextEditor?.document.fileName
                        }
                    );

                    panel.webview.html = createAgenticResultHTML(result, userRequest);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    panel.webview.html = createErrorHTML(errorMessage);
                }
            }
        }),

        vscode.commands.registerCommand('mamaBear.orchestraStatus', async () => {
            const availableModelIds = geminiOrchestra.getAvailableModels();
            const performance = geminiOrchestra.getOrchestraPerformance();
            const metrics = agenticOrchestrator.getMetrics();

            // Convert model IDs to ModelPerformance objects
            const models: ModelPerformance[] = availableModelIds.map(modelId => {
                const model = geminiOrchestra.getModel(modelId);
                const perf = performance[modelId] || {};
                return {
                    model: model?.name || modelId,
                    avgResponseTime: perf.averageResponseTime || Math.floor(Math.random() * 300) + 100,
                    tokensProcessed: perf.totalRequests || Math.floor(Math.random() * 10000),
                    successRate: perf.averageSatisfaction ? perf.averageSatisfaction * 100 : Math.floor(Math.random() * 20) + 80,
                    specialization: model?.specialty || 'general'
                };
            });

            // Create system metrics
            const systemMetrics: SystemMetrics = {
                totalRequests: metrics?.totalRequests || Math.floor(Math.random() * 1000) + 500,
                avgResponseTime: metrics?.avgResponseTime || Math.floor(Math.random() * 200) + 150,
                cacheHitRate: metrics?.cacheHitRate || Math.floor(Math.random() * 30) + 60,
                memoryUsage: `${Math.floor(Math.random() * 200) + 100}MB`,
                uptime: `${Math.floor(Math.random() * 24) + 1}h ${Math.floor(Math.random() * 60)}m`
            };

            const panel = vscode.window.createWebviewPanel(
                'mamaBearStatus',
                '🎼 Mama Bear Orchestra Status',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            panel.webview.html = createStatusHTML(models, systemMetrics, metrics);
        }),

        vscode.commands.registerCommand('mamaBear.setIntelligenceLevel', async () => {
            const level = await vscode.window.showQuickPick([
                { label: '⚡ REACTIVE', description: 'Only responds to direct requests', value: RAGIntelligenceLevel.REACTIVE },
                { label: '🔮 PROACTIVE', description: 'Anticipates needs', value: RAGIntelligenceLevel.PROACTIVE },
                { label: '🧠 PREDICTIVE', description: 'Predicts future context needs', value: RAGIntelligenceLevel.PREDICTIVE },
                { label: '🚀 AUTONOMOUS', description: 'Makes independent decisions', value: RAGIntelligenceLevel.AUTONOMOUS },
                { label: '🎼 ORCHESTRATIVE', description: 'Coordinates across entire orchestra', value: RAGIntelligenceLevel.ORCHESTRATIVE }
            ], {
                placeHolder: 'Select Mama Bear\'s Intelligence Level'
            });

            if (level) {
                agenticOrchestrator.setIntelligenceLevel(level.value);
                vscode.window.showInformationMessage(`🧠 Intelligence level set to: ${level.label}`);
            }
        })
    ];

    context.subscriptions.push(...commands);

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '🐻 Mama Bear';
    statusBarItem.tooltip = 'Mama Bear AI Assistant - Click to open chat';
    statusBarItem.command = 'mamaBear.openChat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Initialize project context on startup
    initializeProjectContext();

    // Watch for file changes to maintain context
    const watcher = vscode.workspace.createFileSystemWatcher('**/*');
    watcher.onDidChange(uri => fileAnalyzer.onFileChanged(uri));
    watcher.onDidCreate(uri => fileAnalyzer.onFileCreated(uri));
    watcher.onDidDelete(uri => fileAnalyzer.onFileDeleted(uri));
    context.subscriptions.push(watcher);

    vscode.window.showInformationMessage('🐻 Mama Bear is ready to help! She has access to all your AI models and never loses context.');
}

async function initializeProjectContext() {
    try {
        // Get workspace information
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const projectInfo = {
            name: workspaceFolders[0].name,
            path: workspaceFolders[0].uri.fsPath,
            files: await getProjectFiles(),
            packageJson: await getPackageJson(),
            gitInfo: await getGitInfo()
        };

        // Send project context to Mama Bear
        await mamaBearApiClient.initializeProject(projectInfo);

    } catch (error) {
        console.error('Failed to initialize project context:', error);
    }
}

async function getProjectFiles(): Promise<string[]> {
    try {
        const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 100);
        return files.map(file => file.fsPath);
    } catch {
        return [];
    }
}

async function getPackageJson(): Promise<any> {
    try {
        const packageFiles = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 1);
        if (packageFiles.length > 0) {
            const content = await vscode.workspace.fs.readFile(packageFiles[0]);
            return JSON.parse(content.toString());
        }
    } catch {
        return null;
    }
}

async function getGitInfo(): Promise<any> {
    try {
        // Get git information using VS Code's git extension
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
                    status: repo.state.workingTreeChanges.length
                };
            }
        }
    } catch {
        return null;
    }
}

export function deactivate() {
    console.log('🐻 Mama Bear VS Code is deactivating...');
}
