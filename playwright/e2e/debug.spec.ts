import { test, expect } from '@playwright/test';

test.describe('Debug Page Load', () => {
    test('should load home page and print title', async ({ page }) => {
        await page.goto('/');

        const title = await page.title();
        console.log('Page Title:', title);

        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('Body Text Length:', bodyText.length);
        console.log('Body Start:', bodyText.substring(0, 100));

        await expect(page.getByTestId('main-heading')).toBeVisible({ timeout: 10000 });
    });
});
