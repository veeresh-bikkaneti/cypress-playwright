#!/usr/bin/env node

/**
 * Migration parity gate.
 *
 * 1. Every cypress/e2e/tests/*.test.ts has playwright/e2e/<sameBase>.spec.ts
 * 2. Extra Playwright specs (except auth.setup.ts) without a Cypress twin fail
 * 3. Every cypress/e2e/pages/*.ts has a mapped playwright/pages/ twin
 * 4. Page methods used in Cypress pages exist on Playwright pages
 * 5. Cypress.Commands.add / addQuery names appear in custom-commands.test.ts
 *    and in docs/COMMAND_MAP.md
 * 6. playwright/fixtures/test-data.ts reads cypress/fixtures/users.json
 * 7. playwright/e2e must not contain tautological assertions
 * 8. test.skip( / it.skip( require "Cypress-only" nearby
 *
 * Run from repo root: node plugin/scripts/assert-migration-parity.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const CY_TESTS = path.join(ROOT, "cypress", "e2e", "tests");
const PW_TESTS = path.join(ROOT, "playwright", "e2e");
const CY_PAGES = path.join(ROOT, "cypress", "e2e", "pages");
const PW_PAGES = path.join(ROOT, "playwright", "pages");
const COMMANDS = path.join(ROOT, "cypress", "support", "commands.ts");
const COMMAND_MAP = path.join(ROOT, "docs", "COMMAND_MAP.md");
const CUSTOM_CY = path.join(
  ROOT,
  "cypress",
  "e2e",
  "tests",
  "custom-commands.test.ts",
);
const TEST_DATA = path.join(ROOT, "playwright", "fixtures", "test-data.ts");

const PAGE_MAP = {
  "loginPage.ts": "LoginPage.ts",
  "myAccountPage.ts": "MyAccountPage.ts",
};

const PAGE_METHODS = [
  "login",
  "loginFromHome",
  "validateLoginError",
  "validateEmailError",
  "validatePasswordError",
  "validateSuccessfulLogin",
  "validateUserInfo",
  "logout",
  "validateSuccessfulLogout",
  "navigateToOrders",
  "navigateToProducts",
  "navigateToSettings",
];

const TAUTOLOGIES = [
  "expect(true)",
  "test.info().title",
  "process.platform",
  "browserName).toBeTruthy",
  'expect(subject.name).toBe("Ada")',
  'const [a, b, c] = ["Apples"',
];

const ALLOWED_EXTRA_PW = new Set(["auth.setup.ts"]);

const failures = [];

function walkFiles(dir, predicate) {
  const out = [];
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkFiles(full, predicate));
    } else if (predicate(ent.name, full)) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function linesOf(file) {
  return fs.readFileSync(file, "utf8").split(/\r?\n/);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const cyTestFiles = walkFiles(CY_TESTS, (name) => name.endsWith(".test.ts"));
const pwSpecs = walkFiles(PW_TESTS, (name) => name.endsWith(".ts"));

for (const file of cyTestFiles) {
  const base = path.basename(file, ".test.ts");
  const twin = path.join(PW_TESTS, `${base}.spec.ts`);
  if (!fs.existsSync(twin)) {
    failures.push(
      `missing Playwright twin: playwright/e2e/${base}.spec.ts (from ${rel(file)})`,
    );
  }
}

for (const file of pwSpecs) {
  const name = path.basename(file);
  if (ALLOWED_EXTRA_PW.has(name)) {
    continue;
  }
  if (!name.endsWith(".spec.ts")) {
    failures.push(`unexpected Playwright file: ${rel(file)}`);
    continue;
  }
  const base = name.replace(/\.spec\.ts$/, "");
  const twin = path.join(CY_TESTS, `${base}.test.ts`);
  if (!fs.existsSync(twin)) {
    failures.push(
      `Playwright-only spec: ${rel(file)} — Cypress is the source of truth`,
    );
  }
}

const cyPageFiles = walkFiles(CY_PAGES, (name) => name.endsWith(".ts"));
for (const file of cyPageFiles) {
  const name = path.basename(file);
  const mapped = PAGE_MAP[name];
  if (!mapped) {
    failures.push(`unmapped Cypress page: ${rel(file)} — add it to PAGE_MAP`);
    continue;
  }
  const twin = path.join(PW_PAGES, mapped);
  if (!fs.existsSync(twin)) {
    failures.push(
      `missing Playwright page: playwright/pages/${mapped} (from ${rel(file)})`,
    );
    continue;
  }
  const cySrc = read(file);
  const pwSrc = read(twin);
  for (const method of PAGE_METHODS) {
    if (cySrc.includes(method) && !pwSrc.includes(method)) {
      failures.push(
        `page method ${method} missing on playwright/pages/${mapped}`,
      );
    }
  }
}

const commandsSrc = read(COMMANDS);
const commandNames = new Set();
for (const m of commandsSrc.matchAll(
  /Commands\.(?:add|addQuery|overwrite)\(\s*["']([^"']+)["']/g,
)) {
  commandNames.add(m[1]);
}
const catalog = read(CUSTOM_CY);
const commandMap = fs.existsSync(COMMAND_MAP) ? read(COMMAND_MAP) : "";
for (const name of commandNames) {
  if (!catalog.includes(name) && name !== "visit") {
    failures.push(
      `custom command cy.${name} is not demonstrated in custom-commands.test.ts`,
    );
  }
  if (commandMap && !commandMap.includes(name)) {
    failures.push(`custom command ${name} missing from docs/COMMAND_MAP.md`);
  }
}

if (!fs.existsSync(TEST_DATA) || !read(TEST_DATA).includes("users.json")) {
  failures.push(
    "playwright/fixtures/test-data.ts must read cypress/fixtures/users.json",
  );
}

for (const file of pwSpecs) {
  const lines = linesOf(file);
  lines.forEach((line, i) => {
    for (const needle of TAUTOLOGIES) {
      if (line.includes(needle)) {
        failures.push(`${rel(file)}:${i + 1} tautology: ${needle}`);
      }
    }
  });
}

for (const file of pwSpecs) {
  const lines = linesOf(file);
  lines.forEach((line, i) => {
    if (!line.includes("test.skip(")) {
      return;
    }
    const prev = i > 0 ? lines[i - 1] : "";
    if (!line.includes("Cypress-only") && !prev.includes("Cypress-only")) {
      failures.push(
        `${rel(file)}:${i + 1} test.skip( without Cypress-only on this or previous line`,
      );
    }
  });
}

const cySpecs = walkFiles(CY_TESTS, (name) => name.endsWith(".ts"));
for (const file of cySpecs) {
  const lines = linesOf(file);
  lines.forEach((line, i) => {
    if (!line.includes("it.skip(")) {
      return;
    }
    const prev = i > 0 ? lines[i - 1] : "";
    const comment =
      line.includes("Cypress-only") || prev.includes("Cypress-only");
    if (!comment) {
      failures.push(
        `${rel(file)}:${i + 1} it.skip( without Cypress-only comment`,
      );
    }
  });
}

if (failures.length) {
  console.log("FAIL");
  for (const f of failures) {
    console.log(`  ${f}`);
  }
  process.exit(1);
}

console.log("PASS");
