#!/usr/bin/env node

/**
 * Install AGENTS.md + skills (portable), then optional enterprise adapters.
 *
 * Usage:
 *   npx cypress2playwright-setup setup
 *   npx cypress2playwright-setup setup --tools copilot,claude,cursor
 *   npx cypress2playwright-setup setup --all
 *   npx cypress2playwright-setup detect
 */

const fs = require("fs");
const path = require("path");
const {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
} = require("../lib/detectors");
const { installAll, stripFetchInstructions } = require("../lib/installers");

const HELP = `
Cypress2PlaywrightUsingAI — enterprise agent setup

Always installs the portable core:
  AGENTS.md + skills/   (Grok, Codex, OpenCode, Copilot, Claude, Cursor, Gemini, …)

Optional vendor adapters:
  copilot   GitHub Copilot  (.github/copilot-instructions.md, .github/agents/*.agent.md)
  claude    Claude Code     (CLAUDE.md, .claude/commands/, .claude/skills/)
  cursor    Cursor          (.cursor/rules/, .cursor/skills/)
  grok      Grok            (core only — AGENTS.md)
  codex     OpenAI Codex    (core only — AGENTS.md + .agents/skills)
  gemini    Gemini          (GEMINI.md)
  opencode  OpenCode        (core only — AGENTS.md)

Commands:
  setup     Install core + adapters (auto-detects vendor files, always installs core)
  detect    Show which AI tools are detected
  list      List supported tools

Options:
  --tools <list>   copilot,claude,cursor,grok,codex,gemini,opencode
  --all            All vendor adapters
  --target <path>  Project root (default: cwd)
  --force          Overwrite existing files
  --no-fetch       Strip version-check fetch sections from files this installer wrote
  --help

Examples:
  npx cypress2playwright-setup setup
  npx cypress2playwright-setup setup --tools copilot,claude,cursor
  npx cypress2playwright-setup setup --all --no-fetch
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
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--all") args.all = true;
    else if (arg === "--force" || arg === "-f") args.force = true;
    else if (arg === "--no-fetch") args.noFetch = true;
    else if (arg === "--tools") {
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
  console.log("\nDetected enterprise AI tools:\n");
  console.log("  Tool              Status");
  console.log("  ──────────────── ──────────");
  for (const [toolId, info] of Object.entries(results)) {
    const status = info.detected ? "detected" : "not found";
    console.log(`  ${info.name.padEnd(16)} ${status}`);
  }
  const detected = getDetectedToolIds(projectRoot);
  console.log(
    `\n  Found ${detected.length}: ${detected.length ? detected.join(", ") : "none"}\n`,
  );
  return detected;
}

function printToolList() {
  console.log("\nSupported tools:\n");
  for (const toolId of getAllToolIds()) console.log(`  • ${toolId}`);
  console.log("");
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.command) {
    console.log(HELP);
    process.exit(0);
  }

  if (!fs.existsSync(args.target)) {
    console.error(`Target directory does not exist: ${args.target}`);
    process.exit(1);
  }

  switch (args.command) {
    case "detect":
      printDetectionResults(args.target);
      break;
    case "list":
      printToolList();
      break;
    case "setup": {
      console.log("\nCypress2PlaywrightUsingAI setup");
      console.log(`  Target: ${args.target}\n`);

      let toolsToInstall = [];
      if (args.all) {
        toolsToInstall = getAllToolIds();
      } else if (args.tools) {
        toolsToInstall = args.tools;
      } else {
        toolsToInstall = printDetectionResults(args.target);
        if (toolsToInstall.length === 0) {
          console.log(
            "  No vendor files detected. Installing portable core only.",
          );
          console.log(
            "  Add --tools copilot,claude,cursor for vendor adapters.\n",
          );
        }
      }

      const allValid = getAllToolIds();
      const invalid = toolsToInstall.filter((t) => !allValid.includes(t));
      if (invalid.length > 0) {
        console.error(`Unknown tools: ${invalid.join(", ")}`);
        console.error(`Valid: ${allValid.join(", ")}`);
        process.exit(1);
      }

      const options = { force: args.force };
      const results = installAll(toolsToInstall, args.target, options);

      if (args.noFetch) {
        console.log(
          "\nAir-gapped: stripping fetch sections from written files…\n",
        );
        const n = stripFetchInstructions(options._copied || []);
        console.log(`  Stripped ${n} file(s) (installer-written only)\n`);
      }

      const succeeded = Object.entries(results).filter(([, v]) => v);
      const failed = Object.entries(results).filter(([, v]) => !v);
      console.log("\nSetup complete.");
      if (succeeded.length)
        console.log(`  Installed: ${succeeded.map(([k]) => k).join(", ")}`);
      if (failed.length)
        console.log(`  Failed:    ${failed.map(([k]) => k).join(", ")}`);
      console.log(
        "\n  Next: commit AGENTS.md and skills/ so every agent on the team sees them.\n",
      );
      if (failed.length) process.exit(1);
      break;
    }
    default:
      console.error(`Unknown command: ${args.command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
