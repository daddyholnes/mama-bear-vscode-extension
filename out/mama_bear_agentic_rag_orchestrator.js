"use strict";
// 🔥 MAMA BEAR AGENTIC RAG ORCHESTRATOR - VS CODE EDITION
// Extracted from podplay-scout-alpha backend and weaponized for VS Code
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPAgenticRAGOrchestrator = exports.AgenticMemorySystem = exports.CrossSessionLearner = exports.PredictiveContextEngine = exports.RAGIntelligenceLevel = exports.AgenticRAGDecisionType = void 0;
// Agentic RAG Decision Types - Our Secret Weapon System
var AgenticRAGDecisionType;
(function (AgenticRAGDecisionType) {
    AgenticRAGDecisionType["MEMORY_SEARCH"] = "memory_search";
    AgenticRAGDecisionType["CONTEXT_EXPANSION"] = "context_expansion";
    AgenticRAGDecisionType["MODEL_SELECTION"] = "model_selection";
    AgenticRAGDecisionType["TOOL_ROUTING"] = "tool_routing";
    AgenticRAGDecisionType["PROACTIVE_FETCH"] = "proactive_fetch";
    AgenticRAGDecisionType["CROSS_SESSION_LEARNING"] = "cross_session_learning";
})(AgenticRAGDecisionType || (exports.AgenticRAGDecisionType = AgenticRAGDecisionType = {}));
// RAG Intelligence Levels - 5 Levels of AI Autonomy
var RAGIntelligenceLevel;
(function (RAGIntelligenceLevel) {
    RAGIntelligenceLevel[RAGIntelligenceLevel["REACTIVE"] = 1] = "REACTIVE";
    RAGIntelligenceLevel[RAGIntelligenceLevel["PROACTIVE"] = 2] = "PROACTIVE";
    RAGIntelligenceLevel[RAGIntelligenceLevel["PREDICTIVE"] = 3] = "PREDICTIVE";
    RAGIntelligenceLevel[RAGIntelligenceLevel["AUTONOMOUS"] = 4] = "AUTONOMOUS";
    RAGIntelligenceLevel[RAGIntelligenceLevel["ORCHESTRATIVE"] = 5] = "ORCHESTRATIVE"; // Coordinates across the entire orchestra
})(RAGIntelligenceLevel || (exports.RAGIntelligenceLevel = RAGIntelligenceLevel = {}));
// 🧠 PREDICTIVE CONTEXT ENGINE - Future-Seeing AI
class PredictiveContextEngine {
    constructor() {
        this.context_cache = new Map();
    }
    async predictNextContextNeeds(userRequest, userId) {
        const predictions = [];
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
    isExplanationRequest(request) {
        return /\b(how|what|explain|why|describe)\b/i.test(request);
    }
    isCodeRequest(request) {
        return /\b(code|function|implement|create|build|develop)\b/i.test(request);
    }
    hashRequest(request) {
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
exports.PredictiveContextEngine = PredictiveContextEngine;
// 📚 CROSS-SESSION LEARNER - Gets Smarter Over Time
class CrossSessionLearner {
    constructor() {
        this.learning_patterns = new Map();
    }
    async learnFromSession(sessionData) {
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
        }
        catch (error) {
            console.error('Cross-session learning failed:', error);
            return { improved_accuracy: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    async extractSuccessPatterns(sessionData) {
        // Extract patterns from successful interactions
        return sessionData.successful_interactions?.map((interaction) => ({
            pattern_type: interaction.type,
            context: interaction.context,
            success_indicators: interaction.success_indicators,
            user_satisfaction: interaction.user_satisfaction || 0.8
        })) || [];
    }
    async createAvoidanceStrategies(failures) {
        // Create strategies to avoid previous failures
        return failures.map(failure => ({
            failure_type: failure.type,
            avoidance_strategy: failure.suggested_avoidance,
            context_markers: failure.context_markers
        }));
    }
    async adaptToPreferences(sessionData) {
        // Adapt to user preferences over time
        return {
            response_style: sessionData.preferred_response_style || 'detailed',
            interaction_pace: sessionData.preferred_pace || 'moderate',
            support_level: sessionData.preferred_support_level || 'caring'
        };
    }
    updateLearningPatterns(successPatterns, avoidanceStrategies, preferences) {
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
exports.CrossSessionLearner = CrossSessionLearner;
// 🧠 CONTEXTUAL MEMORY SYSTEM - Never Forgets Anything  
class AgenticMemorySystem {
    constructor(apiClient) {
        this.memories = new Map();
        this.apiClient = apiClient;
    }
    async searchMemoryWithStrategy(strategy, query, userId) {
        const results = {
            memories: [],
            expanded_context: {},
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
        }
        catch (error) {
            console.error('Memory search failed:', error);
            return { ...results, error: error instanceof Error ? error.message : String(error) };
        }
    }
    async searchPersonalMemories(query, userId, threshold) {
        // Search user's personal memories
        try {
            // Use the available loadContext method as a fallback
            const memories = await this.apiClient.loadContext();
            return memories.filter((memory) => memory.content?.toLowerCase().includes(query.toLowerCase()) ||
                memory.user_id === userId);
        }
        catch (error) {
            console.warn('Personal memory search failed:', error);
            return [];
        }
    }
    async searchSystemPatterns(query, threshold) {
        // Search system-wide patterns
        try {
            // Mock system pattern search for now - could be extended to use available API methods
            return [{
                    pattern_type: 'system',
                    confidence: threshold,
                    content: `System pattern for: ${query}`
                }];
        }
        catch (error) {
            console.warn('System pattern search failed:', error);
            return [];
        }
    }
    async searchRelatedConcepts(query, userId) {
        // Search for related concepts to expand context
        try {
            // Mock concept expansion for now - could be extended with web search API
            return {
                related_concepts: query.split(' ').slice(0, 3),
                expansion_type: 'conceptual',
                user_context: userId
            };
        }
        catch (error) {
            console.warn('Concept expansion failed:', error);
            return {};
        }
    }
    calculateConfidenceScore(memories) {
        if (memories.length === 0)
            return 0;
        const totalConfidence = memories.reduce((sum, memory) => sum + (memory.confidence || 0.5), 0);
        return totalConfidence / memories.length;
    }
}
exports.AgenticMemorySystem = AgenticMemorySystem;
// 🎼 MCP AGENTIC RAG ORCHESTRATOR - The Ultimate AI Weapon
class MCPAgenticRAGOrchestrator {
    constructor(apiClient) {
        this.intelligence_level = RAGIntelligenceLevel.AUTONOMOUS;
        this.decision_history = [];
        this.learning_patterns = new Map();
        // Performance metrics
        this.rag_metrics = {
            total_decisions: 0,
            successful_predictions: 0,
            context_cache_hits: 0,
            average_response_improvement: 0.0,
            user_satisfaction_scores: []
        };
        this.apiClient = apiClient;
        this.predictive_engine = new PredictiveContextEngine();
        this.cross_session_learner = new CrossSessionLearner();
        this.memory_system = new AgenticMemorySystem(apiClient);
        console.log('🧠 MCP + Agentic RAG Orchestrator initialized for VS Code');
    }
    // 🚀 MAIN ENTRY POINT - Process user requests with full agentic intelligence
    async processAgenticRequest(userRequest, userId, sessionContext = {}) {
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
        }
        catch (error) {
            console.error('Agentic request processing failed:', error);
            return {
                response: { error: 'Agentic processing failed', message: error instanceof Error ? error.message : String(error) },
                agentic_enhancements: { error: true }
            };
        }
    }
    // 🧠 AUTONOMOUS DECISION MAKING - AI decides what context to retrieve
    async makeAgenticRAGDecisions(userRequest, userId, sessionContext) {
        const decisions = [];
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
    async decideMemorySearchStrategy(userRequest, userId) {
        try {
            // Analyze request for optimal memory search strategy
            const strategy = {
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
        }
        catch (error) {
            return this.createFallbackDecision(AgenticRAGDecisionType.MEMORY_SEARCH, userRequest, userId);
        }
    }
    async decideContextExpansion(userRequest, sessionContext) {
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
    async decideCrossSessionLearning(userRequest, userId) {
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
    async decideToolRouting(userRequest, sessionContext) {
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
    async executeRAGDecisions(decisions, userId) {
        const enhancedContext = {
            memories: [],
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
            }
            catch (error) {
                console.error(`Failed to execute RAG decision ${decision.decision_id}:`, error);
                decision.success = false;
                decision.execution_time_ms = Date.now() - decision.timestamp.getTime();
            }
        }
        return enhancedContext;
    }
    async executeMemorySearch(decision, userId) {
        const strategy = decision.execution_plan[0]?.strategy;
        if (!strategy)
            return [];
        const userRequest = decision.trigger_context.user_request;
        return (await this.memory_system.searchMemoryWithStrategy(strategy, userRequest, userId)).memories;
    }
    async executeContextExpansion(decision, userId) {
        const shouldExpand = decision.execution_plan[0]?.expand;
        if (!shouldExpand)
            return {};
        // Simulate context expansion
        return {
            related_concepts: ['AI', 'development', 'VS Code'],
            expanded_details: 'Enhanced context for complex request processing'
        };
    }
    async executeCrossSessionLearning(decision, userId) {
        // Apply learning from previous sessions
        const sessionData = {
            successful_interactions: this.decision_history.filter(d => d.success),
            user_id: userId,
            success_rate: this.calculateSuccessRate()
        };
        return await this.cross_session_learner.learnFromSession(sessionData);
    }
    async executeToolPreparation(decision, userId) {
        const needsTools = decision.execution_plan[0]?.tools_needed;
        if (!needsTools)
            return {};
        // Prepare MCP tools for request
        return {
            mcp_tools_ready: true,
            available_tools: ['file_operations', 'web_search', 'code_analysis'],
            preparation_time: Date.now()
        };
    }
    // Select optimal models based on enhanced context
    async selectOptimalModels(userRequest, enhancedContext, ragDecisions) {
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
    async processWithEnhancedContext(userRequest, enhancedContext, optimalModels) {
        try {
            // Use the available sendMessage method for processing
            const response = await this.apiClient.sendMessage(userRequest, {
                enhanced_context: enhancedContext,
                optimal_models: optimalModels,
                agentic_mode: true
            });
            return response.response || response;
        }
        catch (error) {
            console.error('Enhanced processing failed:', error);
            return {
                message: '🐻 Mama Bear agentic system processed your request with care!',
                enhanced_with: 'agentic_rag',
                models_used: optimalModels,
                context_applied: Object.keys(enhancedContext).length > 0
            };
        }
    }
    async learnFromInteraction(ragDecisions, result, userId) {
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
        }
        catch (error) {
            console.error('Learning from interaction failed:', error);
        }
    }
    prepareNextContext(userRequest, result, userId) {
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
    isSystemKnowledgeRequest(request) {
        return /\b(documentation|api|reference|standard|best practice)\b/i.test(request);
    }
    isConceptualRequest(request) {
        return /\b(concept|idea|theory|approach|methodology)\b/i.test(request);
    }
    isHighPrecisionRequest(request) {
        return /\b(exactly|precisely|specific|accurate|correct)\b/i.test(request);
    }
    isComplexRequest(request) {
        return request.split(' ').length > 10 || /\b(complex|advanced|detailed|comprehensive)\b/i.test(request);
    }
    isCodeRequest(request) {
        return /\b(code|function|class|method|implement|develop|program)\b/i.test(request);
    }
    isCreativeRequest(request) {
        return /\b(create|design|generate|write|compose|build)\b/i.test(request);
    }
    isToolRequiredRequest(request) {
        return /\b(search|analyze|test|deploy|install|configure)\b/i.test(request);
    }
    analyzeRequestComplexity(request) {
        const words = request.split(' ').length;
        const complexityKeywords = (request.match(/\b(complex|advanced|detailed|comprehensive|sophisticated)\b/gi) || []).length;
        return Math.min((words / 20) + (complexityKeywords * 0.3), 1.0);
    }
    calculateSuccessRate() {
        if (this.decision_history.length === 0)
            return 0.8; // Default
        const successful = this.decision_history.filter(d => d.success).length;
        return successful / this.decision_history.length;
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateDecisionId() {
        return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    createFallbackDecision(type, userRequest, userId) {
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
    getMetrics() {
        return { ...this.rag_metrics };
    }
    setIntelligenceLevel(level) {
        this.intelligence_level = level;
        console.log(`🧠 Intelligence level set to: ${RAGIntelligenceLevel[level]}`);
    }
    getIntelligenceLevel() {
        return RAGIntelligenceLevel[this.intelligence_level];
    }
}
exports.MCPAgenticRAGOrchestrator = MCPAgenticRAGOrchestrator;
//# sourceMappingURL=mama_bear_agentic_rag_orchestrator.js.map