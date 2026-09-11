/**
 * cy.clock / cy.tick against the AUT time widget on `/`.
 * Do not inject a DOM node from the test — that is a fake.
 */
describe("Time Manipulation", () => {
  it("freezes the AUT client clock", () => {
    const now = new Date("2023-01-01T00:00:00.000Z");
    cy.clock(now.getTime(), ["Date", "setTimeout", "setInterval"]);
    cy.visit("/");
    cy.getByTestId("client-clock").should("contain", "2023-01-01");
  });

  it("ticks the AUT delayed banner without waiting 5s", () => {
    cy.clock(new Date("2023-01-01T00:00:00.000Z").getTime(), [
      "Date",
      "setTimeout",
      "setInterval",
    ]);
    cy.visit("/");
    cy.getByTestId("delayed-banner").should("not.be.visible");
    cy.getByTestId("delayed-banner-btn").click();
    cy.getByTestId("delayed-banner").should("not.be.visible");
    cy.tick(5000);
    cy.getByTestId("delayed-banner")
      .should("be.visible")
      .and("contain", "Timeout Complete");
  });
});
