# Mama Bear Code-Server Dockerfile
FROM codercom/code-server:latest

USER root

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install VS Code extensions
RUN code-server --install-extension ms-vscode.vscode-typescript-next \
    && code-server --install-extension ms-vscode.vscode-json

USER coder

# Set working directory
WORKDIR /home/coder/workspace

# Expose code-server port
EXPOSE 8080

# Start code-server
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/home/coder/workspace"]
