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
exports.MamaBearGitProvider = void 0;
// src/providers/MamaBearGitProvider.ts
const vscode = __importStar(require("vscode"));
class MamaBearGitProvider {
    constructor(apiClient) {
        this._apiClient = apiClient;
    }
    async analyzeRepository() {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (!gitExtension) {
                vscode.window.showErrorMessage('Git extension not found');
                return;
            }
            const git = gitExtension.exports.getAPI(1);
            const repo = git.repositories[0];
            if (!repo) {
                vscode.window.showErrorMessage('No Git repository found in workspace');
                return;
            }
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🐻 Mama Bear analyzing repository...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: "Gathering repository info..." });
                // Get repository information
                const repoInfo = {
                    branch: repo.state.HEAD?.name || 'unknown',
                    workingTreeChanges: repo.state.workingTreeChanges.length,
                    indexChanges: repo.state.indexChanges.length, remotes: repo.state.remotes.map((remote) => ({
                        name: remote.name,
                        url: remote.fetchUrl
                    })),
                    lastCommit: await this.getLastCommit(repo),
                    commitCount: await this.getCommitCount(repo),
                    contributors: await this.getContributors(repo)
                };
                progress.report({ increment: 30, message: "Analyzing commit history..." });
                // Get recent commits
                const recentCommits = await this.getRecentCommits(repo, 10);
                progress.report({ increment: 60, message: "Analyzing code changes..." });
                // Get file changes summary
                const changesSummary = await this.analyzeChanges(repo);
                progress.report({ increment: 90, message: "Generating insights..." });
                // Get analysis from Mama Bear
                const analysisResponse = await this._apiClient.analyzeRepository();
                const analysisData = {
                    repoInfo,
                    recentCommits,
                    changesSummary,
                    mamaBearAnalysis: analysisResponse.success ? analysisResponse.response : 'Analysis failed'
                };
                progress.report({ increment: 100, message: "Complete!" });
                // Show results
                await this.showRepositoryAnalysis(analysisData);
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Repository analysis failed: ${error.message}`);
        }
    }
    async generateCommitMessage() {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (!gitExtension) {
                vscode.window.showErrorMessage('Git extension not found');
                return;
            }
            const git = gitExtension.exports.getAPI(1);
            const repo = git.repositories[0];
            if (!repo) {
                vscode.window.showErrorMessage('No Git repository found');
                return;
            }
            // Get staged changes
            const stagedChanges = repo.state.indexChanges;
            const workingTreeChanges = repo.state.workingTreeChanges;
            if (stagedChanges.length === 0 && workingTreeChanges.length === 0) {
                vscode.window.showInformationMessage('No changes to commit');
                return;
            }
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🐻 Generating commit message...",
                cancellable: false
            }, async () => {
                // Prepare changes summary for Mama Bear
                const changesSummary = this.summarizeChanges(stagedChanges, workingTreeChanges);
                const prompt = `🤖 GENERATE COMMIT MESSAGE

Changes Summary:
${changesSummary}

Please generate a concise, descriptive commit message following conventional commits format:
- Use present tense ("Add feature" not "Added feature")
- Start with a type: feat, fix, docs, style, refactor, test, chore
- Keep the first line under 50 characters
- Include a body if needed for complex changes

Examples:
- feat: add user authentication system
- fix: resolve memory leak in data processing
- docs: update API documentation

Return ONLY the commit message.`;
                const response = await this._apiClient.expressMode(prompt);
                if (response.success && response.response) {
                    const commitMessage = this.extractCommitMessage(response.response);
                    // Show the commit message to user for approval
                    const action = await vscode.window.showInformationMessage(`🐻 Suggested commit message:\n"${commitMessage}"`, 'Use This Message', 'Edit Message', 'Cancel');
                    switch (action) {
                        case 'Use This Message':
                            repo.inputBox.value = commitMessage;
                            break;
                        case 'Edit Message':
                            const editedMessage = await vscode.window.showInputBox({
                                value: commitMessage,
                                prompt: 'Edit the commit message',
                                validateInput: (value) => {
                                    if (!value.trim()) {
                                        return 'Commit message cannot be empty';
                                    }
                                    return null;
                                }
                            });
                            if (editedMessage) {
                                repo.inputBox.value = editedMessage;
                            }
                            break;
                    }
                }
                else {
                    vscode.window.showErrorMessage('Failed to generate commit message');
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Commit message generation failed: ${error.message}`);
        }
    }
    async createPullRequest() {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (!gitExtension) {
                vscode.window.showErrorMessage('Git extension not found');
                return;
            }
            const git = gitExtension.exports.getAPI(1);
            const repo = git.repositories[0];
            if (!repo) {
                vscode.window.showErrorMessage('No Git repository found');
                return;
            }
            const currentBranch = repo.state.HEAD?.name;
            if (!currentBranch || currentBranch === 'main' || currentBranch === 'master') {
                vscode.window.showWarningMessage('Create a feature branch first for pull requests');
                return;
            }
            // Get recent commits on this branch
            const recentCommits = await this.getRecentCommits(repo, 5);
            const changes = await this.analyzeChanges(repo);
            const prompt = `🔀 GENERATE PULL REQUEST DESCRIPTION

Branch: ${currentBranch}
Recent Commits:
${recentCommits.map(c => `- ${c.message}`).join('\n')}

Changes Summary:
${changes.summary}

Generate a comprehensive pull request description including:
1. **Title**: Clear, descriptive title
2. **Description**: What this PR does
3. **Changes Made**: List of key changes
4. **Testing**: How to test these changes
5. **Notes**: Any additional context

Format in markdown for GitHub/GitLab.`;
            const response = await this._apiClient.expressMode(prompt);
            if (response.success && response.response) {
                // Show PR description in a new document
                const doc = await vscode.workspace.openTextDocument({
                    content: response.response,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, {
                    viewColumn: vscode.ViewColumn.Active
                });
                vscode.window.showInformationMessage('📝 Pull request description generated! Copy to your Git hosting service.', 'Open GitHub', 'Open GitLab').then(selection => {
                    if (selection) {
                        this.openGitHostingService(repo, selection);
                    }
                });
            }
            else {
                vscode.window.showErrorMessage('Failed to generate pull request description');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Pull request creation failed: ${error.message}`);
        }
    }
    async suggestBranchName(description) {
        try {
            const prompt = `🌿 SUGGEST BRANCH NAME

Feature Description: ${description}

Suggest a good Git branch name following conventions:
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Include type prefix (feature/, fix/, hotfix/, etc.)
- Max 50 characters

Examples:
- feature/user-authentication
- fix/memory-leak-processing
- hotfix/critical-security-patch

Return ONLY the branch name.`;
            const response = await this._apiClient.expressMode(prompt);
            if (response.success && response.response) {
                return this.extractBranchName(response.response);
            }
            return undefined;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Branch name suggestion failed: ${error.message}`);
            return undefined;
        }
    }
    async getLastCommit(repo) {
        try {
            const commits = await repo.log({ maxEntries: 1 });
            return commits.length > 0 ? commits[0].message : 'No commits';
        }
        catch {
            return 'Unable to get last commit';
        }
    }
    async getCommitCount(repo) {
        try {
            const commits = await repo.log({ maxEntries: 1000 });
            return commits.length;
        }
        catch {
            return 0;
        }
    }
    async getContributors(repo) {
        try {
            const commits = await repo.log({ maxEntries: 100 });
            const contributors = new Set();
            commits.forEach((commit) => {
                if (commit.authorEmail) {
                    contributors.add(commit.authorEmail);
                }
            });
            return Array.from(contributors);
        }
        catch {
            return [];
        }
    }
    async getRecentCommits(repo, count) {
        try {
            const commits = await repo.log({ maxEntries: count });
            return commits.map((commit) => ({
                hash: commit.hash?.substring(0, 8) || 'unknown',
                message: commit.message || 'No message',
                author: commit.authorName || 'Unknown',
                date: commit.authorDate ? new Date(commit.authorDate).toLocaleDateString() : 'Unknown'
            }));
        }
        catch {
            return [];
        }
    }
    async analyzeChanges(repo) {
        const stagedChanges = repo.state.indexChanges;
        const workingTreeChanges = repo.state.workingTreeChanges;
        const changeTypes = {
            added: 0,
            modified: 0,
            deleted: 0,
            renamed: 0
        };
        const processChanges = (changes) => {
            changes.forEach(change => {
                switch (change.status) {
                    case 1: // Added
                        changeTypes.added++;
                        break;
                    case 2: // Modified
                        changeTypes.modified++;
                        break;
                    case 3: // Deleted
                        changeTypes.deleted++;
                        break;
                    case 4: // Renamed
                        changeTypes.renamed++;
                        break;
                }
            });
        };
        processChanges(stagedChanges);
        processChanges(workingTreeChanges);
        return {
            staged: stagedChanges.length,
            unstaged: workingTreeChanges.length,
            changeTypes,
            summary: this.createChangesSummary(changeTypes, stagedChanges, workingTreeChanges)
        };
    }
    summarizeChanges(stagedChanges, workingTreeChanges) {
        const allChanges = [...stagedChanges, ...workingTreeChanges];
        if (allChanges.length === 0) {
            return 'No changes detected';
        }
        const summary = allChanges.map(change => {
            const status = this.getChangeStatusText(change.status);
            const fileName = change.uri.path.split('/').pop();
            return `${status}: ${fileName}`;
        }).join('\n');
        return summary;
    }
    createChangesSummary(changeTypes, stagedChanges, workingTreeChanges) {
        const parts = [];
        if (changeTypes.added > 0)
            parts.push(`${changeTypes.added} added`);
        if (changeTypes.modified > 0)
            parts.push(`${changeTypes.modified} modified`);
        if (changeTypes.deleted > 0)
            parts.push(`${changeTypes.deleted} deleted`);
        if (changeTypes.renamed > 0)
            parts.push(`${changeTypes.renamed} renamed`);
        const stagingInfo = stagedChanges.length > 0 ?
            `(${stagedChanges.length} staged, ${workingTreeChanges.length} unstaged)` :
            `(${workingTreeChanges.length} unstaged)`;
        return parts.length > 0 ? `${parts.join(', ')} ${stagingInfo}` : 'No changes';
    }
    getChangeStatusText(status) {
        switch (status) {
            case 1: return 'Added';
            case 2: return 'Modified';
            case 3: return 'Deleted';
            case 4: return 'Renamed';
            case 5: return 'Copied';
            case 6: return 'Untracked';
            default: return 'Changed';
        }
    }
    extractCommitMessage(response) {
        // Remove any markdown formatting
        let message = response.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
        // Take the first non-empty line that looks like a commit message
        const lines = message.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('*') && !trimmed.includes('commit message')) {
                return trimmed;
            }
        }
        return message.split('\n')[0] || 'Update files';
    }
    extractBranchName(response) {
        let branchName = response.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
        // Take the first line that looks like a branch name
        const lines = branchName.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && trimmed.includes('/') && !trimmed.includes(' ') && !trimmed.includes('branch')) {
                return trimmed;
            }
        }
        // Fallback: clean up the response
        branchName = branchName.split('\n')[0].trim();
        branchName = branchName.replace(/[^a-zA-Z0-9\-\/]/g, '');
        return branchName || 'feature/new-feature';
    }
    async showRepositoryAnalysis(data) {
        const content = this.formatRepositoryReport(data);
        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Active
        });
    }
    formatRepositoryReport(data) {
        const { repoInfo, recentCommits, changesSummary, mamaBearAnalysis } = data;
        return `# 🐻 Mama Bear Repository Analysis

## Repository Overview

- **Current Branch:** ${repoInfo.branch}
- **Pending Changes:** ${changesSummary.summary}
- **Total Commits:** ${repoInfo.commitCount}
- **Contributors:** ${repoInfo.contributors.length}

## Recent Commits

${recentCommits.map((commit) => `- \`${commit.hash}\` ${commit.message} (${commit.author} - ${commit.date})`).join('\n')}

## Remote Repositories

${repoInfo.remotes.map((remote) => `- **${remote.name}:** ${remote.url}`).join('\n')}

## Mama Bear Analysis

${mamaBearAnalysis}

## Repository Health

- ✅ ${changesSummary.staged > 0 ? 'Has staged changes ready for commit' : 'No staged changes'}
- ${changesSummary.unstaged > 0 ? '⚠️ Has unstaged changes' : '✅ Working tree clean'}
- ${repoInfo.remotes.length > 0 ? '✅ Connected to remote repository' : '⚠️ No remote repository configured'}

## Quick Actions

- \`Ctrl+Shift+G\` - Open Source Control
- Generate commit message: Use Mama Bear's commit message generator
- Create pull request: Use Mama Bear's PR description generator

---

*Generated by Mama Bear AI Assistant on ${new Date().toLocaleString()}*`;
    }
    openGitHostingService(repo, service) {
        const remotes = repo.state.remotes;
        if (remotes.length === 0) {
            vscode.window.showWarningMessage('No remote repository configured');
            return;
        }
        const remote = remotes[0];
        let url = remote.fetchUrl || remote.pushUrl;
        if (url) {
            // Convert SSH to HTTPS if needed
            if (url.startsWith('git@')) {
                url = url.replace('git@github.com:', 'https://github.com/')
                    .replace('git@gitlab.com:', 'https://gitlab.com/')
                    .replace('.git', '');
            }
            if (service === 'Open GitHub' && url.includes('github.com')) {
                vscode.env.openExternal(vscode.Uri.parse(`${url}/compare`));
            }
            else if (service === 'Open GitLab' && url.includes('gitlab.com')) {
                vscode.env.openExternal(vscode.Uri.parse(`${url}/-/merge_requests/new`));
            }
            else {
                vscode.env.openExternal(vscode.Uri.parse(url));
            }
        }
    }
}
exports.MamaBearGitProvider = MamaBearGitProvider;
//# sourceMappingURL=mama_bear_git_provider.js.map