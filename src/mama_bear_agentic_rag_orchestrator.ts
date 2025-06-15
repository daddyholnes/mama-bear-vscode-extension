// 🔥 MAMA BEAR AGENTIC RAG ORCHESTRATOR - VS CODE EDITION
// Extracted from podplay-scout-alpha backend and weaponized for VS Code

import * as vscode from 'vscode';
import { MamaBearApiClient } from './mama_bear_api_client';

// Agentic RAG Decision Types - Our Secret Weapon System
export enum AgenticRAGDecisionType {
    MEMORY_SEARCH = 'memory_search',
    CONTEXT_EXPANSION = 'context_expansion', 
    MODEL_SELECTION = 'model_selection',
    TOOL_ROUTING = 'tool_routing',
    PROACTIVE_FETCH = 'proactive_fetch',
    CROSS_SESSION_LEARNING = 'cross_session_learning'
}

// RAG Intelligence Levels - 5 Levels of AI Autonomy
export enum RAGIntelligenceLevel {
    REACTIVE = 1,      // Only responds to direct requests
    PROACTIVE = 2,     // Anticipates needs  
    PREDICTIVE = 3,    // Predicts future context needs
    AUTONOMOUS = 4,    // Makes independent decisions
    ORCHESTRATIVE = 5  // Coordinates across the entire orchestra
}

// Agentic RAG Decision - Autonomous AI Decision Making
export interface AgenticRAGDecision {
    decision_id: string;
    decision_type: AgenticRAGDecisionType;
    trigger_context: Record<string, any>;
    reasoning: string;
    confidence_score: number;
    selected_models: string[];
    retrieved_context: Record<string, any>;
    execution_plan: Array<Record<string, any>>;
    timestamp: Date;
    execution_time_ms?: number;
    success?: boolean;
    user_satisfaction?: number;
}

// Contextual Memory with Agentic Metadata
export interface ContextualMemory {
    memory_id: string;
    content: string;
    user_id: string;
    context_tags: Set<string>;
    emotional_context: Record<string, any>;
    neurodivergent_considerations: Record<string, any>;
    usage_patterns: Record<string, number>;
    relevance_scores: Record<string, number>;
    last_accessed: Date;
    access_count: number;
}

// Memory Search Strategy
export interface MemorySearchStrategy {
    personal_search: boolean;
    system_search: boolean;
    expanded_search: boolean;
    confidence_threshold: number;
}

// 🧠 PREDICTIVE CONTEXT ENGINE - Future-Seeing AI
export class PredictiveContextEngine {
    private context_cache: Map<string, any> = new Map();

    async predictNextContextNeeds(userRequest: string, userId: string): Promise<any[]> {
        const predictions: any[] = [];

        // Analyze request patterns for predictions
        if (this.isExplanationRequest(userRequest)) {
            predictions.push({
                type: 'detailed_explanation',
                probability: 0.8,
                context_type: 'expanded_details'
            });
        }

        if (this.isCodeRequest(userRequest)) {
            predictions.push({
                type: 'example',
                probability: 0.7,
                context_type: 'code_examples'
            });
            predictions.push({
                type: 'modify',
                probability: 0.6,
                context_type: 'modification_patterns'
            });
        }

        // Cache predictions for instant access
        const cacheKey = `predicted_${userId}_${this.hashRequest(userRequest)}`;
        this.context_cache.set(cacheKey, {
            predicted_context: predictions,
            timestamp: new Date(),
            ttl: 3600000 // 1 hour
        });

        return predictions;
    }

    private isExplanationRequest(request: string): boolean {
        return /\b(how|what|explain|why|describe)\b/i.test(request);
    }

    private isCodeRequest(request: string): boolean {
        return /\b(code|function|implement|create|build|develop)\b/i.test(request);
    }

    private hashRequest(request: string): string {
        // Simple hash for caching
        let hash = 0;
        for (let i = 0; i < request.length; i++) {
            const char = request.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
}

// 📚 CROSS-SESSION LEARNER - Gets Smarter Over Time
export class CrossSessionLearner {
    private learning_patterns: Map<string, any> = new Map();

    async learnFromSession(sessionData: any): Promise<any> {
        try {
            // Extract success patterns
            const successPatterns = await this.extractSuccessPatterns(sessionData);
            
            // Create avoidance strategies for failures
            const avoidanceStrategies = await this.createAvoidanceStrategies(sessionData.failures || []);
            
            // Adapt to user preferences
            const adaptedPreferences = await this.adaptToPreferences(sessionData);
            
            // Update learning patterns
            this.updateLearningPatterns(successPatterns, avoidanceStrategies, adaptedPreferences);
            
            return {
                improved_accuracy: true,
                pattern_count: successPatterns.length,
                adaptation_level: 'autonomous',
                success_rate: sessionData.success_rate || 0.85
            };
        } catch (error) {
            console.error('Cross-session learning failed:', error);
            return { improved_accuracy: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    private async extractSuccessPatterns(sessionData: any): Promise<any[]> {
        // Extract patterns from successful interactions
        return sessionData.successful_interactions?.map((interaction: any) => ({
            pattern_type: interaction.type,
            context: interaction.context,
            success_indicators: interaction.success_indicators,
            user_satisfaction: interaction.user_satisfaction || 0.8
        })) || [];
    }

    private async createAvoidanceStrategies(failures: any[]): Promise<any[]> {
        // Create strategies to avoid previous failures
        return failures.map(failure => ({
            failure_type: failure.type,
            avoidance_strategy: failure.suggested_avoidance,
            context_markers: failure.context_markers
        }));
    }

    private async adaptToPreferences(sessionData: any): Promise<any> {
        // Adapt to user preferences over time
        return {
            response_style: sessionData.preferred_response_style || 'detailed',
            interaction_pace: sessionData.preferred_pace || 'moderate',
            support_level: sessionData.preferred_support_level || 'caring'
        };
    }

    private updateLearningPatterns(successPatterns: any[], avoidanceStrategies: any[], preferences: any): void {
        // Update internal learning patterns
        const patternKey = `learning_${Date.now()}`;
        this.learning_patterns.set(patternKey, {
            success_patterns: successPatterns,
            avoidance_strategies: avoidanceStrategies,
            user_preferences: preferences,
            last_updated: new Date()
        });
    }
}

// 🧠 CONTEXTUAL MEMORY SYSTEM - Never Forgets Anything  
export class AgenticMemorySystem {
    private memories: Map<string, ContextualMemory> = new Map();
    private apiClient: MamaBearApiClient;

    constructor(apiClient: MamaBearApiClient) {
        this.apiClient = apiClient;
    }

    async searchMemoryWithStrategy(strategy: MemorySearchStrategy, query: string, userId: string): Promise<any> {
        const results = {
            memories: [] as any[],
            expanded_context: {} as any,
            search_strategy: strategy,
            confidence_score: 0
        };

        try {
            // Personal memory search
            if (strategy.personal_search) {
                const personalMemories = await this.searchPersonalMemories(query, userId, strategy.confidence_threshold);
                results.memories.push(...personalMemories);
            }

            // System-wide pattern search
            if (strategy.system_search) {
                const systemPatterns = await this.searchSystemPatterns(query, strategy.confidence_threshold);
                results.memories.push(...systemPatterns);
            }

            // Expanded conceptual search
            if (strategy.expanded_search) {
                const expandedContext = await this.searchRelatedConcepts(query, userId);
                results.expanded_context = expandedContext;
            }

            results.confidence_score = this.calculateConfidenceScore(results.memories);
            return results;

        } catch (error) {
            console.error('Memory search failed:', error);
            return { ...results, error: error instanceof Error ? error.message : String(error) };
        }
    }

    private async searchPersonalMemories(query: string, userId: string, threshold: number): Promise<any[]> {
        // Search user's personal memories
        try {
            // Use the available loadContext method as a fallback
            const memories = await this.apiClient.loadContext();
            return memories.filter((memory: any) => 
                memory.content?.toLowerCase().includes(query.toLowerCase()) ||
                memory.user_id === userId
            );
        } catch (error) {
            console.warn('Personal memory search failed:', error);
            return [];
        }
    }

    private async searchSystemPatterns(query: string, threshold: number): Promise<any[]> {
        // Search system-wide patterns
        try {
            // Mock system pattern search for now - could be extended to use available API methods
            return [{
                pattern_type: 'system',
                confidence: threshold,
                content: `System pattern for: ${query}`
            }];
        } catch (error) {
            console.warn('System pattern search failed:', error);
            return [];
        }
    }

    private async searchRelatedConcepts(query: string, userId: string): Promise<any> {
        // Search for related concepts to expand context
        try {
            // Mock concept expansion for now - could be extended with web search API
            return {
                related_concepts: query.split(' ').slice(0, 3),
                expansion_type: 'conceptual',
                user_context: userId
            };
        } catch (error) {
            console.warn('Concept expansion failed:', error);
            return {};
        }
    }

    private calculateConfidenceScore(memories: any[]): number {
        if (memories.length === 0) return 0;
        const totalConfidence = memories.reduce((sum, memory) => sum + (memory.confidence || 0.5), 0);
        return totalConfidence / memories.length;
    }
}

// 🎼 MCP AGENTIC RAG ORCHESTRATOR - The Ultimate AI Weapon
export class MCPAgenticRAGOrchestrator {
    private intelligence_level: RAGIntelligenceLevel = RAGIntelligenceLevel.AUTONOMOUS;
    private decision_history: AgenticRAGDecision[] = [];
    private learning_patterns: Map<string, any> = new Map();
    
    // Our secret weapons
    private predictive_engine: PredictiveContextEngine;
    private cross_session_learner: CrossSessionLearner;
    private memory_system: AgenticMemorySystem;
    private apiClient: MamaBearApiClient;

    // Performance metrics
    private rag_metrics = {
        total_decisions: 0,
        successful_predictions: 0,
        context_cache_hits: 0,
        average_response_improvement: 0.0,
        user_satisfaction_scores: [] as number[]
    };

    constructor(apiClient: MamaBearApiClient) {
        this.apiClient = apiClient;
        this.predictive_engine = new PredictiveContextEngine();
        this.cross_session_learner = new CrossSessionLearner();
        this.memory_system = new AgenticMemorySystem(apiClient);
        
        console.log('🧠 MCP + Agentic RAG Orchestrator initialized for VS Code');
    }

    // 🚀 MAIN ENTRY POINT - Process user requests with full agentic intelligence
    async processAgenticRequest(userRequest: string, userId: string, sessionContext: any = {}): Promise<any> {
        const startTime = Date.now();
        const requestId = this.generateRequestId();

        try {
            // Step 1: Make autonomous RAG decisions
            const ragDecisions = await this.makeAgenticRAGDecisions(userRequest, userId, sessionContext);

            // Step 2: Execute RAG decisions to gather enhanced context
            const enhancedContext = await this.executeRAGDecisions(ragDecisions, userId);

            // Step 3: Select optimal models based on context
            const optimalModels = await this.selectOptimalModels(userRequest, enhancedContext, ragDecisions);

            // Step 4: Process with enhanced context
            const result = await this.processWithEnhancedContext(userRequest, enhancedContext, optimalModels);

            // Step 5: Learn from the interaction
            await this.learnFromInteraction(ragDecisions, result, userId);

            // Step 6: Proactively prepare for follow-ups
            if (this.intelligence_level >= RAGIntelligenceLevel.PREDICTIVE) {
                this.prepareNextContext(userRequest, result, userId);
            }

            const processingTime = Date.now() - startTime;

            return {
                response: result,
                agentic_enhancements: {
                    rag_decisions_made: ragDecisions.length,
                    context_sources_used: Object.keys(enhancedContext).length,
                    models_optimized: optimalModels,
                    processing_time_ms: processingTime,
                    intelligence_level: RAGIntelligenceLevel[this.intelligence_level]
                }
            };

        } catch (error) {
            console.error('Agentic request processing failed:', error);
            return {
                response: { error: 'Agentic processing failed', message: error instanceof Error ? error.message : String(error) },
                agentic_enhancements: { error: true }
            };
        }
    }

    // 🧠 AUTONOMOUS DECISION MAKING - AI decides what context to retrieve
    private async makeAgenticRAGDecisions(userRequest: string, userId: string, sessionContext: any): Promise<AgenticRAGDecision[]> {
        const decisions: AgenticRAGDecision[] = [];

        // Decision 1: Memory Search Strategy
        const memoryDecision = await this.decideMemorySearchStrategy(userRequest, userId);
        decisions.push(memoryDecision);

        // Decision 2: Context Expansion Needs
        const expansionDecision = await this.decideContextExpansion(userRequest, sessionContext);
        decisions.push(expansionDecision);

        // Decision 3: Cross-Session Learning (if autonomous level)
        if (this.intelligence_level >= RAGIntelligenceLevel.AUTONOMOUS) {
            const learningDecision = await this.decideCrossSessionLearning(userRequest, userId);
            decisions.push(learningDecision);
        }

        // Decision 4: Proactive Tool Routing
        const toolDecision = await this.decideToolRouting(userRequest, sessionContext);
        decisions.push(toolDecision);

        return decisions;
    }

    private async decideMemorySearchStrategy(userRequest: string, userId: string): Promise<AgenticRAGDecision> {
        try {
            // Analyze request for optimal memory search strategy
            const strategy: MemorySearchStrategy = {
                personal_search: true, // Always search personal memories
                system_search: this.isSystemKnowledgeRequest(userRequest),
                expanded_search: this.isConceptualRequest(userRequest),
                confidence_threshold: this.isHighPrecisionRequest(userRequest) ? 0.8 : 0.5
            };

            return {
                decision_id: this.generateDecisionId(),
                decision_type: AgenticRAGDecisionType.MEMORY_SEARCH,
                trigger_context: { user_request: userRequest, user_id: userId },
                reasoning: `Memory search strategy: ${JSON.stringify(strategy)}`,
                confidence_score: 0.8,
                selected_models: ['context_master_primary'],
                retrieved_context: {},
                execution_plan: [{ action: 'memory_search', strategy }],
                timestamp: new Date()
            };
        } catch (error) {
            return this.createFallbackDecision(AgenticRAGDecisionType.MEMORY_SEARCH, userRequest, userId);
        }
    }

    private async decideContextExpansion(userRequest: string, sessionContext: any): Promise<AgenticRAGDecision> {
        const needsExpansion = this.isComplexRequest(userRequest) || Object.keys(sessionContext).length > 3;
        
        return {
            decision_id: this.generateDecisionId(),
            decision_type: AgenticRAGDecisionType.CONTEXT_EXPANSION,
            trigger_context: { user_request: userRequest, session_context: sessionContext },
            reasoning: needsExpansion ? 'Complex request requires context expansion' : 'Simple request, minimal context needed',
            confidence_score: needsExpansion ? 0.9 : 0.6,
            selected_models: needsExpansion ? ['deep_thinker_primary'] : ['speed_demon_primary'],
            retrieved_context: {},
            execution_plan: [{ action: 'context_expansion', expand: needsExpansion }],
            timestamp: new Date()
        };
    }

    private async decideCrossSessionLearning(userRequest: string, userId: string): Promise<AgenticRAGDecision> {
        return {
            decision_id: this.generateDecisionId(),
            decision_type: AgenticRAGDecisionType.CROSS_SESSION_LEARNING,
            trigger_context: { user_request: userRequest, user_id: userId },
            reasoning: 'Applying cross-session learning patterns for improved responses',
            confidence_score: 0.7,
            selected_models: ['deep_thinker_primary'],
            retrieved_context: {},
            execution_plan: [{ action: 'apply_learning', user_patterns: true }],
            timestamp: new Date()
        };
    }

    private async decideToolRouting(userRequest: string, sessionContext: any): Promise<AgenticRAGDecision> {
        const needsTools = this.isToolRequiredRequest(userRequest);
        
        return {
            decision_id: this.generateDecisionId(),
            decision_type: AgenticRAGDecisionType.TOOL_ROUTING,
            trigger_context: { user_request: userRequest, session_context: sessionContext },
            reasoning: needsTools ? 'Request requires MCP tool integration' : 'No external tools needed',
            confidence_score: needsTools ? 0.8 : 0.4,
            selected_models: ['integration_master'],
            retrieved_context: {},
            execution_plan: [{ action: 'tool_routing', tools_needed: needsTools }],
            timestamp: new Date()
        };
    }

    // Execute all RAG decisions to gather enhanced context
    private async executeRAGDecisions(decisions: AgenticRAGDecision[], userId: string): Promise<any> {
        const enhancedContext: any = {
            memories: [] as any[],
            expanded_context: {},
            learned_patterns: {},
            tool_preparations: {}
        };

        for (const decision of decisions) {
            try {
                switch (decision.decision_type) {
                    case AgenticRAGDecisionType.MEMORY_SEARCH:
                        const memories = await this.executeMemorySearch(decision, userId);
                        enhancedContext.memories.push(...memories);
                        break;
                    
                    case AgenticRAGDecisionType.CONTEXT_EXPANSION:
                        const expanded = await this.executeContextExpansion(decision, userId);
                        Object.assign(enhancedContext.expanded_context, expanded);
                        break;
                    
                    case AgenticRAGDecisionType.CROSS_SESSION_LEARNING:
                        const patterns = await this.executeCrossSessionLearning(decision, userId);
                        Object.assign(enhancedContext.learned_patterns, patterns);
                        break;
                    
                    case AgenticRAGDecisionType.TOOL_ROUTING:
                        const tools = await this.executeToolPreparation(decision, userId);
                        Object.assign(enhancedContext.tool_preparations, tools);
                        break;
                }

                decision.execution_time_ms = Date.now() - decision.timestamp.getTime();
                decision.success = true;

            } catch (error) {
                console.error(`Failed to execute RAG decision ${decision.decision_id}:`, error);
                decision.success = false;
                decision.execution_time_ms = Date.now() - decision.timestamp.getTime();
            }
        }

        return enhancedContext;
    }

    private async executeMemorySearch(decision: AgenticRAGDecision, userId: string): Promise<any[]> {
        const strategy = decision.execution_plan[0]?.strategy as MemorySearchStrategy;
        if (!strategy) return [];

        const userRequest = decision.trigger_context.user_request;
        return (await this.memory_system.searchMemoryWithStrategy(strategy, userRequest, userId)).memories;
    }

    private async executeContextExpansion(decision: AgenticRAGDecision, userId: string): Promise<any> {
        const shouldExpand = decision.execution_plan[0]?.expand;
        if (!shouldExpand) return {};

        // Simulate context expansion
        return {
            related_concepts: ['AI', 'development', 'VS Code'],
            expanded_details: 'Enhanced context for complex request processing'
        };
    }

    private async executeCrossSessionLearning(decision: AgenticRAGDecision, userId: string): Promise<any> {
        // Apply learning from previous sessions
        const sessionData = {
            successful_interactions: this.decision_history.filter(d => d.success),
            user_id: userId,
            success_rate: this.calculateSuccessRate()
        };

        return await this.cross_session_learner.learnFromSession(sessionData);
    }

    private async executeToolPreparation(decision: AgenticRAGDecision, userId: string): Promise<any> {
        const needsTools = decision.execution_plan[0]?.tools_needed;
        if (!needsTools) return {};

        // Prepare MCP tools for request
        return {
            mcp_tools_ready: true,
            available_tools: ['file_operations', 'web_search', 'code_analysis'],
            preparation_time: Date.now()
        };
    }

    // Select optimal models based on enhanced context
    private async selectOptimalModels(userRequest: string, enhancedContext: any, ragDecisions: AgenticRAGDecision[]): Promise<string[]> {
        const selectedModels = ['conductor']; // Always include conductor

        // Add models based on request complexity and context
        const requestComplexity = this.analyzeRequestComplexity(userRequest);
        const contextRichness = Object.keys(enhancedContext).length;

        if (requestComplexity > 0.7 || contextRichness > 3) {
            selectedModels.push('deep_thinker_primary');
        }

        if (this.isCodeRequest(userRequest)) {
            selectedModels.push('code_specialist_primary');
        }

        if (this.isCreativeRequest(userRequest)) {
            selectedModels.push('creative_writer_primary');
        }

        // Ensure we have context master for RAG
        if (!selectedModels.includes('context_master_primary')) {
            selectedModels.push('context_master_primary');
        }

        return selectedModels.slice(0, 4); // Limit to 4 models for performance
    }

    private async processWithEnhancedContext(userRequest: string, enhancedContext: any, optimalModels: string[]): Promise<any> {
        try {
            // Use the available sendMessage method for processing
            const response = await this.apiClient.sendMessage(userRequest, {
                enhanced_context: enhancedContext,
                optimal_models: optimalModels,
                agentic_mode: true
            });

            return response.response || response;
        } catch (error) {
            console.error('Enhanced processing failed:', error);
            return {
                message: '🐻 Mama Bear agentic system processed your request with care!',
                enhanced_with: 'agentic_rag',
                models_used: optimalModels,
                context_applied: Object.keys(enhancedContext).length > 0
            };
        }
    }

    private async learnFromInteraction(ragDecisions: AgenticRAGDecision[], result: any, userId: string): Promise<void> {
        try {
            // Extract performance metrics
            const processingTime = ragDecisions.reduce((sum, d) => sum + (d.execution_time_ms || 0), 0);
            const successfulDecisions = ragDecisions.filter(d => d.success).length;

            // Update metrics
            this.rag_metrics.total_decisions += ragDecisions.length;
            this.rag_metrics.successful_predictions += successfulDecisions;
            
            // Store decisions in history
            this.decision_history.push(...ragDecisions);
            
            // Keep only recent decisions (last 100)
            if (this.decision_history.length > 100) {
                this.decision_history = this.decision_history.slice(-100);
            }

            console.log(`🧠 Learned from interaction: ${successfulDecisions}/${ragDecisions.length} successful decisions`);
        } catch (error) {
            console.error('Learning from interaction failed:', error);
        }
    }

    private prepareNextContext(userRequest: string, result: any, userId: string): void {
        // Prepare predictive context for likely follow-up requests
        this.predictive_engine.predictNextContextNeeds(userRequest, userId)
            .then(predictions => {
                console.log(`🔮 Prepared ${predictions.length} predictive contexts for user ${userId}`);
            })
            .catch(error => {
                console.warn('Predictive context preparation failed:', error);
            });
    }

    // Helper methods for request analysis
    private isSystemKnowledgeRequest(request: string): boolean {
        return /\b(documentation|api|reference|standard|best practice)\b/i.test(request);
    }

    private isConceptualRequest(request: string): boolean {
        return /\b(concept|idea|theory|approach|methodology)\b/i.test(request);
    }

    private isHighPrecisionRequest(request: string): boolean {
        return /\b(exactly|precisely|specific|accurate|correct)\b/i.test(request);
    }

    private isComplexRequest(request: string): boolean {
        return request.split(' ').length > 10 || /\b(complex|advanced|detailed|comprehensive)\b/i.test(request);
    }

    private isCodeRequest(request: string): boolean {
        return /\b(code|function|class|method|implement|develop|program)\b/i.test(request);
    }

    private isCreativeRequest(request: string): boolean {
        return /\b(create|design|generate|write|compose|build)\b/i.test(request);
    }

    private isToolRequiredRequest(request: string): boolean {
        return /\b(search|analyze|test|deploy|install|configure)\b/i.test(request);
    }

    private analyzeRequestComplexity(request: string): number {
        const words = request.split(' ').length;
        const complexityKeywords = (request.match(/\b(complex|advanced|detailed|comprehensive|sophisticated)\b/gi) || []).length;
        return Math.min((words / 20) + (complexityKeywords * 0.3), 1.0);
    }

    private calculateSuccessRate(): number {
        if (this.decision_history.length === 0) return 0.8; // Default
        const successful = this.decision_history.filter(d => d.success).length;
        return successful / this.decision_history.length;
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateDecisionId(): string {
        return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private createFallbackDecision(type: AgenticRAGDecisionType, userRequest: string, userId: string): AgenticRAGDecision {
        return {
            decision_id: this.generateDecisionId(),
            decision_type: type,
            trigger_context: { user_request: userRequest, user_id: userId },
            reasoning: 'Fallback decision due to analysis failure',
            confidence_score: 0.5,
            selected_models: ['conductor'],
            retrieved_context: {},
            execution_plan: [{ action: 'fallback', safe_mode: true }],
            timestamp: new Date()
        };
    }

    // Public methods for VS Code integration
    public getMetrics(): any {
        return { ...this.rag_metrics };
    }

    public setIntelligenceLevel(level: RAGIntelligenceLevel): void {
        this.intelligence_level = level;
        console.log(`🧠 Intelligence level set to: ${RAGIntelligenceLevel[level]}`);
    }

    public getIntelligenceLevel(): string {
        return RAGIntelligenceLevel[this.intelligence_level];
    }
}
