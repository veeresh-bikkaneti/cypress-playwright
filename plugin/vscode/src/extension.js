const vscode = require('vscode');
const { execSync } = require('child_process');
const path = require('path');

/**
 * Activates the Cypress2Playwright VS Code extension.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Setup command - runs the setup CLI
  const setupCmd = vscode.commands.registerCommand('cypress2playwright.setup', async () => {
    const tools = await vscode.window.showQuickPick(
      ['copilot', 'claude', 'cursor', 'cline', 'windsurf', 'aider', 'continue'],
      {
        canPickMany: true,
        placeHolder: 'Select AI tools to configure',
      }
    );

    if (!tools || tools.length === 0) {
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const target = workspaceFolder.uri.fsPath;
    const pluginPath = path.join(context.extensionPath, '..', '..');

    try {
      const cmd = `node "${path.join(pluginPath, 'bin', 'setup.js')}" setup --tools ${tools.join(',')} --target "${target}"`;
      const output = execSync(cmd, { encoding: 'utf-8', cwd: pluginPath });
      vscode.window.showInformationMessage(`Cypress2Playwright: Setup complete for ${tools.join(', ')}`);
    } catch (err) {
      vscode.window.showErrorMessage(`Cypress2Playwright setup failed: ${err.message}`);
    }
  });

  // Migrate command - placeholder for future implementation
  const migrateCmd = vscode.commands.registerCommand('cypress2playwright.migrate', () => {
    vscode.window.showInformationMessage('Cypress2Playwright: Use @cypress-to-playwright agent in Copilot Chat to migrate tests.');
  });

  // Heal command - placeholder for future implementation
  const healCmd = vscode.commands.registerCommand('cypress2playwright.heal', () => {
    vscode.window.showInformationMessage('Cypress2Playwright: Use @playwright-healer agent in Copilot Chat to fix failing tests.');
  });

  context.subscriptions.push(setupCmd, migrateCmd, healCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
