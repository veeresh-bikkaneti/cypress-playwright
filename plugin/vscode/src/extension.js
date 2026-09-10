const vscode = require("vscode");
const { execFileSync } = require("child_process");
const path = require("path");

const ENTERPRISE_TOOLS = [
  "copilot",
  "claude",
  "cursor",
  "grok",
  "codex",
  "gemini",
];

function activate(context) {
  const setupCmd = vscode.commands.registerCommand(
    "cypress2playwright.setup",
    async () => {
      const tools = await vscode.window.showQuickPick(ENTERPRISE_TOOLS, {
        canPickMany: true,
        placeHolder:
          "Vendor adapters (empty = portable core only). Grok/Codex need no extra files.",
      });

      if (!tools) {
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const target = workspaceFolder.uri.fsPath;
      const pluginPath = path.join(context.extensionPath, "..");
      const setupJs = path.join(pluginPath, "bin", "setup.js");
      const args = ["setup", "--target", target];
      if (tools.length) args.push("--tools", tools.join(","));

      try {
        const output = execFileSync(process.execPath, [setupJs, ...args], {
          encoding: "utf-8",
          cwd: pluginPath,
        });
        vscode.window.showInformationMessage(
          tools.length
            ? `Cypress2Playwright: setup complete for ${tools.join(", ")}`
            : "Cypress2Playwright: portable core (AGENTS.md + skills) installed.",
        );
        console.log(output);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Cypress2Playwright setup failed: ${err.message}`,
        );
      }
    },
  );

  const migrateCmd = vscode.commands.registerCommand(
    "cypress2playwright.migrate",
    () => {
      vscode.window.showInformationMessage(
        "Ask your coding agent to follow skills/cypress-to-playwright-migration (Copilot: @cypress-to-playwright-migration, Claude: /migrate, Grok: natural language + AGENTS.md).",
      );
    },
  );

  const healCmd = vscode.commands.registerCommand(
    "cypress2playwright.heal",
    () => {
      vscode.window.showInformationMessage(
        "Ask your coding agent to follow skills/playwright-testing (Copilot: @playwright-healer, Claude: /heal, Grok: natural language + AGENTS.md).",
      );
    },
  );

  context.subscriptions.push(setupCmd, migrateCmd, healCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
