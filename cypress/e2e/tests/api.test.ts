/**
 * ============================================================================
 * API TESTING - Network Interception & Direct API Requests
 * ============================================================================
 *
 * PURPOSE:
 * Demonstrates Cypress's powerful network capabilities including:
 * - cy.intercept() - Mock/stub API responses
 * - cy.request() - Direct API testing (bypasses UI)
 * - cy.wait() - Wait for network requests
 * - Request/Response assertions
 * - Fixture-based response mocking
 *
 * TEST FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         API TESTING FLOW                                │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────┐    cy.intercept()     ┌─────────────┐                 │
 * │  │   Browser   │ ◄──────────────────── │   Cypress   │                 │
 * │  │   Request   │                       │   Stub      │                 │
 * │  └─────────────┘                       └─────────────┘                 │
 * │        │                                                               │
 * │        │ cy.request()                                                  │
 * │        ▼                                                               │
 * │  ┌─────────────┐                       ┌─────────────┐                 │
 * │  │   API       │ ◄──────────────────── │   Direct    │                 │
 * │  │   Server    │                       │   Request   │                 │
 * │  └─────────────┘                       └─────────────┘                 │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @author Veeresh Bikkaneti
 */

describe("API Testing - Network Capabilities", () => {
  const validLogin = () =>
    cy.fixture("users.json").then((data) => ({
      email: data.valid_credentials.emailId as string,
      password: data.valid_credentials.password as string,
    }));
  // ==========================================================================
  // cy.intercept() - Response Stubbing
  // ==========================================================================

  describe("cy.intercept() - Response Stubbing", () => {
    it("cy.intercept() stubs GET /api/products from a fixture", () => {
      cy.intercept("GET", "/api/products", { fixture: "products.json" }).as(
        "products",
      );
      cy.visit("/");
      cy.wait("@products").its("response.statusCode").should("eq", 200);
      cy.get("[data-testid=product-card]").should("have.length", 5);
      cy.contains("[data-testid=product-card]", "Premium Laptop").should(
        "be.visible",
      );
    });

    it("cy.intercept() stubs GET /api/products and the AUT renders the stub", () => {
      cy.intercept("GET", "/api/products", {
        body: {
          products: [{ id: 99, name: "Stub Widget", price: 1, inStock: true }],
          total: 1,
        },
      }).as("products");
      cy.visit("/");
      cy.wait("@products");
      cy.contains("[data-testid=product-card]", "Stub Widget").should(
        "be.visible",
      );
      cy.get("[data-testid=product-card]").should("have.length", 1);
    });

    it("cy.intercept() matches a URL pattern", () => {
      cy.intercept("GET", "**/api/products*").as("products");
      cy.visit("/");
      cy.wait("@products").its("request.method").should("eq", "GET");
    });

    it("cy.intercept() returns an empty list", () => {
      cy.intercept("GET", "/api/products", {
        body: { products: [], total: 0 },
      }).as("empty");
      cy.visit("/");
      cy.wait("@empty");
      cy.get("[data-testid=products-grid]").should("exist");
      cy.get("[data-testid=product-card]").should("have.length", 0);
    });

    it("cy.intercept() delays the response", () => {
      cy.intercept("GET", "/api/products", (req) => {
        req.reply({
          delay: 400,
          body: {
            products: [{ id: 1, name: "Slow Widget", price: 2, inStock: true }],
            total: 1,
          },
        });
      }).as("slow");
      cy.visit("/");
      cy.wait("@slow")
        .its("response.body.products.0.name")
        .should("eq", "Slow Widget");
    });

    it("cy.intercept() stubs an error body the AUT surfaces", () => {
      cy.intercept("GET", "/api/products", {
        statusCode: 500,
        body: { error: "boom" },
      }).as("fail");
      cy.visit("/");
      cy.wait("@fail");
      cy.get("[data-testid=products-grid]").should(
        "contain",
        "Failed to load products",
      );
    });

    it("cy.intercept() asserts the outgoing login request body", () => {
      validLogin().then((creds) => {
        cy.intercept("POST", "/api/auth/login").as("login");
        cy.visit("/login");
        cy.get('[data-testid="email-input"]').type(creds.email);
        cy.get('[data-testid="password-input"]').type(creds.password);
        cy.get('[data-testid="submit-btn"]').click();
        cy.wait("@login").its("request.body").should("deep.include", {
          email: creds.email,
          password: creds.password,
        });
        cy.url().should("include", "/dashboard");
      });
    });

    it("cy.interceptAndWait visits home and waits for products", () => {
      cy.interceptAndWait("GET", "/api/products", "getProducts", "/");
      cy.get("[data-testid=product-card]").should("have.length.gt", 0);
    });
  });

  // ==========================================================================
  // cy.request() - Direct API Testing
  // ==========================================================================

  describe("cy.request() - Direct API Testing", () => {
    /**
     * Basic GET request
     */
    it("should make direct GET request", () => {
      cy.request("GET", "/api/products").then((response) => {
        // Assert status code
        expect(response.status).to.eq(200);

        // Assert response body
        expect(response.body).to.have.property("products");
        expect(response.body.products).to.be.an("array");
        expect(response.body.products.length).to.be.greaterThan(0);

        // Assert headers - lower case for consistency
        expect(response.headers).to.have.property("content-type");
      });
    });

    /**
     * POST request with body
     */
    it("should make POST request with JSON body", () => {
      validLogin().then((creds) => {
        cy.request({
          method: "POST",
          url: "/api/auth/login",
          body: creds,
          headers: {
            "Content-Type": "application/json",
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("token");
          expect(response.body).to.have.property("user");
        });
      });
    });

    /**
     * Handle error responses
     */
    it("should handle error responses", () => {
      cy.request({
        method: "POST",
        url: "/api/auth/login",
        body: {
          email: "invalid@example.com",
          password: "wrongpassword",
        },
        failOnStatusCode: false, // Don't fail on 4xx/5xx
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property("error");
      });
    });

    /**
     * Chain API requests
     */
    it("should chain multiple API requests", () => {
      validLogin()
        .then((creds) => {
          return cy.request({
            method: "POST",
            url: "/api/auth/login",
            body: creds,
          });
        })
        .then((loginResponse) => {
          const token = loginResponse.body.token;
          return cy.request({
            method: "POST",
            url: "/api/orders",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              items: [{ productId: 1, quantity: 2 }],
            },
          });
        })
        .then((orderResponse) => {
          expect(orderResponse.status).to.be.oneOf([200, 201]);
          expect(orderResponse.body).to.have.property("order");
        });
    });

    /**
     * Test API endpoint error codes
     */
    it("should validate various HTTP error codes", () => {
      // Test actual available error endpoint or just invalid routes
      const errorCodes = [404];

      errorCodes.forEach((code) => {
        cy.request({
          method: "GET",
          url: `/api/non-existent-endpoint-${code}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(404);
        });
      });
    });

    /**
     * Use cy.request() for test setup
     */
    it("should use API for test setup (bypass UI)", () => {
      validLogin().then((creds) => {
        cy.request({
          method: "POST",
          url: "/api/auth/login",
          body: creds,
        }).then((response) => {
          cy.visit("/dashboard", {
            onBeforeLoad(win) {
              win.localStorage.setItem("authToken", response.body.token);
              win.localStorage.setItem(
                "user",
                JSON.stringify(response.body.user),
              );
            },
          });
          cy.getByTestId("user-email").should("contain", creds.email);
        });
      });
    });

    /**
     * Why Cypress #Other — canonical cy.request POST:
     * https://docs.cypress.io/app/get-started/why-cypress#Other
     */
    it("adds a todo via cy.request POST (Why Cypress #Other)", () => {
      cy.request("POST", "/api/todos", { title: "Write API Tests" })
        .its("body")
        .should("contain", { title: "Write API Tests" });
    });

    it("returns 400 when the todo title is missing", () => {
      cy.request({
        method: "POST",
        url: "/api/todos",
        body: {},
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });

    it("cy.request reads live /api/error status codes", () => {
      [400, 401, 404, 500].forEach((code) => {
        cy.request({
          method: "GET",
          url: `/api/error/${code}`,
          failOnStatusCode: false,
        })
          .its("status")
          .should("eq", code);
      });
    });

    it("cy.api() (cypress-plugin-api) posts a todo", () => {
      cy.api({
        method: "POST",
        url: "/api/todos",
        body: { title: "Plugin API Tests" },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.contain({ title: "Plugin API Tests" });
      });
    });
  });

  // ==========================================================================
  // cy.wait() - aliased network requests (see intercept suite above)
  // Direct cy.request checks live here; do not confuse with cy.wait(ms).
  // ==========================================================================

  describe("Live endpoint health (cy.request)", () => {
    /**
     * Wait for aliased request
     */
    it("should verify products API responsiveness", () => {
      const start = Date.now();
      cy.request("/api/products").then((res) => {
        const duration = Date.now() - start;
        expect(res.status).to.eq(200);
        expect(res.duration).to.be.lessThan(2000);
        expect(res.body.products).to.have.length.gt(0);
      });
    });

    /**
     * Wait for multiple requests
     */
    it("should verify multiple critical endpoints", () => {
      // Verify critical endpoints are up
      cy.request("/api/products").its("status").should("eq", 200);
      // We don't guarantee /api/time exists so just check root or health if exists
      cy.request("/").its("status").should("eq", 200);
    });

    /**
     * Wait with timeout
     */
    it("should handle manual fetch requests", () => {
      // Manually trigger a fetch to verify browser API works
      cy.window().then((win) => {
        return win
          .fetch("/api/products")
          .then((res) => {
            expect(res.status).to.eq(200);
            return res.json();
          })
          .then((data) => {
            expect(data.products).to.be.an("array");
          });
      });
    });
  });
});
