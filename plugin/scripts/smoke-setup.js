#!/usr/bin/env node

/**
 * Smoke-test the installer: enterprise tool list, portable core, adapters,
 * skill mirrors, --no-fetch does not walk the consumer tree, no hobby CLIs.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const setupJs = path.join(__dirname, "..", "bin", "setup.js");

function run(args, cwd = process.cwd()) {
  return execFileSync(process.execPath, [setupJs, ...args], {
    encoding: "utf-8",
    cwd,
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function exists(root, rel) {
  return fs.existsSync(path.join(root, rel));
}

const list = run(["list"]);
for (const tool of ["copilot", "claude", "cursor", "grok", "codex", "gemini"]) {
  assert(list.includes(tool), `list missing ${tool}`);
}
for (const hobby of ["aider", "cline", "windsurf", "continue"]) {
  assert(!list.includes(hobby), `hobby tool still listed: ${hobby}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "c2p-smoke-"));
fs.writeFileSync(
  path.join(tmp, "KEEP.md"),
  "## ⚠️ Version Check Required\n\nConsumer file — do not strip.\n",
);

run(["setup", "--all", "--no-fetch", "--target", tmp]);

const required = [
  "AGENTS.md",
  "skills/cypress-to-playwright-migration/SKILL.md",
  "skills/playwright-testing/SKILL.md",
  "skills/code-review/SKILL.md",
  "skills/code-review/code-reviewer.md",
  "skills/webapp-testing/SKILL.md",
  ".agents/skills/playwright-testing/SKILL.md",
  ".github/skills/code-review/SKILL.md",
  ".github/copilot-instructions.md",
  ".github/agents/qa-orchestrator.agent.md",
  ".github/agents/cypress-to-playwright-migration.agent.md",
  "CLAUDE.md",
  ".claude/commands/migrate.md",
  ".claude/commands/heal.md",
  ".claude/commands/review.md",
  ".cursor/rules/cypress-playwright.mdc",
  "GEMINI.md",
];

for (const rel of required) {
  assert(exists(tmp, rel), `missing ${rel}`);
}

assert(!exists(tmp, ".aider.conf.yml"), "aider adapter leaked");
assert(!exists(tmp, ".cline"), "cline adapter leaked");
assert(!exists(tmp, ".clinerules"), "clinerules leaked");
assert(!exists(tmp, ".windsurf"), "windsurf adapter leaked");
assert(
  !exists(tmp, ".github/agents/cypress-healer.agent.md"),
  "legacy cypress-healer shipped",
);
assert(
  !exists(tmp, ".github/agents/backend-specialist.md"),
  "legacy persona shipped",
);

const keep = fs.readFileSync(path.join(tmp, "KEEP.md"), "utf-8");
assert(
  keep.includes("Version Check Required"),
  "--no-fetch walked a consumer file it did not write",
);

const agents = fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf-8");
assert(/GitHub Copilot/.test(agents), "AGENTS.md missing Copilot");
assert(/Claude Code/.test(agents), "AGENTS.md missing Claude");
assert(/Grok/.test(agents), "AGENTS.md missing Grok");
assert(
  !/fetch the matching documentation/i.test(agents),
  "AGENTS.md still asks agents to fetch live docs",
);

const detect = run(["detect", "--target", tmp]);
for (const name of [
  "GitHub Copilot",
  "Claude Code",
  "Cursor",
  "Grok",
  "OpenAI Codex",
  "Gemini",
]) {
  assert(detect.includes(name), `detect missing ${name}`);
}

console.log("smoke-setup: ok");
console.log(`  target: ${tmp}`);
