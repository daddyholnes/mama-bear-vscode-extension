# 🐻 Mama Bear VS Code Extension - Complete Setup Guide

**Your AI coding companion with 15+ models, persistent memory, and agentic superpowers!**

## 📁 Project Structure

```
mama-bear-vscode/
├── 📄 package.json                    # Extension manifest and dependencies
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 README.md                       # Complete documentation
├── 📄 Makefile                        # Build automation
├── 
├── 📁 src/                            # Source code
│   ├── 📄 extension.ts                # Main extension entry point
│   ├── 
│   ├── 📁 api/                        # Backend communication
│   │   └── 📄 MamaBearApiClient.ts    # API client for all 15+ models
│   ├── 
│   ├── 📁 providers/                  # VS Code providers
│   │   ├── 📄 MamaBearChatProvider.ts           # Main chat interface
│   │   ├── 📄 MamaBearCodeCompletionProvider.ts # AI copilot functionality
│   │   ├── 📄 MamaBearFileAnalyzer.ts           # Project understanding
│   │   ├── 📄 MamaBearTerminalProvider.ts       # Safe command execution
│   │   ├── 📄 MamaBearGitProvider.ts            # Git integration
│   │   └── 📄 MamaBearWorkspaceProvider.ts      # Collaborative sessions
│   └── 
│   └── 📁 test/                       # Test suite
│       ├── 📄 runTest.ts              # Test runner
│       └── 📁 suite/                  # Test files
│           ├── 📄 extension.test.ts   # Main extension tests
│           ├── 📄 apiClient.test.ts   # API client tests
│           └── 📄 index.ts            # Test configuration
├── 
├── 📁 scripts/                        # Setup and build scripts
│   ├── 📄 setup.sh                    # Initial setup
│   ├── 📄 dev.sh                      # Development environment
│   ├── 📄 build.sh                    # Production build
│   ├── 📄 test.sh                     # Testing script
│   ├── 📄 install.sh                  # Install extension
│   └── 📄 uninstall.sh               # Remove extension
├── 
├── 📁 snippets/                       # Code snippets
│   ├── 📄 typescript.json             # TypeScript snippets
│   ├── 📄 javascript.json             # JavaScript snippets
│   └── 📄 python.json                 # Python snippets
├── 
├── 📁 .vscode/                        # Development configuration
│   ├── 📄 launch.json                 # Debug configuration
│   ├── 📄 tasks.json                  # Build tasks
│   └── 📄 settings.json               # Extension settings
├── 
└── 📁 out/                            # Compiled JavaScript (generated)
    └── 📄 *.js                        # Compiled TypeScript files
```

## 🚀 Quick Installation

### Option 1: Clone and Build (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/mama-bear-vscode
cd mama-bear-vscode

# 2. Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Launch development environment
make dev
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript
npm run compile

# 3. Open in VS Code
code .

# 4. Press F5 to launch extension in new window
```

## ⚙️ Backend Requirements

Your Mama Bear VS Code extension connects to your backend server. Make sure it's running with all the APIs we've built:

### Required Backend Endpoints

```
http://localhost:5001/api/health                          # Health check
http://localhost:5001/api/mama-bear/chat                  # Main chat API
http://localhost:5001/api/multimodal-chat/models          # Available models
http://localhost:5001/api/chat/stream                     # Streaming chat
http://localhost:5001/api/express-mode/ultra-fast         # Express Mode
http://localhost:5001/api/agentic/process                 # Agentic features
http://localhost:5001/api/memory/save                     # Memory system
http://localhost:5001/api/scout/search                    # Web search
http://localhost:5001/api/workspaces/create               # Collaborative sessions
```

### Required Environment Variables in Backend

```bash
# In your backend .env file
GEMINI_API_KEY_PRIMARY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
MEM0_API_KEY=your_mem0_key
VERTEX_AI_PROJECT_ID=your_project_id
PRIMARY_SERVICE_ACCOUNT_PATH=/path/to/service-account.json
```

## 🎯 Extension Configuration

Create or update your VS Code settings:

```json
{
  "mamaBear.backendUrl": "http://localhost:5001",
  "mamaBear.defaultModel": "gemini-2.0-flash-exp",
  "mamaBear.expressMode": true,
  "mamaBear.agenticControl": 0.8,
  "mamaBear.codeCompletion": true,
  "mamaBear.autoAnalyze": false,
  "mamaBear.contextMemory": true,
  "mamaBear.webSearch": true,
  "mamaBear.mcpIntegration": true,
  "mamaBear.collaborativeMode": true,
  "mamaBear.debugMode": false,
  "mamaBear.completionDebounce": 300,
  "mamaBear.maxContextLength": 8000
}
```

## 🧪 Testing Your Installation

### 1. Basic Functionality Test

```bash
# Run the test suite
npm test

# Or use the script
./scripts/test.sh
```

### 2. Manual Testing Checklist

Once the extension is loaded in VS Code:

- [ ] **Chat Panel**: Press `Ctrl+Shift+M` - Chat panel opens
- [ ] **Backend Connection**: Chat shows "🐻 Mama Bear is ready!"
- [ ] **Express Mode**: Press `Ctrl+Shift+E` - Ultra-fast response
- [ ] **Code Completion**: Start typing code - AI suggestions appear
- [ ] **Code Explanation**: Select code, press `Ctrl+Shift+X`
- [ ] **File Analysis**: Right-click file → "🐻 Analyze Current File"
- [ ] **Agentic Takeover**: Press `Ctrl+Shift+A` - AI takes control
- [ ] **Git Integration**: Right-click in Source Control → Mama Bear options
- [ ] **Terminal Integration**: Command Palette → "Mama Bear: Execute Command"
- [ ] **Web Search**: Press `Ctrl+Shift+S` - AI research functionality

### 3. Advanced Feature Testing

- [ ] **Model Selection**: Chat → Model dropdown shows 15+ models
- [ ] **Memory Persistence**: Close/reopen VS Code - context remembered
- [ ] **Collaborative Mode**: Start collaborative session
- [ ] **Project Analysis**: Analyze entire project
- [ ] **MCP Integration**: Browse available MCP agents

## 💡 Usage Examples

### 1. Smart Code Completion

```typescript
// Start typing, Mama Bear suggests contextually appropriate code
function processUserData(users: User[]) {
  return users.
  // 🐻 Suggests: filter(user => user.isActive).map(user => user.name);
}
```

### 2. Code Explanation

Select this code and press `Ctrl+Shift+X`:

```python
@lru_cache(maxsize=128)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

**Mama Bear explains**: "This function calculates Fibonacci numbers using dynamic programming with memoization via `@lru_cache` decorator..."

### 3. Agentic Takeover Examples

Press `Ctrl+Shift+A` and try these prompts:

- "Add comprehensive error handling to all my functions"
- "Convert this project from JavaScript to TypeScript"
- "Optimize all my React components for performance"
- "Add unit tests for my utility functions"
- "Fix all ESLint warnings in the project"
- "Add proper TypeScript interfaces for all my API responses"

### 4. Git Integration

```bash
# In Source Control panel
1. Make changes to files
2. Right-click → "🐻 Generate Commit Message"
3. Result: "feat: add user authentication with JWT tokens"

# Or for Pull Requests
1. Create feature branch
2. Command Palette → "Mama Bear: Create Pull Request"
3. Gets comprehensive PR description
```

### 5. Collaborative Sessions

```bash
1. Command Palette → "Mama Bear: Start Collaborative Session"
2. Choose mode: "Pair Programming"
3. Share session link with teammates
4. Code together with real-time AI assistance
```

## 🛠️ Development Workflow

### For Extension Development

```bash
# Start development environment
make dev

# In VS Code:
# 1. Press F5 to launch extension in new window
# 2. Make changes to TypeScript files
# 3. Reload extension window (Ctrl+R) to test changes
# 4. Use Console (F12) to debug
```

### Building for Production

```bash
# Build and package
make build

# Install the built extension
make install

# Or manually
npm run package
code --install-extension mama-bear-ai-1.0.0.vsix
```

### Common Development Commands

```bash
# Quick setup
make setup

# Development with file watching
make dev

# Run tests
make test

# Build for production
make build

# Clean build artifacts
make clean

# Package extension
make package

# Install built extension
make install
```

## 🔧 Troubleshooting

### Extension Won't Load

1. **Check VS Code version**: Requires 1.60.0+
2. **Check Node.js version**: Requires 16+
3. **Rebuild extension**:
   ```bash
   npm run clean
   npm install
   npm run compile
   ```

### Backend Connection Issues

1. **Check backend is running**:
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check extension settings**:
   ```json
   {
     "mamaBear.backendUrl": "http://localhost:5001"
   }
   ```

3. **Check backend logs** for API errors

### Code Completion Not Working

1. **Check setting is enabled**:
   ```json
   {
     "mamaBear.codeCompletion": true
   }
   ```

2. **Check API keys** in backend environment
3. **Restart VS Code**

### Memory/Context Issues

1. **Check Mem0 configuration** in backend
2. **Enable context memory**:
   ```json
   {
     "mamaBear.contextMemory": true
   }
   ```

3. **Clear and rebuild context**:
   - Command Palette → "Mama Bear: Save Current Context"

### Performance Issues

1. **Reduce debounce delay**:
   ```json
   {
     "mamaBear.completionDebounce": 150
   }
   ```

2. **Lower context length**:
   ```json
   {
     "mamaBear.maxContextLength": 4000
   }
   ```

3. **Disable auto-analysis**:
   ```json
   {
     "mamaBear.autoAnalyze": false
   }
   ```

## 🎉 What Makes This Special

### vs GitHub Copilot
- ✅ **Never loses context** (persistent RAG memory)
- ✅ **15+ AI models** (not just one)
- ✅ **Full project understanding** (analyzes entire codebase)
- ✅ **Agentic control** (can autonomously fix your project)
- ✅ **Express Mode** (6x faster responses)
- ✅ **Web search integration** (real-time research)
- ✅ **Collaborative features** (team coding sessions)

### vs Other AI Assistants
- ✅ **Your own models** (use your API keys)
- ✅ **Complete control** (runs on your infrastructure)
- ✅ **No vendor lock-in** (works with any backend)
- ✅ **Extensible** (add new models and features)
- ✅ **Privacy-focused** (your code stays with you)

## 📚 Additional Resources

### Extension Commands Reference

| Command | Shortcut | Description |
|---------|----------|-------------|
| `mamaBear.openChat` | `Ctrl+Shift+M` | Open main chat |
| `mamaBear.expressMode` | `Ctrl+Shift+E` | Ultra-fast mode |
| `mamaBear.explainCode` | `Ctrl+Shift+X` | Explain selection |
| `mamaBear.fixCode` | `Ctrl+Shift+F` | Fix selected code |
| `mamaBear.takeover` | `Ctrl+Shift+A` | Agentic takeover |
| `mamaBear.webSearch` | `Ctrl+Shift+S` | AI web search |
| `mamaBear.analyzeFile` | `F1` | Analyze current file |
| `mamaBear.generateTests` | `Alt+T` | Create test suite |

### API Endpoints Used

The extension communicates with these backend endpoints:

- **Chat API**: Real-time AI conversations
- **Express Mode**: 6x faster responses
- **Agentic API**: Autonomous AI control
- **Memory API**: Persistent context storage
- **Search API**: Web research capabilities
- **Workspace API**: Collaborative sessions
- **MCP API**: Agent marketplace access

### File Types Supported

Mama Bear provides intelligent assistance for:

- **Languages**: TypeScript, JavaScript, Python, Java, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala
- **Web**: HTML, CSS, SCSS, React, Vue, Angular
- **Data**: JSON, YAML, XML, CSV
- **Docs**: Markdown, reStructuredText
- **Config**: Package.json, tsconfig.json, .env files
- **Scripts**: Bash, PowerShell, Dockerfile

## 🆘 Getting Help

### Community Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-repo/mama-bear-vscode/issues)
- **Discord Server**: Join our developer community
- **Documentation**: [Complete guides and API docs](https://docs.mama-bear.ai)

### Professional Support
- **Enterprise Setup**: Custom deployment assistance
- **Training Sessions**: Team onboarding and best practices
- **Custom Features**: Tailored development for your organization

---

**🐻 Ready to revolutionize your coding experience?**

**Start with**: `make setup && make dev`

**Then open VS Code and press** `Ctrl+Shift+M` **to meet Mama Bear!**

*She never forgets, never gives up, and has access to the most powerful AI models available.* ✨