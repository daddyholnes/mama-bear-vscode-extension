// Add to your src/mama_bear_vscode_extension.ts

import { MamaBearAgentModelOrchestrator, AgentType, WorkflowTask } from './mama_bear_agent_model_orchestrator';

// Add to your activate function:
export function activate(context: vscode.ExtensionContext) {
    // ... existing code ...

    // Initialize Agent-Model Orchestrator
    const agentOrchestrator = new MamaBearAgentModelOrchestrator(mamaBearApiClient);

    // 🐻 ORCHESTRATOR COMMANDS
    const orchestratorCommands = [
        vscode.commands.registerCommand('mamaBear.orchestratorPlan', async () => {
            const requirements = await vscode.window.showInputBox({
                prompt: '🐻 Mama Bear Orchestrator: Describe your project requirements',
                placeHolder: 'e.g., "Build a React dashboard with user authentication"'
            });
            
            if (requirements) {
                const result = await agentOrchestrator.architecturalPlanning(requirements);
                await showAgentResult(result, '🐻 Project Architecture Plan');
            }
        }),

        // ⚡ SPEED DEMON COMMANDS
        vscode.commands.registerCommand('mamaBear.speedDemonCode', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) return;

            const prompt = await vscode.window.showInputBox({
                prompt: '⚡ Speed Demon: What code do you need instantly?',
                placeHolder: 'e.g., "React component for user profile"'
            });

            if (prompt) {
                const fileType = activeEditor.document.languageId;
                const result = await agentOrchestrator.quickCodeGeneration(prompt, fileType);
                await insertCodeAtCursor(activeEditor, result.content);
                vscode.window.showInformationMessage(`⚡ Speed Demon delivered code in ${result.model_used}!`);
            }
        }),

        // 🧠 DEEP THINKER COMMANDS
        vscode.commands.registerCommand('mamaBear.deepThinkerAnalyze', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) return;

            const selectedText = activeEditor.document.getText(activeEditor.selection);
            if (!selectedText) {
                vscode.window.showWarningMessage('Please select code for Deep Thinker analysis');
                return;
            }

            const result = await agentOrchestrator.routeWorkflow({
                task: WorkflowTask.OPTIMIZATION,
                context: { 
                    code: selectedText, 
                    analysisType: 'deep_architectural_analysis',
                    fileName: activeEditor.document.fileName
                },
                userInput: 'Perform deep architectural analysis and optimization suggestions',
                priority: 'medium',
                complexity: 'expert'
            });

            await showAgentResult(result, '🧠 Deep Analysis Results');
        }),

        // ⚕️ CODE SURGEON COMMANDS
        vscode.commands.registerCommand('mamaBear.codeSurgeonReview', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) return;

            const code = activeEditor.document.getText();
            const fileName = activeEditor.document.fileName;
            
            const result = await agentOrchestrator.expertCodeReview(code, fileName);
            await showAgentResult(result, '⚕️ Surgical Code Review');
        }),

        vscode.commands.registerCommand('mamaBear.codeSurgeonFix', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) return;

            const selectedText = activeEditor.document.getText(activeEditor.selection);
            if (!selectedText) {
                vscode.window.showWarningMessage('Please select problematic code');
                return;
            }

            const result = await agentOrchestrator.rapidDebugging(
                'Fix and optimize this code',
                selectedText
            );

            await showCodeFixSuggestion(activeEditor, result);
        }),

        // 🎨 CREATIVE GENIUS COMMANDS
        vscode.commands.registerCommand('mamaBear.creativeGeniusDesign', async () => {
            const designType = await vscode.window.showQuickPick([
                'UI Component Design',
                'User Experience Flow',
                'Creative Architecture',
                'Design System',
                'Visual Enhancement'
            ], { placeHolder: '🎨 What would you like to design?' });

            if (designType) {
                const requirements = await vscode.window.showInputBox({
                    prompt: `🎨 Creative Genius: Describe your ${designType} requirements`,
                    placeHolder: 'e.g., "Modern dashboard with dark theme and animations"'
                });

                if (requirements) {
                    const result = await agentOrchestrator.routeWorkflow({
                        task: WorkflowTask.DOCUMENTATION,
                        context: { designType, creativeFocus: true },
                        userInput: requirements,
                        priority: 'medium',
                        complexity: 'complex'
                    });

                    await showAgentResult(result, '🎨 Creative Design');
                }
            }
        }),

        // 🧙‍♂️ DATA WIZARD COMMANDS
        vscode.commands.registerCommand('mamaBear.dataWizardAnalyze', async () => {
            const analysisType = await vscode.window.showQuickPick([
                'Data Structure Analysis',
                'Performance Metrics',
                'Code Statistics',
                'Dependency Analysis',
                'Security Audit'
            ], { placeHolder: '🧙‍♂️ What data should I analyze?' });

            if (analysisType) {
                const workspaceFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 100);
                
                const result = await agentOrchestrator.routeWorkflow({
                    task: WorkflowTask.OPTIMIZATION,
                    context: { 
                        analysisType, 
                        projectFiles: workspaceFiles.length,
                        workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
                    },
                    userInput: `Perform ${analysisType} on the current workspace`,
                    priority: 'medium',
                    complexity: 'expert'
                });

                await showAgentResult(result, '🧙‍♂️ Data Analysis');
            }
        }),

        // 🔗 INTEGRATION MASTER COMMANDS
        vscode.commands.registerCommand('mamaBear.integrationMasterConnect', async () => {
            const integrationType = await vscode.window.showQuickPick([
                'API Integration',
                'Database Connection',
                'Third-party Service',
                'DevOps Pipeline',
                'Microservice Architecture'
            ], { placeHolder: '🔗 What integration do you need?' });

            if (integrationType) {
                const specs = await vscode.window.showInputBox({
                    prompt: `🔗 Integration Master: Describe your ${integrationType} requirements`,
                    placeHolder: 'e.g., "REST API with authentication and rate limiting"'
                });

                if (specs) {
                    const result = await agentOrchestrator.routeWorkflow({
                        task: WorkflowTask.INTEGRATION,
                        context: { integrationType, systemsIntegration: true },
                        userInput: specs,
                        priority: 'high',
                        complexity: 'complex'
                    });

                    await showAgentResult(result, '🔗 Integration Plan');
                }
            }
        }),

        // 📊 AGENT PERFORMANCE DASHBOARD
        vscode.commands.registerCommand('mamaBear.agentDashboard', async () => {
            const stats = agentOrchestrator.getAgentPerformanceStats();
            const activeWorkflows = agentOrchestrator.getActiveWorkflows();
            
            await showAgentDashboard(stats, activeWorkflows);
        }),

        // 🚀 INTELLIGENT AUTO-ROUTING
        vscode.commands.registerCommand('mamaBear.smartRoute', async () => {
            const taskDescription = await vscode.window.showInputBox({
                prompt: '🚀 Smart Router: Describe what you want to build/fix/optimize',
                placeHolder: 'e.g., "I need to add authentication to my React app"'
            });

            if (taskDescription) {
                // AI determines the best workflow automatically
                const result = await agentOrchestrator.routeWorkflow({
                    task: await determineTaskType(taskDescription),
                    context: await gatherCurrentContext(),
                    userInput: taskDescription,
                    priority: 'medium',
                    complexity: await assessComplexity(taskDescription)
                });

                await showSmartRouteResult(result, taskDescription);
            }
        })
    ];

    context.subscriptions.push(...orchestratorCommands);

    // Helper functions
    async function showAgentResult(result: any, title: string) {
        const doc = await vscode.workspace.openTextDocument({
            content: `# ${title}\n\n**Agent Used:** ${result.metadata?.agent_emoji} ${result.agent_used}\n**Model:** ${result.model_used}\n\n## Result\n\n${result.content}`,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: true
        });
    }

    async function insertCodeAtCursor(editor: vscode.TextEditor, content: string) {
        const selection = editor.selection;
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, content);
        });
    }

    async function showCodeFixSuggestion(editor: vscode.TextEditor, result: any) {
        const action = await vscode.window.showInformationMessage(
            `⚕️ Code Surgeon found issues and has fixes ready!`,
            'Apply Fix', 'View Analysis', 'Cancel'
        );

        switch (action) {
            case 'Apply Fix':
                // Apply the suggested fix
                const selection = editor.selection;
                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, result.content);
                });
                break;
            case 'View Analysis':
                await showAgentResult(result, '⚕️ Code Surgery Analysis');
                break;
        }
    }

    async function showAgentDashboard(stats: any, activeWorkflows: any[]) {
        const dashboardContent = `# 🐻 Agent Performance Dashboard

## Active Workflows: ${activeWorkflows.length}

${Object.entries(stats).map(([agent, data]: [string, any]) => `
### ${data.emoji} ${agent.replace('_', ' ').toUpperCase()}
- **Executions:** ${data.totalExecutions}
- **Avg Duration:** ${Math.round(data.averageDuration)}ms
- **Success Rate:** ${Math.round(data.successRate * 100)}%
- **Specialties:** ${data.specialties.join(', ')}
`).join('\n')}

## Recent Workflow History
${agentOrchestrator.getWorkflowHistory(10).map((w: any, i: number) => `
${i + 1}. **${w.agent}** → ${w.task} (${w.duration}ms)
`).join('')}
`;

        const doc = await vscode.workspace.openTextDocument({
            content: dashboardContent,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Active
        });
    }

    async function determineTaskType(description: string): Promise<WorkflowTask> {
        // Simple AI-based task classification
        const lowerDesc = description.toLowerCase();
        
        if (lowerDesc.includes('plan') || lowerDesc.includes('architect')) return WorkflowTask.PROJECT_PLANNING;
        if (lowerDesc.includes('setup') || lowerDesc.includes('environment')) return WorkflowTask.ENVIRONMENT_SETUP;
        if (lowerDesc.includes('generate') || lowerDesc.includes('create') || lowerDesc.includes('build')) return WorkflowTask.CODE_GENERATION;
        if (lowerDesc.includes('review') || lowerDesc.includes('check')) return WorkflowTask.CODE_REVIEW;
        if (lowerDesc.includes('debug') || lowerDesc.includes('fix') || lowerDesc.includes('error')) return WorkflowTask.DEBUGGING;
        if (lowerDesc.includes('test')) return WorkflowTask.TESTING;
        if (lowerDesc.includes('optimize') || lowerDesc.includes('performance')) return WorkflowTask.OPTIMIZATION;
        if (lowerDesc.includes('deploy') || lowerDesc.includes('production')) return WorkflowTask.DEPLOYMENT;
        if (lowerDesc.includes('document') || lowerDesc.includes('readme')) return WorkflowTask.DOCUMENTATION;
        if (lowerDesc.includes('integrate') || lowerDesc.includes('api') || lowerDesc.includes('connect')) return WorkflowTask.INTEGRATION;
        
        return WorkflowTask.CODE_GENERATION; // Default
    }

    async function assessComplexity(description: string): Promise<'simple' | 'moderate' | 'complex' | 'expert'> {
        const complexityKeywords = {
            simple: ['quick', 'simple', 'basic', 'easy'],
            moderate: ['moderate', 'standard', 'typical'],
            complex: ['complex', 'advanced', 'sophisticated', 'enterprise'],
            expert: ['expert', 'professional', 'production', 'scalable', 'architecture']
        };

        const lowerDesc = description.toLowerCase();
        
        for (const [level, keywords] of Object.entries(complexityKeywords)) {
            if (keywords.some(keyword => lowerDesc.includes(keyword))) {
                return level as any;
            }
        }
        
        return 'moderate'; // Default
    }

    async function gatherCurrentContext(): Promise<any> {
        const activeEditor = vscode.window.activeTextEditor;
        return {
            currentFile: activeEditor?.document.fileName,
            language: activeEditor?.document.languageId,
            selectedText: activeEditor?.selection ? activeEditor.document.getText(activeEditor.selection) : null,
            workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.name),
            openFiles: vscode.window.tabGroups.all.flatMap(group =>
                group.tabs.map(tab => (tab.input as any)?.uri?.fsPath).filter(Boolean)
            )
        };
    }

    async function showSmartRouteResult(result: any, originalRequest: string) {
        const content = `# 🚀 Smart Route Results

**Original Request:** ${originalRequest}

**AI Selected:** ${result.metadata?.agent_emoji} ${result.agent_used} using ${result.model_used}

**Why This Agent:** ${result.metadata?.agent_description}

**Specialties Applied:** ${result.metadata?.specialties.join(', ')}

## Solution

${result.content}

---

*Automatically routed by Mama Bear's intelligent agent orchestration system*`;

        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: false
        });
    }
}