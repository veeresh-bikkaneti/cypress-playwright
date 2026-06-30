/**
 * AI Tool Detector
 * Detects which AI coding tools are configured in the current project.
 */

const fs = require("fs");
const path = require("path");

const TOOL_SIGNATURES = {
  copilot: {
    name: "GitHub Copilot",
    files: [
      ".github/copilot-instructions.md",
      ".github/agents",
      ".github/instructions",
    ],
    configFiles: [".github/copilot-instructions.md"],
  },
  claude: {
    name: "Claude Code",
    files: ["CLAUDE.md", ".claude", ".claude/commands"],
    configFiles: ["CLAUDE.md"],
  },
  cursor: {
    name: "Cursor",
    files: [".cursorrules", ".cursor/rules", ".cursor"],
    configFiles: [".cursorrules"],
  },
  cline: {
    name: "Cline",
    files: [".clinerules", ".clinerules/"],
    configFiles: [".clinerules"],
  },
  windsurf: {
    name: "Windsurf",
    files: [".windsurfrules", ".windsurf/rules", ".windsurf"],
    configFiles: [".windsurfrules"],
  },
  aider: {
    name: "Aider",
    files: [".aider.conf.yml", ".aider"],
    configFiles: [".aider.conf.yml"],
  },
  continue: {
    name: "Continue",
    files: [".continue", ".continue/config.yaml", ".continue/rules"],
    configFiles: [".continue/config.yaml"],
  },
};

/**
 * Detect which AI tools are installed in the given directory.
 * @param {string} projectRoot - Path to the project root
 * @returns {Object} Detection results with tool names and their status
 */
function detectTools(projectRoot) {
  const results = {};

  for (const [toolId, tool] of Object.entries(TOOL_SIGNATURES)) {
    const detected = tool.files.some((file) => {
      const fullPath = path.join(projectRoot, file);
      try {
        const stat = fs.statSync(fullPath);
        return stat.isFile() || stat.isDirectory();
      } catch {
        return false;
      }
    });

    results[toolId] = {
      name: tool.name,
      detected,
      configFiles: tool.configFiles,
    };
  }

  return results;
}

/**
 * Get a list of detected tool names.
 * @param {string} projectRoot - Path to the project root
 * @returns {string[]} Array of detected tool IDs
 */
function getDetectedToolIds(projectRoot) {
  const results = detectTools(projectRoot);
  return Object.entries(results)
    .filter(([, info]) => info.detected)
    .map(([id]) => id);
}

/**
 * Get a list of all supported tool names.
 * @returns {string[]} Array of all supported tool IDs
 */
function getAllToolIds() {
  return Object.keys(TOOL_SIGNATURES);
}

module.exports = {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
  TOOL_SIGNATURES,
};
