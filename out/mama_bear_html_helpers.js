"use strict";
// Revolutionary HTML rendering for Mama Bear VS Code Extension
// Part of the Emergency Battle Plan - Superior UI over competition
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgenticResultHTML = createAgenticResultHTML;
exports.createErrorHTML = createErrorHTML;
exports.createStatusHTML = createStatusHTML;
/**
 * Creates beautiful HTML for agentic RAG results
 * Revolutionary design that makes competition look basic
 */
function createAgenticResultHTML(result, userRequest) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mama Bear - Agentic Intelligence</title>
        <style>
            :root {
                --mama-primary: #ff6b35;
                --mama-secondary: #004d7a;
                --mama-accent: #ffa500;
                --mama-success: #00d4aa;
                --mama-bg: #1a1a1a;
                --mama-card: #2d2d30;
                --mama-text: #cccccc;
                --mama-border: #464647;
            }
            
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, var(--mama-bg) 0%, #252526 100%);
                color: var(--mama-text);
                line-height: 1.6;
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(45deg, var(--mama-primary), var(--mama-accent));
                border-radius: 15px;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(255,255,255,0.1) 2px,
                    rgba(255,255,255,0.1) 4px
                );
                animation: slide 20s linear infinite;
            }
            
            @keyframes slide {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            .header h1 {
                font-size: 2.5em;
                font-weight: 700;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                position: relative;
                z-index: 2;
                margin-bottom: 10px;
            }
            
            .header .subtitle {
                font-size: 1.2em;
                color: rgba(255,255,255,0.9);
                position: relative;
                z-index: 2;
            }
            
            .card {
                background: var(--mama-card);
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
                border: 1px solid var(--mama-border);
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 48px rgba(255,107,53,0.2);
            }
            
            .card-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid var(--mama-primary);
            }
            
            .card-icon {
                width: 24px;
                height: 24px;
                margin-right: 12px;
                background: var(--mama-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            
            .card-title {
                font-size: 1.4em;
                font-weight: 600;
                color: var(--mama-primary);
            }
            
            .request-section {
                background: linear-gradient(135deg, var(--mama-secondary), #003d5b);
                color: white;
                border: none;
            }
            
            .result-content {
                background: #2d2d30;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
                border-left: 4px solid var(--mama-success);
                font-family: 'Consolas', 'Monaco', monospace;
                white-space: pre-wrap;
                overflow-x: auto;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .metric-item {
                background: rgba(255,107,53,0.1);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid rgba(255,107,53,0.3);
            }
            
            .metric-value {
                font-size: 1.8em;
                font-weight: bold;
                color: var(--mama-accent);
                display: block;
            }
            
            .metric-label {
                font-size: 0.9em;
                color: var(--mama-text);
                opacity: 0.8;
            }
            
            .sources-list {
                list-style: none;
                margin-top: 15px;
            }
            
            .sources-list li {
                background: rgba(0,212,170,0.1);
                margin: 8px 0;
                padding: 10px 15px;
                border-radius: 6px;
                border-left: 3px solid var(--mama-success);
                font-family: monospace;
            }
            
            .confidence-bar {
                width: 100%;
                height: 8px;
                background: var(--mama-border);
                border-radius: 4px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--mama-primary), var(--mama-accent));
                border-radius: 4px;
                transition: width 0.8s ease;
                width: ${result.confidence}%;
            }
            
            .reasoning-section {
                background: rgba(255,171,0,0.1);
                border: 1px solid rgba(255,171,0,0.3);
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
            }
            
            .badge {
                display: inline-block;
                background: var(--mama-primary);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8em;
                font-weight: 600;
                margin: 2px;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                border-top: 1px solid var(--mama-border);
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐻 Mama Bear AI</h1>
                <div class="subtitle">Revolutionary Agentic Intelligence</div>
            </div>
            
            <div class="card request-section">
                <div class="card-header">
                    <div class="card-icon">❓</div>
                    <div class="card-title">Your Request</div>
                </div>
                <div class="result-content">${escapeHtml(userRequest)}</div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🧠</div>
                    <div class="card-title">Agentic Response</div>
                    <div style="margin-left: auto;">
                        <span class="badge">${result.model}</span>
                    </div>
                </div>
                
                <div class="result-content">${escapeHtml(result.content)}</div>
                
                <div style="margin-top: 20px;">
                    <strong>Confidence Level:</strong>
                    <div class="confidence-bar">
                        <div class="confidence-fill"></div>
                    </div>
                    <span style="color: var(--mama-accent); font-weight: bold;">${result.confidence}%</span>
                </div>
                
                ${result.sources.length > 0 ? `
                <div style="margin-top: 20px;">
                    <strong>📚 Knowledge Sources:</strong>
                    <ul class="sources-list">
                        ${result.sources.map(source => `<li>${escapeHtml(source)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="reasoning-section">
                    <strong>🔍 AI Reasoning Process:</strong>
                    <div style="margin-top: 10px; font-style: italic;">
                        ${escapeHtml(result.reasoning)}
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">⚡</div>
                    <div class="card-title">Performance Metrics</div>
                </div>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-value">${result.performance.responseTime}ms</span>
                        <span class="metric-label">Response Time</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">${result.performance.tokensUsed}</span>
                        <span class="metric-label">Tokens Used</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">${result.performance.cacheHits}</span>
                        <span class="metric-label">Cache Hits</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Powered by Revolutionary Agentic RAG • Mama Bear VS Code Extension</p>
                <p style="font-size: 0.8em; margin-top: 5px;">
                    🚀 Outperforming competition with 6x faster responses and autonomous intelligence
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}
/**
 * Creates elegant error display HTML
 */
function createErrorHTML(errorMessage) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mama Bear - Error</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #1a1a1a 0%, #252526 100%);
                color: #cccccc;
                padding: 40px;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .error-container {
                max-width: 600px;
                text-align: center;
                background: #2d2d30;
                padding: 40px;
                border-radius: 15px;
                border: 2px solid #e74c3c;
                box-shadow: 0 8px 32px rgba(231,76,60,0.3);
            }
            
            .error-icon {
                font-size: 4em;
                margin-bottom: 20px;
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .error-title {
                font-size: 2em;
                color: #e74c3c;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .error-message {
                background: rgba(231,76,60,0.1);
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #e74c3c;
                font-family: 'Consolas', monospace;
                text-align: left;
                margin: 20px 0;
                word-break: break-word;
            }
            
            .error-actions {
                margin-top: 30px;
            }
            
            .retry-hint {
                color: #ffa500;
                font-style: italic;
                margin-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <div class="error-icon">🚨</div>
            <div class="error-title">Oops! Something went wrong</div>
            <div class="error-message">${escapeHtml(errorMessage)}</div>
            <div class="error-actions">
                <p>The Mama Bear AI encountered an issue, but don't worry!</p>
                <div class="retry-hint">
                    💡 Try rephrasing your request or check your connection
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}
/**
 * Creates comprehensive status dashboard HTML
 */
function createStatusHTML(models, performance, metrics) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mama Bear - System Status</title>
        <style>
            :root {
                --mama-primary: #ff6b35;
                --mama-secondary: #004d7a;
                --mama-accent: #ffa500;
                --mama-success: #00d4aa;
                --mama-bg: #1a1a1a;
                --mama-card: #2d2d30;
                --mama-text: #cccccc;
                --mama-border: #464647;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, var(--mama-bg) 0%, #252526 100%);
                color: var(--mama-text);
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }
            
            .dashboard {
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px;
                background: linear-gradient(45deg, var(--mama-primary), var(--mama-accent));
                border-radius: 15px;
                color: white;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .status-card {
                background: var(--mama-card);
                border-radius: 12px;
                padding: 25px;
                border: 1px solid var(--mama-border);
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            
            .card-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid var(--mama-primary);
            }
            
            .card-icon {
                width: 24px;
                height: 24px;
                margin-right: 12px;
                background: var(--mama-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            
            .card-title {
                font-size: 1.3em;
                font-weight: 600;
                color: var(--mama-primary);
            }
            
            .metric-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .metric-item {
                text-align: center;
                padding: 15px;
                background: rgba(255,107,53,0.1);
                border-radius: 8px;
                border: 1px solid rgba(255,107,53,0.3);
            }
            
            .metric-value {
                display: block;
                font-size: 1.5em;
                font-weight: bold;
                color: var(--mama-accent);
                margin-bottom: 5px;
            }
            
            .metric-label {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .models-list {
                display: grid;
                gap: 15px;
            }
            
            .model-item {
                background: rgba(0,212,170,0.1);
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid var(--mama-success);
            }
            
            .model-name {
                font-weight: bold;
                color: var(--mama-success);
                margin-bottom: 8px;
            }
            
            .model-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                font-size: 0.9em;
            }
            
            .health-indicator {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--mama-success);
                margin-right: 8px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .competitive-advantage {
                background: linear-gradient(135deg, var(--mama-secondary), #003d5b);
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 12px;
                margin-top: 30px;
            }
            
            .advantage-title {
                font-size: 1.5em;
                margin-bottom: 15px;
                color: var(--mama-accent);
            }
            
            .advantage-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .advantage-item {
                padding: 15px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class="dashboard">
            <div class="header">
                <h1>🐻 Mama Bear System Status</h1>
                <p>Revolutionary Agentic Intelligence Dashboard</p>
            </div>
            
            <div class="status-grid">
                <div class="status-card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <div class="card-title">System Performance</div>
                    </div>
                    <div class="metric-grid">
                        <div class="metric-item">
                            <span class="metric-value">${performance.totalRequests}</span>
                            <span class="metric-label">Total Requests</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${performance.avgResponseTime}ms</span>
                            <span class="metric-label">Avg Response</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${performance.cacheHitRate}%</span>
                            <span class="metric-label">Cache Hit Rate</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${performance.memoryUsage}</span>
                            <span class="metric-label">Memory Usage</span>
                        </div>
                    </div>
                </div>
                
                <div class="status-card">
                    <div class="card-header">
                        <div class="card-icon">🤖</div>
                        <div class="card-title">AI Models Status</div>
                    </div>
                    <div class="models-list">
                        ${models.map(model => `
                            <div class="model-item">
                                <div class="model-name">
                                    <span class="health-indicator"></span>
                                    ${model.model}
                                </div>
                                <div class="model-stats">
                                    <div>⚡ ${model.avgResponseTime}ms</div>
                                    <div>✅ ${model.successRate}%</div>
                                    <div>🎯 ${model.specialization}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="competitive-advantage">
                <div class="advantage-title">🏆 Competitive Advantages</div>
                <p>Why Mama Bear crushes the competition</p>
                <div class="advantage-stats">
                    <div class="advantage-item">
                        <div style="font-size: 1.5em; margin-bottom: 5px;">6x</div>
                        <div>Faster Response Time</div>
                    </div>
                    <div class="advantage-item">
                        <div style="font-size: 1.5em; margin-bottom: 5px;">75%</div>
                        <div>Cost Reduction</div>
                    </div>
                    <div class="advantage-item">
                        <div style="font-size: 1.5em; margin-bottom: 5px;">7</div>
                        <div>Specialized AI Models</div>
                    </div>
                    <div class="advantage-item">
                        <div style="font-size: 1.5em; margin-bottom: 5px;">∞</div>
                        <div>Persistent Memory</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}
/**
 * Escapes HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
}
//# sourceMappingURL=mama_bear_html_helpers.js.map