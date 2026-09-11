#!/usr/bin/env node

/**
 * Validate Agent Skills spec (https://agentskills.io/specification)
 * for canonical skills/ and the installer copy in templates/_shared/skills/.
 *
 * Repo `skills/` may also hold maintainer-only skills (architecture-diagram,
 * skill-creator). Those must NEVER be copied into plugin templates — consumers
 * get the four migration playbooks only.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const REPO_SKILLS = path.join(ROOT, "skills");
const TEMPLATE_SKILLS = path.join(__dirname, "..", "templates", "_shared", "skills");

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Shipped to consumer repos by the installer. */
const CANONICAL = new Set([
  "cypress-to-playwright-migration",
  "playwright-testing",
  "code-review",
  "webapp-testing",
]);

/** Live in this GitHub repo only. Not published with the npm package. */
const REPO_ONLY = new Set(["architecture-diagram", "skill-creator"]);

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

function auditFrontmatter(name, skillMd, errors) {
  if (!fs.existsSync(skillMd)) {
    errors.push(`${name}: missing SKILL.md`);
    return;
  }
  const content = fs.readFileSync(skillMd, "utf-8");
  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push(`${name}: missing YAML frontmatter`);
    return;
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

function auditTree(dir, { allowRepoOnly }) {
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

  const allowed = new Set(CANONICAL);
  if (allowRepoOnly) {
    for (const extra of REPO_ONLY) allowed.add(extra);
  }

  for (const name of entries) {
    if (!allowed.has(name)) {
      errors.push(`${dir}: unexpected skill folder ${name}`);
    }
    auditFrontmatter(name, path.join(dir, name, "SKILL.md"), errors);
  }

  for (const required of CANONICAL) {
    if (!entries.includes(required)) {
      errors.push(`${dir}: missing canonical skill ${required}`);
    }
  }

  if (allowRepoOnly) {
    for (const extra of REPO_ONLY) {
      if (!entries.includes(extra)) {
        errors.push(`${dir}: missing repo-only skill ${extra}`);
      }
    }
  } else {
    for (const extra of REPO_ONLY) {
      if (entries.includes(extra)) {
        errors.push(
          `${dir}: installer must not ship repo-only skill ${extra}`,
        );
      }
    }
  }

  return errors;
}

let failed = false;
const jobs = [
  { dir: REPO_SKILLS, allowRepoOnly: true },
  { dir: TEMPLATE_SKILLS, allowRepoOnly: false },
];

for (const job of jobs) {
  const errors = auditTree(job.dir, job);
  if (errors.length) {
    failed = true;
    console.error(`audit-skills FAIL ${path.relative(ROOT, job.dir)}`);
    for (const e of errors) console.error(`  - ${e}`);
  } else {
    console.log(`audit-skills ok  ${path.relative(process.cwd(), job.dir)}`);
  }
}

if (failed) process.exit(1);
