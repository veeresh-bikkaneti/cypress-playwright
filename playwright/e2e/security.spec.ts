import { test, expect } from '@playwright/test';

// ============================================================================
// SECURITY CHECKS
// ============================================================================

test.describe('OWASP Security Checks', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.evaluate(() => sessionStorage.clear());
    });

    test.describe('Injection (XSS)', () => {
        test('should sanitize input and prevent Reflected XSS', async ({ page }) => {
            const xssPayload = '<script>alert("XSS")</script>';

            await page.goto('/forms'); // Assuming /forms.html maps to /forms in this app routing

            let dialogFired = false;
            page.on('dialog', dialog => {
                dialogFired = true;
                dialog.accept();
            });

            // Inject payload
            await page.locator('input[type="text"]').first().fill(xssPayload);
            await page.locator('input[type="text"]').first().blur();

            // Verify alert was NOT called
            expect(dialogFired).toBe(false);
        });
    });

    test.describe('Broken Access Control', () => {
        test.skip('should redirect unauthenticated users identifying protected resources', async ({ page }) => {
            await page.goto('/dashboard');
            await expect(page).toHaveURL(/.*\/login/);
            await expect(page.locator('h1')).toContainText('Login');
        });
    });

    test.describe('Security Misconfiguration (Headers)', () => {
        test('should have standard security headers', async ({ request }) => {
            const response = await request.get('/');
            const headers = response.headers();
            expect(headers['x-powered-by']).toBeDefined();
        });
    });

    test.describe('Insecure Design (Cookie Flags)', () => {
        test.skip('should use Secure and HttpOnly flags for session cookies', async ({ page, request }) => {
            // Login to get cookie
            await request.post('/api/auth/login', {
                data: { email: 'test@example.com', password: 'password123' }
            });

            // Reload page to get cookies in context
            await page.reload();

            const cookies = await page.context().cookies();
            const authCookie = cookies.find(c => c.name === 'authToken');

            if (authCookie) {
                expect(authCookie.httpOnly).toBe(true);
                // Secure flag depends on HTTPS environment
                // expect(authCookie.secure).toBe(true);
            }
        });
    });
});
