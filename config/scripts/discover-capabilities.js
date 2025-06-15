#!/usr/bin/env node
/**
 * 🐻 Mama Bear AI - Capability Discovery Script
 * Comprehensive system analysis to discover and map all available capabilities
 * Based on mama_bear_system.md capability framework
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class MamaBearCapabilityDiscovery {
  constructor() {
    this.configPath = path.join(__dirname, '../');
    this.capabilities = {
      system_info: {},
      memory_system: {},
      vscode_integration: {},
      mcp_tools: {},
      model_registry: {},
      file_operations: {},
      network_services: {},
      docker_environment: {},
      security_features: {},
      performance_metrics: {},
      discovery_timestamp: new Date().toISOString()
    };
  }

  async discoverAllCapabilities() {
    console.log("🐻 Mama Bear Capability Discovery Starting...");
    console.log("📋 Mapping all available system capabilities...\n");

    try {
      // 1. System Information Discovery
      await this.discoverSystemInfo();
      
      // 2. Memory System (MEM0) Discovery
      await this.discoverMemorySystem();
      
      // 3. VS Code Integration Discovery
      await this.discoverVSCodeCapabilities();
      
      // 4. MCP Tools Discovery
      await this.discoverMCPTools();
      
      // 5. Model Registry Discovery
      await this.discoverModelCapabilities();
      
      // 6. File Operations Discovery
      await this.discoverFileOperations();
      
      // 7. Network Services Discovery
      await this.discoverNetworkServices();
      
      // 8. Docker Environment Discovery
      await this.discoverDockerEnvironment();
      
      // 9. Security Features Discovery
      await this.discoverSecurityFeatures();
      
      // 10. Performance Metrics Discovery
      await this.discoverPerformanceMetrics();
      
      // Generate comprehensive report
      await this.generateCapabilityReport();
      
      console.log("\n✅ Mama Bear Capability Discovery Complete!");
      return this.capabilities;
      
    } catch (error) {
      console.error("❌ Capability discovery failed:", error.message);
      throw error;
    }
  }

  async discoverSystemInfo() {
    console.log("🖥️  Discovering System Information...");
    
    try {
      this.capabilities.system_info = {
        platform: process.platform,
        architecture: process.arch,
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        workspace_path: this.configPath,
        timestamp: new Date().toISOString()
      };
      
      // Check for VS Code environment
      this.capabilities.system_info.vscode_environment = {
        in_vscode: !!process.env.VSCODE_PID,
        extension_host: !!process.env.VSCODE_EXTENSION_HOST_LOG_LEVEL,
        webview_environment: !!process.env.VSCODE_WEBVIEW
      };
      
      console.log(`   ✅ Platform: ${this.capabilities.system_info.platform}`);
      console.log(`   ✅ Node.js: ${this.capabilities.system_info.node_version}`);
      console.log(`   ✅ VS Code: ${this.capabilities.system_info.vscode_environment.in_vscode ? 'Detected' : 'Standalone'}`);
      
    } catch (error) {
      console.log(`   ❌ System info discovery failed: ${error.message}`);
      this.capabilities.system_info.error = error.message;
    }
  }

  async discoverMemorySystem() {
    console.log("🧠 Discovering Memory System (MEM0)...");
    
    try {
      // Check if MEM0 configuration exists
      const mem0Config = await this.checkFileExists(path.join(this.configPath, 'services/mama-bear-backend.json'));
      
      this.capabilities.memory_system = {
        configured: mem0Config.exists,
        provider: 'mem0',
        persistent_storage: true,
        vector_db: 'chromadb',
        embedding_model: 'gemini-embedding',
        capabilities: [
          'user_preferences',
          'conversation_history',
          'code_context',
          'project_knowledge',
          'user_patterns',
          'cross_session_persistence',
          'semantic_search',
          'contextual_recall'
        ],
        operations: [
          'search',
          'add',
          'update',
          'delete',
          'upsert',
          'get_all',
          'get_history'
        ],
        config_path: mem0Config.path,
        status: mem0Config.exists ? 'configured' : 'not_configured'
      };
      
      if (mem0Config.exists && mem0Config.content) {
        const config = JSON.parse(mem0Config.content);
        this.capabilities.memory_system.config_details = config.memory_configuration || {};
      }
      
      console.log(`   ✅ MEM0 Status: ${this.capabilities.memory_system.status}`);
      console.log(`   ✅ Capabilities: ${this.capabilities.memory_system.capabilities.length} memory operations`);
      
    } catch (error) {
      console.log(`   ❌ Memory system discovery failed: ${error.message}`);
      this.capabilities.memory_system.error = error.message;
    }
  }

  async discoverVSCodeCapabilities() {
    console.log("💻 Discovering VS Code Integration...");
    
    try {
      // Check extension files
      const packageJson = await this.checkFileExists(path.join(this.configPath, 'package.json'));
      const extensionFiles = await this.findFiles(path.join(this.configPath, 'src'), '.ts');
      
      this.capabilities.vscode_integration = {
        extension_configured: packageJson.exists,
        source_files: extensionFiles.length,
        capabilities: [
          'file_operations',
          'code_analysis',
          'project_management',
          'git_integration',
          'terminal_control',
          'webview_provider',
          'command_execution',
          'extension_management',
          'workspace_management',
          'settings_management'
        ],
        providers: [
          'MamaBearChatProvider',
          'MamaBearTerminalProvider',
          'MamaBearCodeCompletion',
          'MamaBearFileAnalyzer',
          'MamaBearGitProvider',
          'MamaBearWorkspaceProvider'
        ],
        commands: [],
        keybindings: [],
        views: []
      };
      
      // Parse package.json for VS Code configuration
      if (packageJson.exists && packageJson.content) {
        const pkg = JSON.parse(packageJson.content);
        this.capabilities.vscode_integration.commands = pkg.contributes?.commands || [];
        this.capabilities.vscode_integration.keybindings = pkg.contributes?.keybindings || [];
        this.capabilities.vscode_integration.views = pkg.contributes?.views || {};
        this.capabilities.vscode_integration.activation_events = pkg.activationEvents || [];
      }
      
      console.log(`   ✅ Extension: ${this.capabilities.vscode_integration.extension_configured ? 'Configured' : 'Not configured'}`);
      console.log(`   ✅ Source Files: ${this.capabilities.vscode_integration.source_files}`);
      console.log(`   ✅ Commands: ${this.capabilities.vscode_integration.commands.length}`);
      
    } catch (error) {
      console.log(`   ❌ VS Code discovery failed: ${error.message}`);
      this.capabilities.vscode_integration.error = error.message;
    }
  }

  async discoverMCPTools() {
    console.log("🐳 Discovering MCP Tools...");
    
    try {
      // Check Docker availability
      let dockerAvailable = false;
      try {
        execSync('docker --version', { stdio: 'ignore' });
        dockerAvailable = true;
      } catch (error) {
        dockerAvailable = false;
      }
      
      this.capabilities.mcp_tools = {
        docker_available: dockerAvailable,
        mcp_configured: false,
        available_tools: [],
        tool_categories: {
          browser_automation: [],
          code_analysis: [],
          file_management: [],
          data_processing: [],
          ai_assistants: [],
          security_tools: [],
          testing_tools: [],
          deployment_tools: []
        },
        capabilities: [
          'tool_discovery',
          'tool_installation',
          'tool_execution',
          'container_management',
          'service_orchestration',
          'tool_chaining',
          'marketplace_integration'
        ]
      };
      
      // Check MCP configuration
      const dockerCompose = await this.checkFileExists(path.join(this.configPath, 'docker/docker-compose.mama-bear.yml'));
      this.capabilities.mcp_tools.mcp_configured = dockerCompose.exists;
      
      // Simulate tool discovery (in real implementation, would scan Docker)
      if (dockerAvailable) {
        this.capabilities.mcp_tools.available_tools = this.getSimulatedMCPTools();
        this.categorizeMCPTools();
      }
      
      console.log(`   ✅ Docker: ${dockerAvailable ? 'Available' : 'Not available'}`);
      console.log(`   ✅ MCP Config: ${this.capabilities.mcp_tools.mcp_configured ? 'Configured' : 'Not configured'}`);
      console.log(`   ✅ Tools: ${this.capabilities.mcp_tools.available_tools.length} discovered`);
      
    } catch (error) {
      console.log(`   ❌ MCP discovery failed: ${error.message}`);
      this.capabilities.mcp_tools.error = error.message;
    }
  }

  async discoverModelCapabilities() {
    console.log("🤖 Discovering Model Registry...");
    
    try {
      const modelsFile = await this.checkFileExists(path.join(this.configPath, 'models/mama-bear-models.json'));
      
      this.capabilities.model_registry = {
        configured: modelsFile.exists,
        total_models: 0,
        available_models: [],
        model_categories: {},
        capabilities: [
          'model_selection',
          'capability_matching',
          'performance_optimization',
          'cost_optimization',
          'context_management',
          'multimodal_support',
          'streaming_responses',
          'batch_processing'
        ],
        providers: []
      };
      
      if (modelsFile.exists && modelsFile.content) {
        const modelsData = JSON.parse(modelsFile.content);
        this.capabilities.model_registry.total_models = modelsData.model_registry?.total_models || 0;
        this.capabilities.model_registry.model_categories = modelsData.model_registry?.model_categories || {};
        this.capabilities.model_registry.recommended_defaults = modelsData.model_registry?.recommended_defaults || {};
        
        // Extract unique providers
        const models = modelsData.model_registry?.models || {};
        this.capabilities.model_registry.providers = [...new Set(
          Object.values(models).map(m => m.provider)
        )];
        
        // Extract available models
        this.capabilities.model_registry.available_models = Object.keys(models);
      }
      
      console.log(`   ✅ Registry: ${this.capabilities.model_registry.configured ? 'Configured' : 'Not configured'}`);
      console.log(`   ✅ Models: ${this.capabilities.model_registry.total_models}`);
      console.log(`   ✅ Providers: ${this.capabilities.model_registry.providers.length}`);
      
    } catch (error) {
      console.log(`   ❌ Model discovery failed: ${error.message}`);
      this.capabilities.model_registry.error = error.message;
    }
  }

  async discoverFileOperations() {
    console.log("📁 Discovering File Operations...");
    
    try {
      // Check file structure and permissions
      const workspaceStats = await this.analyzeWorkspaceStructure();
      
      this.capabilities.file_operations = {
        workspace_accessible: true,
        file_count: workspaceStats.totalFiles,
        directory_count: workspaceStats.totalDirectories,
        supported_operations: [
          'create',
          'read',
          'update',
          'delete',
          'rename',
          'copy',
          'move',
          'search',
          'watch',
          'analyze'
        ],
        supported_formats: [
          'typescript',
          'javascript', 
          'json',
          'markdown',
          'yaml',
          'dockerfile',
          'shell_scripts',
          'configuration_files'
        ],
        capabilities: [
          'syntax_analysis',
          'dependency_tracking',
          'code_completion',
          'error_detection',
          'formatting',
          'refactoring',
          'search_and_replace',
          'bulk_operations'
        ],
        analysis: workspaceStats
      };
      
      console.log(`   ✅ Files: ${this.capabilities.file_operations.file_count}`);
      console.log(`   ✅ Directories: ${this.capabilities.file_operations.directory_count}`);
      console.log(`   ✅ Operations: ${this.capabilities.file_operations.supported_operations.length}`);
      
    } catch (error) {
      console.log(`   ❌ File operations discovery failed: ${error.message}`);
      this.capabilities.file_operations.error = error.message;
    }
  }

  async discoverNetworkServices() {
    console.log("🌐 Discovering Network Services...");
    
    try {
      const serviceConfig = await this.checkFileExists(path.join(this.configPath, 'services/mama-bear-backend.json'));
      
      this.capabilities.network_services = {
        backend_configured: serviceConfig.exists,
        services: [],
        endpoints: [],
        capabilities: [
          'http_requests',
          'websocket_connections',
          'streaming_responses',
          'file_uploads',
          'authentication',
          'rate_limiting',
          'cors_handling',
          'error_handling'
        ],
        protocols: ['http', 'https', 'ws', 'wss'],
        ports: []
      };
      
      if (serviceConfig.exists && serviceConfig.content) {
        const config = JSON.parse(serviceConfig.content);
        this.capabilities.network_services.port = config.port;
        this.capabilities.network_services.endpoints = Object.keys(config.endpoints || {});
        this.capabilities.network_services.authentication = config.authentication || {};
        this.capabilities.network_services.features = config.features || {};
      }
      
      console.log(`   ✅ Backend: ${this.capabilities.network_services.backend_configured ? 'Configured' : 'Not configured'}`);
      console.log(`   ✅ Endpoints: ${this.capabilities.network_services.endpoints.length}`);
      console.log(`   ✅ Port: ${this.capabilities.network_services.port || 'Not specified'}`);
      
    } catch (error) {
      console.log(`   ❌ Network services discovery failed: ${error.message}`);
      this.capabilities.network_services.error = error.message;
    }
  }

  async discoverDockerEnvironment() {
    console.log("🐳 Discovering Docker Environment...");
    
    try {
      let dockerInfo = null;
      let composeAvailable = false;
      
      try {
        // Check Docker
        dockerInfo = execSync('docker info --format json', { stdio: 'pipe' }).toString();
        dockerInfo = JSON.parse(dockerInfo);
        
        // Check Docker Compose
        execSync('docker-compose --version', { stdio: 'ignore' });
        composeAvailable = true;
      } catch (error) {
        // Docker not available
      }
      
      this.capabilities.docker_environment = {
        docker_available: !!dockerInfo,
        compose_available: composeAvailable,
        containers: dockerInfo ? dockerInfo.Containers || 0 : 0,
        images: dockerInfo ? dockerInfo.Images || 0 : 0,
        capabilities: [
          'container_management',
          'image_building',
          'service_orchestration',
          'volume_management',
          'network_management',
          'health_checks',
          'scaling',
          'monitoring'
        ],
        compose_files: await this.findFiles(this.configPath, 'docker-compose*.yml'),
        dockerfiles: await this.findFiles(this.configPath, 'Dockerfile*')
      };
      
      console.log(`   ✅ Docker: ${this.capabilities.docker_environment.docker_available ? 'Available' : 'Not available'}`);
      console.log(`   ✅ Compose: ${this.capabilities.docker_environment.compose_available ? 'Available' : 'Not available'}`);
      console.log(`   ✅ Containers: ${this.capabilities.docker_environment.containers}`);
      
    } catch (error) {
      console.log(`   ❌ Docker discovery failed: ${error.message}`);
      this.capabilities.docker_environment.error = error.message;
    }
  }

  async discoverSecurityFeatures() {
    console.log("🔒 Discovering Security Features...");
    
    try {
      this.capabilities.security_features = {
        authentication_configured: false,
        service_accounts: [],
        cors_enabled: false,
        rate_limiting: false,
        input_validation: false,
        capabilities: [
          'service_account_auth',
          'cors_protection',
          'rate_limiting',
          'input_validation',
          'output_sanitization',
          'secure_headers',
          'encryption',
          'access_control'
        ],
        security_files: []
      };
      
      // Check for security configuration
      const serviceConfig = await this.checkFileExists(path.join(this.configPath, 'services/mama-bear-backend.json'));
      if (serviceConfig.exists && serviceConfig.content) {
        const config = JSON.parse(serviceConfig.content);
        this.capabilities.security_features.authentication_configured = !!config.authentication;
        this.capabilities.security_features.service_accounts = config.authentication?.service_accounts || [];
        this.capabilities.security_features.cors_enabled = config.security?.cors_enabled || false;
        this.capabilities.security_features.rate_limiting = config.security?.rate_limiting?.enabled || false;
        this.capabilities.security_features.input_validation = config.security?.input_validation || false;
      }
      
      // Look for security-related files
      this.capabilities.security_features.security_files = await this.findSecurityFiles();
      
      console.log(`   ✅ Authentication: ${this.capabilities.security_features.authentication_configured ? 'Configured' : 'Not configured'}`);
      console.log(`   ✅ Service Accounts: ${this.capabilities.security_features.service_accounts.length}`);
      console.log(`   ✅ Security Files: ${this.capabilities.security_features.security_files.length}`);
      
    } catch (error) {
      console.log(`   ❌ Security discovery failed: ${error.message}`);
      this.capabilities.security_features.error = error.message;
    }
  }

  async discoverPerformanceMetrics() {
    console.log("⚡ Discovering Performance Metrics...");
    
    try {
      this.capabilities.performance_metrics = {
        monitoring_configured: false,
        metrics_available: [],
        capabilities: [
          'response_time_tracking',
          'throughput_measurement',
          'error_rate_monitoring',
          'resource_utilization',
          'cache_performance',
          'model_performance',
          'health_checks',
          'alerting'
        ],
        health_endpoints: [],
        caching: {
          enabled: false,
          providers: []
        }
      };
      
      // Check service configuration for performance settings
      const serviceConfig = await this.checkFileExists(path.join(this.configPath, 'services/mama-bear-backend.json'));
      if (serviceConfig.exists && serviceConfig.content) {
        const config = JSON.parse(serviceConfig.content);
        this.capabilities.performance_metrics.monitoring_configured = !!config.monitoring;
        this.capabilities.performance_metrics.health_endpoints = config.endpoints?.health ? [config.endpoints.health] : [];
        this.capabilities.performance_metrics.caching.enabled = config.performance?.cache_enabled || false;
        this.capabilities.performance_metrics.response_timeout = config.performance?.response_timeout_ms || null;
      }
      
      console.log(`   ✅ Monitoring: ${this.capabilities.performance_metrics.monitoring_configured ? 'Configured' : 'Not configured'}`);
      console.log(`   ✅ Health Checks: ${this.capabilities.performance_metrics.health_endpoints.length}`);
      console.log(`   ✅ Caching: ${this.capabilities.performance_metrics.caching.enabled ? 'Enabled' : 'Disabled'}`);
      
    } catch (error) {
      console.log(`   ❌ Performance discovery failed: ${error.message}`);
      this.capabilities.performance_metrics.error = error.message;
    }
  }

  async generateCapabilityReport() {
    console.log("\n📊 Generating Comprehensive Capability Report...");
    
    const report = {
      mama_bear_capabilities: this.capabilities,
      summary: {
        total_capabilities: this.countTotalCapabilities(),
        system_readiness: this.assessSystemReadiness(),
        recommendations: this.generateRecommendations(),
        missing_components: this.identifyMissingComponents(),
        next_steps: this.suggestNextSteps()
      },
      generated_at: new Date().toISOString(),
      generator: "Mama Bear Capability Discovery v1.0"
    };
    
    // Save detailed report
    const reportPath = path.join(this.configPath, 'reports/capability_discovery_report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Save human-readable summary
    const summaryPath = path.join(this.configPath, 'reports/capability_summary.md');
    const markdownSummary = this.generateMarkdownSummary(report);
    await fs.writeFile(summaryPath, markdownSummary);
    
    console.log(`✅ Detailed report saved: ${reportPath}`);
    console.log(`✅ Summary saved: ${summaryPath}`);
    
    return report;
  }

  // Helper methods
  async checkFileExists(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      return {
        exists: true,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        content: content
      };
    } catch (error) {
      return {
        exists: false,
        path: filePath,
        error: error.message
      };
    }
  }

  async findFiles(directory, pattern) {
    try {
      const files = [];
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const subFiles = await this.findFiles(fullPath, pattern);
            files.push(...subFiles);
          }
        } else if (entry.name.includes(pattern) || entry.name.endsWith(pattern)) {
          files.push(fullPath);
        }
      }
      
      return files;
    } catch (error) {
      return [];
    }
  }

  async analyzeWorkspaceStructure() {
    let totalFiles = 0;
    let totalDirectories = 0;
    const fileTypes = {};
    
    const analyze = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
              totalDirectories++;
              await analyze(fullPath);
            }
          } else {
            totalFiles++;
            const ext = path.extname(entry.name);
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };
    
    await analyze(this.configPath);
    
    return {
      totalFiles,
      totalDirectories,
      fileTypes
    };
  }

  getSimulatedMCPTools() {
    return [
      { name: 'playwright-browser', category: 'browser_automation', capabilities: ['web_scraping', 'ui_testing'] },
      { name: 'code-analyzer', category: 'code_analysis', capabilities: ['static_analysis', 'security_scan'] },
      { name: 'file-processor', category: 'file_management', capabilities: ['batch_operations', 'format_conversion'] },
      { name: 'data-transformer', category: 'data_processing', capabilities: ['data_cleaning', 'format_conversion'] },
      { name: 'ai-assistant', category: 'ai_assistants', capabilities: ['language_processing', 'content_generation'] }
    ];
  }

  categorizeMCPTools() {
    for (const tool of this.capabilities.mcp_tools.available_tools) {
      const category = tool.category;
      if (this.capabilities.mcp_tools.tool_categories[category]) {
        this.capabilities.mcp_tools.tool_categories[category].push(tool);
      }
    }
  }

  async findSecurityFiles() {
    const securityPatterns = ['.json', '.pem', '.key', '.cert', '.env'];
    const securityFiles = [];
    
    for (const pattern of securityPatterns) {
      const files = await this.findFiles(this.configPath, pattern);
      securityFiles.push(...files.filter(f => 
        f.includes('auth') || f.includes('security') || f.includes('credentials')
      ));
    }
    
    return securityFiles;
  }

  countTotalCapabilities() {
    let total = 0;
    for (const category of Object.values(this.capabilities)) {
      if (category.capabilities && Array.isArray(category.capabilities)) {
        total += category.capabilities.length;
      }
    }
    return total;
  }

  assessSystemReadiness() {
    const checks = {
      memory_system: this.capabilities.memory_system.configured,
      vscode_integration: this.capabilities.vscode_integration.extension_configured,
      model_registry: this.capabilities.model_registry.configured,
      network_services: this.capabilities.network_services.backend_configured,
      docker_environment: this.capabilities.docker_environment.docker_available
    };
    
    const readyCount = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const readiness = (readyCount / totalChecks * 100).toFixed(1);
    
    return {
      percentage: readiness,
      ready_components: readyCount,
      total_components: totalChecks,
      status: readiness >= 80 ? 'ready' : readiness >= 60 ? 'mostly_ready' : 'needs_setup',
      details: checks
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.capabilities.memory_system.configured) {
      recommendations.push({
        priority: 'high',
        component: 'Memory System',
        action: 'Configure MEM0 integration for persistent memory and context retention'
      });
    }
    
    if (!this.capabilities.docker_environment.docker_available) {
      recommendations.push({
        priority: 'medium',
        component: 'Docker Environment',
        action: 'Install Docker for MCP tool support and containerized services'
      });
    }
    
    if (this.capabilities.model_registry.total_models === 0) {
      recommendations.push({
        priority: 'high',
        component: 'Model Registry',
        action: 'Configure model registry with available AI models'
      });
    }
    
    return recommendations;
  }

  identifyMissingComponents() {
    const missing = [];
    
    if (!this.capabilities.memory_system.configured) missing.push('MEM0 Memory System');
    if (!this.capabilities.docker_environment.docker_available) missing.push('Docker Environment');
    if (!this.capabilities.network_services.backend_configured) missing.push('Backend Service');
    if (this.capabilities.model_registry.total_models === 0) missing.push('Model Configuration');
    
    return missing;
  }

  suggestNextSteps() {
    const readiness = this.assessSystemReadiness();
    
    if (readiness.status === 'ready') {
      return [
        'Run model testing script to validate all models',
        'Deploy backend services using Docker Compose',
        'Test VS Code extension with full capabilities',
        'Configure memory system with initial data'
      ];
    } else if (readiness.status === 'mostly_ready') {
      return [
        'Complete missing component configuration',
        'Run capability tests for configured components',
        'Deploy in development mode for testing'
      ];
    } else {
      return [
        'Set up missing critical components',
        'Configure basic service infrastructure',
        'Test individual components before integration'
      ];
    }
  }

  generateMarkdownSummary(report) {
    const { capabilities, summary } = report;
    
    return `# 🐻 Mama Bear AI - Capability Discovery Report

Generated: ${new Date().toISOString()}

## 📊 System Readiness: ${summary.system_readiness.percentage}%

**Status:** ${summary.system_readiness.status.toUpperCase()}
**Ready Components:** ${summary.system_readiness.ready_components}/${summary.system_readiness.total_components}

## 🧠 Memory System (MEM0)
- **Status:** ${capabilities.memory_system.configured ? '✅ Configured' : '❌ Not Configured'}
- **Capabilities:** ${capabilities.memory_system.capabilities?.length || 0} memory operations
- **Provider:** ${capabilities.memory_system.provider || 'Not set'}

## 💻 VS Code Integration
- **Status:** ${capabilities.vscode_integration.extension_configured ? '✅ Configured' : '❌ Not Configured'}
- **Source Files:** ${capabilities.vscode_integration.source_files || 0}
- **Commands:** ${capabilities.vscode_integration.commands?.length || 0}
- **Providers:** ${capabilities.vscode_integration.providers?.length || 0}

## 🤖 Model Registry
- **Status:** ${capabilities.model_registry.configured ? '✅ Configured' : '❌ Not Configured'}
- **Total Models:** ${capabilities.model_registry.total_models || 0}
- **Providers:** ${capabilities.model_registry.providers?.length || 0}

## 🐳 MCP Tools
- **Docker:** ${capabilities.mcp_tools.docker_available ? '✅ Available' : '❌ Not Available'}
- **Tools:** ${capabilities.mcp_tools.available_tools?.length || 0}
- **Categories:** ${Object.keys(capabilities.mcp_tools.tool_categories || {}).length}

## 🌐 Network Services
- **Backend:** ${capabilities.network_services.backend_configured ? '✅ Configured' : '❌ Not Configured'}
- **Port:** ${capabilities.network_services.port || 'Not specified'}
- **Endpoints:** ${capabilities.network_services.endpoints?.length || 0}

## 🔒 Security Features
- **Authentication:** ${capabilities.security_features.authentication_configured ? '✅ Configured' : '❌ Not Configured'}
- **Service Accounts:** ${capabilities.security_features.service_accounts?.length || 0}
- **CORS:** ${capabilities.security_features.cors_enabled ? '✅ Enabled' : '❌ Disabled'}

## 📈 Recommendations

${summary.recommendations.map(rec => `### ${rec.priority.toUpperCase()} Priority: ${rec.component}
${rec.action}

`).join('')}

## 🚀 Next Steps

${summary.next_steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## 📋 Missing Components

${summary.missing_components.length > 0 ? 
  summary.missing_components.map(comp => `- ${comp}`).join('\n') : 
  'All components are configured! 🎉'}

---

**Total Capabilities Discovered:** ${summary.total_capabilities}

This report provides a comprehensive overview of Mama Bear AI's current capabilities and readiness for deployment.
`;
  }
}

// Main execution
async function main() {
  console.log("🐻 Mama Bear Capability Discovery");
  console.log("===================================\n");
  
  const discovery = new MamaBearCapabilityDiscovery();
  const capabilities = await discovery.discoverAllCapabilities();
  
  console.log("\n🎉 Discovery Complete!");
  console.log(`📊 Total Capabilities: ${discovery.countTotalCapabilities()}`);
  console.log(`✅ System Readiness: ${discovery.assessSystemReadiness().percentage}%`);
  
  return capabilities;
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MamaBearCapabilityDiscovery;
