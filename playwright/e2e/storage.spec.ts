import { test, expect } from '@playwright/test';

// ============================================================================
// STORAGE TESTING - Cookies, localStorage & sessionStorage
// ============================================================================

test.describe('Storage Testing - Cookies & Local Storage', () => {

    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('/'); // Must visit domain to access localstorage
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // Setup mock auth
        await page.evaluate(() => {
            localStorage.setItem('authToken', 'mock-token');
            localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User', email: 'test@example.com' }));
        });
    });

    // ==========================================================================
    // Cookie Management
    // ==========================================================================

    test.describe('Cookie Management', () => {
        test('should set and get a cookie', async ({ page }) => {
            await page.context().addCookies([{
                name: 'testCookie', value: 'testValue', url: 'http://localhost:3000/'
            }]);

            const cookies = await page.context().cookies('http://localhost:3000/');
            const cookie = cookies.find(c => c.name === 'testCookie');
            expect(cookie).toBeDefined();
            expect(cookie?.value).toBe('testValue');
        });

        test('should basic cookie operations', async ({ page }) => {
            // Set multiple
            await page.context().addCookies([
                { name: 'cookie1', value: 'value1', url: 'http://localhost:3000/' },
                { name: 'cookieToDelete', value: 'value', url: 'http://localhost:3000/' }
            ]);

            // Clear all
            await page.context().clearCookies();
            const cookies = await page.context().cookies('http://localhost:3000/');
            expect(cookies.length).toBe(0);
        });
    });

    // ==========================================================================
    // localStorage Management
    // ==========================================================================

    test.describe('localStorage Management', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/dashboard');
        });

        test('should set and get localStorage item', async ({ page }) => {
            await page.evaluate(() => localStorage.setItem('testKey', 'testValue'));
            const val = await page.evaluate(() => localStorage.getItem('testKey'));
            expect(val).toBe('testValue');
        });

        test('should store complex object in localStorage', async ({ page }) => {
            const userData = { id: 1, name: 'Test User', preferences: { theme: 'dark', lang: 'en' } };
            await page.evaluate(data => localStorage.setItem('userData', JSON.stringify(data)), userData);

            const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('userData')!));
            expect(stored).toEqual(userData);
        });

        test('should clear specific localStorage key', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('toDelete', 'value');
                localStorage.setItem('toKeep', 'value');
                localStorage.removeItem('toDelete');
            });

            const toDelete = await page.evaluate(() => localStorage.getItem('toDelete'));
            const toKeep = await page.evaluate(() => localStorage.getItem('toKeep'));

            expect(toDelete).toBeNull();
            expect(toKeep).toBe('value');
        });

        test('should use UI buttons to test storage', async ({ page }) => {
            await page.getByTestId('set-storage-btn').click();

            const val = await page.evaluate(() => localStorage.getItem('testKey'));
            expect(val).toBe('cypress-test-value'); // keeping value same as app logic (assuming app uses this value)

            await expect(page.getByTestId('storage-result')).toContainText('localStorage set');
        });
    });

    // ==========================================================================
    // sessionStorage Management
    // ==========================================================================

    test.describe('sessionStorage Management', () => {
        test('should set and get sessionStorage item', async ({ page }) => {
            await page.goto('/');
            await page.evaluate(() => sessionStorage.setItem('sessionKey', 'sessionValue'));
            const val = await page.evaluate(() => sessionStorage.getItem('sessionKey'));
            expect(val).toBe('sessionValue');
        });
    });
});
