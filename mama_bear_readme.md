# 🐻 Mama Bear AI Assistant - VS Code Extension

**Your personal AI coding companion with access to 15+ AI models, persistent RAG memory, and devastating agentic capabilities - all without losing context!**

## ✨ Why Mama Bear?

Fed up with GitHub Copilot and other assistants losing context and making mistakes? Mama Bear never forgets because she uses her own RAG system and has access to all your favorite AI models:

- **🧠 Never Loses Context** - Uses persistent RAG memory system
- **🤖 15+ AI Models** - Claude, Gemini, OpenAI, and more
- **⚡ Express Mode** - 6x faster responses
- **🤝 Agentic Control** - Can take autonomous action
- **🔍 Web Search & MCP** - Real-time information access
- **📊 Collaborative Workspaces** - Real-time team coding

## 🚀 Features

### Core AI Capabilities
- **Multi-Model Access**: Claude 3.5, Gemini 2.5, GPT-4o, and 12+ more models
- **Intelligent Model Selection**: Automatically chooses the best model for each task
- **Express Mode**: Ultra-fast responses using Vertex AI acceleration
- **Persistent Memory**: RAG system that never forgets your project context
- **Agentic Takeover**: Let Mama Bear autonomously fix your entire project

### Code Intelligence
- **Smart Code Completion**: Context-aware suggestions using your preferred AI model
- **Code Analysis**: Comprehensive file and project analysis
- **Bug Detection & Fixing**: Automatic bug detection and intelligent fixes
- **Code Optimization**: Performance and quality improvements
- **Test Generation**: Automatic test suite creation

### Collaboration Features
- **Real-time Collaboration**: Share coding sessions with team members
- **Screen Sharing**: Show your code to collaborators instantly
- **Agentic Assistance**: AI can participate as a team member
- **Workspace Sync**: Keep everyone on the same page

### Development Tools
- **Git Integration**: Smart commit messages, PR descriptions, repo analysis
- **Terminal Integration**: Safe command execution with AI analysis
- **Project Understanding**: Deep analysis of your entire codebase
- **Web Research**: Real-time information gathering
- **MCP Agent Hub**: Access to revolutionary AI agents

## 📦 Installation

### Prerequisites

1. **VS Code** 1.60.0 or higher
2. **Node.js** 16+ (for development)
3. **Your Mama Bear Backend** running on `http://localhost:5001`

### Quick Install

1. **Download or clone this extension:**
   ```bash
   git clone https://github.com/your-repo/mama-bear-vscode
   cd mama-bear-vscode
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the extension:**
   ```bash
   npm run compile
   ```

4. **Launch VS Code with the extension:**
   ```bash
   code --extensionDevelopmentPath=.
   ```

### Package for Distribution

```bash
npm run package
# This creates mama-bear-ai-1.0.0.vsix
# Install with: code --install-extension mama-bear-ai-1.0.0.vsix
```

## ⚙️ Configuration

### Backend Connection

Make sure your Mama Bear backend is running and configure the connection:

```json
{
  "mamaBear.backendUrl": "http://localhost:5001",
  "mamaBear.defaultModel": "gemini-2.0-flash-exp",
  "mamaBear.expressMode": true,
  "mamaBear.agenticControl": 0.8,
  "mamaBear.codeCompletion": true,
  "mamaBear.contextMemory": true
}
```

### API Keys

Ensure your backend has these environment variables:
```bash
# In your backend .env file
GEMINI_API_KEY_PRIMARY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
MEM0_API_KEY=your_mem0_key
VERTEX_AI_PROJECT_ID=your_project_id
```

## 🎯 Quick Start

### 1. Open Mama Bear Chat
- **Keyboard**: `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)
- **Command Palette**: `Mama Bear: Open Chat`
- **Sidebar**: Click the 🐻 Mama Bear panel

### 2. Express Mode (Ultra Fast)
- **Keyboard**: `Ctrl+Shift+E`
- **Chat**: Click "⚡ Express" button
- **Command**: `Mama Bear: Express Mode`

### 3. Code Analysis
- **Current File**: `Ctrl+Shift+F1` or right-click → "🐻 Analyze Current File"
- **Selected Code**: Select code → `Ctrl+Shift+X` → "🐻 Explain Selected Code"
- **Entire Project**: Command Palette → "Mama Bear: Analyze Entire Project"

### 4. Agentic Takeover
- **Keyboard**: `Ctrl+Shift+A`
- **Chat**: Click "🤖 Agentic" button
- **Example**: "Fix all TypeScript errors in my project"

## 🛠️ Usage Examples

### Smart Code Completion
```typescript
// Just start typing, Mama Bear will suggest contextually
function calculateTax(income: number) {
  // Mama Bear suggests: return income * 0.25;
}
```

### Code Explanation
Select any code and press `Ctrl+Shift+X`:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```
**Mama Bear explains:** "This is a recursive implementation of the Fibonacci sequence..."

### Git Integration
```bash
# Mama Bear generates smart commit messages
git add .
# Right-click in Source Control → "🐻 Generate Commit Message"
# Result: "feat: add user authentication with JWT tokens"
```

### Agentic Takeover Examples
- "Optimize all my React components for performance"
- "Add comprehensive error handling to my API"
- "Convert this JavaScript project to TypeScript"
- "Add unit tests for all my utility functions"
- "Fix all ESLint warnings in the project"

## 🎮 Commands & Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Open Chat | `Ctrl+Shift+M` | Open Mama Bear chat panel |
| Express Mode | `Ctrl+Shift+E` | Ultra-fast AI assistance |
| Explain Code | `Ctrl+Shift+X` | Explain selected code |
| Fix Code | `Ctrl+Shift+F` | Fix selected code issues |
| Agentic Takeover | `Ctrl+Shift+A` | Autonomous AI control |
| Web Search | `Ctrl+Shift+S` | Research with AI |
| Analyze File | `F1` | Analyze current file |
| Generate Tests | `Alt+T` | Create test suite |

## 🤖 Available AI Models

Mama Bear gives you access to the most powerful AI models:

### Text Models
- **Claude 3.5 Sonnet** - Best for complex reasoning and analysis
- **Claude 3 Opus** - Maximum intelligence for hard problems
- **Gemini 2.5 Pro** - Advanced reasoning and long context
- **Gemini 2.0 Flash** - Ultra-fast responses
- **GPT-4o** - Balanced performance for general tasks
- **GPT-4o Mini** - Fast and efficient

### Multimodal Models
- **Gemini 2.0 Live API** - Real-time interaction with images/audio
- **Claude 3.5 Vision** - Image analysis and understanding
- **GPT-4 Vision** - Visual intelligence

### Specialized Models
- **Gemini Code** - Optimized for programming tasks
- **Claude Computer Use** - Can interact with interfaces
- **Research Models** - For deep analysis and investigation

## 🧠 Memory & Context

Mama Bear never loses context thanks to:

### Persistent Memory
- **Project Context**: Remembers your entire codebase structure
- **Conversation History**: Maintains context across sessions
- **User Preferences**: Learns your coding style and preferences
- **Error Patterns**: Remembers and avoids previous mistakes

### RAG System
- **Code Embeddings**: Understands your code semantically
- **Documentation Index**: Indexes your project docs and comments
- **Git History**: Analyzes your development patterns
- **Cross-Project Learning**: Applies knowledge across projects

## 🤝 Collaborative Features

### Real-time Collaboration
1. **Start Session**: Click "🤝 Start Collaborative Session"
2. **Choose Mode**: Pair programming, code review, debugging, etc.
3. **Invite Others**: Share session link with team members
4. **Collaborate**: See cursors, edits, and AI assistance in real-time

### Agentic Collaboration
- **AI Team Member**: Mama Bear can act as a collaborator
- **Autonomous Fixes**: AI can fix issues while you focus on features
- **Smart Suggestions**: Real-time improvement suggestions
- **Code Reviews**: AI provides comprehensive code reviews

## 🔧 Advanced Configuration

### Custom Model Selection
```json
{
  "mamaBear.modelPreferences": {
    "codeCompletion": "claude-3.5-sonnet",
    "codeReview": "gemini-2.5-pro-exp",
    "debugging": "gpt-4o",
    "research": "claude-3-opus"
  }
}
```

### Agentic Control Levels
```json
{
  "mamaBear.agenticControl": {
    "level": 0.8,
    "allowFileModifications": true,
    "allowTerminalCommands": false,
    "allowNetworkRequests": true,
    "requireConfirmation": ["delete", "deploy", "publish"]
  }
}
```

### Memory Settings
```json
{
  "mamaBear.memory": {
    "persistentContext": true,
    "maxContextLength": 50000,
    "embeddingModel": "text-embedding-3-large",
    "memoryRetentionDays": 90
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Extension not connecting to backend:**
1. Check that your backend is running on `http://localhost:5001`
2. Verify the `mamaBear.backendUrl` setting
3. Check the backend logs for errors

**Code completion not working:**
1. Ensure `mamaBear.codeCompletion` is enabled
2. Check that you have valid API keys in your backend
3. Try restarting VS Code

**Agentic features not responding:**
1. Verify `mamaBear.agenticControl` is > 0.5
2. Check that Express Mode is enabled
3. Ensure your backend has the agentic API endpoints

**Memory/context issues:**
1. Check that Mem0 is properly configured
2. Verify `mamaBear.contextMemory` is enabled
3. Check the backend memory service status

### Debug Mode
Enable debug logging:
```json
{
  "mamaBear.debugMode": true
}
```

Check the "Mama Bear Commands" output channel for detailed logs.

### Reset Extension
If you encounter persistent issues:
1. **Command Palette** → "Developer: Reload Window"
2. **Settings** → Reset all Mama Bear settings to default
3. **Backend** → Restart your Mama Bear backend service

## 🆘 Support

### Getting Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-repo/mama-bear-vscode/issues)
- **Discord**: Join our developer community
- **Documentation**: [Complete API docs](https://docs.mama-bear.ai)

### Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Backend Repository
This extension requires the Mama Bear backend. Get it from:
[Mama Bear Backend Repository](https://github.com/your-repo/mama-bear-backend)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude API
- **Google** for Gemini and Vertex AI
- **OpenAI** for GPT models
- **Mem0** for memory infrastructure
- **VS Code** team for the excellent extension API

---

**Made with 💖 by the Podplay Sanctuary team**

*Mama Bear: Your AI coding companion who never forgets and never gives up!* 🐻✨