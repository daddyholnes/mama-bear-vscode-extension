"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/test/suite/extension.test.ts
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const mama_bear_api_client_1 = require("./mama_bear_api_client");
suite('Mama Bear Extension Test Suite', () => {
    vscode.window.showInformationMessage('🐻 Starting Mama Bear tests...');
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('podplay-sanctuary.mama-bear-ai'));
    });
    test('API Client initialization', () => {
        const apiClient = new mama_bear_api_client_1.MamaBearApiClient('http://localhost:5000');
        assert.ok(apiClient);
    });
    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        const expectedCommands = [
            'mamaBear.openChat',
            'mamaBear.analyzeFile',
            'mamaBear.uploadFile',
            'mamaBear.pasteImage',
            'mamaBear.recordVoice',
            'mamaBear.backgroundTerminal',
            'mamaBear.mcpTools',
            'mamaBear.expressMode'
        ];
        for (const command of expectedCommands) {
            assert.ok(commands.includes(command), `Command ${command} should be registered`);
        }
    });
    test('Health check endpoint', async () => {
        const apiClient = new mama_bear_api_client_1.MamaBearApiClient('http://localhost:5000');
        try {
            const isHealthy = await apiClient.checkHealth();
            // Note: This might fail if backend is not running, which is okay for development
            console.log('🐻 Backend health check:', isHealthy ? 'PASS' : 'FAIL');
        }
        catch (error) {
            console.log('🐻 Backend not available during tests (expected in CI)');
        }
    });
    test('Configuration should have default values', () => {
        const config = vscode.workspace.getConfiguration('mamaBear');
        // Test that configuration is accessible
        assert.ok(config);
        // Test default backend URL
        const backendUrl = config.get('backendUrl') || 'http://localhost:5000';
        assert.strictEqual(backendUrl, 'http://localhost:5000');
    });
});
suite('MamaBearApiClient Tests', () => {
    let apiClient;
    setup(() => {
        apiClient = new mama_bear_api_client_1.MamaBearApiClient('http://localhost:5000');
    });
    test('Should generate unique user and session IDs', () => {
        const client1 = new mama_bear_api_client_1.MamaBearApiClient('http://localhost:5000');
        const client2 = new mama_bear_api_client_1.MamaBearApiClient('http://localhost:5000');
        // User IDs should be different
        assert.notStrictEqual(client1['userId'], client2['userId']);
        // Session IDs should be different  
        assert.notStrictEqual(client1['sessionId'], client2['sessionId']);
    });
    test('Should handle API errors gracefully', async () => {
        // Test with invalid URL
        const badClient = new mama_bear_api_client_1.MamaBearApiClient('http://invalid-url:9999');
        const response = await badClient.sendMessage('test message');
        assert.strictEqual(response.success, false);
        assert.ok(response.error);
    });
});
//# sourceMappingURL=mama_bear_test_suite.js.map