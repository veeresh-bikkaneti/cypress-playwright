/**
 * ACCESSIBILITY — Why Cypress Solutions example
 *
 * Official example from https://docs.cypress.io/app/get-started/why-cypress
 * uses an in-spec alt assertion (not Cypress Accessibility Cloud):
 *
 *   cy.get('img#logo').should('have.attr', 'alt', 'Cypress Logo')
 *
 * Playwright twin: playwright/e2e/a11y.spec.ts
 */

describe("Accessibility (Why Cypress in-spec checks)", () => {
  it("home logo has the documented alt text", () => {
    cy.visit("/");
    cy.get("img#logo").should("have.attr", "alt", "Cypress Logo");
    cy.getByTestId("app-logo").should("have.attr", "alt", "Cypress Logo");
  });

  it("main nav exposes a navigation landmark", () => {
    cy.visit("/");
    cy.getByTestId("main-nav")
      .should("have.attr", "role", "navigation")
      .and("have.attr", "aria-label", "Main navigation");
  });

  it("login fields are labelled and failed login uses role=alert", () => {
    cy.visit("/login");
    cy.getByTestId("email-input").should("have.attr", "aria-labelledby");
    cy.getByTestId("password-input").should("have.attr", "aria-labelledby");
    cy.getByTestId("email-input").type("nobody@example.com");
    cy.getByTestId("password-input").type("wrongpassword");
    cy.getByTestId("submit-btn").click();
    cy.getByTestId("login-alert")
      .should("have.attr", "role", "alert")
      .and("be.visible")
      .and("not.be.empty");
  });
});
