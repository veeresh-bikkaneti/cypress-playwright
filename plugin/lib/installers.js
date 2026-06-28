/**
 * Tool Installers
 * Copies template files for each AI tool into the target project.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * Recursively copy a directory, merging with existing content.
 */
function copyDirSync(src, dest, force = false) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, force);
    } else {
      if (force || !fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ Created: ${path.relative(process.cwd(), destPath)}`);
      } else {
        console.log(`  ⏭️  Skipped (exists): ${path.relative(process.cwd(), destPath)}`);
      }
    }
  }
}

/**
 * Install tool-specific files into the target project.
 * @param {string} toolId - The tool identifier (e.g., 'copilot', 'claude')
 * @param {string} projectRoot - The target project root directory
 * @param {Object} options - Installation options
 * @param {boolean} options.force - Overwrite existing files
 */
function installTool(toolId, projectRoot, force = false) {
  const templateDir = path.join(TEMPLATES_DIR, toolId);

  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Template directory not found for tool: ${toolId}`);
    return false;
  }

  console.log(`\n📦 Installing ${toolId} templates...`);
  copyDirSync(templateDir, projectRoot, force);
  console.log(`✅ ${toolId} templates installed successfully.`);
  return true;
}

/**
 * Install all detected tools.
 * @param {string[]} toolIds - Array of tool identifiers to install
 * @param {string} projectRoot - The target project root directory
 * @param {Object} options - Installation options
 */
function installAll(toolIds, projectRoot, options = {}) {
  const results = {};

  for (const toolId of toolIds) {
    results[toolId] = installTool(toolId, projectRoot, options.force);
  }

  return results;
}

module.exports = {
  installTool,
  installAll,
  TEMPLATES_DIR,
};
