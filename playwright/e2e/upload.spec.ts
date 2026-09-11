/**
 * Migrated from: cypress/e2e/tests/upload.test.ts
 *
 * Cypress → Playwright:
 * - cy.selectFile() → locator.setInputFiles()
 * - drag-drop selectFile → DataTransfer drop on the zone
 * - downloadsFolder readFile → page.waitForEvent('download')
 */

import { test, expect, type Locator, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

async function dropFile(
  page: Page,
  target: Locator,
  file: { name: string; mimeType: string; contents: string },
) {
  const dataTransfer = await page.evaluateHandle(
    ({ name, mimeType, contents }) => {
      const dt = new DataTransfer();
      dt.items.add(new File([contents], name, { type: mimeType }));
      return dt;
    },
    file,
  );

  await target.dispatchEvent("drop", { dataTransfer });
}

test.describe("File upload and download", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/upload");
  });

  test.describe("setInputFiles()", () => {
    test("selects a single in-memory file", async ({ page }) => {
      await page.getByTestId("single-file-input").setInputFiles({
        name: "hello.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("hello from playwright"),
      });

      await expect(page.getByTestId("single-file-status")).toHaveText(
        "hello.txt",
      );
      await expect(page.getByTestId("single-upload-btn")).toBeEnabled();
    });

    test("selects a fixture file", async ({ page }) => {
      const fixture = path.join(
        process.cwd(),
        "cypress/fixtures/task-read.txt",
      );
      await page.getByTestId("single-file-input").setInputFiles(fixture);
      await expect(page.getByTestId("single-file-status")).toContainText(
        "task-read.txt",
      );
    });

    test("selects multiple files", async ({ page }) => {
      await page.getByTestId("multiple-file-input").setInputFiles([
        {
          name: "one.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("one"),
        },
        {
          name: "two.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("two"),
        },
      ]);

      await expect(page.getByTestId("file-list")).toContainText("one.txt");
      await expect(page.getByTestId("file-list")).toContainText("two.txt");
      await expect(page.getByTestId("multiple-upload-btn")).toBeEnabled();
    });

    test("drops a file onto the upload area", async ({ page }) => {
      await dropFile(page, page.getByTestId("single-upload-area"), {
        name: "dropped.txt",
        mimeType: "text/plain",
        contents: "dropped",
      });

      await expect(page.getByTestId("single-file-status")).toHaveText(
        "dropped.txt",
      );
    });

    test("uploads the selected file through the AUT", async ({ page }) => {
      const upload = page.waitForResponse(
        (res) =>
          res.url().includes("/api/upload") && res.request().method() === "POST",
      );

      await page.getByTestId("single-file-input").setInputFiles({
        name: "payload.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("payload"),
      });
      await page.getByTestId("single-upload-btn").click();

      expect((await upload).status()).toBe(200);
      await expect(page.getByTestId("single-upload-result")).toContainText(
        "Upload successful",
      );
    });
  });

  test.describe("download", () => {
    test("downloads the canned sample file", async ({ page }) => {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByTestId("download-sample").click(),
      ]);

      expect(download.suggestedFilename()).toBe("sample.txt");
      const filePath = await download.path();
      if (!filePath) {
        throw new Error("download path missing");
      }
      expect(fs.readFileSync(filePath, "utf8")).toContain(
        "Sample file for Cypress download tests",
      );
    });
  });
});
