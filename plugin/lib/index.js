/**
 * Cypress2PlaywrightUsingAI
 *
 * AI-powered Cypress to Playwright migration toolkit.
 * Provides agent configurations for 7 major AI coding tools.
 */

const {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
  TOOL_SIGNATURES,
} = require("./detectors");
const { installTool, installAll, TEMPLATES_DIR } = require("./installers");

module.exports = {
  detectTools,
  getDetectedToolIds,
  getAllToolIds,
  TOOL_SIGNATURES,
  installTool,
  installAll,
  TEMPLATES_DIR,
};
