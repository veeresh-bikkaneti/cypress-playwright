---
applyTo: "playwright/**"
---

Follow root `AGENTS.md`. Load `skills/playwright-testing` when writing or healing specs.

- No `cy.*`. No `page.waitForTimeout`.
- Locators: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`.
- Page Object if the page has 3+ interactions.
- Auth via `storageState` or fixtures, not UI-login in every test.
- Await every action and assertion.
