// 🎼 MAMA BEAR GEMINI MODEL ORCHESTRA - 7 Specialized AI Models
// Extracted from podplay-scout-alpha backend and optimized for VS Code

export enum ModelCapability {
    SPEED = 'speed',
    REASONING = 'reasoning', 
    THINKING = 'thinking',
    CREATIVE = 'creative',
    CODE_GENERATION = 'code_generation',
    DOCUMENT_ANALYSIS = 'document_analysis',
    MULTIMODAL = 'multimodal',
    LONG_OUTPUT = 'long_output',
    BATCH_PROCESSING = 'batch_processing',
    CACHED_CONTENT = 'cached_content',
    REAL_TIME = 'real_time',
    LIVE_COLLABORATION = 'live_collaboration',
    BIDIRECTIONAL = 'bidirectional'
}

export interface GeminiModel {
    id: string;
    name: string;
    context_window: number;
    output_limit: number;
    capabilities: Set<ModelCapability>;
    latency_tier: 'ultra_fast' | 'fast' | 'medium' | 'slow';
    cost_tier: 'free' | 'low' | 'medium' | 'high';
    specialty: string;
    features: string[];
    notes: string;
}

// 🚀 MAMA BEAR GEMINI REGISTRY - Our 7 Model Nuclear Arsenal
export const MAMA_BEAR_GEMINI_REGISTRY: Record<string, GeminiModel> = {
    // 🎼 CONDUCTOR - Strategic orchestration and decision making
    "conductor": {
        id: "models/gemini-2.5-pro-exp-12-05",
        name: "Gemini 2.5 Pro (Latest)",
        context_window: 2097152, // 2M context window!
        output_limit: 8192,
        capabilities: new Set([
            ModelCapability.REASONING,
            ModelCapability.CODE_GENERATION,
            ModelCapability.DOCUMENT_ANALYSIS,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "medium",
        cost_tier: "medium",
        specialty: "strategic_orchestration_and_planning",
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "Latest 2.5 Pro - Supreme conductor for complex routing and strategic decisions"
    },

    // 🧠 DEEP THINKER - Complex reasoning and architectural analysis
    "deep_thinker_primary": {
        id: "models/gemini-2.0-flash-thinking-exp-01-21",
        name: "Gemini 2.0 Flash Thinking (Latest)",
        context_window: 1048576,
        output_limit: 65536, // 65K output for complex analysis!
        capabilities: new Set([
            ModelCapability.THINKING,
            ModelCapability.REASONING,
            ModelCapability.LONG_OUTPUT,
            ModelCapability.CODE_GENERATION,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "slow",
        cost_tier: "medium",
        specialty: "complex_reasoning_and_architecture",
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "Latest thinking model - Best for complex debugging and architectural decisions"
    },

    // ⚡ SPEED DEMON - Ultra-fast responses and instant coding
    "speed_demon_primary": {
        id: "models/gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        context_window: 1048576,
        output_limit: 8192,
        capabilities: new Set([
            ModelCapability.SPEED,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "ultra_fast",
        cost_tier: "low",
        specialty: "instant_responses_and_quick_coding",
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "Fastest model - 6x faster than competition! Perfect for instant chat and quick coding"
    },

    // 🎨 CREATIVE GENIUS - Long-form content and innovative solutions
    "creative_writer_primary": {
        id: "models/gemini-2.5-flash-preview-05-20", 
        name: "Gemini 2.5 Flash Creative",
        context_window: 1048576,
        output_limit: 65536, // 65K output for long-form content!
        capabilities: new Set([
            ModelCapability.CREATIVE,
            ModelCapability.LONG_OUTPUT,
            ModelCapability.CODE_GENERATION,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "fast",
        cost_tier: "medium",
        specialty: "creative_solutions_and_long_form_content",
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "Creative powerhouse with massive 65K output - Perfect for innovative solutions and documentation"
    },

    // 📚 CONTEXT MASTER - 2M context window specialist
    "context_master_primary": {
        id: "models/gemini-2.5-pro",
        name: "Gemini 2.5 Pro (Context Master)",
        context_window: 2097152, // 2M context window!
        output_limit: 8192,
        capabilities: new Set([
            ModelCapability.REASONING,
            ModelCapability.DOCUMENT_ANALYSIS,
            ModelCapability.CODE_GENERATION,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "medium",
        cost_tier: "medium",
        specialty: "massive_context_processing_and_analysis",
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "2M context master - Handles entire codebases and massive documents with ease"
    },

    // 🔧 CODE SURGEON - Programming specialist and code analysis
    "code_specialist_primary": {
        id: "models/gemini-2.5-flash",
        name: "Gemini 2.5 Flash (Code Specialist)",
        context_window: 1048576,
        output_limit: 8192,
        capabilities: new Set([
            ModelCapability.CODE_GENERATION,
            ModelCapability.SPEED,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "fast",
        cost_tier: "low",
        specialty: "precise_code_generation_and_analysis", 
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "Code specialist optimized for precise programming tasks and code analysis"
    },

    // 📖 INTEGRATION MASTER - System integration and documentation
    "integration_master_primary": {
        id: "models/gemini-1.5-pro",
        name: "Gemini 1.5 Pro (Integration Master)",
        context_window: 2097152, // 2M context window
        output_limit: 8192,
        capabilities: new Set([
            ModelCapability.DOCUMENT_ANALYSIS,
            ModelCapability.REASONING,
            ModelCapability.CODE_GENERATION,
            ModelCapability.BATCH_PROCESSING,
            ModelCapability.CACHED_CONTENT
        ]),
        latency_tier: "medium",
        cost_tier: "medium",
        specialty: "system_integration_and_documentation",
        features: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
        notes: "Integration specialist for complex system connections and comprehensive documentation"
    }
};

// 🎼 INTELLIGENT MODEL ROUTER - Selects optimal AI for each task
export class IntelligentModelRouter {
    private performanceMetrics: Map<string, any> = new Map();

    // Select optimal models based on request analysis
    async selectOptimalModels(request: string, context: any = {}, maxModels: number = 3): Promise<string[]> {
        const selectedModels: string[] = [];
        
        // Always include conductor for orchestration
        selectedModels.push('conductor');

        // Analyze request characteristics
        const analysis = this.analyzeRequest(request);
        
        // Select based on analysis
        if (analysis.needsComplexReasoning) {
            selectedModels.push('deep_thinker_primary');
        }
        
        if (analysis.needsSpeed) {
            selectedModels.push('speed_demon_primary');
        }
        
        if (analysis.needsCreativity) {
            selectedModels.push('creative_writer_primary');
        }
        
        if (analysis.needsLargeContext) {
            selectedModels.push('context_master_primary');
        }
        
        if (analysis.needsCodeSpecialist) {
            selectedModels.push('code_specialist_primary');
        }
        
        if (analysis.needsIntegration) {
            selectedModels.push('integration_master_primary');
        }

        // Remove duplicates and limit to maxModels
        const uniqueModels = [...new Set(selectedModels)];
        return uniqueModels.slice(0, maxModels);
    }

    // Analyze request to determine optimal model selection
    private analyzeRequest(request: string): any {
        const lowerRequest = request.toLowerCase();
        const wordCount = request.split(' ').length;
        
        return {
            needsComplexReasoning: this.hasComplexReasoningPatterns(lowerRequest),
            needsSpeed: this.hasSpeedRequirements(lowerRequest),
            needsCreativity: this.hasCreativeRequirements(lowerRequest),
            needsLargeContext: wordCount > 100 || this.hasLargeContextRequirements(lowerRequest),
            needsCodeSpecialist: this.hasCodeRequirements(lowerRequest),
            needsIntegration: this.hasIntegrationRequirements(lowerRequest)
        };
    }

    private hasComplexReasoningPatterns(request: string): boolean {
        const patterns = [
            'analyze', 'complex', 'reasoning', 'logic', 'problem', 'solve',
            'architecture', 'design pattern', 'optimization', 'algorithm',
            'debug', 'troubleshoot', 'investigate', 'research'
        ];
        return patterns.some(pattern => request.includes(pattern));
    }

    private hasSpeedRequirements(request: string): boolean {
        const patterns = [
            'quick', 'fast', 'immediately', 'instant', 'urgent', 'now',
            'simple', 'basic', 'straightforward', 'brief'
        ];
        return patterns.some(pattern => request.includes(pattern));
    }

    private hasCreativeRequirements(request: string): boolean {
        const patterns = [
            'create', 'design', 'generate', 'invent', 'innovative',
            'creative', 'original', 'unique', 'artistic', 'compose',
            'write', 'story', 'content', 'documentation'
        ];
        return patterns.some(pattern => request.includes(pattern));
    }

    private hasLargeContextRequirements(request: string): boolean {
        const patterns = [
            'entire', 'whole', 'complete', 'comprehensive', 'detailed',
            'full analysis', 'all files', 'project wide', 'codebase',
            'documentation', 'review everything'
        ];
        return patterns.some(pattern => request.includes(pattern));
    }

    private hasCodeRequirements(request: string): boolean {
        const patterns = [
            'code', 'function', 'method', 'class', 'variable',
            'implement', 'program', 'script', 'syntax', 'compile',
            'refactor', 'optimize code', 'code review'
        ];
        return patterns.some(pattern => request.includes(pattern));
    }

    private hasIntegrationRequirements(request: string): boolean {
        const patterns = [
            'integrate', 'connect', 'api', 'service', 'system',
            'database', 'external', 'third party', 'configuration',
            'deployment', 'setup', 'install'
        ];
        return patterns.some(pattern => request.includes(pattern));
    }

    // Update performance metrics for continuous improvement
    updatePerformanceMetrics(modelId: string, responseTime: number, userSatisfaction: number): void {
        if (!this.performanceMetrics.has(modelId)) {
            this.performanceMetrics.set(modelId, {
                totalRequests: 0,
                averageResponseTime: 0,
                averageSatisfaction: 0,
                lastUpdated: new Date()
            });
        }

        const metrics = this.performanceMetrics.get(modelId);
        metrics.totalRequests++;
        metrics.averageResponseTime = (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
        metrics.averageSatisfaction = (metrics.averageSatisfaction * (metrics.totalRequests - 1) + userSatisfaction) / metrics.totalRequests;
        metrics.lastUpdated = new Date();
        
        this.performanceMetrics.set(modelId, metrics);
    }

    // Get model performance statistics
    getModelPerformance(modelId: string): any {
        return this.performanceMetrics.get(modelId) || {
            totalRequests: 0,
            averageResponseTime: 0,
            averageSatisfaction: 0,
            lastUpdated: null
        };
    }

    // Get all performance metrics
    getAllPerformanceMetrics(): any {
        const metrics: any = {};
        for (const [modelId, data] of this.performanceMetrics.entries()) {
            metrics[modelId] = data;
        }
        return metrics;
    }
}

// 🎼 GEMINI ORCHESTRA MANAGER - Coordinates all 7 models
export class GeminiOrchestraManager {
    private modelRouter: IntelligentModelRouter;
    private modelRegistry: Record<string, GeminiModel>;

    constructor() {
        this.modelRouter = new IntelligentModelRouter();
        this.modelRegistry = MAMA_BEAR_GEMINI_REGISTRY;
        console.log('🎼 Gemini Orchestra Manager initialized with 7 specialized models');
    }

    // Process request with optimal model selection
    async processWithOrchestra(request: string, context: any = {}): Promise<any> {
        const startTime = Date.now();
        
        try {
            // Select optimal models for this request
            const optimalModels = await this.modelRouter.selectOptimalModels(request, context);
            
            // Get model details
            const modelDetails = optimalModels.map(modelId => ({
                id: modelId,
                model: this.modelRegistry[modelId],
                specialty: this.modelRegistry[modelId]?.specialty || 'general'
            }));

            console.log(`🎼 Orchestra selected models: ${optimalModels.join(', ')}`);

            // For now, return orchestration details
            // In production, this would call the actual Vertex AI endpoints
            const result = {
                message: `🎼 Gemini Orchestra processed your request with ${optimalModels.length} specialized models`,
                models_used: optimalModels,
                model_details: modelDetails,
                orchestra_strategy: this.getOrchestraStrategy(optimalModels),
                processing_time_ms: Date.now() - startTime,
                context_applied: Object.keys(context).length > 0
            };

            // Update performance metrics
            const responseTime = Date.now() - startTime;
            for (const modelId of optimalModels) {
                this.modelRouter.updatePerformanceMetrics(modelId, responseTime, 0.85); // Default satisfaction
            }

            return result;

        } catch (error) {
            console.error('Orchestra processing failed:', error);
            return {
                error: 'Orchestra processing failed',
                message: error instanceof Error ? error.message : String(error),
                fallback_model: 'conductor'
            };
        }
    }

    // Get orchestra strategy description
    private getOrchestraStrategy(models: string[]): string {
        const strategies: string[] = [];
        
        if (models.includes('conductor')) {
            strategies.push('Strategic orchestration');
        }
        if (models.includes('deep_thinker_primary')) {
            strategies.push('Complex reasoning analysis');
        }
        if (models.includes('speed_demon_primary')) {
            strategies.push('Ultra-fast processing');
        }
        if (models.includes('creative_writer_primary')) {
            strategies.push('Creative solution generation');
        }
        if (models.includes('context_master_primary')) {
            strategies.push('Massive context processing');
        }
        if (models.includes('code_specialist_primary')) {
            strategies.push('Precision code analysis');
        }
        if (models.includes('integration_master_primary')) {
            strategies.push('System integration planning');
        }

        return strategies.join(' + ');
    }

    // Get model registry
    getModelRegistry(): Record<string, GeminiModel> {
        return { ...this.modelRegistry };
    }

    // Get available models
    getAvailableModels(): string[] {
        return Object.keys(this.modelRegistry);
    }

    // Get model by ID
    getModel(modelId: string): GeminiModel | undefined {
        return this.modelRegistry[modelId];
    }

    // Get models by capability
    getModelsByCapability(capability: ModelCapability): string[] {
        return Object.entries(this.modelRegistry)
            .filter(([_, model]) => model.capabilities.has(capability))
            .map(([id, _]) => id);
    }

    // Get performance statistics
    getOrchestraPerformance(): any {
        return this.modelRouter.getAllPerformanceMetrics();
    }

    // Get fastest models
    getFastestModels(): string[] {
        return Object.entries(this.modelRegistry)
            .filter(([_, model]) => model.latency_tier === 'ultra_fast' || model.latency_tier === 'fast')
            .map(([id, _]) => id)
            .sort((a, b) => {
                const aModel = this.modelRegistry[a];
                const bModel = this.modelRegistry[b];
                const tierOrder = { 'ultra_fast': 0, 'fast': 1, 'medium': 2, 'slow': 3 };
                return tierOrder[aModel.latency_tier] - tierOrder[bModel.latency_tier];
            });
    }

    // Get most capable models
    getMostCapableModels(): string[] {
        return Object.entries(this.modelRegistry)
            .sort(([_, a], [__, b]) => b.capabilities.size - a.capabilities.size)
            .map(([id, _]) => id)
            .slice(0, 3);
    }
}
