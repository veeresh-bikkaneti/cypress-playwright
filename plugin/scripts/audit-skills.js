#!/usr/bin/env node

/**
 * Validate Agent Skills spec (https://agentskills.io/specification)
 * for canonical skills/ and the installer copy in templates/_shared/skills/.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const DIRS = [
  path.join(ROOT, "skills"),
  path.join(__dirname, "..", "templates", "_shared", "skills"),
];

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CANONICAL = new Set([
  "cypress-to-playwright-migration",
  "playwright-testing",
  "code-review",
  "webapp-testing",
]);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

function auditTree(dir) {
  const errors = [];
  if (!fs.existsSync(dir)) {
    errors.push(`missing skills dir: ${dir}`);
    return errors;
  }
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const name of entries) {
    if (!CANONICAL.has(name)) {
      errors.push(`${dir}: unexpected skill folder ${name}`);
    }
    const skillMd = path.join(dir, name, "SKILL.md");
    if (!fs.existsSync(skillMd)) {
      errors.push(`${name}: missing SKILL.md`);
      continue;
    }
    const content = fs.readFileSync(skillMd, "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      errors.push(`${name}: missing YAML frontmatter`);
      continue;
    }
    if (!fm.name) errors.push(`${name}: missing name`);
    else {
      if (fm.name !== name) errors.push(`${name}: name '${fm.name}' != folder`);
      if (fm.name.length > 64) errors.push(`${name}: name > 64 chars`);
      if (!NAME_RE.test(fm.name)) errors.push(`${name}: invalid name charset`);
    }
    if (!fm.description) errors.push(`${name}: missing description`);
    else if (fm.description.length > 1024)
      errors.push(`${name}: description > 1024 chars`);
  }

  for (const required of CANONICAL) {
    if (!entries.includes(required)) {
      errors.push(`${dir}: missing canonical skill ${required}`);
    }
  }
  return errors;
}

let failed = false;
for (const dir of DIRS) {
  const errors = auditTree(dir);
  if (errors.length) {
    failed = true;
    console.error(`audit-skills FAIL ${path.relative(ROOT, dir)}`);
    for (const e of errors) console.error(`  - ${e}`);
  } else {
    console.log(`audit-skills ok  ${path.relative(process.cwd(), dir)}`);
  }
}

if (failed) process.exit(1);
