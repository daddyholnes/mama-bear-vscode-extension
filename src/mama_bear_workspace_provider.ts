// src/providers/MamaBearWorkspaceProvider.ts
import * as vscode from 'vscode';
import { MamaBearApiClient } from './mama_bear_api_client';

export class MamaBearWorkspaceProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'mamaBearWorkspace';
    private _view?: vscode.WebviewView;
    private _context: vscode.ExtensionContext;
    private _apiClient: MamaBearApiClient;
    private _activeSession: any = null;
    private _collaborators: Map<string, any> = new Map();

    constructor(context: vscode.ExtensionContext, apiClient: MamaBearApiClient) {
        this._context = context;
        this._apiClient = apiClient;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'startSession':
                    await this.showStartSessionDialog();
                    break;
                case 'joinSession':
                    await this.joinSession(data.sessionId);
                    break;
                case 'leaveSession':
                    await this.leaveCurrentSession();
                    break;
                case 'inviteCollaborator':
                    await this.inviteCollaborator(data.email);
                    break;
                case 'shareScreen':
                    await this.shareCurrentScreen();
                    break;
                case 'agenticTakeover':
                    await this.requestAgenticTakeover(data.task);
                    break;
                case 'syncWorkspace':
                    await this.syncWorkspaceState();
                    break;
                case 'ready':
                    await this.sendInitialWorkspaceData();
                    break;
            }
        });
    }

    public async showStartSessionDialog(): Promise<void> {
        try {
            // Get session details from user
            const sessionName = await vscode.window.showInputBox({
                prompt: '🤝 Enter collaborative session name',
                placeHolder: 'e.g., "Fixing authentication bug"'
            });

            if (!sessionName) return;

            const mode = await vscode.window.showQuickPick([
                { label: 'Pair Programming', value: 'pair_programming' },
                { label: 'Code Review', value: 'code_review' },
                { label: 'Brainstorming', value: 'brainstorming' },
                { label: 'Debugging', value: 'debugging' },
                { label: 'Learning Session', value: 'learning' },
                { label: 'Research', value: 'research' },
                { label: 'Agentic Takeover', value: 'agentic_takeover' }
            ], {
                placeHolder: 'Select collaboration mode'
            });

            if (!mode) return;

            await this.startCollaborativeSession(sessionName, mode.value);

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to start session: ${error.message}`);
        }
    }

    private async startCollaborativeSession(sessionName: string, mode: string): Promise<void> {
        try {
            const session = await this._apiClient.createCollaborativeSession(sessionName, mode);

            if (session) {
                this._activeSession = session;

                // Update UI
                if (this._view) {
                    await this._view.webview.postMessage({
                        type: 'sessionStarted',
                        session: session
                    });
                }

                // Show success message with session info
                const shareLink = `mama-bear://join-session/${session.session_id}`;
                const action = await vscode.window.showInformationMessage(
                    `🎉 Session "${sessionName}" started!`,
                    'Copy Join Link', 'Invite Others', 'Open Dashboard'
                );

                switch (action) {
                    case 'Copy Join Link':
                        await vscode.env.clipboard.writeText(shareLink);
                        vscode.window.showInformationMessage('📋 Join link copied to clipboard!');
                        break;
                    case 'Invite Others':
                        await this.showInviteDialog();
                        break;
                    case 'Open Dashboard':
                        await this.openCollaborationDashboard();
                        break;
                }

                // Start real-time sync
                await this.initializeRealtimeSync();

            } else {
                vscode.window.showErrorMessage('Failed to create collaborative session');
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Session creation failed: ${error.message}`);
        }
    }

    private async joinSession(sessionId: string): Promise<void> {
        try {
            const success = await this._apiClient.joinCollaborativeSession(sessionId);

            if (success) {
                this._activeSession = { session_id: sessionId };

                if (this._view) {
                    await this._view.webview.postMessage({
                        type: 'sessionJoined',
                        sessionId: sessionId
                    });
                }

                vscode.window.showInformationMessage(`🤝 Joined collaborative session!`);
                await this.initializeRealtimeSync();

            } else {
                vscode.window.showErrorMessage('Failed to join session');
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to join session: ${error.message}`);
        }
    }

    private async leaveCurrentSession(): Promise<void> {
        if (!this._activeSession) {
            vscode.window.showWarningMessage('No active collaborative session');
            return;
        }

        try {
            // Leave session via API
            // await this._apiClient.leaveCollaborativeSession(this._activeSession.session_id);

            this._activeSession = null;
            this._collaborators.clear();

            if (this._view) {
                await this._view.webview.postMessage({
                    type: 'sessionLeft'
                });
            }

            vscode.window.showInformationMessage('👋 Left collaborative session');

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to leave session: ${error.message}`);
        }
    }

    private async inviteCollaborator(email: string): Promise<void> {
        try {
            if (!this._activeSession) {
                vscode.window.showWarningMessage('No active session to invite to');
                return;
            }

            // Generate invitation link
            const inviteLink = `mama-bear://join-session/${this._activeSession.session_id}?inviter=${encodeURIComponent(email)}`;

            // Copy to clipboard
            await vscode.env.clipboard.writeText(inviteLink);

            vscode.window.showInformationMessage(
                `📨 Invitation link copied! Share with ${email}`,
                'Send Email'
            ).then(action => {
                if (action === 'Send Email') {
                    const subject = `Invitation to Mama Bear Collaborative Session`;
                    const body = `You've been invited to join a collaborative coding session!\n\nSession: ${this._activeSession.name}\nJoin link: ${inviteLink}`;
                    vscode.env.openExternal(vscode.Uri.parse(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`));
                }
            });

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to invite collaborator: ${error.message}`);
        }
    }

    private async shareCurrentScreen(): Promise<void> {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showWarningMessage('No active file to share');
                return;
            }

            const fileName = activeEditor.document.fileName;
            const code = activeEditor.document.getText();
            const selection = activeEditor.selection;

            // Share with session participants
            const shareData = {
                type: 'screen_share',
                fileName: fileName,
                code: code,
                selection: {
                    start: { line: selection.start.line, character: selection.start.character },
                    end: { line: selection.end.line, character: selection.end.character }
                },
                timestamp: new Date().toISOString()
            };

            // Send to collaborative session
            // await this._apiClient.shareToSession(this._activeSession.session_id, shareData);

            if (this._view) {
                await this._view.webview.postMessage({
                    type: 'screenShared',
                    data: shareData
                });
            }

            vscode.window.showInformationMessage('📺 Screen shared with collaborators!');

        } catch (error: any) {
            vscode.window.showErrorMessage(`Screen sharing failed: ${error.message}`);
        }
    }

    private async requestAgenticTakeover(task: string): Promise<void> {
        try {
            if (!this._activeSession) {
                vscode.window.showWarningMessage('No active session for agentic takeover');
                return;
            }

            // Request agentic takeover
            const response = await this._apiClient.sendAgenticRequest({
                message: `🤖 Collaborative Agentic Takeover: ${task}`,
                user_id: 'vscode_user',
                context: {
                    session_id: this._activeSession.session_id,
                    collaborative_mode: true
                },
                allow_autonomous_actions: true
            });

            if (response.success) {
                if (this._view) {
                    await this._view.webview.postMessage({
                        type: 'agenticTakeoverStarted',
                        task: task,
                        response: response.response
                    });
                }

                vscode.window.showInformationMessage(
                    `🤖 Mama Bear has taken control for: ${task}`,
                    'View Progress'
                ).then(action => {
                    if (action === 'View Progress') {
                        this.openAgenticProgress();
                    }
                });

            } else {
                vscode.window.showErrorMessage(`Agentic takeover failed: ${response.error}`);
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Agentic takeover failed: ${error.message}`);
        }
    }

    private async syncWorkspaceState(): Promise<void> {
        try {
            if (!this._activeSession) return;

            const workspaceState = {
                openFiles: vscode.window.tabGroups.all.flatMap(group =>
                    group.tabs.map(tab => (tab.input as any)?.uri?.fsPath).filter(Boolean)
                ),
                activeFile: vscode.window.activeTextEditor?.document.fileName,
                cursorPosition: vscode.window.activeTextEditor?.selection.active,
                workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                timestamp: new Date().toISOString()
            };

            // Sync with session
            // await this._apiClient.syncWorkspaceState(this._activeSession.session_id, workspaceState);

            if (this._view) {
                await this._view.webview.postMessage({
                    type: 'workspaceSynced',
                    state: workspaceState
                });
            }

        } catch (error: any) {
            console.error('Workspace sync failed:', error);
        }
    }

    private async initializeRealtimeSync(): Promise<void> {
        try {
            // Initialize WebSocket connection for real-time collaboration
            // const ws = await this._apiClient.connectWebSocket(this._activeSession.session_id);

            // Set up event listeners for real-time updates
            this.setupCollaborativeEventListeners();

        } catch (error: any) {
            console.error('Real-time sync initialization failed:', error);
        }
    }

    private setupCollaborativeEventListeners(): void {
        // Listen for document changes
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this._activeSession) {
                this.broadcastDocumentChange(event);
            }
        });

        // Listen for cursor position changes
        vscode.window.onDidChangeTextEditorSelection((event) => {
            if (this._activeSession) {
                this.broadcastCursorChange(event);
            }
        });

        // Listen for file opens/closes
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (this._activeSession && editor) {
                this.broadcastFileChange(editor.document.fileName);
            }
        });
    }

    private async broadcastDocumentChange(event: vscode.TextDocumentChangeEvent): Promise<void> {
        // Broadcast document changes to session participants
        const changeData = {
            type: 'document_change',
            fileName: event.document.fileName,
            changes: event.contentChanges.map(change => ({
                range: {
                    start: { line: change.range.start.line, character: change.range.start.character },
                    end: { line: change.range.end.line, character: change.range.end.character }
                },
                text: change.text
            })),
            timestamp: new Date().toISOString()
        };

        // Send to session
        // await this._apiClient.broadcastToSession(this._activeSession.session_id, changeData);
    }

    private async broadcastCursorChange(event: vscode.TextEditorSelectionChangeEvent): Promise<void> {
        const cursorData = {
            type: 'cursor_change',
            fileName: event.textEditor.document.fileName,
            selections: event.selections.map(selection => ({
                start: { line: selection.start.line, character: selection.start.character },
                end: { line: selection.end.line, character: selection.end.character }
            })),
            timestamp: new Date().toISOString()
        };

        // Send to session
        // await this._apiClient.broadcastToSession(this._activeSession.session_id, cursorData);
    }

    private async broadcastFileChange(fileName: string): Promise<void> {
        const fileData = {
            type: 'file_change',
            fileName: fileName,
            timestamp: new Date().toISOString()
        };

        // Send to session
        // await this._apiClient.broadcastToSession(this._activeSession.session_id, fileData);
    }

    private async sendInitialWorkspaceData(): Promise<void> {
        if (!this._view) return;

        const workspaceData = {
            activeSession: this._activeSession,
            collaborators: Array.from(this._collaborators.values()),
            workspaceInfo: {
                name: vscode.workspace.workspaceFolders?.[0]?.name || 'Unknown',
                fileCount: (await vscode.workspace.findFiles('**/*', '**/node_modules/**', 100)).length
            }
        };

        await this._view.webview.postMessage({
            type: 'initialWorkspaceData',
            data: workspaceData
        });
    }

    private async showInviteDialog(): Promise<void> {
        const email = await vscode.window.showInputBox({
            prompt: '📧 Enter collaborator\'s email address',
            placeHolder: 'colleague@company.com',
            validateInput: (value) => {
                if (!value) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
                return null;
            }
        });

        if (email) {
            await this.inviteCollaborator(email);
        }
    }

    private async openCollaborationDashboard(): Promise<void> {
        // Open a new webview panel with collaboration dashboard
        const panel = vscode.window.createWebviewPanel(
            'mamaBearDashboard',
            '🤝 Collaboration Dashboard',
            vscode.ViewColumn.Active,
            { enableScripts: true }
        );

        panel.webview.html = this.getDashboardHtml();
    }

    private async openAgenticProgress(): Promise<void> {
        // Open agentic progress viewer
        const panel = vscode.window.createWebviewPanel(
            'agenticProgress',
            '🤖 Agentic Progress',
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        panel.webview.html = this.getAgenticProgressHtml();
    }

    private getDashboardHtml(): string {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Collaboration Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        .session-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .collaborator { padding: 10px; border-bottom: 1px solid #ddd; }
        .status { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
        .active { background: #4CAF50; color: white; }
        .idle { background: #FFC107; color: black; }
    </style>
</head>
<body>
    <h1>🤝 Collaboration Dashboard</h1>
    <div class="session-info">
        <h3>Active Session: ${this._activeSession?.name || 'None'}</h3>
        <p>Session ID: ${this._activeSession?.session_id || 'N/A'}</p>
        <p>Mode: ${this._activeSession?.mode || 'N/A'}</p>
    </div>

    <h3>Collaborators</h3>
    <div id="collaborators">
        <p>No collaborators yet. Invite others to join!</p>
    </div>

    <h3>Recent Activity</h3>
    <div id="activity">
        <p>Session activity will appear here...</p>
    </div>
</body>
</html>`;
    }

    private getAgenticProgressHtml(): string {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Agentic Progress</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        .progress-item { padding: 10px; margin: 10px 0; border-left: 4px solid #4CAF50; background: #f9f9f9; }
        .timestamp { font-size: 12px; color: #666; }
        .action { font-weight: bold; color: #333; }
        .result { margin-top: 5px; color: #555; }
    </style>
</head>
<body>
    <h1>🤖 Mama Bear Agentic Progress</h1>
    <div id="progress">
        <div class="progress-item">
            <div class="action">🚀 Agentic takeover initiated</div>
            <div class="timestamp">${new Date().toLocaleTimeString()}</div>
            <div class="result">Analyzing workspace and planning actions...</div>
        </div>
    </div>
</body>
</html>`;
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collaborative Workspace</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 8px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }

        .header {
            font-weight: bold;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }

        .session-status {
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 12px;
            text-align: center;
            font-size: 12px;
        }

        .session-active {
            background: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
        }

        .session-inactive {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
        }

        .action-section {
            margin-bottom: 16px;
        }

        .action-section h3 {
            font-size: 14px;
            margin: 0 0 8px 0;
            color: var(--vscode-foreground);
        }

        .button {
            width: 100%;
            padding: 8px;
            margin-bottom: 4px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }

        .button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .input {
            width: 100%;
            padding: 6px;
            margin-bottom: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            font-size: 12px;
            box-sizing: border-box;
        }

        .collaborators {
            max-height: 120px;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 3px;
            padding: 4px;
        }

        .collaborator {
            padding: 4px;
            font-size: 11px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .collaborator:last-child {
            border-bottom: none;
        }

        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
        }

        .status-active { background: #4CAF50; }
        .status-idle { background: #FFC107; }
        .status-offline { background: #757575; }

        .session-info {
            background: var(--vscode-textCodeBlock-background);
            padding: 8px;
            border-radius: 4px;
            font-size: 11px;
            margin-bottom: 12px;
        }

        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="header">🤝 Collaborative Workspace</div>

    <div id="sessionStatus" class="session-status session-inactive">
        No active session
    </div>

    <div id="sessionInfo" class="session-info hidden">
        <div><strong>Session:</strong> <span id="sessionName">-</span></div>
        <div><strong>Mode:</strong> <span id="sessionMode">-</span></div>
        <div><strong>ID:</strong> <span id="sessionId">-</span></div>
    </div>

    <div class="action-section">
        <h3>🚀 Quick Start</h3>
        <button class="button" id="startSessionBtn">Start New Session</button>
        <button class="button secondary" id="joinSessionBtn">Join Session</button>
    </div>

    <div id="sessionControls" class="action-section hidden">
        <h3>⚡ Session Controls</h3>
        <button class="button" id="agenticTakeoverBtn">🤖 Agentic Takeover</button>
        <button class="button secondary" id="shareScreenBtn">📺 Share Screen</button>
        <button class="button secondary" id="syncWorkspaceBtn">🔄 Sync Workspace</button>
        <button class="button secondary" id="leaveSessionBtn">👋 Leave Session</button>
    </div>

    <div class="action-section">
        <h3>👥 Collaborators</h3>
        <div id="collaborators" class="collaborators">
            <div class="collaborator">No collaborators</div>
        </div>
        <button class="button secondary" id="inviteBtn">📧 Invite Collaborator</button>
    </div>

    <div id="joinSessionDialog" class="action-section hidden">
        <h3>🔗 Join Session</h3>
        <input type="text" class="input" id="sessionIdInput" placeholder="Enter session ID">
        <button class="button" id="joinSessionConfirmBtn">Join</button>
        <button class="button secondary" id="cancelJoinBtn">Cancel</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // DOM elements
        const sessionStatus = document.getElementById('sessionStatus');
        const sessionInfo = document.getElementById('sessionInfo');
        const sessionName = document.getElementById('sessionName');
        const sessionMode = document.getElementById('sessionMode');
        const sessionId = document.getElementById('sessionId');
        const sessionControls = document.getElementById('sessionControls');
        const collaborators = document.getElementById('collaborators');
        const joinSessionDialog = document.getElementById('joinSessionDialog');

        // Buttons
        document.getElementById('startSessionBtn').addEventListener('click', startSession);
        document.getElementById('joinSessionBtn').addEventListener('click', showJoinDialog);
        document.getElementById('agenticTakeoverBtn').addEventListener('click', requestAgenticTakeover);
        document.getElementById('shareScreenBtn').addEventListener('click', shareScreen);
        document.getElementById('syncWorkspaceBtn').addEventListener('click', syncWorkspace);
        document.getElementById('leaveSessionBtn').addEventListener('click', leaveSession);
        document.getElementById('inviteBtn').addEventListener('click', inviteCollaborator);
        document.getElementById('joinSessionConfirmBtn').addEventListener('click', joinSession);
        document.getElementById('cancelJoinBtn').addEventListener('click', hideJoinDialog);

        async function startSession() {
            const sessionName = prompt('🤝 Enter session name:');
            if (!sessionName) return;

            const modes = [
                'pair_programming', 'code_review', 'brainstorming',
                'debugging', 'learning', 'research', 'agentic_takeover'
            ];

            const mode = prompt('Select mode:\\n' + modes.map((m, i) => \`\${i+1}. \${m}\`).join('\\n'));
            const selectedMode = modes[parseInt(mode) - 1] || 'pair_programming';

            vscode.postMessage({
                type: 'startSession',
                sessionName: sessionName,
                mode: selectedMode
            });
        }

        function showJoinDialog() {
            joinSessionDialog.classList.remove('hidden');
        }

        function hideJoinDialog() {
            joinSessionDialog.classList.add('hidden');
            document.getElementById('sessionIdInput').value = '';
        }

        function joinSession() {
            const sessionId = document.getElementById('sessionIdInput').value.trim();
            if (!sessionId) return;

            vscode.postMessage({
                type: 'joinSession',
                sessionId: sessionId
            });

            hideJoinDialog();
        }

        function leaveSession() {
            vscode.postMessage({ type: 'leaveSession' });
        }

        function requestAgenticTakeover() {
            const task = prompt('🤖 What should Mama Bear autonomously work on?');
            if (!task) return;

            vscode.postMessage({
                type: 'agenticTakeover',
                task: task
            });
        }

        function shareScreen() {
            vscode.postMessage({ type: 'shareScreen' });
        }

        function syncWorkspace() {
            vscode.postMessage({ type: 'syncWorkspace' });
        }

        function inviteCollaborator() {
            const email = prompt('📧 Enter collaborator email:');
            if (!email) return;

            vscode.postMessage({
                type: 'inviteCollaborator',
                email: email
            });
        }

        function updateSessionUI(session) {
            if (session) {
                sessionStatus.textContent = \`🟢 Active: \${session.name}\`;
                sessionStatus.className = 'session-status session-active';
                sessionName.textContent = session.name;
                sessionMode.textContent = session.mode;
                sessionId.textContent = session.session_id;
                sessionInfo.classList.remove('hidden');
                sessionControls.classList.remove('hidden');
            } else {
                sessionStatus.textContent = 'No active session';
                sessionStatus.className = 'session-status session-inactive';
                sessionInfo.classList.add('hidden');
                sessionControls.classList.add('hidden');
            }
        }

        // Message handlers
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'initialWorkspaceData':
                    updateSessionUI(message.data.activeSession);
                    // Update collaborators list
                    break;

                case 'sessionStarted':
                case 'sessionJoined':
                    updateSessionUI(message.session || { session_id: message.sessionId });
                    break;

                case 'sessionLeft':
                    updateSessionUI(null);
                    break;

                case 'collaboratorJoined':
                    // Update collaborators list
                    break;

                case 'agenticTakeoverStarted':
                    alert(\`🤖 Agentic takeover started: \${message.task}\`);
                    break;
            }
        });

        // Send ready message
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
    }
}
