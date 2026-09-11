/**
 * Playwright helpers that twin Cypress custom commands in
 * cypress/support/commands.ts. These are plain functions — not a global
 * Cypress-like registry. Login/logout stay on LoginPage / MyAccountPage.
 */

import {
  Page,
  Locator,
  BrowserContext,
  expect,
  type Response,
} from "@playwright/test";

/**
 * Twin of cy.typeAndClear: type into an input, assert the value, then clear.
 */
export async function typeAndClear(
  locator: Locator,
  text: string,
): Promise<void> {
  await locator.fill(text);
  await expect(locator).toHaveValue(text);
  await locator.clear();
  await expect(locator).toHaveValue("");
}

/**
 * Twin of cy.shouldHaveData: assert data-{attr} equals value.
 */
export async function shouldHaveData(
  locator: Locator,
  attr: string,
  value: string,
): Promise<void> {
  await expect(locator).toHaveAttribute(`data-${attr}`, value);
}

/**
 * Twin of cy.interceptAndWait: wait for a response matching method + URL
 * substring, then navigate so the AUT triggers it. Assert response.ok()
 * in the spec — this helper only returns the response.
 */
export async function interceptAndWait(
  page: Page,
  method: string,
  urlSubstring: string,
  visitPath: string,
): Promise<Response> {
  const responsePromise = page.waitForResponse((res) => {
    return (
      res.request().method().toUpperCase() === method.toUpperCase() &&
      res.url().includes(urlSubstring)
    );
  });
  await page.goto(visitPath);
  return responsePromise;
}

/**
 * Twin of cy.setAuthCookie. Cookie is proven against GET /api/auth/me
 * (cookie auth), not the dashboard JS localStorage gate.
 *
 * Playwright's `request` fixture is a separate APIRequestContext — after
 * adding this cookie, call `page.request.get` (same browser context).
 */
export async function setAuthCookie(
  context: BrowserContext,
  token: string,
): Promise<void> {
  await context.addCookies([
    {
      name: "authToken",
      value: token,
      // Playwright addCookies accepts url XOR domain+path. The origin URL
      // infers path '/'; httpOnly matches the AUT Set-Cookie from login.
      url: "http://127.0.0.1:3000/",
      httpOnly: true,
    },
  ]);
}

/**
 * Twin of cy.fruit (Cypress 12 addQuery): find a .fruit by visible text.
 */
export function fruit(page: Page, name: string): Locator {
  return page.locator(".fruit", { hasText: name });
}

/**
 * Twin of cy.highlight: set an inline red border for debug visibility.
 * Not Cypress-only — the spec asserts the inline style includes border.
 */
export async function highlight(locator: Locator): Promise<void> {
  await locator.evaluate((el) => {
    const html = el as HTMLElement;
    html.style.border = "3px solid red";
    html.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
  });
}
