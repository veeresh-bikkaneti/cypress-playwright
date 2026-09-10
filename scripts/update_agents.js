const fs = require("fs");
const path = require("path");

/**
 * Sync Playwright/Cypress versions from package.json into the thin
 * Copilot agent wrappers. Does not fetch live docs. Versions also live
 * in AGENTS.md via package.json — this only rewrites existing strings.
 */

const AGENTS_DIR = path.join(__dirname, "../.github/agents");
const PACKAGE_JSON = path.join(__dirname, "../package.json");

console.log("Checking agent wrappers against package.json…");

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
const pwVersion =
  pkg.devDependencies["@playwright/test"] ||
  pkg.dependencies["@playwright/test"] ||
  "";
const cyVersion = pkg.devDependencies["cypress"] || pkg.dependencies["cypress"] || "";

console.log(`package.json: Playwright ${pwVersion}, Cypress ${cyVersion}`);

function updateFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`skip missing ${path.basename(filePath)}`);
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");
  let updated = content;
  replacements.forEach(({ search, replace }) => {
    updated = updated.replace(search, replace);
  });
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`updated ${path.basename(filePath)}`);
  } else {
    console.log(`unchanged ${path.basename(filePath)}`);
  }
}

const wrappers = [
  "qa-orchestrator.agent.md",
  "cypress-to-playwright-migration.agent.md",
  "playwright-healer.agent.md",
  "playwright-test-generator.agent.md",
  "playwright-test-planner.agent.md",
];

const replacements = [];
if (pwVersion) {
  replacements.push({
    search: /Playwright v\d+\.\d+\+ features only/g,
    replace: `Playwright ${pwVersion.replace("^", "v")}+ features only`,
  });
}
replacements.push({
  search: /last_checked=\d{4}-\d{2}-\d{2}/g,
  replace: `last_checked=${new Date().toISOString().split("T")[0]}`,
});

wrappers.forEach((agent) => {
  updateFile(path.join(AGENTS_DIR, agent), replacements);
});

console.log("Agent wrapper version sync complete. Canonical rules: AGENTS.md.");
