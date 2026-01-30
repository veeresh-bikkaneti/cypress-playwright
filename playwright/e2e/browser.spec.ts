import { test, expect } from '@playwright/test';

// ============================================================================
// BROWSER TESTING - Viewport, Scroll, Window & Document
// ============================================================================

test.describe('Browser Testing - Viewport, Scroll & Navigation', () => {

    // ==========================================================================
    // Viewport Testing
    // ==========================================================================

    test.describe('Viewport Testing', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
        });

        test('should set viewport by dimensions', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await expect(page.getByTestId('main-heading')).toBeVisible();
        });

        test('should test mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
            // Check if nav becomes a hamburger or specific mobile element exists
            // Assuming main-nav is visible in this responsive design
            await expect(page.getByTestId('main-nav')).toBeVisible();
        });

        test('should test tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await expect(page.getByTestId('products-grid')).toBeVisible();
        });

        test('should test landscape orientation', async ({ page }) => {
            // Playwright handles orientation via viewport dimensions usually, or mobile emulation context
            await page.setViewportSize({ width: 667, height: 375 });
            await expect(page.getByTestId('main-heading')).toBeVisible();
        });
    });

    // ==========================================================================
    // Scroll Control
    // ==========================================================================

    test.describe('Scroll Control', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
        });

        test('should scroll to specific position', async ({ page }) => {
            await page.evaluate(() => window.scrollTo(0, 500));
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toBeGreaterThan(0);
        });

        test('should scroll to bottom and top of page', async ({ page }) => {
            // Scroll to bottom
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await expect(page.getByTestId('scroll-section')).toBeVisible();

            // Scroll to top
            await page.evaluate(() => window.scrollTo(0, 0));
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toEqual(0);
        });

        test('should scroll element into view', async ({ page }) => {
            const el = page.getByTestId('scroll-section');
            await el.scrollIntoViewIfNeeded();
            await expect(el).toBeVisible();
        });
    });

    // ==========================================================================
    // Page Info (Title, URL)
    // ==========================================================================

    test.describe('Page Info Assertions', () => {
        test('should assert page title', async ({ page }) => {
            await page.goto('/');
            await expect(page).toHaveTitle(/Cypress Test Application/);
        });

        test('should assert URL', async ({ page }) => {
            await page.goto('/login');
            await expect(page).toHaveURL(/.*\/login/);
        });

        test('should assert query parameters', async ({ page }) => {
            await page.goto('/?filter=active&sort=date');
            expect(page.url()).toContain('filter=active');
            expect(page.url()).toContain('sort=date');
        });
    });

    // ==========================================================================
    // Navigation
    // ==========================================================================

    test.describe('Navigation Control', () => {
        test('should navigate back and forward in history', async ({ page }) => {
            await page.goto('/');
            await page.goto('/login');
            await page.goBack();
            expect(page.url()).not.toContain('/login');

            await page.goForward();
            expect(page.url()).toContain('/login');
        });

        test('should reload the page', async ({ page }) => {
            await page.goto('/');

            // State change
            await page.getByTestId('load-content-btn').click();
            await expect(page.getByTestId('loaded-content')).toBeVisible();

            await page.reload();
            await expect(page.getByTestId('loaded-content')).not.toContainText('Content Loaded Successfully');
        });
    });
});
