import { test, expect } from "@playwright/test";

// ============================================================================
// DIALOG TESTING - Alerts, Confirms, Prompts & Custom Modals
// ============================================================================

test.describe("Dialog Testing - Alerts, Confirms, Prompts", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      if (!err.message.includes("Test error")) {
        throw err;
      }
    });
    await page.goto("/dialogs");
  });

  // ==========================================================================
  // Alert Handling
  // ==========================================================================

  test.describe("Alert Dialogs", () => {
    test("should capture alert message", async ({ page }) => {
      let message = "";
      page.once("dialog", async (dialog) => {
        message = dialog.message();
        await dialog.dismiss();
      });
      await page.getByTestId("alert-btn").click();
      expect(message).toEqual("This is an alert message!");
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "Alert was shown",
      );
    });

    test("should stub alert to prevent popup", async ({ page }) => {
      await page.evaluate(() => {
        (window as unknown as { __alerts: string[] }).__alerts = [];
        window.alert = ((msg?: string) => {
          (window as unknown as { __alerts: string[] }).__alerts.push(
            String(msg ?? ""),
          );
        }) as typeof window.alert;
      });
      await page.getByTestId("alert-btn").click();
      expect(
        await page.evaluate(
          () => (window as unknown as { __alerts: string[] }).__alerts,
        ),
      ).toEqual(["This is an alert message!"]);
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "Alert was shown",
      );
    });

    test("should count multiple alert calls", async ({ page }) => {
      let alertCount = 0;
      page.on("dialog", async (dialog) => {
        alertCount++;
        await dialog.accept();
      });
      await page.getByTestId("alert-btn").click();
      await page.getByTestId("alert-btn").click();
      await page.getByTestId("alert-btn").click();
      await expect.poll(() => alertCount).toBe(3);
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "Alert was shown",
      );
    });
  });

  // ==========================================================================
  // Confirm Handling
  // ==========================================================================

  test.describe("Confirm Dialogs", () => {
    test("should accept confirm dialog by default", async ({ page }) => {
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByTestId("confirm-btn").click();
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "User clicked OK",
      );
    });

    test("should reject confirm dialog", async ({ page }) => {
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByTestId("confirm-btn").click();
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "User clicked Cancel",
      );
    });

    test("should conditionally respond to confirm based on message", async ({
      page,
    }) => {
      page.once("dialog", async (dialog) => {
        if (dialog.message().includes("proceed")) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
      });
      await page.getByTestId("confirm-btn").click();
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "User clicked OK",
      );
    });

    test("should capture confirm message", async ({ page }) => {
      let message = "";
      page.once("dialog", async (dialog) => {
        message = dialog.message();
        await dialog.accept();
      });
      await page.getByTestId("confirm-btn").click();
      expect(message).toEqual("Do you want to proceed?");
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "User clicked OK",
      );
    });
  });

  // ==========================================================================
  // Prompt Handling
  // ==========================================================================

  test.describe("Prompt Dialogs", () => {
    test("should stub prompt and return value", async ({ page }) => {
      page.once("dialog", (dialog) => dialog.accept("Test User"));
      await page.getByTestId("prompt-btn").click();
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        'User entered: "Test User"',
      );
    });

    test("should stub prompt to simulate cancel", async ({ page }) => {
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByTestId("prompt-btn").click();
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        "User cancelled",
      );
    });

    test("should verify prompt default value", async ({ page }) => {
      let message = "";
      let defaultValue = "";
      page.once("dialog", async (dialog) => {
        message = dialog.message();
        defaultValue = dialog.defaultValue();
        await dialog.accept("Entered Name");
      });
      await page.getByTestId("prompt-btn").click();
      expect(message).toBe("Please enter your name:");
      expect(defaultValue).toBe("Guest");
      await expect(page.getByTestId("native-dialog-result")).toContainText(
        'User entered: "Entered Name"',
      );
    });
  });

  // ==========================================================================
  // Custom Modal Dialogs
  // ==========================================================================

  test.describe("Custom Modal Dialogs", () => {
    test("should open and close info modal", async ({ page }) => {
      await page.getByTestId("info-modal-btn").click();
      await expect(page.getByTestId("info-modal")).toHaveClass(/show/);
      await expect(page.getByTestId("info-modal-title")).toContainText(
        "Information",
      );

      await page.getByTestId("info-modal-close").click();
      await expect(page.getByTestId("info-modal")).not.toHaveClass(/show/);
    });

    test("should handle delete confirmation modal - confirm", async ({
      page,
    }) => {
      await page.getByTestId("delete-modal-btn").click();
      await expect(page.getByTestId("delete-modal")).toHaveClass(/show/);
      await expect(page.getByTestId("delete-modal-content")).toContainText(
        "cannot be undone",
      );

      await page.getByTestId("delete-modal-confirm").click();
      await expect(page.getByTestId("delete-modal")).not.toHaveClass(/show/);
      await expect(page.getByTestId("modal-result")).toContainText(
        "Item deleted",
      );
    });

    test("should handle delete confirmation modal - cancel", async ({
      page,
    }) => {
      await page.getByTestId("delete-modal-btn").click();
      await page.getByTestId("delete-modal-cancel").click();

      await expect(page.getByTestId("delete-modal")).not.toHaveClass(/show/);
      await expect(page.getByTestId("modal-result")).toContainText(
        "Delete cancelled",
      );
    });

    test("should fill and submit form inside modal", async ({ page }) => {
      await page.getByTestId("form-modal-btn").click();

      await page.getByTestId("modal-name-input").fill("John Doe");
      await page
        .getByTestId("modal-message-input")
        .fill("This is a test message");

      await page.getByTestId("form-modal-submit").click();
      await expect(page.getByTestId("form-modal")).not.toHaveClass(/show/);

      const result = page.getByTestId("modal-result");
      await expect(result).toContainText("John Doe");
      await expect(result).toContainText("test message");
    });

    test("should close modal by clicking overlay", async ({ page }) => {
      await page.getByTestId("info-modal-btn").click();
      await expect(page.getByTestId("info-modal")).toHaveClass(/show/);
      await page.getByTestId("info-modal").click({ position: { x: 2, y: 2 } });
      await expect(page.getByTestId("info-modal")).not.toHaveClass(/show/);
    });
  });

  // ==========================================================================
  // Window Events (uncaught error, console spy, beforeunload)
  // ==========================================================================

  test.describe("Window Events", () => {
    test("should handle beforeunload event", async ({ page }) => {
      await page.getByTestId("beforeunload-btn").click();
      await expect(page.getByTestId("event-result")).toContainText("ENABLED");
    });

    test("should handle triggered errors gracefully", async ({ page }) => {
      const errorPromise = page.waitForEvent("pageerror");
      await page.getByTestId("error-btn").click();
      const err = await errorPromise;
      expect(err.message).toContain("Test error");
      await expect(page.getByTestId("event-result")).toContainText(
        "Error triggered",
      );
    });

    test("should spy on console methods", async ({ page }) => {
      const logs: string[] = [];
      const warns: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "log") {
          logs.push(msg.text());
        }
        if (msg.type() === "warning") {
          warns.push(msg.text());
        }
      });
      await page.getByTestId("console-btn").click();
      await expect.poll(() => logs).toContain("Console log test message");
      await expect.poll(() => warns).toContain("Console warn test message");
    });
  });

  // ==========================================================================
  // Popup Windows (page.waitForEvent)
  // ==========================================================================

  test.describe("Popup Windows", () => {
    test("should stub window.open to prevent popup", async ({ page }) => {
      await page.evaluate(() => {
        (window as unknown as { __openCalls: unknown[][] }).__openCalls = [];
        window.open = ((...args: unknown[]) => {
          (window as unknown as { __openCalls: unknown[][] }).__openCalls.push(
            args,
          );
          return null;
        }) as typeof window.open;
      });
      await page.getByTestId("popup-btn").click();
      const calls = await page.evaluate(
        () => (window as unknown as { __openCalls: unknown[][] }).__openCalls,
      );
      expect(calls).toHaveLength(1);
    });

    test("should verify popup window parameters", async ({ page }) => {
      await page.evaluate(() => {
        (window as unknown as { __openCalls: unknown[][] }).__openCalls = [];
        window.open = ((...args: unknown[]) => {
          (window as unknown as { __openCalls: unknown[][] }).__openCalls.push(
            args,
          );
          return null;
        }) as typeof window.open;
      });
      await page.getByTestId("popup-btn").click();
      const calls = await page.evaluate(
        () => (window as unknown as { __openCalls: unknown[][] }).__openCalls,
      );
      expect(calls[0][0]).toBe("/");
      expect(calls[0][1]).toBe("popup");
      expect(typeof calls[0][2]).toBe("string");
    });
  });
});
