/**
 * ============================================================================
 * FILE COMMANDS - selectFile, drag-drop upload, download
 * ============================================================================
 *
 * PURPOSE:
 * Demonstrates Cypress file capabilities against `/upload`.
 *
 * CAPABILITIES:
 * - cy.selectFile()
 * - cy.selectFile(..., { action: 'drag-drop' })
 * - File download via cy.readFile() of the downloads folder
 *
 * Playwright twin: playwright/e2e/upload.spec.ts (migrated 1:1)
 */

describe("File upload and download", () => {
  beforeEach(() => {
    cy.visit("/upload");
  });

  describe("cy.selectFile()", () => {
    it("selects a single in-memory file", () => {
      cy.getByTestId("single-file-input").selectFile({
        contents: Cypress.Buffer.from("hello from cypress"),
        fileName: "hello.txt",
        mimeType: "text/plain",
      });

      cy.getByTestId("single-file-status").should("have.text", "hello.txt");
      cy.getByTestId("single-upload-btn").should("not.be.disabled");
    });

    it("selects a fixture file", () => {
      cy.getByTestId("single-file-input").selectFile(
        "cypress/fixtures/task-read.txt",
      );
      cy.getByTestId("single-file-status").should("contain", "task-read.txt");
    });

    it("selects multiple files", () => {
      cy.getByTestId("multiple-file-input").selectFile([
        {
          contents: Cypress.Buffer.from("one"),
          fileName: "one.txt",
          mimeType: "text/plain",
        },
        {
          contents: Cypress.Buffer.from("two"),
          fileName: "two.txt",
          mimeType: "text/plain",
        },
      ]);

      cy.getByTestId("file-list")
        .should("contain", "one.txt")
        .and("contain", "two.txt");
      cy.getByTestId("multiple-upload-btn").should("not.be.disabled");
    });

    it("drops a file onto the upload area", () => {
      cy.getByTestId("single-upload-area").selectFile(
        {
          contents: Cypress.Buffer.from("dropped"),
          fileName: "dropped.txt",
          mimeType: "text/plain",
        },
        { action: "drag-drop" },
      );

      cy.getByTestId("single-file-status").should("have.text", "dropped.txt");
    });

    it("uploads the selected file through the AUT", () => {
      cy.intercept("POST", "/api/upload").as("upload");

      cy.getByTestId("single-file-input").selectFile({
        contents: Cypress.Buffer.from("payload"),
        fileName: "payload.txt",
        mimeType: "text/plain",
      });
      cy.getByTestId("single-upload-btn").click();

      cy.wait("@upload").its("response.statusCode").should("eq", 200);
      cy.getByTestId("single-upload-result").should(
        "contain",
        "Upload successful",
      );
    });
  });

  describe("download", () => {
    it("downloads the canned sample file", () => {
      cy.getByTestId("download-sample").click();
      cy.readFile("test-output/cypress-output/downloads/sample.txt").should(
        "contain",
        "Sample file for Cypress download tests",
      );
    });
  });
});
