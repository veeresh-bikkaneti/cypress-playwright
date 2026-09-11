/**
 * Detects enterprise AI coding tools configured in a project.
 *
 * Portable core (AGENTS.md + skills/) is always installed and covers
 * Grok, OpenAI Codex, OpenCode, and any other AGENTS.md client.
 */

const fs = require("fs");
const path = require("path");

const TOOL_SIGNATURES = {
  copilot: {
    name: "GitHub Copilot",
    // Do not treat .github/skills as Copilot — the portable core mirrors
    // skills there for every AGENTS.md client.
    files: [".github/copilot-instructions.md"],
    configFiles: [".github/copilot-instructions.md"],
  },
  claude: {
    name: "Claude Code",
    files: ["CLAUDE.md", ".claude", ".claude/commands", ".claude/skills"],
    configFiles: ["CLAUDE.md"],
  },
  cursor: {
    name: "Cursor",
    files: [".cursor/rules", ".cursor/skills", ".cursor"],
    configFiles: [".cursor/rules"],
  },
  grok: {
    name: "Grok",
    files: ["AGENTS.md"],
    configFiles: ["AGENTS.md"],
  },
  codex: {
    name: "OpenAI Codex",
    files: ["AGENTS.md", ".agents", ".agents/skills", ".codex"],
    configFiles: ["AGENTS.md"],
  },
  gemini: {
    name: "Gemini",
    files: ["GEMINI.md", ".gemini"],
    configFiles: ["GEMINI.md"],
  },
  opencode: {
    name: "OpenCode",
    files: [".opencode", "opencode.json", ".opencode/agents"],
    configFiles: ["opencode.json"],
  },
};

/** Tools that only need the portable core (no extra adapter directory). */
const CORE_ONLY = new Set(["grok", "codex", "opencode"]);

function exists(fullPath) {
  try {
    const stat = fs.statSync(fullPath);
    return stat.isFile() || stat.isDirectory();
  } catch {
    return false;
  }
}

function hasCopilotAgents(projectRoot) {
  const dir = path.join(projectRoot, ".github", "agents");
  if (!exists(dir)) return false;
  try {
    return fs.readdirSync(dir).some((name) => name.endsWith(".agent.md"));
  } catch {
    return false;
  }
}

function detectTools(projectRoot) {
  const results = {};
  for (const [toolId, tool] of Object.entries(TOOL_SIGNATURES)) {
    let detected = tool.files.some((file) =>
      exists(path.join(projectRoot, file)),
    );
    if (toolId === "copilot" && !detected) {
      detected = hasCopilotAgents(projectRoot);
    }
    results[toolId] = {
      name: tool.name,
      detected,
      configFiles: tool.configFiles,
    };
  }
  return results;
}

function getDetectedToolIds(projectRoot) {
  return Object.entries(detectTools(projectRoot))
    .filter(([, info]) => info.detected)
    .map(([id]) => id);
}

function getAllToolIds() {
  return Object.keys(TOOL_SIGNATURES);
}

function isCoreOnlyTool(toolId) {
  return CORE_ONLY.has(toolId);
}

module.exports = {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
  isCoreOnlyTool,
  TOOL_SIGNATURES,
};
