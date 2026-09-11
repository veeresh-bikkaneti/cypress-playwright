/**
 * Migrated from: cypress/e2e/tests/actions.test.ts
 *
 * Cypress → Playwright:
 * - cy.click() → locator.click()
 * - cy.dblclick() → locator.dblclick()
 * - cy.rightclick() → locator.click({ button: 'right' })
 * - cy.realHover() → locator.hover()
 * - cy.trigger(drag*) → DragEvent dispatch (HTML5)
 * - cy.submit() → form.requestSubmit()
 */

import { test, expect, type Page } from "@playwright/test";

async function html5Drag(
  page: Page,
  sourceTestId: string,
  targetTestId: string,
) {
  await page.evaluate(
    ([fromId, toId]) => {
      const from = document.querySelector(`[data-testid="${fromId}"]`);
      const to = document.querySelector(`[data-testid="${toId}"]`);
      if (!from || !to) {
        throw new Error("missing drag nodes");
      }
      const dt = new DataTransfer();
      from.dispatchEvent(
        new DragEvent("dragstart", {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
      to.dispatchEvent(
        new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
      to.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
      from.dispatchEvent(
        new DragEvent("dragend", {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
        }),
      );
    },
    [sourceTestId, targetTestId],
  );
}

test.describe("Action commands", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/actions");
  });

  test.describe("click()", () => {
    test("clicks a button and records the event", async ({ page }) => {
      await page.getByTestId("click-target").click();
      await expect(page.getByTestId("click-log")).toContainText("click");
    });

    test("clicks a corner position", async ({ page }) => {
      await page.getByRole("button", { name: "Click me" }).click({
        position: { x: 2, y: 2 },
      });
      const text = await page.getByTestId("click-log").innerText();
      expect(text).toContain("click");
      const x = Number((text.match(/x=(\d+)/) || [])[1]);
      expect(x).toBeLessThan(20);
    });

    test("clicks at coordinates", async ({ page }) => {
      await page.getByRole("button", { name: "Click me" }).click({
        position: { x: 8, y: 8 },
      });
      const text = await page.getByTestId("click-log").innerText();
      const x = Number((text.match(/x=(\d+)/) || [])[1]);
      const y = Number((text.match(/y=(\d+)/) || [])[1]);
      expect(x).toBeGreaterThanOrEqual(4);
      expect(x).toBeLessThanOrEqual(12);
      expect(y).toBeGreaterThanOrEqual(4);
      expect(y).toBeLessThanOrEqual(12);
    });

    test("force-clicks a covered button", async ({ page }) => {
      // Cypress { force: true } fires the event on the subject even when
      // another node sits on top. Playwright's click({ force: true }) still
      // hits the overlay at those coordinates — dispatchEvent matches Cypress.
      await page.getByTestId("covered-btn").dispatchEvent("click");
      await expect(page.getByTestId("click-log")).toContainText("covered-btn");
    });

    test("clicks with a modifier key", async ({ page }) => {
      await page.getByTestId("click-target").click({ modifiers: ["Control"] });
      await expect(page.getByTestId("click-log")).toContainText("ctrl");
    });

    test("clicks multiple matched elements", async ({ page }) => {
      for (const chip of await page.locator(".chip").all()) {
        await chip.click();
      }
      await expect(page.getByTestId("click-log")).toContainText("chips=3");
      await expect(page.locator(".chip.picked")).toHaveCount(3);
    });
  });

  test.describe("dblclick()", () => {
    test("double-clicks a button", async ({ page }) => {
      await page.getByTestId("click-target").dblclick();
      await expect(page.getByTestId("click-log")).toContainText("dblclick");
    });
  });

  test.describe("right click", () => {
    test("right-clicks a button", async ({ page }) => {
      await page.getByTestId("click-target").click({ button: "right" });
      await expect(page.getByTestId("click-log")).toContainText("contextmenu");
    });
  });

  test.describe("hover", () => {
    test("reveals a tooltip on hover", async ({ page }) => {
      await page.getByTestId("hover-target").hover();
      await expect(page.getByTestId("hover-tooltip")).toBeVisible();
      await expect(page.getByTestId("hover-log")).toHaveText("hovered");
    });
  });

  test.describe("HTML5 drag and drop", () => {
    test("drags a card from todo to done", async ({ page }) => {
      await html5Drag(page, "card-alpha", "drop-done");
      await expect(
        page.getByTestId("drop-done").getByTestId("card-alpha"),
      ).toBeVisible();
      await expect(page.getByTestId("dnd-status")).toContainText(
        "dropped:card-alpha",
      );
    });
  });

  test.describe("pointer drag (slider)", () => {
    test("moves the slider knob with mouse events", async ({ page }) => {
      const track = page.getByTestId("slider-track");
      await track.scrollIntoViewIfNeeded();
      const box = await track.boundingBox();
      if (!box) {
        throw new Error("slider track has no box");
      }
      const knobBox = await page.getByTestId("slider-knob").boundingBox();
      if (!knobBox) {
        throw new Error("slider knob has no box");
      }

      // Real pointer path (Chromium / WebKit). Firefox often swallows a
      // 1-step mouse.move teleport, so we always use steps — and if the
      // AUT value still has not moved, fall through to the Cypress twin:
      // trigger(mousedown) + window mousemove with clientX.
      await page.mouse.move(
        knobBox.x + knobBox.width / 2,
        knobBox.y + knobBox.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, {
        steps: 16,
      });
      await page.mouse.up();

      const afterPointer = Number(
        await page.getByTestId("slider-value").innerText(),
      );
      if (afterPointer <= 50) {
        await page.evaluate(
          ({ startX, clientX, clientY }) => {
            const knob = document.querySelector('[data-testid="slider-knob"]');
            if (!knob) {
              throw new Error("slider knob missing");
            }
            const down = {
              bubbles: true,
              cancelable: true,
              button: 0,
              buttons: 1,
              clientX: startX,
              clientY,
            };
            const move = {
              bubbles: true,
              cancelable: true,
              button: 0,
              buttons: 1,
              clientX,
              clientY,
            };
            knob.dispatchEvent(new MouseEvent("mousedown", down));
            window.dispatchEvent(new MouseEvent("mousemove", move));
            document.body.dispatchEvent(new MouseEvent("mousemove", move));
            window.dispatchEvent(
              new MouseEvent("mouseup", { ...move, buttons: 0 }),
            );
          },
          {
            startX: knobBox.x + knobBox.width / 2,
            clientX: box.x + box.width * 0.8,
            clientY: box.y + box.height / 2,
          },
        );
      }

      await expect
        .poll(async () =>
          Number(await page.getByTestId("slider-value").innerText()),
        )
        .toBeGreaterThan(50);
    });
  });

  test.describe("keyboard", () => {
    test("types text and records Escape", async ({ page }) => {
      await page.getByTestId("key-input").fill("hello");
      await page.getByTestId("key-input").press("Escape");
      await expect(page.getByTestId("key-input")).toHaveValue("hello");
      await expect(page.getByTestId("key-log")).toContainText("keydown:Escape");
    });
  });

  test.describe("range input", () => {
    test("sets a range value via input event", async ({ page }) => {
      await page.getByTestId("volume-range").fill("75");
      await expect(page.getByTestId("volume-value")).toHaveText("75");
    });
  });

  test.describe("form submit", () => {
    test("submits a native form", async ({ page }) => {
      await page.getByTestId("alias-input").fill("veeresh");
      await page.getByTestId("native-form").evaluate((form) => {
        (form as HTMLFormElement).requestSubmit();
      });
      await expect(page.getByTestId("form-status")).toHaveText(
        "submitted:veeresh",
      );
    });
  });
});
