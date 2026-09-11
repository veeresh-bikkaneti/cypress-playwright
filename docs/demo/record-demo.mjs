#!/usr/bin/env node
/**
 * Record docs/demo/setup-and-use.mp4 (setup + interactive architecture).
 * Usage from repo root: node docs/demo/record-demo.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.resolve(__dirname, "..");
const OUT_DIR = __dirname;
const PORT = 4173;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function serve(root) {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let rel = urlPath === "/" ? "/index.html" : urlPath;
    if (rel.includes("..")) {
      res.writeHead(400);
      res.end();
      return;
    }
    const file = path.join(root, rel);
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, {
        "content-type": MIME[path.extname(file)] || "application/octet-stream",
      });
      res.end(data);
    });
  });
}

async function caption(page, text) {
  await page.evaluate((t) => {
    let el = document.getElementById("demo-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-caption";
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = [
        "position:fixed",
        "left:24px",
        "right:24px",
        "bottom:20px",
        "z-index:99999",
        "font:600 18px/1.3 'Space Grotesk',system-ui,sans-serif",
        "color:#e6edf7",
        "background:rgba(10,13,18,.82)",
        "border:1px solid #2a3650",
        "border-radius:12px",
        "padding:12px 16px",
        "backdrop-filter:blur(8px)",
        "pointer-events:none",
      ].join(";");
      document.body.appendChild(el);
    }
    el.textContent = t;
  }, text);
}

async function main() {
  const server = serve(DOCS);
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${PORT}`;

  const rawDir = path.join(OUT_DIR, "raw");
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.mkdirSync(rawDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--force-prefers-reduced-motion=0"],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "no-preference",
    recordVideo: { dir: rawDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  await page.goto(`${origin}/index.html`, { waitUntil: "networkidle" });
  await caption(page, "Cypress2Playwright — setup and use");
  await page.waitForTimeout(1800);
  await page.locator("#inventory").scrollIntoViewIfNeeded();
  await caption(page, "Two products: npm toolkit + this dual-suite demo");
  await page.waitForTimeout(2200);
  await page.locator("#noshake").scrollIntoViewIfNeeded();
  await caption(page, "Do not squash feat PRs — merge commit keeps the SDD ledger");
  await page.waitForTimeout(2200);
  await page.locator("#setup").scrollIntoViewIfNeeded();
  await caption(page, "Consumer install: run setup.js, then prompt any agent");
  await page.waitForTimeout(2400);
  await page.locator("#setup-cmd").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);

  await page.goto(`${origin}/architecture.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await caption(page, "Interactive architecture — Consumer mode · Setup flow");
  await page.locator('[data-flow="setup"]').click();
  await page.locator("#btnPlay").click();
  await page.waitForTimeout(8500);
  await caption(page, "Flow 2 — migrate one Cypress spec to Playwright");
  await page.locator('[data-flow="migrate"]').click();
  await page.locator("#btnPlay").click();
  await page.waitForTimeout(8500);
  await caption(page, "Toggle Demo repo — dual Cypress + Playwright + Express");
  await page.locator('.modepick button[data-mode="online"]').click();
  await page.waitForTimeout(1600);
  await page.locator('[data-flow="auth"]').click();
  await caption(page, "Auth: cy.session has no twin — storageState + Remember me");
  await page.locator("#btnPlay").click();
  await page.waitForTimeout(6500);
  await page.screenshot({
    path: path.join(OUT_DIR, "poster.png"),
    type: "png",
  });
  await caption(page, "Open docs/architecture.html · merge, do not squash");
  await page.waitForTimeout(1800);

  const video = page.video();
  await page.close();
  const webmPath = video ? await video.path() : null;
  await context.close();
  await browser.close();
  server.close();

  if (!webmPath || !fs.existsSync(webmPath)) {
    throw new Error("Playwright did not write a video file");
  }

  const destWebm = path.join(OUT_DIR, "setup-and-use.webm");
  const destMp4 = path.join(OUT_DIR, "setup-and-use.mp4");
  fs.copyFileSync(webmPath, destWebm);

  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      destWebm,
      "-vf",
      "scale=1280:720:flags=lanczos",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-movflags",
      "+faststart",
      "-an",
      destMp4,
    ],
    { stdio: "inherit" },
  );
  if (ff.status !== 0) {
    throw new Error("ffmpeg failed to transcode the demo video");
  }
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.rmSync(destWebm, { force: true });
  const stat = fs.statSync(destMp4);
  console.log(
    `wrote ${destMp4} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

