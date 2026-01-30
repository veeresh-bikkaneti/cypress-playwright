import { test, expect } from '@playwright/test';

// ============================================================================
// API TESTING - Network Interception & Direct API Requests
// ============================================================================

test.describe('API Testing - Network Capabilities', () => {

    // ==========================================================================
    // page.route() - Response Stubbing (Equivalent to cy.intercept)
    // ==========================================================================

    test.describe('page.route() - Response Stubbing', () => {

        test('should load and display products from API', async ({ page }) => {
            await page.goto('/');

            // Verify real products load from API
            // Verify real products load from API
            // Wait for at least one product to appear
            await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

            const count = await page.locator('[data-testid="product-card"]').count();
            expect(count).toBeGreaterThan(0);

            const firstCard = page.locator('[data-testid="product-card"]').first();
            await expect(firstCard.locator('h3')).toHaveCount(1);
            await expect(firstCard.locator('.price')).toHaveCount(1);
        });

        test('should display multiple products - mocked', async ({ page }) => {
            // Mock the API response
            await page.route('**/api/products', async route => {
                const json = {
                    products: [
                        { id: 1, name: 'Product A', price: 10 },
                        { id: 2, name: 'Product B', price: 20 }
                    ]
                };
                await route.fulfill({ json });
            });

            await page.goto('/');

            // Verify multiple products are displayed
            const count = await page.locator('[data-testid="product-card"]').count();
            expect(count).toBeGreaterThan(1);
        });

        test('should match URL patterns for products endpoint', async ({ page }) => {
            // Setup listener to verify call
            const requestPromise = page.waitForRequest('**/api/products');
            await page.goto('/');
            await requestPromise;
            await expect(page.locator('body')).toBeVisible();
        });

        test('should display product details correctly - mocked', async ({ page }) => {
            await page.route('**/api/products', async route => {
                const json = {
                    products: [
                        { id: 1, name: 'Mock Product', price: 99.00 }
                    ]
                };
                await route.fulfill({ json });
            });

            await page.goto('/');

            const firstCard = page.locator('[data-testid="product-card"]').first();
            await expect(firstCard.locator('h3')).not.toBeEmpty();
            await expect(firstCard.locator('.price')).toContainText('$');
        });

        test('should load products quickly', async ({ page }) => {
            const start = Date.now();
            await page.goto('/');
            await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 3000 });
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(5000); // Relaxed timeout for Playwright execution
        });

        test('should handle empty result set from API', async ({ page }) => {
            // Force empty response
            await page.route('**/api/products*', async route => {
                await route.fulfill({ json: { products: [] } });
            });

            await page.goto('/?minPrice=1000000');

            // Grid should exist but be empty
            // Grid should exist but be empty
            await expect(page.locator('[data-testid="product-card"]')).toHaveCount(0);
        });
    });

    // ==========================================================================
    // request.newContext() - Direct API Testing (Equivalent to cy.request)
    // ==========================================================================

    test.describe('Direct API Testing', () => {

        test('should make direct GET request', async ({ request }) => {
            const response = await request.get('/api/products');
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body).toHaveProperty('products');
            expect(Array.isArray(body.products)).toBeTruthy();
            expect(body.products.length).toBeGreaterThan(0);

            const headers = response.headers();
            expect(headers['content-type']).toBeDefined();
        });

        test('should make POST request with JSON body', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: {
                    email: 'test@example.com',
                    password: 'password123'
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty('token');
            expect(body).toHaveProperty('user');
        });

        test('should handle error responses', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: {
                    email: 'invalid@example.com',
                    password: 'wrongpassword'
                }
            });
            expect(response.status()).toBe(401);
            const body = await response.json();
            expect(body).toHaveProperty('error');
        });

        test('should chain multiple API requests', async ({ request }) => {
            // 1. Login
            const loginRes = await request.post('/api/auth/login', {
                data: { email: 'test@example.com', password: 'password123' }
            });
            const loginBody = await loginRes.json();
            const token = loginBody.token;

            // 2. Create Order
            const orderRes = await request.post('/api/orders', {
                headers: { Authorization: `Bearer ${token}` },
                data: { items: [{ productId: 1, quantity: 2 }] }
            });

            expect([200, 201]).toContain(orderRes.status());
            const orderBody = await orderRes.json();
            expect(orderBody).toHaveProperty('order');
        });

        test('should validate various HTTP error codes', async ({ request }) => {
            const response = await request.get('/api/non-existent-endpoint-404');
            expect(response.status()).toBe(404);
        });
    });
});
