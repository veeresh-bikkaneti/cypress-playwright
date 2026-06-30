#!/usr/bin/env node

/**
 * Cypress2PlaywrightUsingAI Setup CLI
 *
 * Auto-detects installed AI coding tools and installs the appropriate
 * agent configurations for Cypress-to-Playwright migration.
 *
 * Usage:
 *   npx cypress2playwright-using-ai setup
 *   npx cypress2playwright-using-ai setup --tools copilot,claude,cursor
 *   npx cypress2playwright-using-ai setup --all
 *   npx cypress2playwright-using-ai detect
 */

const fs = require("fs");
const path = require("path");
const {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
} = require("../lib/detectors");
const {
  installAll,
  installTool,
  stripFetchInstructions,
} = require("../lib/installers");

const HELP = `
╔══════════════════════════════════════════════════════════════╗
║     Cypress2PlaywrightUsingAI - AI Testing Agents Setup     ║
╚══════════════════════════════════════════════════════════════╝

Install AI-powered Cypress→Playwright migration agents for your project.

Supported tools:
  copilot   GitHub Copilot (.github/agents/)
  claude    Claude Code (CLAUDE.md + .claude/commands/)
  cursor    Cursor (.cursor/rules/)
  cline     Cline (.clinerules/)
  windsurf  Windsurf (.windsurf/rules/)
  aider     Aider (.aider.conf.yml + CONVENTIONS.md)
  continue  Continue (.continue/rules/)

Commands:
  setup     Install agent configs (auto-detects tools)
  detect    Show which AI tools are detected in this project
  list      List all supported tools

Options:
  --tools <list>   Comma-separated list of tools to install (e.g., "copilot,claude")
  --all            Install templates for ALL supported tools
  --target <path>  Target project directory (default: cwd)
  --no-fetch       Strip version-check instructions for air-gapped environments
  --help           Show this help message

Examples:
  npx cypress2playwright-using-ai setup
  npx cypress2playwright-using-ai setup --tools copilot,cursor
  npx cypress2playwright-using-ai setup --all --target /path/to/project
  npx cypress2playwright-using-ai setup --all --no-fetch
  npx cypress2playwright-using-ai detect
`;

function parseArgs(argv) {
  const args = {
    command: null,
    tools: null,
    all: false,
    force: false,
    noFetch: false,
    target: process.cwd(),
    help: false,
  };

  const rawArgs = argv.slice(2);

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--all") {
      args.all = true;
    } else if (arg === "--force" || arg === "-f") {
      args.force = true;
    } else if (arg === "--no-fetch") {
      args.noFetch = true;
    } else if (arg === "--tools") {
      const next = rawArgs[i + 1];
      if (next && !next.startsWith("--")) {
        args.tools = next.split(",").map((t) => t.trim());
        i++;
      }
    } else if (arg === "--target" && rawArgs[i + 1]) {
      args.target = path.resolve(rawArgs[i + 1]);
      i++;
    } else if (!arg.startsWith("--")) {
      args.command = arg;
    }
  }

  return args;
}

function printDetectionResults(projectRoot) {
  const results = detectTools(projectRoot);

  console.log("\n🔍 Detected AI tools in project:\n");
  console.log("  Tool            Status");
  console.log("  ─────────────── ──────────");

  for (const [toolId, info] of Object.entries(results)) {
    const status = info.detected ? "✅ Detected" : "❌ Not found";
    const name = info.name.padEnd(15);
    console.log(`  ${name} ${status}`);
  }

  const detected = getDetectedToolIds(projectRoot);
  console.log(
    `\n  Found ${detected.length} tool(s): ${detected.length > 0 ? detected.join(", ") : "none"}\n`,
  );

  return detected;
}

function printToolList() {
  const allTools = getAllToolIds();
  console.log("\n📋 All supported AI coding tools:\n");
  for (const toolId of allTools) {
    console.log(`  • ${toolId}`);
  }
  console.log(`\n  Total: ${allTools.length} tool(s)\n`);
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.command) {
    console.log(HELP);
    process.exit(0);
  }

  // Validate target directory exists
  if (!fs.existsSync(args.target)) {
    console.error(`❌ Target directory does not exist: ${args.target}`);
    process.exit(1);
  }

  switch (args.command) {
    case "detect": {
      printDetectionResults(args.target);
      break;
    }

    case "list": {
      printToolList();
      break;
    }

    case "setup": {
      console.log("\n🚀 Cypress2PlaywrightUsingAI Setup\n");
      console.log(`  Target project: ${args.target}\n`);

      let toolsToInstall;

      if (args.all) {
        toolsToInstall = getAllToolIds();
        console.log(
          `  Mode: Installing ALL ${toolsToInstall.length} tool templates\n`,
        );
      } else if (args.tools) {
        toolsToInstall = args.tools;
        console.log(
          `  Mode: Installing specified tools: ${toolsToInstall.join(", ")}\n`,
        );
      } else {
        console.log("  Mode: Auto-detecting installed tools\n");
        toolsToInstall = printDetectionResults(args.target);

        if (toolsToInstall.length === 0) {
          console.log(
            "  ⚠️  No AI tools detected. Use --all to install for all tools,",
          );
          console.log(
            "     or --tools <list> to specify which tools to install.\n",
          );
          process.exit(1);
        }
      }

      // Validate tool IDs
      const allValid = getAllToolIds();
      const invalid = toolsToInstall.filter((t) => !allValid.includes(t));
      if (invalid.length > 0) {
        console.error(`❌ Unknown tools: ${invalid.join(", ")}`);
        console.error(`   Valid tools: ${allValid.join(", ")}`);
        process.exit(1);
      }

      console.log("─".repeat(50));

      const results = installAll(toolsToInstall, args.target, {
        force: args.force,
      });

      // Strip version-fetch instructions in air-gapped mode
      if (args.noFetch) {
        console.log(
          "\n🔒 Air-gapped mode: Stripping version-fetch instructions...\n",
        );
        const stripped = stripFetchInstructions(args.target);
        console.log(
          `\n  ✂️  Stripped fetch instructions from ${stripped} file(s)`,
        );
        console.log(
          "  ℹ️  Templates will use built-in API mappings only (no runtime doc fetching)\n",
        );
      }

      console.log("\n─".repeat(50));
      console.log("\n✅ Setup complete!\n");

      const succeeded = Object.entries(results).filter(([, v]) => v);
      const failed = Object.entries(results).filter(([, v]) => !v);

      if (succeeded.length > 0) {
        console.log(`  Installed: ${succeeded.map(([k]) => k).join(", ")}`);
      }
      if (failed.length > 0) {
        console.log(`  Failed:    ${failed.map(([k]) => k).join(", ")}`);
      }

      console.log("\n  Next steps:");
      console.log("  1. Review the installed files in your project");
      console.log("  2. Customize the agent configs for your team's workflow");
      console.log(
        "  3. Start using @mentions or slash commands with your AI tool\n",
      );
      break;
    }

    default:
      console.error(`❌ Unknown command: ${args.command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
