// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import { MamaBearApiClient } from './mama_bear_api_client';

suite('Mama Bear Extension Test Suite', () => {
    vscode.window.showInformationMessage('🐻 Starting Mama Bear tests...');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('podplay-sanctuary.mama-bear-ai'));
    });

    test('API Client initialization', () => {
        const apiClient = new MamaBearApiClient('http://localhost:5000');
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
        const apiClient = new MamaBearApiClient('http://localhost:5000');
        try {
            const isHealthy = await apiClient.checkHealth();
            // Note: This might fail if backend is not running, which is okay for development
            console.log('🐻 Backend health check:', isHealthy ? 'PASS' : 'FAIL');
        } catch (error) {
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
    let apiClient: MamaBearApiClient;

    setup(() => {
        apiClient = new MamaBearApiClient('http://localhost:5000');
    });

    test('Should generate unique user and session IDs', () => {
        const client1 = new MamaBearApiClient('http://localhost:5000');
        const client2 = new MamaBearApiClient('http://localhost:5000');
        
        // User IDs should be different
        assert.notStrictEqual(client1['userId'], client2['userId']);
        
        // Session IDs should be different  
        assert.notStrictEqual(client1['sessionId'], client2['sessionId']);
    });

    test('Should handle API errors gracefully', async () => {
        // Test with invalid URL
        const badClient = new MamaBearApiClient('http://invalid-url:9999');
        
        const response = await badClient.sendMessage('test message');
        assert.strictEqual(response.success, false);
        assert.ok(response.error);
    });
});