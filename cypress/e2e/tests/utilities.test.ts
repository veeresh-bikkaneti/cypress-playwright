/**
 * ============================================================================
 * CYPRESS RUNTIME + MISC COMMANDS
 * ============================================================================
 *
 * PURPOSE:
 * One test per Cypress runtime helper / leftover E2E command that does not
 * belong in actions, traversal, network, or storage specs.
 *
 * SKIPPED ON PURPOSE (not E2E AUT capabilities):
 * - cy.mount() — component-testing runner
 * - cy.pause() — interactive only; would hang headless
 * - cy.prompt() / cy.press() — Cypress 15+ APIs (this repo pins Cypress 12)
 *
 * Playwright twin: playwright/e2e/utilities.spec.ts (migrated where the AUT
 * can observe the same outcome; Cypress-only runtime helpers stay Cypress).
 */

describe("Cypress utilities and leftover commands", () => {
  it("cy.screenshot() captures the home page", () => {
    cy.visit("/");
    cy.screenshot("utilities-home", { capture: "viewport" });
    cy.getByTestId("main-heading").should("be.visible");
  });

  it("cy.document() yields the document", () => {
    cy.visit("/");
    cy.document().should("have.property", "readyState", "complete");
  });

  it("Cypress.config() and Cypress.env() are readable", () => {
    expect(Cypress.config("baseUrl")).to.include("localhost:3000");
    expect(Cypress.config("viewportWidth")).to.eq(1280);
    cy.visit("/");
    cy.getByTestId("main-heading").should("be.visible");
  });

  it("Cypress.browser / platform / version / spec are defined", () => {
    expect(Cypress.browser.name).to.be.oneOf([
      "chrome",
      "electron",
      "firefox",
      "edge",
    ]);
    expect(Cypress.platform).to.be.a("string").and.not.be.empty;
    expect(Cypress.version).to.match(/^\d+\./);
    expect(Cypress.spec.name).to.eq("utilities.test.ts");
    expect(Cypress.testingType).to.eq("e2e");
    cy.visit("/");
    cy.getByTestId("main-heading").should(
      "contain",
      "Cypress Test Application",
    );
  });

  it("Cypress.isCy() distinguishes the chainable from a plain object", () => {
    expect(Cypress.isCy(cy)).to.eq(true);
    expect(Cypress.isCy({})).to.eq(false);
    cy.visit("/");
    cy.getByTestId("main-heading").should("be.visible");
  });

  it("Cypress._ lodash helper", () => {
    expect(Cypress._.camelCase("drag and drop")).to.eq("dragAndDrop");
    expect(Cypress._.min([3, 1, 2])).to.eq(1);
  });

  it("Cypress.minimatch helper", () => {
    expect(Cypress.minimatch("/api/products/1", "/api/products/*")).to.eq(true);
  });

  it("Cypress.Promise resolves", () => {
    cy.wrap(null)
      .then(() => {
        return Cypress.Promise.resolve(21).then((n) => n * 2);
      })
      .should("eq", 42);
  });

  it("Cypress.Blob and Cypress.Buffer build a file payload", () => {
    const buf = Cypress.Buffer.from("abc");
    expect(buf.toString()).to.eq("abc");
    cy.wrap(null)
      .then(() =>
        Cypress.Blob.base64StringToBlob(buf.toString("base64"), "text/plain"),
      )
      .should((blob) => {
        expect(blob.size).to.be.greaterThan(0);
      });
  });

  it("Cypress.$ queries the document", () => {
    cy.visit("/");
    cy.document().then((doc) => {
      const heading = Cypress.$(doc).find("[data-testid=main-heading]");
      expect(heading.text()).to.contain("Cypress Test Application");
    });
  });

  it("Cypress.dom.isVisible / isElement", () => {
    cy.visit("/");
    cy.getByTestId("main-heading").then(($el) => {
      expect(Cypress.dom.isElement($el)).to.eq(true);
      expect(Cypress.dom.isVisible($el)).to.eq(true);
    });
  });

  it("Cypress.sinon spies on the AUT fetch for products", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.spy(win, "fetch").as("fetchSpy");
      },
    });
    cy.getByTestId("product-card").should("have.length.gt", 0);
    cy.get("@fetchSpy").should("have.been.called");
  });

  it("Cypress.log is callable and home still loads", () => {
    Cypress.log({ name: "capability", message: "utilities" });
    cy.visit("/");
    cy.getByTestId("main-heading").should(
      "contain",
      "Cypress Test Application",
    );
  });

  it("cy.debug() is callable in headless (does not pause)", () => {
    cy.visit("/");
    cy.getByTestId("main-heading").debug().should("be.visible");
  });

  it("custom commands: getByTestId, typeAndClear, shouldHaveData, highlight", () => {
    cy.visit("/actions");
    cy.getByTestId("alias-input")
      .shouldHaveData("field", "alias")
      .highlight()
      .typeAndClear("temp");
    cy.getByTestId("alias-input").should("have.value", "");
    cy.getByTestId("alias-input")
      .should("have.attr", "style")
      .and("include", "border");
  });

  it("Cypress.currentTest and Cypress.currentRetry are defined", () => {
    expect(Cypress.currentTest.title).to.be.a("string").and.have.length.gt(0);
    expect(Cypress.currentRetry).to.eq(0);
    cy.visit("/");
    cy.getByTestId("main-heading").should("be.visible");
  });

  it("Cypress.Cookies.debug() is callable", () => {
    Cypress.Cookies.debug(true);
    cy.setCookie("debugCookie", "1");
    cy.getCookie("debugCookie").should("exist");
    Cypress.Cookies.debug(false);
  });

  it("Cypress.Keyboard.defaults() sets keystrokeDelay", () => {
    Cypress.Keyboard.defaults({ keystrokeDelay: 0 });
    cy.visit("/actions");
    cy.getByTestId("key-input").type("ab");
    cy.getByTestId("key-input").should("have.value", "ab");
  });

  it("Cypress.Screenshot.defaults() still allows a real screenshot", () => {
    Cypress.Screenshot.defaults({ screenshotOnRunFailure: true });
    cy.visit("/");
    cy.screenshot("defaults-probe", { capture: "viewport" });
    cy.getByTestId("main-heading").should(
      "contain",
      "Cypress Test Application",
    );
  });

  it("overwritten cy.visit() still loads home", () => {
    cy.visit("/");
    cy.getByTestId("main-heading").should("be.visible");
  });
});
