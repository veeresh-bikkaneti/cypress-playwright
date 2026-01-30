import { test, expect } from '@playwright/test';

// ============================================================================
// GRAPHQL API TESTING
// ============================================================================

test.describe('GraphQL API Testing', () => {

    // ========================================================================
    // GraphQL Queries (Direct Request)
    // ========================================================================

    test.describe('GraphQL Queries', () => {

        test('should fetch products using GraphQL query', async ({ request }) => {
            const response = await request.post('/api/graphql', {
                data: {
                    query: `
                        query GetProducts {
                            products {
                                id
                                name
                                price
                                category
                                inStock
                            }
                        }
                    `
                }
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(body.data.products.length).toBeGreaterThan(0);

            const firstProduct = body.data.products[0];
            expect(firstProduct).toHaveProperty('id');
            expect(firstProduct).toHaveProperty('name');
        });

        test('should fetch single product by ID', async ({ request }) => {
            const response = await request.post('/api/graphql', {
                data: {
                    query: `
                        query GetProduct($id: Int!) {
                            product(id: $id) {
                                id
                                name
                                price
                            }
                        }
                    `,
                    variables: { id: 1 }
                }
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.product).toBeDefined();
            expect(body.data.product.id).toBe(1);
        });
    });

    // ========================================================================
    // Authenticated GraphQL
    // ========================================================================

    test.describe('Authenticated GraphQL Queries', () => {
        let authToken: string;

        test.beforeAll(async ({ request }) => {
            const res = await request.post('/api/auth/login', {
                data: { email: 'test@example.com', password: 'password123' }
            });
            const body = await res.json();
            authToken = body.token;
        });

        test('should fetch current user with authentication', async ({ request }) => {
            const response = await request.post('/api/graphql', {
                headers: { Authorization: `Bearer ${authToken}` },
                data: {
                    query: `
                        query GetCurrentUser {
                            user {
                                    id
                                    email
                                    name
                            }
                        }
                    `
                }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.user.email).toBe('test@example.com');
        });
    });

    // ========================================================================
    // Intercepting GraphQL Requests (Mocking)
    // ========================================================================

    test.describe('Intercepting GraphQL', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
        });

        test('should intercept and mock GraphQL products query', async ({ page }) => {
            await page.route('**/api/graphql', async route => {
                const request = route.request();
                const postData = request.postDataJSON();

                // Check if it's the products query
                if (postData.query && postData.query.includes('products')) {
                    await route.fulfill({
                        json: {
                            data: {
                                products: [
                                    { id: 99, name: 'Mocked Product', price: 1.99, category: 'Test', inStock: true }
                                ]
                            }
                        }
                    });
                } else {
                    await route.continue();
                }
            });

            // Trigger request (using evaluate to mimic app behavior or just manual fetch)
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ products { id name price } }' })
                });
                return res.json();
            });

            expect(result.data.products[0].name).toBe('Mocked Product');
        });
    });
});
