/**
 * ============================================================================
 * QUERY + TRAVERSAL COMMANDS
 * ============================================================================
 *
 * PURPOSE:
 * One Cypress test per query/traversal/connector command against `/dom`.
 *
 * Playwright twin: playwright/e2e/traversal.spec.ts (migrated 1:1)
 */

describe("Query, traversal, and connectors", () => {
  beforeEach(() => {
    cy.visit("/dom");
  });

  describe("Queries", () => {
    it("cy.get() finds the tree root", () => {
      cy.get("[data-testid=tree-root]").should("be.visible");
    });

    it("cy.contains() finds fruit by text", () => {
      cy.contains("Bananas").should("have.attr", "data-testid", "item-bananas");
    });

    it("cy.get().first() / last() / eq()", () => {
      cy.get(".fruit").first().should("contain", "Apples");
      cy.get(".fruit").last().should("contain", "Oranges");
      cy.get(".fruit").eq(1).should("contain", "Bananas");
    });

    it("cy.get().filter() and cy.get().not()", () => {
      cy.get(".fruit").filter(".active").should("contain", "Oranges");
      cy.get(".fruit").not(".active").should("have.length", 2);
    });

    it("cy.get().find() walks descendants", () => {
      cy.getByTestId("item-apples").find(".variety").should("have.length", 2);
    });

    it("cy.focused() yields the active element", () => {
      cy.getByTestId("focus-input").focus();
      cy.focused().should("have.attr", "data-testid", "focus-input");
    });

    it("cy.root() yields the html element by default", () => {
      cy.root().should("match", "html");
      cy.getByTestId("tree-root").within(() => {
        cy.root().should("have.attr", "data-testid", "tree-root");
      });
    });

    it("cy.hash() reads the URL hash", () => {
      cy.visit("/dom#shadow-section");
      cy.hash().should("eq", "#shadow-section");
    });
  });

  describe("Traversal", () => {
    it("cy.children() returns direct children", () => {
      cy.getByTestId("tree-list").children("li").should("have.length", 3);
    });

    it("cy.parent() and cy.parents() and cy.closest()", () => {
      cy.getByTestId("item-fuji").parent().should("match", "ul");
      cy.getByTestId("item-fuji")
        .parents("nav")
        .should("have.attr", "data-testid", "tree-root");
      cy.getByTestId("item-fuji")
        .closest("[data-testid=tree-root]")
        .should("exist");
    });

    it("cy.next() / cy.prev() / cy.siblings()", () => {
      cy.getByTestId("item-apples").next().should("contain", "Bananas");
      cy.getByTestId("item-bananas").prev().should("contain", "Apples");
      cy.getByTestId("item-bananas").siblings().should("have.length", 2);
    });

    it("cy.nextAll() / cy.prevAll()", () => {
      cy.getByTestId("item-apples").nextAll().should("have.length", 2);
      cy.getByTestId("item-oranges").prevAll().should("have.length", 2);
    });

    it("cy.nextUntil() yields siblings up to the selector", () => {
      cy.getByTestId("item-apples")
        .nextUntil("[data-testid=item-oranges]")
        .should("have.length", 1)
        .and("contain", "Bananas");
    });

    it("cy.prevUntil() yields preceding siblings up to the selector", () => {
      cy.getByTestId("item-oranges")
        .prevUntil("[data-testid=item-apples]")
        .should("have.length", 1)
        .and("contain", "Bananas");
    });

    it("cy.parentsUntil() yields ancestors up to the selector", () => {
      cy.getByTestId("item-fuji")
        .parentsUntil("[data-testid=tree-root]")
        .should("have.length.gte", 2);
      cy.getByTestId("item-fuji")
        .parentsUntil("[data-testid=tree-root]", "ul")
        .should("exist");
    });
  });

  describe("Connectors", () => {
    it("cy.as() aliases an element", () => {
      cy.get(".fruit").first().as("firstFruit");
      cy.get("@firstFruit").should("contain", "Apples");
    });

    it("cy.wrap() wraps a plain object", () => {
      cy.wrap({ name: "Ada" }).its("name").should("eq", "Ada");
    });

    it("cy.its() reads a property", () => {
      cy.get(".fruit").its("length").should("eq", 3);
    });

    it("cy.invoke() calls a jQuery method", () => {
      cy.getByTestId("item-oranges")
        .invoke("text")
        .should("match", /Oranges/);
    });

    it("cy.each() iterates elements", () => {
      cy.get(".fruit").each(($el) => {
        expect($el.text().trim().length).to.be.greaterThan(0);
      });
    });

    it("cy.then() yields the subject to a callback", () => {
      cy.get(".fruit").then(($lis) => {
        expect($lis).to.have.length(3);
      });
    });

    it("cy.spread() unpacks an array subject", () => {
      cy.wrap(["Apples", "Bananas", "Oranges"]).spread((a, b, c) => {
        expect(a).to.eq("Apples");
        expect(b).to.eq("Bananas");
        expect(c).to.eq("Oranges");
      });
    });

    it("cy.within() scopes subsequent commands", () => {
      cy.getByTestId("tree-root").within(() => {
        cy.get(".active").should("contain", "Oranges");
        cy.contains("Fuji").should("be.visible");
      });
    });

    it("cy.fruit() addQuery finds a fruit by text", () => {
      cy.fruit("Bananas").should("have.attr", "data-testid", "item-bananas");
    });
  });

  describe("cy.shadow()", () => {
    it("clicks a button inside an open shadow root", () => {
      cy.getByTestId("demo-widget")
        .shadow()
        .find("[data-testid=shadow-btn]")
        .click();
      cy.getByTestId("demo-widget")
        .shadow()
        .find("[data-testid=shadow-status]")
        .should("have.text", "clicked");
    });
  });

  describe("iframe (its + wrap)", () => {
    it("reads and clicks inside a same-origin iframe", () => {
      cy.getByTestId("demo-iframe")
        .its("0.contentDocument.body")
        .should("not.be.empty")
        .then(cy.wrap)
        .within(() => {
          cy.get("[data-testid=iframe-secret]").should(
            "contain",
            "inside iframe",
          );
          cy.get("[data-testid=iframe-btn]").click();
          cy.get("[data-testid=iframe-status]").should("have.text", "pinged");
        });
    });
  });
});
