const fs = require("fs");
const path = require("path");

// Configuration
const AGENTS_DIR = path.join(__dirname, "../.github/agents");
const PACKAGE_JSON = path.join(__dirname, "../package.json");

console.log("🔄 Checking Agent Definitions against Project Config...");

// 1. Read Project Versions
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
const pwVersion =
  pkg.devDependencies["@playwright/test"] ||
  pkg.dependencies["@playwright/test"];
const cyVersion = pkg.devDependencies["cypress"] || pkg.dependencies["cypress"];

console.log(
  `📦 Project Versions: Playwright ${pwVersion}, Cypress ${cyVersion}`,
);

// 2. Update Function
function updateFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");
  let updated = content;

  replacements.forEach(({ search, replace }) => {
    updated = updated.replace(search, replace);
  });

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✅ Updated ${path.basename(filePath)}`);
  } else {
    console.log(`✨ ${path.basename(filePath)} is up to date.`);
  }
}

// 3. Define Updates
const pwAgents = [
  "cypress-to-playwright.agent.md",
  "playwright-healer.md",
  "playwright-test-generator.agent.md",
];

pwAgents.forEach((agent) => {
  const agentPath = path.join(AGENTS_DIR, agent);
  updateFile(agentPath, [
    // Update version references based on installed package
    {
      search: /Playwright v\d+\.\d+\+ features only/g,
      replace: `Playwright ${pwVersion.replace("^", "v")}+ features only`,
    },
    // Update last checked metadata (if present)
    {
      search: /last_checked=\d{4}-\d{2}-\d{2}/g,
      replace: `last_checked=${new Date().toISOString().split("T")[0]}`,
    },
  ]);
});

console.log("🎉 Agent Update Complete.");
