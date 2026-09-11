describe("Debug Page Load", () => {
  it("should load home page and print title", () => {
    cy.visit("/");
    cy.title().should("include", "Cypress Test Application");
    cy.get("body").then(($body) => {
      cy.log("Body Text Length:", $body.text().length);
      cy.log("Body Start:", $body.text().substring(0, 100));
    });
    cy.get('[data-testid="main-heading"]', { timeout: 10000 })
      .should("be.visible")
      .and("contain", "Cypress Test Application");
    cy.getByTestId("product-card", { timeout: 10000 }).should(
      "have.length.gt",
      0,
    );
  });
});
