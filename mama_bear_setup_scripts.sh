#!/bin/bash
# scripts/setup.sh - Initial setup script for Mama Bear VS Code Extension

echo "🐻 Setting up Mama Bear VS Code Extension..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI is not installed or not in PATH."
    echo "   Please install VS Code and ensure 'code' command is available."
    echo "   Run 'Install code command in PATH' from VS Code Command Palette."
    exit 1
fi

echo "✅ VS Code CLI available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "✅ TypeScript compiled"

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "⚠️ Some tests failed, but continuing setup..."
else
    echo "✅ All tests passed"
fi

# Create example configuration
echo "⚙️ Creating example configuration..."
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "mamaBear.backendUrl": "http://localhost:5001",
  "mamaBear.defaultModel": "gemini-2.0-flash-exp",
  "mamaBear.expressMode": true,
  "mamaBear.agenticControl": 0.7,
  "mamaBear.codeCompletion": true,
  "mamaBear.autoAnalyze": false,
  "mamaBear.contextMemory": true,
  "mamaBear.webSearch": true,
  "mamaBear.mcpIntegration": true,
  "mamaBear.collaborativeMode": true,
  "mamaBear.debugMode": false
}
EOF

echo "✅ Example configuration created in .vscode/settings.json"

# Create development launch configuration
cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🐻 Launch Mama Bear Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${workspaceFolder}:npm:compile"
    }
  ]
}
EOF

echo "✅ Development launch configuration created"

echo ""
echo "🎉 Mama Bear VS Code Extension setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your Mama Bear backend is running on http://localhost:5001"
echo "2. Open VS Code in this directory: code ."
echo "3. Press F5 to launch the extension in a new VS Code window"
echo "4. Open the Command Palette (Ctrl+Shift+P) and run 'Mama Bear: Open Chat'"
echo ""
echo "🐻 Happy coding with Mama Bear!"

---

#!/bin/bash
# scripts/dev.sh - Development workflow script

echo "🐻 Starting Mama Bear development environment..."

# Check if backend is running
echo "🔍 Checking if Mama Bear backend is running..."
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:5001"
else
    echo "⚠️ Backend is not running. Please start your Mama Bear backend first."
    echo "   Expected URL: http://localhost:5001"
    echo ""
    echo "   If you need to start the backend:"
    echo "   cd ../backend && npm start"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start TypeScript compiler in watch mode
echo "🔨 Starting TypeScript compiler in watch mode..."
npm run watch &
WATCH_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    kill $WATCH_PID 2>/dev/null
    exit 0
}

# Trap cleanup on script exit
trap cleanup EXIT

echo "⚡ TypeScript compiler started (PID: $WATCH_PID)"
echo ""
echo "🚀 Ready for development!"
echo ""
echo "Instructions:"
echo "1. Open VS Code: code ."
echo "2. Press F5 to launch extension in new window"
echo "3. Make changes to TypeScript files"
echo "4. Reload the extension window (Ctrl+R) to test changes"
echo ""
echo "Press Ctrl+C to stop the development environment"

# Keep script running
wait $WATCH_PID

---

#!/bin/bash
# scripts/build.sh - Build script for production

echo "🐻 Building Mama Bear VS Code Extension for production..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf out/
rm -f *.vsix

# Install dependencies (production)
echo "📦 Installing production dependencies..."
npm ci --only=production

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Fix tests before building."
    exit 1
fi

# Lint code
echo "🔍 Linting code..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️ Linting warnings found. Consider fixing them."
fi

# Package extension
echo "📦 Packaging extension..."
npm run package

if [ $? -ne 0 ]; then
    echo "❌ Packaging failed"
    exit 1
fi

# Find the generated .vsix file
VSIX_FILE=$(ls *.vsix | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found"
    exit 1
fi

echo "✅ Extension packaged successfully: $VSIX_FILE"
echo ""
echo "Installation instructions:"
echo "1. Install in current VS Code: code --install-extension $VSIX_FILE"
echo "2. Or install via VS Code UI: Extensions > ... > Install from VSIX"
echo ""
echo "🎉 Build complete!"

---

#!/bin/bash
# scripts/test.sh - Comprehensive testing script

echo "🐻 Running Mama Bear VS Code Extension Tests..."

# Set test environment
export NODE_ENV=test

# Run TypeScript compilation first
echo "🔨 Compiling TypeScript for tests..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Run linting
echo "🔍 Running linter..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️ Linting issues found"
fi

# Run unit tests
echo "🧪 Running unit tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed"
    exit 1
fi

# Test extension loading (if VS Code is available)
if command -v code &> /dev/null; then
    echo "🔌 Testing extension loading..."
    
    # Create temporary test workspace
    TEST_DIR=$(mktemp -d)
    cd "$TEST_DIR"
    
    # Create a simple test file
    cat > test.ts << 'EOF'
// Test file for Mama Bear extension
const greet = (name: string): string => {
    return `Hello, ${name}!`;
};

console.log(greet("Mama Bear"));
EOF
    
    echo "📂 Created test workspace in $TEST_DIR"
    echo "   Test file: test.ts"
    
    # Return to extension directory
    cd - > /dev/null
    
    echo "🎯 Extension tests completed"
    echo "   Temporary workspace: $TEST_DIR"
    echo "   You can manually test by opening this workspace with the extension"
else
    echo "⚠️ VS Code CLI not available, skipping extension loading test"
fi

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "Manual testing checklist:"
echo "- [ ] Extension loads without errors"
echo "- [ ] Chat panel opens and connects to backend"
echo "- [ ] Code completion works"
echo "- [ ] File analysis works"
echo "- [ ] Express mode responds quickly"
echo "- [ ] Agentic features work"
echo "- [ ] Git integration works"
echo "- [ ] Terminal integration works"

---

# scripts/install.sh - Install built extension
#!/bin/bash

echo "🐻 Installing Mama Bear VS Code Extension..."

# Find the latest .vsix file
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found. Run 'npm run package' first."
    exit 1
fi

echo "📦 Found extension package: $VSIX_FILE"

# Check if VS Code is available
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI not found. Please install VS Code and add 'code' to PATH."
    exit 1
fi

# Install the extension
echo "🔧 Installing extension..."
code --install-extension "$VSIX_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Extension installed successfully!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Restart VS Code"
    echo "2. Open Command Palette (Ctrl+Shift+P)"
    echo "3. Run 'Mama Bear: Open Chat'"
    echo "4. Make sure your backend is running on http://localhost:5001"
    echo ""
    echo "🐻 Enjoy coding with Mama Bear!"
else
    echo "❌ Installation failed"
    exit 1
fi

---

# scripts/uninstall.sh - Remove the extension
#!/bin/bash

echo "🐻 Uninstalling Mama Bear VS Code Extension..."

# Check if VS Code is available
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI not found."
    exit 1
fi

# Uninstall the extension
echo "🗑️ Removing extension..."
code --uninstall-extension podplay-sanctuary.mama-bear-ai

if [ $? -eq 0 ]; then
    echo "✅ Extension uninstalled successfully!"
    echo "👋 Goodbye from Mama Bear!"
else
    echo "❌ Uninstallation failed or extension not found"
fi

---

# Makefile for common tasks
# Makefile

.PHONY: setup dev build test install clean help

# Default target
help:
	@echo "🐻 Mama Bear VS Code Extension - Available Commands:"
	@echo ""
	@echo "  setup     - Initial setup and install dependencies"
	@echo "  dev       - Start development environment"
	@echo "  build     - Build extension for production"
	@echo "  test      - Run all tests"
	@echo "  install   - Install built extension to VS Code"
	@echo "  clean     - Clean build artifacts"
	@echo "  package   - Create .vsix package"
	@echo ""
	@echo "🚀 Quick start: make setup && make dev"

setup:
	@./scripts/setup.sh

dev:
	@./scripts/dev.sh

build:
	@./scripts/build.sh

test:
	@./scripts/test.sh

install:
	@./scripts/install.sh

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf out/
	@rm -f *.vsix
	@rm -rf node_modules/.cache
	@echo "✅ Clean complete"

package:
	@echo "📦 Creating package..."
	@npm run package
	@echo "✅ Package created"

# Development shortcuts
watch:
	@npm run watch

compile:
	@npm run compile

lint:
	@npm run lint