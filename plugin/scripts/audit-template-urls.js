#!/usr/bin/env node

/**
 * Template URL Security Audit
 *
 * Scans all template files for hardcoded URLs and verifies they are either:
 * - Playwright documentation (playwright.dev)
 * - Cypress documentation (docs.cypress.io)
 * - Localhost / 127.0.0.1 (code examples)
 * - Reserved example domains (example.com, example.org, example.net)
 *
 * Any other URLs are flagged as potential security concerns.
 *
 * Usage:
 *   node scripts/audit-template-urls.js [--verbose]
 */

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

// Whitelisted URL patterns — regex for domain-boundary safety
const ALLOWED_PATTERNS = [
  // Playwright documentation (exact domain match, trailing slash optional)
  /^https?:\/\/playwright\.dev\/?/,
  // Cypress documentation (exact domain match, trailing slash optional)
  /^https?:\/\/docs\.cypress\.io\/?/,
  // Localhost / loopback (code examples)
  /^https?:\/\/localhost/,
  /^https?:\/\/127\.0\.0\.1/,
  // RFC 2606 reserved example domains
  /^https?:\/\/((www|staging|api)\.)?example\.(com|org|net)/,
];

// File extensions to scan
const SCAN_EXTENSIONS = new Set([
  ".md",
  ".mdc",
  ".yml",
  ".yaml",
  ".py",
  ".js",
  ".ts",
]);

const VERBOSE = process.argv.includes("--verbose");

/**
 * Extract all URLs from text
 */
function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s"'<>\])`]+/g) || [];
  // Clean trailing punctuation that gets captured
  return matches.map((u) => u.replace(/[.,;:!?)}\]]+$/, ""));
}

/**
 * Check if a URL is whitelisted
 */
function isAllowed(url) {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Recursively find files to scan
 */
function findFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full));
    } else if (
      entry.isFile() &&
      SCAN_EXTENSIONS.has(path.extname(entry.name))
    ) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Main audit
 */
function audit() {
  console.log("\n🔒 Template URL Security Audit\n");
  console.log(`  Scanning: ${TEMPLATES_DIR}\n`);

  const files = findFiles(TEMPLATES_DIR);
  console.log(`  Found ${files.length} files to scan\n`);

  const violations = [];
  const allUrls = new Map();

  for (const file of files) {
    const relPath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split(/\r?\n/); // Handle both \n and \r\n

    for (let i = 0; i < lines.length; i++) {
      for (const url of extractUrls(lines[i])) {
        if (!isAllowed(url)) {
          violations.push({
            file: relPath,
            line: i + 1,
            url,
            context: lines[i].trim().substring(0, 120),
          });
        }
        if (!allUrls.has(url)) allUrls.set(url, []);
        allUrls.get(url).push({ file: relPath, line: i + 1 });
      }
    }
  }

  // Report
  if (violations.length === 0) {
    console.log("✅ PASS: No unauthorized outbound URLs found.\n");
    console.log(`  Total unique URLs: ${allUrls.size}`);
    console.log(
      "  All URLs are whitelisted (Playwright/Cypress docs, localhost, example domains)\n",
    );
  } else {
    console.log(`❌ FAIL: Found ${violations.length} unauthorized URL(s):\n`);
    for (const v of violations) {
      console.log(`  ${v.file}:${v.line}`);
      console.log(`    URL:       ${v.url}`);
      console.log(`    Context:   ${v.context}`);
      console.log("");
    }
    console.log(
      "  Fix: Remove the URL or add it to ALLOWED_PATTERNS in scripts/audit-template-urls.js\n",
    );
  }

  if (VERBOSE) {
    console.log("📋 All unique URLs found:\n");
    const sorted = [...allUrls.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    for (const [url, occurrences] of sorted) {
      const status = isAllowed(url) ? "✅" : "❌";
      console.log(`  ${status} ${url}  (${occurrences.length} occurrence(s))`);
    }
    console.log("");
  }

  return violations.length === 0;
}

const success = audit();
process.exit(success ? 0 : 1);
