describe("Cross-Origin Testing", () => {
  it("secondary origin serves the same AUT title", () => {
    cy.visit("/");
    cy.getByTestId("main-heading").should("be.visible");
    cy.visit("http://127.0.0.1:3002/");
    cy.origin("http://127.0.0.1:3002", () => {
      cy.title().should("include", "Cypress Test Application");
      cy.get("[data-testid=main-heading]").should("be.visible");
    });
  });

  it("secondary origin login form accepts the fixture email", () => {
    cy.fixture("users.json").then((users) => {
      const email = users.valid_credentials.emailId as string;
      cy.visit("http://127.0.0.1:3002/login");
      cy.origin(
        "http://127.0.0.1:3002",
        { args: { email } },
        ({ email: fixtureEmail }) => {
          cy.get("[data-testid=email-input]").type(fixtureEmail);
          cy.get("[data-testid=email-input]").should(
            "have.value",
            fixtureEmail,
          );
          cy.get("[data-testid=login-container]").should("be.visible");
        },
      );
    });
  });
});
