/**
 * Tool Installers
 * Copies template files for each AI tool into the target project.
 */

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

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
        console.log(
          `  ⏭️  Skipped (exists): ${path.relative(process.cwd(), destPath)}`,
        );
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

/**
 * Version-fetch section patterns to strip in --no-fetch mode.
 * Each entry is a regex that matches a section header line.
 */
const FETCH_SECTION_PATTERNS = [
  /## ⚠️ Version (Check|Compatibility)/i,
  /### 🔄 Version Compatibility/i,
];

/**
 * Recursively find all markdown/mdc/yml files in a directory.
 */
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "test-results",
  "playwright-report",
  "test-output",
  "coverage",
]);

function findMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(full));
    } else if (/\.(md|mdc|yml|yaml)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Strip version-fetch instruction sections from a file's content.
 * Removes entire sections (header + body) that match FETCH_SECTION_PATTERNS.
 * A section is defined as content from one header to the next header of equal or higher level.
 */
function stripFetchSections(content) {
  // Normalize CRLF → LF so Windows line endings don't break section detection
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const result = [];
  let skipping = false;
  let skipLevel = 0;

  for (const line of lines) {
    // Detect header level (number of # at start)
    const headerMatch = line.match(/^(#{1,6})\s/);

    if (headerMatch) {
      const level = headerMatch[1].length;

      if (skipping) {
        // If we hit a header at same or higher level, stop skipping
        if (level <= skipLevel) {
          skipping = false;
        } else {
          continue; // Skip sub-headers within the section
        }
      }

      // Check if this header matches a fetch section pattern
      if (FETCH_SECTION_PATTERNS.some((p) => p.test(line))) {
        skipping = true;
        skipLevel = level;
        continue;
      }
    }

    // Note: if skipping is still true at end-of-file, remaining lines are skipped.
    // This is intentional — a fetch section at the end of a file has no content after it.
    if (!skipping) {
      result.push(line);
    }
  }

  // Clean up multiple consecutive blank lines left by stripping
  return result.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Strip version-fetch instructions from all installed files.
 * @param {string} projectRoot - The target project root directory
 * @returns {number} Number of files modified
 */
function stripFetchInstructions(projectRoot) {
  const files = findMarkdownFiles(projectRoot);
  let modified = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const stripped = stripFetchSections(content);

    if (stripped !== content) {
      fs.writeFileSync(file, stripped, "utf-8");
      console.log(
        `  ✂️  Stripped fetch instructions: ${path.relative(process.cwd(), file)}`,
      );
      modified++;
    }
  }

  return modified;
}

module.exports = {
  installTool,
  installAll,
  stripFetchInstructions,
  TEMPLATES_DIR,
};
