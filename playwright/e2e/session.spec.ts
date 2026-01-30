import { test, expect } from '@playwright/test';

// ============================================================================
// SESSION TESTING - Caching Authentication State
// ============================================================================

test.describe('Session Testing - Caching / Restore', () => {

    const testUser = {
        email: 'test@example.com',
        password: 'password123'
    };

    /**
     * Simple login helper for Playwright
     */
    async function login(page: any) {
        await page.goto('/login');
        await page.getByTestId('email-input').fill(testUser.email);
        await page.getByTestId('password-input').fill(testUser.password);
        await page.getByTestId('submit-btn').click();
        await expect(page).toHaveURL(/.*\/dashboard/);
    }

    test('should log in for Test 1', async ({ page }) => {
        await login(page);
        await page.goto('/dashboard');
        await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('should demonstrate session restore concept (Playwright uses storageState)', async ({ page }) => {
        // In Playwright, you typically save storage state to a file and reuse it.
        // For this migration parity, we will just login again, but in a real PW suite, 
        // you would use test.use({ storageState: 'auth.json' }).
        await login(page);
        await page.goto('/dashboard');
        await expect(page.getByTestId('page-title')).toContainText('Dashboard');
        await expect(page.getByTestId('sidebar')).toBeVisible();
    });

    test('should allow navigation with session', async ({ page }) => {
        await login(page);
        await page.goto('/dashboard');
        await page.getByTestId('nav-orders').click();
        await expect(page.getByTestId('orders-section')).toBeVisible();
    });

    test('should handle session clearing', async ({ page }) => {
        await login(page);

        // Clear context (cookies/storage)
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.evaluate(() => sessionStorage.clear());

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*\/login/);
    });
});
