/**
 * Cypress2PlaywrightUsingAI
 *
 * Portable AGENTS.md + skills, with thin adapters for enterprise coding agents.
 */

const {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
  isCoreOnlyTool,
  TOOL_SIGNATURES,
} = require("./detectors");
const {
  installTool,
  installAll,
  installShared,
  stripFetchInstructions,
  TEMPLATES_DIR,
} = require("./installers");

module.exports = {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
  isCoreOnlyTool,
  TOOL_SIGNATURES,
  installTool,
  installAll,
  installShared,
  stripFetchInstructions,
  TEMPLATES_DIR,
};
