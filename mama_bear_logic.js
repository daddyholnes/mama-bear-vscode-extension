// 🐻 Mama Bear AI - Complete Logic Implementation
// Connect your beautiful UI to the full capability system

class MamaBearAI {
  constructor() {
    this.capabilities = {};
    this.currentModel = 'claude_3_5_sonnet';
    this.mode = 'normal'; // 'build', 'plan', 'express'
    this.memory = new MEM0Client();
    this.vscode = new VSCodeAPI();
    this.mcp = new MCPClient();
    this.initialized = false;
  }

  // 🚀 INITIALIZATION - Run this first!
  async initialize() {
    console.log("🐻 Mama Bear initializing...");
    
    try {
      // 1. Check MEM0 Memory System
      this.capabilities.memory = await this.initializeMemory();
      
      // 2. Check VSCode Admin Access
      this.capabilities.vscode = await this.initializeVSCode();
      
      // 3. Discover MCP Tools
      this.capabilities.mcp = await this.initializeMCP();
      
      // 4. Check Available Models
      this.capabilities.models = await this.initializeModels();
      
      this.initialized = true;
      
      console.log("✅ Mama Bear fully initialized!");
      return this.getStatusReport();
      
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      return { error: error.message };
    }
  }

  // 🧠 MEM0 MEMORY SYSTEM
  async initializeMemory() {
    try {
      const status = await this.memory.connect();
      const memoryCount = await this.memory.count();
      
      return {
        active: status.connected,
        count: memoryCount,
        capabilities: [
          'persistent_memory',
          'cross_session_context', 
          'user_preferences',
          'project_knowledge'
        ]
      };
    } catch (error) {
      return { active: false, error: error.message };
    }
  }

  // Memory operations that AI must use
  async recallMemory(query, limit = 10) {
    if (!this.capabilities.memory?.active) return [];
    
    try {
      const memories = await this.memory.search({
        query: query,
        limit: limit,
        include_metadata: true
      });
      
      console.log(`🧠 Recalled ${memories.length} relevant memories`);
      return memories;
    } catch (error) {
      console.error("Memory recall failed:", error);
      return [];
    }
  }

  async saveMemory(content, metadata = {}) {
    if (!this.capabilities.memory?.active) return false;
    
    try {
      await this.memory.add({
        content: content,
        metadata: {
          timestamp: Date.now(),
          session_id: this.getSessionId(),
          ...metadata
        }
      });
      
      console.log("💾 Memory saved successfully");
      return true;
    } catch (error) {
      console.error("Memory save failed:", error);
      return false;
    }
  }

  // 💻 VSCODE ADMIN CAPABILITIES  
  async initializeVSCode() {
    try {
      const permissions = await this.vscode.checkPermissions();
      
      return {
        active: permissions.admin,
        capabilities: {
          file_operations: permissions.files,
          code_analysis: permissions.analysis,
          project_control: permissions.project,
          extension_management: permissions.extensions,
          git_integration: permissions.git
        }
      };
    } catch (error) {
      return { active: false, error: error.message };
    }
  }

  // VSCode operations AI can perform
  async createFile(path, content, explanation = "") {
    if (!this.capabilities.vscode?.active) {
      throw new Error("VSCode access not available");
    }
    
    try {
      await this.vscode.workspace.fs.writeFile(path, content);
      console.log(`📄 Created file: ${path}`);
      
      // Save to memory
      await this.saveMemory(`Created file ${path}: ${explanation}`, {
        type: 'file_creation',
        path: path
      });
      
      return { success: true, path: path };
    } catch (error) {
      console.error("File creation failed:", error);
      throw error;
    }
  }

  async updateFile(path, content, explanation = "") {
    if (!this.capabilities.vscode?.active) {
      throw new Error("VSCode access not available");
    }
    
    try {
      await this.vscode.workspace.fs.writeFile(path, content);
      console.log(`✏️ Updated file: ${path}`);
      
      await this.saveMemory(`Updated file ${path}: ${explanation}`, {
        type: 'file_update',
        path: path
      });
      
      return { success: true, path: path };
    } catch (error) {
      console.error("File update failed:", error);
      throw error;
    }
  }

  async analyzeProject() {
    if (!this.capabilities.vscode?.active) return null;
    
    try {
      const diagnostics = await this.vscode.languages.getDiagnostics();
      const workspaceInfo = await this.vscode.workspace.getConfiguration();
      
      const analysis = {
        errors: diagnostics.filter(d => d.severity === 0).length,
        warnings: diagnostics.filter(d => d.severity === 1).length,
        info: diagnostics.filter(d => d.severity === 2).length,
        files: await this.vscode.workspace.findFiles('**/*'),
        timestamp: Date.now()
      };
      
      console.log("🔍 Project analysis complete:", analysis);
      
      await this.saveMemory(`Project analysis: ${analysis.errors} errors, ${analysis.warnings} warnings`, {
        type: 'project_analysis',
        analysis: analysis
      });
      
      return analysis;
    } catch (error) {
      console.error("Project analysis failed:", error);
      return null;
    }
  }

  // 🐳 MCP (MODEL CONTEXT PROTOCOL) SYSTEM
  async initializeMCP() {
    try {
      const containers = await this.mcp.discoverContainers();
      const tools = await this.mcp.getAvailableTools();
      
      return {
        active: true,
        containers: containers.length,
        tools: tools,
        categories: this.categorizeMCPTools(tools)
      };
    } catch (error) {
      return { active: false, error: error.message };
    }
  }

  categorizeMCPTools(tools) {
    const categories = {
      browser_automation: [],
      code_analysis: [],
      file_management: [],
      data_processing: [],
      ai_assistants: []
    };
    
    tools.forEach(tool => {
      if (tool.capabilities.includes('web_scraping')) {
        categories.browser_automation.push(tool);
      }
      if (tool.capabilities.includes('static_analysis')) {
        categories.code_analysis.push(tool);
      }
      if (tool.capabilities.includes('file_operations')) {
        categories.file_management.push(tool);
      }
      if (tool.capabilities.includes('data_processing')) {
        categories.data_processing.push(tool);
      }
      if (tool.capabilities.includes('ai_model')) {
        categories.ai_assistants.push(tool);
      }
    });
    
    return categories;
  }

  async useMCPTool(toolName, params) {
    if (!this.capabilities.mcp?.active) {
      throw new Error("MCP system not available");
    }
    
    try {
      console.log(`🐳 Using MCP tool: ${toolName}`);
      const result = await this.mcp.callTool(toolName, params);
      
      await this.saveMemory(`Used MCP tool ${toolName}`, {
        type: 'mcp_usage',
        tool: toolName,
        params: params
      });
      
      return result;
    } catch (error) {
      console.error(`MCP tool ${toolName} failed:`, error);
      throw error;
    }
  }

  async installMCPTool(toolName) {
    try {
      console.log(`🐳 Installing MCP tool: ${toolName}`);
      const result = await this.mcp.installTool(toolName);
      
      // Refresh MCP capabilities
      this.capabilities.mcp = await this.initializeMCP();
      
      return result;
    } catch (error) {
      console.error(`Failed to install ${toolName}:`, error);
      throw error;
    }
  }

  // 🤖 MODEL SELECTION INTELLIGENCE
  async initializeModels() {
    const models = [
      { 
        id: 'claude_3_5_sonnet', 
        name: 'Claude 3.5 Sonnet',
        strengths: ['reasoning', 'code_analysis', 'problem_solving'],
        context_window: 200000,
        best_for: 'general_development'
      },
      { 
        id: 'claude_3_opus', 
        name: 'Claude 3 Opus',
        strengths: ['creative_solutions', 'complex_reasoning'],
        context_window: 200000,
        best_for: 'complex_problems'
      },
      { 
        id: 'gemini_2_0_flash_exp', 
        name: 'Gemini 2.0 Flash',
        strengths: ['speed', 'multimodal', 'real_time'],
        context_window: 1000000,
        best_for: 'quick_responses'
      },
      { 
        id: 'gemini_2_5_pro_exp', 
        name: 'Gemini 2.5 Pro',
        strengths: ['advanced_reasoning', 'long_context'],
        context_window: 2000000,
        best_for: 'large_codebases'
      },
      { 
        id: 'deepseek_r1', 
        name: 'DeepSeek R1',
        strengths: ['reasoning', 'mathematics', 'algorithms'],
        context_window: 64000,
        best_for: 'complex_logic'
      }
    ];
    
    // Check which models are actually available
    const availableModels = [];
    for (const model of models) {
      try {
        const status = await this.checkModelAvailability(model.id);
        if (status.available) {
          availableModels.push({...model, status: 'available'});
        }
      } catch (error) {
        availableModels.push({...model, status: 'unavailable'});
      }
    }
    
    return availableModels;
  }

  selectOptimalModel(task) {
    const taskType = this.categorizeTask(task);
    const complexity = this.assessComplexity(task);
    
    // Model selection logic
    if (taskType === 'reasoning' && complexity === 'high') {
      return 'claude_3_opus';
    }
    if (taskType === 'speed' || complexity === 'low') {
      return 'gemini_2_0_flash_exp';
    }
    if (taskType === 'large_context') {
      return 'gemini_2_5_pro_exp';
    }
    if (taskType === 'mathematics') {
      return 'deepseek_r1';
    }
    
    return 'claude_3_5_sonnet'; // Default
  }

  async switchModel(modelId, reason = "") {
    if (this.currentModel === modelId) return;
    
    const oldModel = this.currentModel;
    this.currentModel = modelId;
    
    console.log(`🤖 Switched from ${oldModel} to ${modelId}: ${reason}`);
    
    await this.saveMemory(`Model switch: ${oldModel} → ${modelId}`, {
      type: 'model_switch',
      old_model: oldModel,
      new_model: modelId,
      reason: reason
    });
  }

  // 🎯 MAIN RESPONSE LOGIC
  async processUserInput(input, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // 1. ALWAYS start with memory recall
      const relevantMemories = await this.recallMemory(input);
      
      // 2. Assess what's needed for this task
      const taskAnalysis = this.analyzeTask(input);
      
      // 3. Select optimal model
      const optimalModel = this.selectOptimalModel(input);
      if (optimalModel !== this.currentModel) {
        await this.switchModel(optimalModel, taskAnalysis.reason);
      }
      
      // 4. Determine required tools
      const requiredTools = this.identifyRequiredTools(taskAnalysis);
      
      // 5. Execute the task
      const response = await this.executeTask({
        input: input,
        memories: relevantMemories,
        analysis: taskAnalysis,
        tools: requiredTools,
        context: context
      });
      
      // 6. Save this interaction
      await this.saveMemory(`User: ${input}\nResponse: ${response.summary}`, {
        type: 'interaction',
        user_input: input,
        response_summary: response.summary,
        tools_used: requiredTools,
        model_used: this.currentModel
      });
      
      return response;
      
    } catch (error) {
      console.error("Processing failed:", error);
      return { error: error.message };
    }
  }

  // 🛠️ TASK EXECUTION ENGINE
  async executeTask(taskData) {
    const { input, memories, analysis, tools, context } = taskData;
    
    let response = {
      text: "",
      actions: [],
      tools_used: [],
      files_modified: [],
      summary: ""
    };
    
    // Use VSCode capabilities if needed
    if (analysis.needs_file_operations) {
      const projectAnalysis = await this.analyzeProject();
      response.actions.push({
        type: 'project_analysis',
        result: projectAnalysis
      });
    }
    
    // Use MCP tools if needed
    for (const tool of tools) {
      try {
        const result = await this.useMCPTool(tool.name, tool.params);
        response.tools_used.push({
          tool: tool.name,
          result: result
        });
      } catch (error) {
        console.error(`Tool ${tool.name} failed:`, error);
      }
    }
    
    // Generate the actual response
    response.text = await this.generateResponse(input, {
      memories: memories,
      analysis: analysis,
      previous_actions: response.actions,
      tool_results: response.tools_used,
      context: context
    });
    
    response.summary = this.extractSummary(response.text);
    
    return response;
  }

  // 📊 STATUS AND REPORTING
  getStatusReport() {
    return {
      🐻: "Mama Bear Status",
      🧠: `MEM0 Memory: ${this.capabilities.memory?.active ? '✅ Active' : '❌ Offline'} (${this.capabilities.memory?.count || 0} memories)`,
      💻: `VSCode Admin: ${this.capabilities.vscode?.active ? '✅ Full Access' : '❌ Limited'}`,
      🐳: `MCP Tools: ${this.capabilities.mcp?.active ? '✅ Active' : '❌ Offline'} (${this.capabilities.mcp?.containers || 0} containers)`,
      🤖: `Models: ${this.capabilities.models?.length || 0} available`,
      🎯: `Current Model: ${this.currentModel}`,
      📍: `Mode: ${this.mode}`,
      ⏰: `Last Updated: ${new Date().toISOString()}`
    };
  }

  // 🔧 UTILITY METHODS
  categorizeTask(task) {
    if (task.includes('code') || task.includes('programming')) return 'code_analysis';
    if (task.includes('fast') || task.includes('quick')) return 'speed';
    if (task.includes('math') || task.includes('calculate')) return 'mathematics';
    if (task.includes('reason') || task.includes('think')) return 'reasoning';
    if (task.includes('large') || task.includes('analyze entire')) return 'large_context';
    return 'general';
  }

  assessComplexity(task) {
    const complexityIndicators = ['complex', 'advanced', 'difficult', 'comprehensive'];
    const speedIndicators = ['quick', 'fast', 'simple', 'basic'];
    
    if (complexityIndicators.some(indicator => task.toLowerCase().includes(indicator))) {
      return 'high';
    }
    if (speedIndicators.some(indicator => task.toLowerCase().includes(indicator))) {
      return 'low';
    }
    return 'medium';
  }

  analyzeTask(input) {
    return {
      type: this.categorizeTask(input),
      complexity: this.assessComplexity(input),
      needs_file_operations: input.includes('file') || input.includes('create') || input.includes('update'),
      needs_web_access: input.includes('search') || input.includes('web') || input.includes('scrape'),
      needs_analysis: input.includes('analyze') || input.includes('check') || input.includes('review'),
      reason: `Task type: ${this.categorizeTask(input)}, Complexity: ${this.assessComplexity(input)}`
    };
  }

  identifyRequiredTools(analysis) {
    const tools = [];
    
    if (analysis.needs_web_access) {
      tools.push({ name: 'browser-automation', params: {} });
    }
    if (analysis.needs_analysis) {
      tools.push({ name: 'code-analysis', params: {} });
    }
    
    return tools;
  }

  getSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractSummary(text) {
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  }

  async generateResponse(input, context) {
    // This would integrate with your actual AI model
    // For now, return a placeholder that shows the system is working
    return `🐻 Mama Bear Response:\n\nI've processed your request: "${input}"\n\nUsing:\n- Model: ${this.currentModel}\n- Memories: ${context.memories?.length || 0} relevant memories found\n- Analysis: ${context.analysis?.type} task with ${context.analysis?.complexity} complexity\n- Tools: ${context.tool_results?.length || 0} tools used\n\nFull response would be generated here based on the selected model and context.`;
  }

  async checkModelAvailability(modelId) {
    // Placeholder - implement actual model checking
    return { available: true };
  }
}

// 🚀 INITIALIZATION
const mamaBear = new MamaBearAI();

// Export for your UI to use
window.MamaBear = mamaBear;

// Auto-initialize when loaded
window.addEventListener('load', async () => {
  console.log("🐻 Starting Mama Bear initialization...");
  const status = await mamaBear.initialize();
  console.log("Status:", status);
});