/**
 * CUSTOM COMMAND CATALOG — every command hits the AUT
 *
 * Source of truth: cypress/support/commands.ts
 * Playwright twin: playwright/e2e/custom-commands.spec.ts
 * Command map:     docs/COMMAND_MAP.md
 *
 * Assertions are AUT-observable. No tautological assertions.
 */

describe("Custom commands", () => {
  beforeEach(function () {
    cy.fixture("users.json").then((data) => {
      this.data = data;
    });
  });

  it("cy.login lands on dashboard", function () {
    cy.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    cy.url().should("include", "/dashboard");
    cy.getByTestId("page-title").should("contain", "Dashboard");
  });

  it("cy.logout returns to login after login", function () {
    cy.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    cy.getByTestId("page-title").should("contain", "Dashboard");
    cy.logout();
    cy.url().should("include", "/login");
    cy.getByTestId("login-container").should("be.visible");
  });

  it("cy.getByTestId finds the home heading", () => {
    cy.visit("/");
    cy.getByTestId("main-heading")
      .should("be.visible")
      .and("contain", "Cypress Test Application");
  });

  it("cy.interceptAndWait waits for products on home", () => {
    cy.interceptAndWait("GET", "/api/products", "getProducts", "/");
    cy.getByTestId("product-card").should("have.length.gt", 0);
  });

  it("cy.typeAndClear types then empties alias-input", () => {
    cy.visit("/actions");
    cy.getByTestId("alias-input").typeAndClear("temporary text");
    cy.getByTestId("alias-input").should("have.value", "");
  });

  it("cy.shouldHaveData asserts data-field on alias-input", () => {
    cy.visit("/actions");
    cy.getByTestId("alias-input").shouldHaveData("field", "alias");
  });

  it("cy.highlight sets an inline border", () => {
    cy.visit("/actions");
    cy.getByTestId("alias-input").highlight();
    cy.getByTestId("alias-input")
      .should("have.attr", "style")
      .and("include", "border");
    cy.getByTestId("alias-input").should(
      "have.css",
      "border-top-style",
      "solid",
    );
  });

  it("cy.setAuthCookie authenticates GET /api/auth/me", function () {
    cy.request({
      method: "GET",
      url: "/api/auth/me",
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401);

    cy.request("POST", "/api/auth/login", {
      email: this.data.valid_credentials.emailId,
      password: this.data.valid_credentials.password,
    }).then((res) => {
      expect(res.body.token).to.be.a("string");
      cy.clearCookies();
      cy.request({
        method: "GET",
        url: "/api/auth/me",
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 401);

      cy.setAuthCookie(res.body.token);
      cy.request("GET", "/api/auth/me").then((me) => {
        expect(me.status).to.eq(200);
        expect(me.body.user.email).to.eq(this.data.valid_credentials.emailId);
      });
    });
  });

  it("cy.fruit finds Bananas on /dom", () => {
    cy.visit("/dom");
    cy.fruit("Bananas").should("have.attr", "data-testid", "item-bananas");
    cy.getByTestId("item-bananas")
      .should("be.visible")
      .and("contain", "Bananas");
  });

  it("cy.api posts a todo", () => {
    cy.api({
      method: "POST",
      url: "/api/todos",
      body: { title: "cmd" },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property("title", "cmd");
    });
  });

  it("overwritten cy.visit still loads home", () => {
    cy.visit("/");
    cy.getByTestId("main-heading")
      .should("be.visible")
      .and("contain", "Cypress Test Application");
  });
});
