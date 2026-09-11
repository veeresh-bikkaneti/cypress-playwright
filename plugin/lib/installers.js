/**
 * Copies the portable core (AGENTS.md + skills/) and optional vendor adapters.
 * --no-fetch only rewrites files this installer just wrote.
 */

const fs = require("fs");
const path = require("path");
const { isCoreOnlyTool } = require("./detectors");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const SHARED_DIR = path.join(TEMPLATES_DIR, "_shared");
const SHARED_SKILLS = path.join(SHARED_DIR, "skills");

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

/** Extra skill discovery paths used by a vendor adapter (in addition to the core mirrors). */
const ADAPTER_SKILL_MIRRORS = {
  claude: ".claude/skills",
  cursor: ".cursor/skills",
};

function copyDirSync(src, dest, force, copied) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      copyDirSync(srcPath, destPath, force, copied);
    } else if (force || !fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      copied.push(destPath);
      console.log(`  ✅ Created: ${path.relative(process.cwd(), destPath)}`);
    } else {
      console.log(
        `  ⏭️  Skipped (exists): ${path.relative(process.cwd(), destPath)}`,
      );
    }
  }
}

function mirrorSkills(projectRoot, destRel, force, copied) {
  // Always mirror the four canonical playbooks from the installer template,
  // never the consumer/repo skills/ tree (this repo also holds
  // architecture-diagram and skill-creator).
  if (!fs.existsSync(SHARED_SKILLS)) return;
  const dest = path.join(projectRoot, destRel);
  console.log(`\n📦 Mirroring templates/_shared/skills → ${destRel}`);
  copyDirSync(SHARED_SKILLS, dest, force, copied);
}

function installShared(projectRoot, force, copied) {
  if (!fs.existsSync(SHARED_DIR)) {
    console.error("❌ Shared template directory missing: templates/_shared");
    return false;
  }
  console.log("\n📦 Installing portable core (AGENTS.md + skills/)...");
  copyDirSync(SHARED_DIR, projectRoot, force, copied);
  // Codex + Copilot + any AGENTS.md client
  mirrorSkills(projectRoot, ".agents/skills", force, copied);
  mirrorSkills(projectRoot, ".github/skills", force, copied);
  return true;
}

function installTool(toolId, projectRoot, force = false, copied = []) {
  if (isCoreOnlyTool(toolId)) {
    console.log(
      `\n📦 ${toolId}: covered by AGENTS.md + skills/ (no extra adapter)`,
    );
    return true;
  }

  const templateDir = path.join(TEMPLATES_DIR, toolId);
  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Template directory not found for tool: ${toolId}`);
    return false;
  }

  console.log(`\n📦 Installing ${toolId} adapter...`);
  copyDirSync(templateDir, projectRoot, force, copied);

  const extraMirror = ADAPTER_SKILL_MIRRORS[toolId];
  if (extraMirror) {
    mirrorSkills(projectRoot, extraMirror, force, copied);
  }

  console.log(`✅ ${toolId} adapter installed.`);
  return true;
}

function installAll(toolIds, projectRoot, options = {}) {
  const force = Boolean(options.force);
  const copied = [];
  const results = { _shared: installShared(projectRoot, force, copied) };

  for (const toolId of toolIds) {
    results[toolId] = installTool(toolId, projectRoot, force, copied);
  }

  options._copied = copied;
  return results;
}

const FETCH_SECTION_PATTERNS = [
  /## ⚠️ Version (Check|Compatibility)/i,
  /### 🔄 Version Compatibility/i,
];

function stripFetchSections(content) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const result = [];
  let skipping = false;
  let skipLevel = 0;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      if (skipping && level <= skipLevel) skipping = false;
      else if (skipping) continue;
      if (FETCH_SECTION_PATTERNS.some((p) => p.test(line))) {
        skipping = true;
        skipLevel = level;
        continue;
      }
    }
    if (!skipping) result.push(line);
  }
  return result.join("\n").replace(/\n{3,}/g, "\n\n");
}

function stripFetchInstructions(files) {
  let modified = 0;
  for (const file of files) {
    if (!/\.(md|mdc|yml|yaml)$/.test(file)) continue;
    if (!fs.existsSync(file)) continue;
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
  installShared,
  stripFetchInstructions,
  TEMPLATES_DIR,
};
