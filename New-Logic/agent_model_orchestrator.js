"use strict";
// src/mama_bear_agent_model_orchestrator.ts
/**
 * 🐻 7-Agent Orchestra + 20-Model Integration
 * Maps your backend agents to VS Code models for intelligent workflow routing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MamaBearAgentModelOrchestrator = exports.WorkflowTask = exports.AgentType = void 0;
var AgentType;
(function (AgentType) {
    AgentType["ORCHESTRATOR"] = "mama_bear_orchestrator";
    AgentType["SPEED_DEMON"] = "speed_demon";
    AgentType["DEEP_THINKER"] = "deep_thinker";
    AgentType["CODE_SURGEON"] = "code_surgeon";
    AgentType["CREATIVE_GENIUS"] = "creative_genius";
    AgentType["DATA_WIZARD"] = "data_wizard";
    AgentType["INTEGRATION_MASTER"] = "integration_master"; // 🔗 API & DevOps
})(AgentType || (exports.AgentType = AgentType = {}));
var WorkflowTask;
(function (WorkflowTask) {
    WorkflowTask["PROJECT_PLANNING"] = "project_planning";
    WorkflowTask["ENVIRONMENT_SETUP"] = "environment_setup";
    WorkflowTask["CODE_GENERATION"] = "code_generation";
    WorkflowTask["CODE_REVIEW"] = "code_review";
    WorkflowTask["DEBUGGING"] = "debugging";
    WorkflowTask["TESTING"] = "testing";
    WorkflowTask["OPTIMIZATION"] = "optimization";
    WorkflowTask["DEPLOYMENT"] = "deployment";
    WorkflowTask["DOCUMENTATION"] = "documentation";
    WorkflowTask["INTEGRATION"] = "integration";
})(WorkflowTask || (exports.WorkflowTask = WorkflowTask = {}));
class MamaBearAgentModelOrchestrator {
    constructor(apiClient) {
        this.workflowHistory = [];
        this.activeWorkflows = new Map();
        this.apiClient = apiClient;
        this.agentMappings = this.initializeAgentModelMappings();
    }
    initializeAgentModelMappings() {
        const mappings = new Map();
        // 🐻 MAMA BEAR ORCHESTRATOR - Supreme conductor
        mappings.set(AgentType.ORCHESTRATOR, {
            agent: AgentType.ORCHESTRATOR,
            primaryModels: [
                'gemini-2.5-pro-preview', // Best for orchestration
                'claude-opus-4', // Advanced reasoning
                'gemini-2.5-flash-native-audio' // Multimodal
            ],
            fallbackModels: ['claude-sonnet-4', 'gemini-1.5-pro'],
            specialties: ['Task Orchestration', 'Context Management', 'Agent Coordination', 'Decision Making'],
            emoji: '🐻',
            description: 'Supreme AI conductor with full context awareness'
        });
        // ⚡ SPEED DEMON - Ultra-fast responses
        mappings.set(AgentType.SPEED_DEMON, {
            agent: AgentType.SPEED_DEMON,
            primaryModels: [
                'gemini-2.0-flash', // Ultra-fast
                'gemini-2.0-flash-lite', // Lightning speed
                'claude-3-5-haiku' // Quick responses
            ],
            fallbackModels: ['gemini-1.5-flash-8b', 'gpt-4o-mini'],
            specialties: ['Rapid Prototyping', 'Quick Fixes', 'Instant Responses', 'UI Interactions'],
            emoji: '⚡',
            description: 'Ultra-fast responses for rapid development'
        });
        // 🧠 DEEP THINKER - Complex reasoning
        mappings.set(AgentType.DEEP_THINKER, {
            agent: AgentType.DEEP_THINKER,
            primaryModels: [
                'claude-opus-4', // Most complex tasks
                'gemini-2.5-pro-preview', // Advanced reasoning
                'o1-preview' // Deep analysis
            ],
            fallbackModels: ['claude-3-7-sonnet', 'o1-mini'],
            specialties: ['Architecture Design', 'Complex Problem Solving', 'System Analysis', 'Strategic Thinking'],
            emoji: '🧠',
            description: 'Complex reasoning and architectural planning'
        });
        // ⚕️ CODE SURGEON - Precision coding
        mappings.set(AgentType.CODE_SURGEON, {
            agent: AgentType.CODE_SURGEON,
            primaryModels: [
                'claude-sonnet-4', // Best for code
                'claude-3-5-sonnet-v2', // Code analysis
                'gemini-2.5-flash' // Fast coding
            ],
            fallbackModels: ['gpt-4o', 'claude-3-opus'],
            specialties: ['Code Review', 'Debugging', 'Optimization', 'Refactoring', 'Best Practices'],
            emoji: '⚕️',
            description: 'Precision coding, debugging, and refactoring'
        });
        // 🎨 CREATIVE GENIUS - Innovation & design
        mappings.set(AgentType.CREATIVE_GENIUS, {
            agent: AgentType.CREATIVE_GENIUS,
            primaryModels: [
                'claude-opus-4', // Creative reasoning
                'gpt-4o', // Multimodal creativity
                'claude-3-7-sonnet' // Extended thinking
            ],
            fallbackModels: ['claude-3-opus', 'gemini-1.5-pro'],
            specialties: ['UI/UX Design', 'Creative Solutions', 'Innovation', 'Artistic Vision'],
            emoji: '🎨',
            description: 'Innovation, design, and creative problem-solving'
        });
        // 🧙‍♂️ DATA WIZARD - Data analysis
        mappings.set(AgentType.DATA_WIZARD, {
            agent: AgentType.DATA_WIZARD,
            primaryModels: [
                'gemini-1.5-pro', // Large context for data
                'claude-opus-4', // Advanced analysis
                'o1-preview' // Mathematical reasoning
            ],
            fallbackModels: ['gemini-2.5-pro-preview', 'gpt-4-turbo'],
            specialties: ['Data Analysis', 'Machine Learning', 'Research', 'Statistics', 'Insights'],
            emoji: '🧙‍♂️',
            description: 'Data analysis, ML, and research specialist'
        });
        // 🔗 INTEGRATION MASTER - API & DevOps
        mappings.set(AgentType.INTEGRATION_MASTER, {
            agent: AgentType.INTEGRATION_MASTER,
            primaryModels: [
                'gpt-4o', // Function calling
                'gemini-2.0-flash', // Tool usage
                'claude-3-5-sonnet-v2' // Tool integration
            ],
            fallbackModels: ['gpt-4-turbo', 'gemini-2.5-flash'],
            specialties: ['API Integration', 'DevOps', 'System Connectivity', 'Automation'],
            emoji: '🔗',
            description: 'API integration, DevOps, and connectivity'
        });
        return mappings;
    }
    /**
     * 🎯 INTELLIGENT WORKFLOW ROUTING
     * Routes tasks to the best agent + model combination
     */
    async routeWorkflow(request) {
        const workflowId = `workflow_${Date.now()}`;
        // Determine best agent for the task
        const selectedAgent = this.selectAgentForTask(request.task, request.complexity);
        const agentMapping = this.agentMappings.get(selectedAgent);
        // Select best model based on context and load
        const selectedModel = await this.selectOptimalModel(agentMapping, request);
        // Create workflow context
        const workflowContext = {
            workflowId,
            agent: selectedAgent,
            model: selectedModel,
            task: request.task,
            timestamp: new Date().toISOString(),
            context: request.context
        };
        // Track active workflow
        this.activeWorkflows.set(workflowId, workflowContext);
        console.log(`🎯 Routing ${request.task} to ${agentMapping.emoji} ${selectedAgent} using ${selectedModel}`);
        // Execute the workflow
        const result = await this.executeAgentWorkflow(workflowContext, request);
        // Update history
        this.workflowHistory.push({
            ...workflowContext,
            result,
            duration: Date.now() - parseInt(workflowId.split('_')[1])
        });
        return result;
    }
    selectAgentForTask(task, complexity) {
        const taskAgentMap = {
            [WorkflowTask.PROJECT_PLANNING]: AgentType.ORCHESTRATOR,
            [WorkflowTask.ENVIRONMENT_SETUP]: AgentType.INTEGRATION_MASTER,
            [WorkflowTask.CODE_GENERATION]: complexity === 'simple' ? AgentType.SPEED_DEMON : AgentType.CODE_SURGEON,
            [WorkflowTask.CODE_REVIEW]: AgentType.CODE_SURGEON,
            [WorkflowTask.DEBUGGING]: AgentType.CODE_SURGEON,
            [WorkflowTask.TESTING]: AgentType.CODE_SURGEON,
            [WorkflowTask.OPTIMIZATION]: complexity === 'expert' ? AgentType.DEEP_THINKER : AgentType.CODE_SURGEON,
            [WorkflowTask.DEPLOYMENT]: AgentType.INTEGRATION_MASTER,
            [WorkflowTask.DOCUMENTATION]: AgentType.CREATIVE_GENIUS,
            [WorkflowTask.INTEGRATION]: AgentType.INTEGRATION_MASTER
        };
        return taskAgentMap[task];
    }
    async selectOptimalModel(agentMapping, request) {
        // Get available models from your model registry
        const availableModels = await this.apiClient.getAvailableModels();
        // Find the best available model from primary options
        for (const model of agentMapping.primaryModels) {
            if (availableModels.some((m) => m.id === model || m.endpoint_id === model)) {
                return model;
            }
        }
        // Fallback to secondary models
        for (const model of agentMapping.fallbackModels) {
            if (availableModels.some((m) => m.id === model || m.endpoint_id === model)) {
                return model;
            }
        }
        // Ultimate fallback
        return 'gemini-2.5-flash';
    }
    async executeAgentWorkflow(workflowContext, request) {
        const agentMapping = this.agentMappings.get(workflowContext.agent);
        // Create agent-specific prompt
        const agentPrompt = this.createAgentPrompt(agentMapping, request);
        // Execute through your API client with specific model
        const response = await this.apiClient.sendMessage(agentPrompt, {
            agent_type: workflowContext.agent,
            model_preference: workflowContext.model,
            workflow_id: workflowContext.workflowId,
            specialties: agentMapping.specialties
        });
        return {
            success: response.success,
            content: response.response,
            agent_used: workflowContext.agent,
            model_used: workflowContext.model,
            workflow_id: workflowContext.workflowId,
            metadata: {
                agent_emoji: agentMapping.emoji,
                agent_description: agentMapping.description,
                specialties: agentMapping.specialties
            }
        };
    }
    createAgentPrompt(agentMapping, request) {
        const agentPersonality = {
            [AgentType.ORCHESTRATOR]: "You are Mama Bear 🐻, the supreme AI conductor. You orchestrate complex workflows with wisdom and authority.",
            [AgentType.SPEED_DEMON]: "You are Speed Demon ⚡, ultra-fast and efficient. You provide rapid solutions and instant feedback.",
            [AgentType.DEEP_THINKER]: "You are Deep Thinker 🧠, analytical and thorough. You solve complex problems with methodical reasoning.",
            [AgentType.CODE_SURGEON]: "You are Code Surgeon ⚕️, precise and detail-oriented. You perform surgical precision on code.",
            [AgentType.CREATIVE_GENIUS]: "You are Creative Genius 🎨, innovative and artistic. You bring creative solutions to every challenge.",
            [AgentType.DATA_WIZARD]: "You are Data Wizard 🧙‍♂️, research-oriented and data-driven. You extract insights from complex data.",
            [AgentType.INTEGRATION_MASTER]: "You are Integration Master 🔗, technical and systematic. You connect systems seamlessly."
        };
        return `${agentPersonality[agentMapping.agent]}

SPECIALTIES: ${agentMapping.specialties.join(', ')}

TASK: ${request.task}
PRIORITY: ${request.priority}
COMPLEXITY: ${request.complexity}

USER REQUEST: ${request.userInput}

CONTEXT: ${JSON.stringify(request.context, null, 2)}

Respond as your specialized agent persona, leveraging your unique capabilities to provide the best solution.`;
    }
    /**
     * 🚀 QUICK WORKFLOW HELPERS FOR VS CODE COMMANDS
     */
    async quickCodeGeneration(prompt, fileType) {
        return this.routeWorkflow({
            task: WorkflowTask.CODE_GENERATION,
            context: { fileType, quickMode: true },
            userInput: prompt,
            priority: 'high',
            complexity: 'simple'
        });
    }
    async expertCodeReview(code, fileName) {
        return this.routeWorkflow({
            task: WorkflowTask.CODE_REVIEW,
            context: { code, fileName, reviewType: 'comprehensive' },
            userInput: `Please review this ${fileName} code for quality, security, and best practices`,
            priority: 'medium',
            complexity: 'complex'
        });
    }
    async architecturalPlanning(requirements) {
        return this.routeWorkflow({
            task: WorkflowTask.PROJECT_PLANNING,
            context: { planningType: 'architecture', scope: 'full_system' },
            userInput: requirements,
            priority: 'high',
            complexity: 'expert'
        });
    }
    async rapidDebugging(errorDescription, codeContext) {
        return this.routeWorkflow({
            task: WorkflowTask.DEBUGGING,
            context: { errorDescription, codeContext, debugMode: 'rapid' },
            userInput: `Debug this error: ${errorDescription}`,
            priority: 'urgent',
            complexity: 'moderate'
        });
    }
    /**
     * 📊 WORKFLOW ANALYTICS
     */
    getAgentPerformanceStats() {
        const stats = {};
        for (const [agent, mapping] of this.agentMappings) {
            const agentWorkflows = this.workflowHistory.filter(w => w.agent === agent);
            stats[agent] = {
                emoji: mapping.emoji,
                name: agent,
                totalExecutions: agentWorkflows.length,
                averageDuration: agentWorkflows.reduce((sum, w) => sum + w.duration, 0) / agentWorkflows.length || 0,
                successRate: agentWorkflows.filter(w => w.result.success).length / agentWorkflows.length || 0,
                specialties: mapping.specialties
            };
        }
        return stats;
    }
    getActiveWorkflows() {
        return Array.from(this.activeWorkflows.values());
    }
    getWorkflowHistory(limit = 50) {
        return this.workflowHistory.slice(-limit);
    }
}
exports.MamaBearAgentModelOrchestrator = MamaBearAgentModelOrchestrator;
//# sourceMappingURL=agent_model_orchestrator.js.map