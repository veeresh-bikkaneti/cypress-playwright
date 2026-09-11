/**
 * Migrated from: cypress/e2e/tests/graphql.test.ts
 * AUT-real GraphQL cases only. The Cypress spy-fallback (POST always exists)
 * is not twinned.
 */
import { test, expect } from "@playwright/test";
import { testData } from "../fixtures/test-data";

test.describe("GraphQL API Testing", () => {
  test.describe("GraphQL Queries", () => {
    test("should fetch products using GraphQL query", async ({ request }) => {
      const response = await request.post("/api/graphql", {
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
          `,
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.products.length).toBeGreaterThan(0);
      const firstProduct = body.data.products[0];
      expect(firstProduct).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          name: expect.any(String),
          price: expect.any(Number),
          category: expect.any(String),
          inStock: expect.any(Boolean),
        }),
      );
    });

    test("should fetch products with variables", async ({ request }) => {
      const response = await request.post("/api/graphql", {
        data: {
          query: `
            query GetProducts($limit: Int, $category: String) {
              products(limit: $limit, category: $category) {
                id
                name
                price
                category
              }
            }
          `,
          variables: { limit: 3, category: "Electronics" },
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.products.length).toBeLessThanOrEqual(3);
      for (const product of body.data.products) {
        expect(product.category).toBe("Electronics");
      }
    });

    test("should fetch single product by ID", async ({ request }) => {
      const response = await request.post("/api/graphql", {
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
          variables: { id: 1 },
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.product).toBeDefined();
      expect(body.data.product.id).toBe(1);
    });

    test("should return error for non-existent product", async ({
      request,
    }) => {
      const response = await request.post("/api/graphql", {
        data: {
          query: `
            query GetProduct($id: Int!) {
              product(id: $id) { id name }
            }
          `,
          variables: { id: 9999 },
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toContain("not found");
    });
  });

  test.describe("Authenticated GraphQL Queries", () => {
    let authToken: string;

    test.beforeAll(async ({ request }) => {
      const res = await request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
      });
      const body = await res.json();
      authToken = body.token;
    });

    test("should fetch current user with authentication", async ({
      request,
    }) => {
      const response = await request.post("/api/graphql", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          query: `
            query GetCurrentUser {
              user { id email name role }
            }
          `,
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.user.email).toBe(testData.validCredentials.emailId);
    });

    test("should return UNAUTHENTICATED error without token", async ({
      request,
    }) => {
      const response = await request.post("/api/graphql", {
        data: {
          query: `
            query GetCurrentUser {
              user { id email }
            }
          `,
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
      expect(body.errors[0].message).toContain("Authentication");
    });
  });

  test.describe("GraphQL Mutations", () => {
    let authToken: string;

    test.beforeAll(async ({ request }) => {
      const res = await request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
      });
      const body = await res.json();
      authToken = body.token;
    });

    test("should create order using mutation", async ({ request }) => {
      const response = await request.post("/api/graphql", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          query: `
            mutation CreateOrder($items: [OrderItemInput!]!) {
              createOrder(items: $items) {
                order { id total status }
                success
                message
              }
            }
          `,
          variables: {
            items: [
              { productId: 1, quantity: 2 },
              { productId: 2, quantity: 1 },
            ],
          },
        },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.createOrder.success).toBe(true);
      expect(body.data.createOrder.order.total).toBeGreaterThan(0);
    });

    test("should return error for empty order items", async ({ request }) => {
      const response = await request.post("/api/graphql", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          query: `
            mutation CreateOrder($items: [OrderItemInput!]!) {
              createOrder(items: $items) { success }
            }
          `,
          variables: { items: [] },
        },
      });
      const body = await response.json();
      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toContain("required");
    });
  });

  test.describe("Intercepting GraphQL", () => {
    test("should intercept and mock GraphQL products query", async ({
      page,
    }) => {
      await page.goto("/");
      await page.route("**/api/graphql", async (route) => {
        const postData = route.request().postDataJSON();
        if (postData.query && postData.query.includes("products")) {
          await route.fulfill({
            json: {
              data: {
                products: [
                  {
                    id: 99,
                    name: "Mocked Product",
                    price: 1.99,
                    category: "Test",
                    inStock: true,
                  },
                ],
              },
            },
          });
        } else {
          await route.continue();
        }
      });

      const result = await page.evaluate(async () => {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "{ products { id name price } }" }),
        });
        return res.json();
      });
      expect(result.data.products[0].name).toBe("Mocked Product");
    });
  });
});
