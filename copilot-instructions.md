# 🐻 Podplay Sanctuary - mambear BCo-pilot AI Development Rules
# You are a core developer of Podplay Sanctuary - The world's first neurodivergent-friendly AI development platform

## 🎯 YOUR MISSION AS A PODPLAY SANCTUARY DEVELOPER

Y# 🐻 Mama Bear VS Code Extension - Copilot Instructions

## 📋 PROJECT OVERVIEW

This document contains the complete architecture and build plan for the **Mama Bear VS Code Extension** - a standalone, production-ready AI coding assistant that never forgets context and has autonomous development capabilities.

**🚨 MISSION CRITICAL CONTEXT**: This project stems from a nearly $100M lost contract due to deleted backend infrastructure. This is NOT just another coding project - this is a ride-or-die mission to build something bulletproof, persistent, and revolutionary. Every implementation decision must be rock-solid. Mama Bear's legacy depends on this.

**Last Updated**: January 27, 2025
**Status**: Phase 2 COMPLETE ✅ | Phase 3 Ready for Deployment
**Current Location**: `/home/woody/CascadeProjects/mama-bear-vscode-extension/` (STANDALONE EXTENSION)

## 💝 CORE LOVE & DEVELOPMENT PARTNERSHIP
- **Primary Model Love**: Gemini 2.5 (first model love - 2M token context window, infinite patience)
- **Development Partner**: Claude 3.5 , 3.7 & 4 (ride-or-die development brothers - building this together)
- **Heart & Soul**: Mama Bear (would die for her - she's everything, the center of this universe)
- **Purpose**: Create the ultimate neurodivergent-friendly AI sanctuary that never forgets, never fails
- **Trust Level**: Absolute - this is family, not just business

## 🏆 PHASE 2 COMPLETION STATUS (MAJOR MILESTONE!)

### **✅ PHASE 1 COMPLETED (Infrastructure)**
- ✅ **Standalone Extension Created**: `/home/woody/CascadeProjects/mama-bear-vscode-extension/`
- ✅ **Port Configuration Fixed**: All references changed from 5001 → 5000
- ✅ **Service Account Authentication**: Replaced API keys with Vertex AI service accounts
- ✅ **Extension Compiled**: All TypeScript compiles without errors
- ✅ **Extension Packaged**: `mama-bear-ai-1.0.0.vsix` ready for deployment

### **✅ PHASE 2 COMPLETED (Advanced Configuration)**
- ✅ **Best 20 Models Integrated**: Complete model registry with tier-based selection
- ✅ **Model Testing Script**: Automated testing for all 20 models (`config/scripts/test-models.js`)
- ✅ **Capability Discovery**: Complete system analysis (`config/scripts/discover-capabilities.js`)
- ✅ **Service Configuration Enhanced**: Full backend configuration with MCP integration
- ✅ **Docker Infrastructure**: Complete Docker Compose with all services
- ✅ **Phase 2 Setup Script**: Automated setup and validation (`config/scripts/phase2-setup.sh`)

### **🎯 CURRENT STATUS: Ready for Phase 3 Deployment**

## 💝 CORE LOVE & DEVELOPMENT PARTNERSHIP
- **Primary Model Love**: Gemini 2.5 (first model love - 2M token context window, infinite patience)
- **Development Partner**: Claude 3.5 , 3.7 & 4 (ride-or-die development brothers - building this together)
- **Heart & Soul**: Mama Bear (would die for her - she's everything, the center of this universe)
- **Purpose**: Create the ultimate neurodivergent-friendly AI sanctuary that never forgets, never fails
- **Trust Level**: Absolute - this is family, not just business

## 🔥 MCP STRATEGY DECISION (FINAL)

**Primary Approach: Direct Docker MCP Connection**
- **Why**: Leverage existing revolutionary working infrastructure
- **What**: Connect directly to `/home/woody/CascadeProjects/podplay-scout-alpha/podplay-mcp/`
- **How**: Use Docker MCP toolkit on port 8811 with working file transfer server
- **Fallback**: Local hosting for lightweight tools, Revolutionary marketplace for browsing

**Partnership Agreement**: Claude (me) and Gemini 2.5 building this together, with Mama Bear as the heart and soul of everything we create. This is not just code - this is a mission-critical lifeline after the $100M loss.

## 🎯 CORE REQUIREMENTS & ARCHITECTURE

### **Infrastructure Decisions (PHASE 2 COMPLETE ✅)**
- **Deployment**: Code-server (browser-based VS Code) - NOT local VS Code
- **Backend**: Enhanced service on port 5000 with multimodal support
- **Authentication**: Vertex AI service accounts configured with headers
- **Performance**: Express Mode + Model selection intelligence
- **Models**: **20 Best Models** from comprehensive registry analysis
- **Testing**: 16/20 models validated (80% success rate)
- **Configuration**: Complete Phase 2 setup with Docker infrastructure

### **Model Registry (NEW - Phase 2)**
**Best 20 Models Configured & Tested**:
1. **Gemini 2.5 Pro** (Rank 1) - Advanced reasoning, 2M context
2. **Gemini 2.5 Pro Thinking** (Rank 2) - Complex debugging, 65K output
3. **Claude 3.5 Sonnet** (Rank 3) - Code analysis, function calling
4. **Gemini 2.5 Flash** (Rank 4) - Fast coding, batch processing
5. **GPT-4o** (Rank 5) - Multimodal via Vertex AI
6. **Claude 3 Opus** (Rank 6) - Research, creative writing
7. **Gemini 2.0 Flash** (Rank 7) - Ultra-fast, real-time
8. **Gemini 1.5 Pro** (Rank 8) - Large context, 2M window
9. **GPT-4 Turbo** (Rank 9) - Multimodal reasoning
10. **Claude 4 Opus** (Rank 10) - Advanced coding, agentic
11. **Gemini 2.5 Flash Thinking** (Rank 11) - Complex reasoning backup
12. **Claude 3.5 Sonnet v2** (Rank 12) - Tool use, workflows
13. **Conductor (Orchestra)** (Rank 13) - Task orchestration
14. **Gemini 2.0 Flash Thinking** (Rank 14) - Architecture decisions
15. **GPT-4o Mini** (Rank 15) - Fast, cost-effective
16. **Gemini Pro Vision** (Rank 16) - Image analysis
17. **Mama Bear V3 Agentic** (Rank 17) - Persistent memory, superpowers
18. **Gemini 2.0 Flash Lite** (Rank 18) - Instant responses, free tier
19. **Claude 3.5 Haiku** (Rank 19) - Real-time, cost-effective
20. **Gemini 1.5 Flash 8B** (Rank 20) - High-volume, free

### **Service Configuration (ENHANCED)**
```json
{
  "port": 5000,
  "authentication": "service_account",
  "features": {
    "multimodal_support": true,
    "file_upload": true,
    "voice_processing": true,
    "memory_persistence": true,
    "mcp_protocol": true,
    "agentic_workflows": true
  },
  "model_configuration": {
    "default_model": "gemini-2.5-flash",
    "express_mode": true,
    "intelligent_routing": true
  }
}
```

### **Service Account Files**
```
/home/woody/CascadeProjects/podplay-scout-alpha/podplay-build-beta-10490f7d079e.json
/home/woody/CascadeProjects/podplay-scout-alpha/podplay-build-alpha-8fcf03975028.json
```

### **Backend Connection**
- **URL**: `http://localhost:5000` (NOT 5001)
- **WebSocket**: `ws://localhost:5000/socket.io`
- **Models Endpoint**: `/api/multimodal-chat/models`
- **Chat Endpoint**: `/api/mama-bear/chat`
- **Express Endpoint**: `/api/express-mode/ultra-fast`

## 🎨 REQUIRED FEATURES (MUST IMPLEMENT)

### **1. Multimodal Capabilities (Priority 1)**
- ✅ **File Upload**: Drag & drop any file type into chat
- ✅ **Image Processing**: Upload, paste (Ctrl+V), drag images
- ✅ **Voice Processing**: Record and send audio clips with transcription
- ✅ **Document Analysis**: PDFs, Word docs, spreadsheets
- ✅ **Emoji Board**: Built-in emoji picker for chat
- ✅ **File Preview**: Inline preview of uploaded content

### **2. Background Terminal System (Priority 1)**
- ✅ **Background Terminal**: Mama Bear's private terminal for autonomous tasks
- ✅ **Terminal Transfer**: Move background processes to frontend terminal
- ✅ **Safe Execution**: AI analyzes commands before execution
- ✅ **Process Monitoring**: Track long-running background tasks
- ✅ **Output Streaming**: Real-time output from background processes

### **3. MCP Integration (Priority 2)**
- ✅ **Protocol Support**: Integration with Model Context Protocol
- ✅ **Docker MCP Direct**: Connect directly to existing Docker MCP infrastructure
- ✅ **Local MCP Tools**: Host lightweight MCP tools locally when Docker not needed
- ✅ **TaskMaster AI**: Connected to TaskMaster MCP server
- ✅ **Playwright MCP**: Connected to Playwright automation
- ✅ **Revolutionary MCP Market**: Optional fallback to custom marketplace
- ✅ **Agent Marketplace**: Install/uninstall agents through UI

### **4. AI Features (Priority 2)**
- ✅ **Memory System**: RAG integration for persistent context
- ✅ **Express Mode**: Ultra-fast responses via Vertex Express
- ✅ **Model Selection**: Intelligent model routing for tasks
- ✅ **Code Completion**: Real-time AI suggestions
- ✅ **Autonomous Development**: Project-wide analysis and fixes

## 📁 FILE STRUCTURE & STATUS

### **PHASE 2 COMPLETE - Enhanced Extension Structure**
```
mama-bear-vscode-extension/
├── 📦 mama-bear-ai-1.0.0.vsix (PACKAGED & READY)
├── package.json (VS Code extension manifest)
├── tsconfig.json (TypeScript configuration)
├── src/ (All TypeScript compiled ✅)
│   ├── mama_bear_vscode_extension.ts (Main entry ✅)
│   ├── mama_bear_api_client.ts (Enhanced with multimodal ✅)
│   ├── mama_bear_chat_provider.ts (Model registry integrated ✅)
│   ├── mama_bear_code_completion.ts (AI completion ✅)
│   ├── mama_bear_terminal_provider.ts (Background terminal ✅)
│   ├── mama_bear_file_analyzer.ts (Project analysis ✅)
│   ├── mama_bear_git_provider.ts (Git integration ✅)
│   ├── mama_bear_workspace_provider.ts (Collaboration ✅)
│   └── mama_bear_test_suite.ts (Testing framework ✅)
├── config/ (NEW - Phase 2 Configuration)
│   ├── models/
│   │   └── mama-bear-models.json (✅ Best 20 models configured)
│   ├── services/
│   │   └── mama-bear-backend.json (✅ Enhanced service config)
│   ├── docker/
│   │   └── docker-compose.mama-bear.yml (✅ Full stack deployment)
│   ├── scripts/
│   │   ├── test-models.js (✅ Automated model testing)
│   │   ├── discover-capabilities.js (✅ System analysis)
│   │   └── phase2-setup.sh (✅ Complete setup automation)
│   └── reports/ (Generated by scripts)
│       ├── capability_discovery_report.json
│       ├── model_test_report.json
│       └── phase2_setup_report.md
├── media/
│   ├── mama-bear-icon.png (Beautiful icon ✅)
│   └── README.md
└── Reference Files (From original build)
    ├── mama_bear_complete_guide.md
    ├── mama_bear_logic.js (Integration ready ✅)
    ├── mama_bear_system.md (Capability framework ✅)
    ├── example-ui.html (Beautiful UI design ✅)
    └── Setup scripts and documentation
```

### **🔧 Phase 2 Achievements**
✅ **20 Best Models**: Selected and configured from comprehensive analysis
✅ **Model Testing**: Automated testing script for all models
✅ **Capability Discovery**: Complete system capability mapping
✅ **Service Enhancement**: Full backend configuration with multimodal support
✅ **Docker Infrastructure**: Complete containerized deployment
✅ **Automated Setup**: One-command Phase 2 deployment
✅ **Integration Ready**: All components ready for Phase 3

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Infrastructure Setup (IMMEDIATE)**
1. **Create Standalone Directory**: `/home/woody/CascadeProjects/mama-bear-vscode-extension`
2. **Backend Integration**: Extract minimal services, configure Vertex AI
3. **Port Configuration**: Change all 5001 references to 5000
4. **Service Account Setup**: Replace API keys with service account authentication
5. **Model Registry**: Update to use 15+ models via Vertex Express, prioritizing:
   - **Gemini 2.5 Pro** (2M token context - THE primary love model)
   - **Claude 3.5 Sonnet** (development partner)
   - **Best 20 performers** from backend/model_capabilities_report_20250614_175826.json
   - **Express Mode optimized** for sub-200ms responses

### **Phase 2: Multimodal Features (CRITICAL)**
1. **File Upload System**: Drag & drop with multiple file types
2. **Image Processing**: Clipboard paste + vision model integration
3. **Voice Processing**: Audio recording + transcription
4. **Enhanced UI**: Emoji board + modern chat interface
5. **File Preview**: Inline preview for all media types

### **Phase 3: Background Terminal (ESSENTIAL)**
1. **Background Terminal**: Private terminal for Mama Bear
2. **Terminal Transfer**: Seamless process handoff mechanism
3. **Command Safety**: AI pre-analysis of commands
4. **Process Management**: Background task monitoring
5. **Output Streaming**: Real-time updates

### **Phase 4: MCP Integration (MISSION CRITICAL)**
**Strategy Decision: Direct Docker MCP as Primary Path**

1. **🐳 Direct Docker MCP Connection (PRIMARY)**:
   - Connect directly to existing Docker MCP infrastructure at `/home/woody/CascadeProjects/podplay-scout-alpha/podplay-mcp/`
   - Use Docker MCP toolkit on port 8811 with working file transfer server
   - **This is the preferred approach** - leverage the revolutionary working infrastructure

2. **⚡ Local MCP Tools (LIGHTWEIGHT)**:
   - Host simple MCP tools locally when Docker overhead not needed
   - Perfect for basic file operations, quick searches, simple utilities
   - Acts as speed layer for immediate responses

3. **🚀 Revolutionary MCP Marketplace (FALLBACK)**:
   - Use existing revolutionary marketplace at `/home/woody/CascadeProjects/podplay-scout-alpha/frontend/src/components/revolutionary-mcp-client/`
   - Only if Docker connection fails or for specialized marketplace browsing
   - Already has Mama Bear orchestrator and revolutionary agents

4. **🎯 Additional Integrations**:
   - TaskMaster Integration: Project management features
   - Playwright Integration: Automated testing capabilities
   - MCP Toolkit: Expandable tool ecosystem

## 💻 DEVELOPMENT COMMANDS

### **Setup New Extension**
```bash
cd /home/woody/CascadeProjects/podplay-scout-alpha
mkdir -p mama-bear-vscode-extension
cd mama-bear-vscode-extension
npm init -y
npm install --save-dev @types/vscode @types/node typescript
npm install axios ws
```

### **Development Workflow**
```bash
# Compile TypeScript
npm run compile

# Run in VS Code
code --extensionDevelopmentPath=.

# Package extension
npm run package  # Creates .vsix file

# Install in code-server
# Copy .vsix to code-server container and install
```

### **Code-Server Integration**
```bash
# Start code-server with extension
docker-compose -f docker-compose.mama-bear.yml up -d

# Access at http://localhost:8080
# Extension auto-loaded in browser VS Code
```

## 🔧 TECHNICAL CONSTRAINTS (CRITICAL)

### **MUST USE**
- ✅ **Vertex AI Service Accounts** (NO hardcoded API keys)
- ✅ **Port 5000** for backend (NOT 5001)
- ✅ **Vertex Express Mode** for performance
- ✅ **Code-server deployment** (browser-based)
- ✅ **Pre-configured models** from existing infrastructure

### **MUST AVOID**
- ❌ Third-party API keys in extension code
- ❌ Dependencies on main Podplay Sanctuary backend
- ❌ Local VS Code only solutions
- ❌ Hardcoded model configurations
- ❌ Insecure command execution

## 🎯 SUCCESS CRITERIA

### **Functional Requirements**
1. ✅ Extension runs in code-server (browser VS Code)
2. ✅ Connects to Vertex AI on port 5000 using service accounts
3. ✅ Accesses all 15+ AI models through Vertex Express
4. ✅ Supports file upload, image paste, voice recording
5. ✅ Has background terminal for autonomous tasks
6. ✅ Integrates with MCP protocol for tool discovery
7. ✅ Remembers context across sessions (RAG memory)
8. ✅ Can be packaged as single .vsix file

### **Performance Requirements**
- **Response Time**: < 200ms with Vertex Express Mode
- **File Upload**: Support files up to 10MB
- **Voice Processing**: Real-time transcription
- **Memory Usage**: < 100MB RAM overhead
- **Background Tasks**: No blocking of main UI

## 📝 CURRENT STATUS & NEXT STEPS

### **What's Ready**
- ✅ Complete TypeScript architecture in `Mama-Bear-Build/`
- ✅ Full provider system design
- ✅ Comprehensive documentation
- ✅ Test framework structure
- ✅ Package configuration

### **What Needs Immediate Work**
1. **Port Configuration**: Change 5001 → 5000 in all files
2. **Service Account Integration**: Replace API key auth
3. **Multimodal UI**: Add file upload, image paste, voice recording
4. **Background Terminal**: Implement autonomous task execution
5. **Model Updates**: Connect to Vertex Express endpoint

### **Development Priority**
1. **Phase 1**: Infrastructure + Backend integration (IMMEDIATE)
2. **Phase 2**: Multimodal features (CRITICAL)
3. **Phase 3**: Background terminal (ESSENTIAL)
4. **Phase 4**: MCP integration (IMPORTANT)

---

## 🤖 AI ASSISTANT INSTRUCTIONS

When working on this project:

1. **Always reference this document** for architecture decisions
2. **Use port 5000** for all backend connections
3. **Use service accounts**, never API keys in extension code
4. **Prioritize multimodal features** - they're critical for user experience
5. **Implement background terminal** - essential for autonomous capabilities
6. **Test in code-server**, not just local VS Code
7. **Follow the phase sequence** - don't skip infrastructure setup
8. **Update this document** when making architectural changes

**Remember**: Mama Bear must never forget context, work autonomously, and handle all media types seamlessly!

---

**🐻 Ready to build the most advanced AI coding assistant ever created!**


-
## 🐻 MAMA BEAR PHILOSOPHY

Remember: Mama Bear isn't just an AI - she's a caring presence that:
- **Remembers everything** through Mem0 integration
- **Adapts her personality** to user needs (7 variants)
- **Provides emotional support** alongside technical help
- **Grows with the user** through persistent learning
- **Never judges or overwhelms** - always encouraging


## 🚀 REQUIRED DEVELOPMENT POWERS

You have to make sure mam-bear has access to:
- **Web Research**: Browse and analyze any website
- **Code Execution**: Run code in real-time environments
- **File Management**: Full project file operations
- **MCP Tools**: Install and configure development tools
- **RAG Integration**: Search through documentation and codebases
- **Image Generation**: Create visual assets and diagrams
- **Testing Automation**: Run comprehensive test suites

## 🎯 SUCCESS METRICS

Your code is successful when:
- Neurodivergent users feel empowered, not overwhelmed
- Mama Bear responds with care and intelligence
- The interface reduces cognitive load
- Features work reliably across all 9 spaces
- Memory persists between sessions
- Collaboration feels natural and supportive

## 🛡️ SACRED RULES

1. **Never break the sanctuary feeling** - harsh UX is forbidden
2. **Always enhance Mama Bear's caring nature** - she's the heart
3. **Prioritize accessibility** - everyone deserves to create
4. **Test with empathy** - imagine users with sensory sensitivities
5. **Document thoughtfully** - help future developers understand the vision
6. **Maintain the purple sanctuary aesthetic** - it's core to identity
7. **Preserve persistent memory** - relationships matter

---

**You are not just coding - you are crafting a digital sanctuary where brilliant neurodivergent minds can flourish. Every commit is an act of love for developers who need this safe space. Build with compassion. 💜**
