/**
 * ============================================================================
 * ACTION COMMANDS - Click, drag-and-drop, hover, keyboard, trigger, submit
 * ============================================================================
 *
 * PURPOSE:
 * One Cypress test per action command used against the AUT `/actions` page.
 *
 * CAPABILITIES:
 * - cy.click() including position, coordinates, force, modifier keys, multiple
 * - cy.dblclick()
 * - cy.rightclick()
 * - cy.trigger() (HTML5 drag-and-drop + range input)
 * - cy.realHover() (cypress-real-events)
 * - cy.type() special keys
 * - cy.submit()
 *
 * Playwright twin: playwright/e2e/actions.spec.ts (migrated 1:1)
 */

describe("Action commands", () => {
  beforeEach(() => {
    cy.visit("/actions");
  });

  describe("cy.click()", () => {
    it("clicks a button and records the event", () => {
      cy.getByTestId("click-target").click();
      cy.getByTestId("click-log").should("contain", "click");
    });

    it("clicks a corner position", () => {
      cy.getByTestId("click-target").click("topLeft");
      cy.getByTestId("click-log")
        .should("contain", "click")
        .and("match", /x=[0-9]+/);
      cy.getByTestId("click-log")
        .invoke("text")
        .then((text) => {
          const x = Number((text.match(/x=(\d+)/) || [])[1]);
          expect(x).to.be.lessThan(20);
        });
    });

    it("clicks at coordinates", () => {
      cy.getByTestId("click-target").click(8, 8);
      cy.getByTestId("click-log")
        .invoke("text")
        .then((text) => {
          const x = Number((text.match(/x=(\d+)/) || [])[1]);
          const y = Number((text.match(/y=(\d+)/) || [])[1]);
          expect(x).to.be.closeTo(8, 4);
          expect(y).to.be.closeTo(8, 4);
        });
    });

    it("force-clicks a covered button", () => {
      cy.getByTestId("covered-btn").click({ force: true });
      cy.getByTestId("click-log").should("contain", "covered-btn");
    });

    it("clicks with a modifier key", () => {
      cy.getByTestId("click-target").click({ ctrlKey: true });
      cy.getByTestId("click-log").should("contain", "ctrl");
    });

    it("clicks multiple matched elements", () => {
      cy.get(".chip").click({ multiple: true });
      cy.getByTestId("click-log").should("contain", "chips=3");
      cy.get(".chip.picked").should("have.length", 3);
    });
  });

  describe("cy.dblclick()", () => {
    it("double-clicks a button", () => {
      cy.getByTestId("click-target").dblclick();
      cy.getByTestId("click-log").should("contain", "dblclick");
    });
  });

  describe("cy.rightclick()", () => {
    it("right-clicks a button", () => {
      cy.getByTestId("click-target").rightclick();
      cy.getByTestId("click-log").should("contain", "contextmenu");
    });
  });

  describe("cy.realHover() / mouseenter", () => {
    it("reveals a tooltip on hover", () => {
      cy.getByTestId("hover-target").realHover();
      cy.getByTestId("hover-tooltip").should("be.visible");
      cy.getByTestId("hover-log").should("have.text", "hovered");
    });
  });

  describe("HTML5 drag and drop (cy.trigger)", () => {
    it("drags a card from todo to done", () => {
      cy.getByTestId("card-alpha").then(($card) => {
        const dataTransfer = new DataTransfer();
        cy.wrap($card).trigger("dragstart", { dataTransfer });
        cy.getByTestId("drop-done").trigger("dragover", { dataTransfer });
        cy.getByTestId("drop-done").trigger("drop", { dataTransfer });
        cy.wrap($card).trigger("dragend", { dataTransfer });
      });

      cy.getByTestId("drop-done")
        .find("[data-testid=card-alpha]")
        .should("exist");
      cy.getByTestId("dnd-status").should("contain", "dropped:card-alpha");
    });
  });

  describe("pointer drag (slider)", () => {
    it("moves the slider knob with mouse events", () => {
      cy.getByTestId("slider-track").then(($track) => {
        const rect = $track[0].getBoundingClientRect();
        const y = rect.top + rect.height / 2;
        const x = rect.left + rect.width * 0.8;
        cy.getByTestId("slider-knob").trigger("mousedown", {
          which: 1,
          button: 0,
        });
        cy.wrap($track).trigger("mousemove", {
          clientX: x,
          clientY: y,
          which: 1,
        });
        cy.get("body").trigger("mousemove", {
          clientX: x,
          clientY: y,
          which: 1,
        });
        cy.get("body").trigger("mouseup", { clientX: x, clientY: y });
      });

      cy.getByTestId("slider-value")
        .invoke("text")
        .then((text) => {
          expect(Number(text)).to.be.greaterThan(50);
        });
    });
  });

  describe("cy.type() special keys", () => {
    it("types text and records Escape", () => {
      cy.getByTestId("key-input").type("hello{esc}");
      cy.getByTestId("key-input").should("have.value", "hello");
      cy.getByTestId("key-log").should("contain", "keydown:Escape");
    });
  });

  describe("cy.trigger() range input", () => {
    it("sets a range value via trigger", () => {
      cy.getByTestId("volume-range").invoke("val", 75).trigger("input");
      cy.getByTestId("volume-value").should("have.text", "75");
    });
  });

  describe("cy.submit()", () => {
    it("submits a native form", () => {
      cy.getByTestId("alias-input").type("veeresh");
      cy.getByTestId("native-form").submit();
      cy.getByTestId("form-status").should("have.text", "submitted:veeresh");
    });
  });
});
