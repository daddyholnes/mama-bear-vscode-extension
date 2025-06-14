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
exports.MamaBearTerminalProvider = void 0;
// src/providers/MamaBearTerminalProvider.ts
const vscode = __importStar(require("vscode"));
class MamaBearTerminalProvider {
    constructor(apiClient) {
        this._commandHistory = [];
        this._backgroundProcesses = new Map();
        this._transferQueue = [];
        this._apiClient = apiClient;
        this._outputChannel = vscode.window.createOutputChannel('Mama Bear Commands');
    }
    async executeCommand(command) {
        try {
            // Add to history
            this._commandHistory.push(command);
            // Get or create Mama Bear terminal
            this._mamaBearTerminal = this.getMamaBearTerminal();
            // Show the terminal
            this._mamaBearTerminal.show();
            // Log the command
            this._outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] Executing: ${command}`);
            // Ask Mama Bear to analyze the command first
            const analysis = await this.analyzeCommand(command);
            if (analysis.shouldExecute) {
                // Execute the command
                this._mamaBearTerminal.sendText(command);
                // If it's a potentially dangerous command, warn the user
                if (analysis.riskLevel === 'high') {
                    vscode.window.showWarningMessage(`🐻 Mama Bear: This command might be risky. ${analysis.warning}`, 'Proceed Anyway', 'Cancel').then(selection => {
                        if (selection !== 'Proceed Anyway') {
                            this._mamaBearTerminal?.sendText('\x03'); // Send Ctrl+C to cancel
                        }
                    });
                }
                // Log successful execution
                this._outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ✅ Command sent to terminal`);
            }
            else {
                // Command was blocked
                vscode.window.showErrorMessage(`🐻 Mama Bear blocked this command: ${analysis.reason}`);
                this._outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ❌ Command blocked: ${analysis.reason}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Command execution failed: ${error.message}`);
            this._outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
        }
    }
    async suggestCommand(description) {
        try {
            const prompt = `🤖 COMMAND SUGGESTION

Task: ${description}
Platform: ${process.platform}
Working Directory: ${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'Unknown'}

Please suggest the most appropriate command to accomplish this task. Consider:
1. Platform compatibility
2. Safety and best practices
3. Current workspace context

Return ONLY the command, no explanations.`;
            const response = await this._apiClient.expressMode(prompt);
            if (response.success && response.response) {
                const suggestedCommand = this.extractCommand(response.response);
                if (suggestedCommand) {
                    const selection = await vscode.window.showInformationMessage(`🐻 Mama Bear suggests: \`${suggestedCommand}\``, 'Execute', 'Edit', 'Cancel');
                    switch (selection) {
                        case 'Execute':
                            await this.executeCommand(suggestedCommand);
                            return suggestedCommand;
                        case 'Edit':
                            const editedCommand = await vscode.window.showInputBox({
                                value: suggestedCommand,
                                prompt: 'Edit the command before execution'
                            });
                            if (editedCommand) {
                                await this.executeCommand(editedCommand);
                                return editedCommand;
                            }
                            break;
                    }
                }
            }
            return undefined;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Command suggestion failed: ${error.message}`);
            return undefined;
        }
    }
    async explainCommand(command) {
        try {
            const prompt = `🔍 COMMAND EXPLANATION

Command: ${command}
Platform: ${process.platform}

Please explain:
1. What this command does
2. Any potential risks or side effects
3. Prerequisites or requirements
4. Expected output

Be concise but comprehensive.`;
            const response = await this._apiClient.expressMode(prompt);
            if (response.success && response.response) {
                // Show explanation in a new document
                const doc = await vscode.workspace.openTextDocument({
                    content: this.formatCommandExplanation(command, response.response),
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, {
                    viewColumn: vscode.ViewColumn.Beside,
                    preview: true
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Command explanation failed: ${error.message}`);
        }
    }
    async getCommandHistory() {
        return [...this._commandHistory];
    }
    async runPredefinedTask(taskName) {
        const predefinedTasks = {
            'setup_node_project': [
                'npm init -y',
                'npm install typescript @types/node --save-dev',
                'npx tsc --init',
                'mkdir src',
                'echo "console.log(\'Hello from Mama Bear!\');" > src/index.ts'
            ],
            'git_initial_setup': [
                'git init',
                'echo "node_modules/\n*.log\n.env" > .gitignore',
                'git add .',
                'git commit -m "Initial commit by Mama Bear"'
            ],
            'python_setup': [
                'python -m venv venv',
                'source venv/bin/activate || venv\\Scripts\\activate',
                'pip install --upgrade pip',
                'echo "# Mama Bear Python Project" > README.md'
            ],
            'clean_project': [
                'npm run clean 2>/dev/null || echo "No clean script"',
                'rm -rf node_modules 2>/dev/null || rmdir /s node_modules 2>nul || echo "No node_modules"',
                'rm -rf dist 2>/dev/null || rmdir /s dist 2>nul || echo "No dist folder"',
                'echo "🧹 Project cleaned by Mama Bear"'
            ]
        };
        const commands = predefinedTasks[taskName];
        if (!commands) {
            vscode.window.showErrorMessage(`Unknown task: ${taskName}`);
            return;
        }
        const shouldExecute = await vscode.window.showInformationMessage(`🐻 Execute ${taskName} (${commands.length} commands)?`, 'Yes', 'Show Commands First', 'Cancel');
        if (shouldExecute === 'Show Commands First') {
            const commandList = commands.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
            const proceed = await vscode.window.showInformationMessage(`Commands to execute:\n${commandList}`, { modal: true }, 'Execute All', 'Cancel');
            if (proceed !== 'Execute All')
                return;
        }
        else if (shouldExecute !== 'Yes') {
            return;
        }
        // Execute commands sequentially
        for (const command of commands) {
            await this.executeCommand(command);
            // Small delay between commands
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        vscode.window.showInformationMessage(`🎉 Task '${taskName}' completed!`);
    }
    getMamaBearTerminal() {
        if (!this._mamaBearTerminal || this._mamaBearTerminal.exitStatus !== undefined) {
            this._mamaBearTerminal = vscode.window.createTerminal({
                name: '🐻 Mama Bear Terminal',
                shellPath: this.getDefaultShell(),
                env: {
                    ...process.env,
                    MAMA_BEAR_TERMINAL: 'true'
                }
            });
            // Welcome message
            this._mamaBearTerminal.sendText('echo "🐻 Welcome to Mama Bear Terminal! Type commands and I\'ll help keep you safe."');
        }
        return this._mamaBearTerminal;
    }
    getDefaultShell() {
        const platform = process.platform;
        if (platform === 'win32') {
            return process.env.COMSPEC || 'cmd.exe';
        }
        else {
            return process.env.SHELL || '/bin/bash';
        }
    }
    async analyzeCommand(command) {
        try {
            const prompt = `🛡️ COMMAND SAFETY ANALYSIS

Command: ${command}
Platform: ${process.platform}
Context: VS Code workspace

Analyze this command for:
1. Safety level (low/medium/high risk)
2. Whether it should be executed
3. Any warnings to show the user

Dangerous commands include:
- System file deletion (rm -rf /, format, etc.)
- Network attacks or hacking tools
- Privilege escalation attempts
- Malicious scripts

Return JSON format:
{
  "shouldExecute": boolean,
  "riskLevel": "low|medium|high",
  "reason": "string (if blocked)",
  "warning": "string (if high risk)"
}`;
            const response = await this._apiClient.expressMode(prompt);
            if (response.success && response.response) {
                try {
                    const analysis = JSON.parse(this.extractJSON(response.response));
                    return {
                        shouldExecute: analysis.shouldExecute !== false,
                        riskLevel: analysis.riskLevel || 'low',
                        reason: analysis.reason,
                        warning: analysis.warning
                    };
                }
                catch {
                    // Fallback analysis
                    return this.basicSafetyCheck(command);
                }
            }
            return this.basicSafetyCheck(command);
        }
        catch (error) {
            console.error('Command analysis failed:', error);
            return this.basicSafetyCheck(command);
        }
    }
    basicSafetyCheck(command) {
        const dangerousPatterns = [
            /rm\s+-rf\s+\/|format\s+c:|del\s+\/[sq]/i,
            /sudo\s+rm|sudo\s+dd|sudo\s+mkfs/i,
            />\s*\/dev\/\w+|dd\s+if=/i,
            /(curl|wget).*\|\s*(bash|sh|python)/i
        ];
        const warningPatterns = [
            /npm\s+install.*-g|pip\s+install|sudo/i,
            /git\s+push.*force|git\s+reset.*hard/i,
            /rm\s+-rf|del\s+\/s/i
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(command)) {
                return {
                    shouldExecute: false,
                    riskLevel: 'high',
                    reason: 'This command could be dangerous to your system'
                };
            }
        }
        for (const pattern of warningPatterns) {
            if (pattern.test(command)) {
                return {
                    shouldExecute: true,
                    riskLevel: 'medium',
                    warning: 'This command requires elevated privileges or could make significant changes'
                };
            }
        }
        return {
            shouldExecute: true,
            riskLevel: 'low'
        };
    }
    extractCommand(response) {
        // Remove markdown code blocks
        let command = response.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
        // Remove explanatory text - look for command-like patterns
        const lines = command.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.includes('suggest') && !trimmed.includes('command')) {
                // This looks like an actual command
                return trimmed;
            }
        }
        return command.trim();
    }
    extractJSON(response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return jsonMatch ? jsonMatch[0] : '{}';
    }
    formatCommandExplanation(command, explanation) {
        return `# 🐻 Mama Bear Command Explanation

## Command
\`\`\`bash
${command}
\`\`\`

## Explanation

${explanation}

---

**Platform:** ${process.platform}
**Analyzed:** ${new Date().toLocaleString()}

*Generated by Mama Bear AI Assistant*`;
    }
    dispose() {
        this._outputChannel.dispose();
        if (this._mamaBearTerminal) {
            this._mamaBearTerminal.dispose();
        }
    }
    // ============================================================================
    // BACKGROUND TERMINAL SYSTEM - Autonomous Task Execution
    // ============================================================================
    async createBackgroundTerminal() {
        if (!this._backgroundTerminal || this._backgroundTerminal.exitStatus) {
            this._backgroundTerminal = vscode.window.createTerminal({
                name: '🐻 Mama Bear Background',
                hideFromUser: true, // Keep it hidden until needed
                shellPath: '/bin/bash',
                shellArgs: ['-i'], // Interactive shell
                env: {
                    'MAMA_BEAR_MODE': 'background',
                    'TERM': 'xterm-256color'
                }
            });
            // Set up process monitoring
            this._backgroundTerminal.processId.then(pid => {
                if (pid) {
                    this._backgroundProcesses.set('main', {
                        pid,
                        status: 'running',
                        startTime: new Date(),
                        commands: []
                    });
                }
            });
        }
        return this._backgroundTerminal;
    }
    async executeBackgroundCommand(command, options = {}) {
        try {
            // Safety analysis if requested
            if (options.safetyCheck !== false) {
                const analysis = await this.analyzeCommand(command);
                if (!analysis.shouldExecute) {
                    return {
                        success: false,
                        error: `Command blocked by safety analysis: ${analysis.warning}`
                    };
                }
            }
            const terminal = await this.createBackgroundTerminal();
            const processId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Log background execution
            if (!options.silent) {
                this._outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] Background executing: ${command}`);
            }
            // Execute command with process tracking
            terminal.sendText(`echo "MAMA_BEAR_START:${processId}" && ${command} && echo "MAMA_BEAR_END:${processId}:SUCCESS" || echo "MAMA_BEAR_END:${processId}:FAILED"`);
            // Track the process
            this._backgroundProcesses.set(processId, {
                command,
                startTime: new Date(),
                status: 'running',
                transferOnComplete: options.transferOnComplete
            });
            return {
                success: true,
                processId
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async transferToFrontend(processId) {
        try {
            if (processId && this._backgroundProcesses.has(processId)) {
                // Transfer specific process
                const process = this._backgroundProcesses.get(processId);
                if (process) {
                    this._transferQueue.push({
                        processId,
                        command: process.command,
                        timestamp: new Date()
                    });
                }
            }
            // Show the background terminal to user
            if (this._backgroundTerminal) {
                this._backgroundTerminal.show();
                vscode.window.showInformationMessage('🐻 Mama Bear: Background process transferred to your terminal!');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to transfer process: ${error.message}`);
        }
    }
    getBackgroundProcesses() {
        return Array.from(this._backgroundProcesses.entries()).map(([id, process]) => ({
            id,
            ...process
        }));
    }
}
exports.MamaBearTerminalProvider = MamaBearTerminalProvider;
//# sourceMappingURL=mama_bear_terminal_provider.js.map