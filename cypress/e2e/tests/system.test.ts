/**
 * ============================================================================
 * SYSTEM & FILESYSTEM CAPABILITIES
 * ============================================================================
 *
 * PURPOSE:
 * Demonstrates Cypress capabilities for interacting with the operating system,
 * file system, and executing Node.js tasks.
 *
 * CAPABILITIES DEMONSTRATED:
 * - cy.exec() - Run system commands
 * - cy.task() - Run Node.js code via plugins
 * - cy.writeFile() - Write files to disk
 * - cy.readFile() - Read files from disk
 * - cy.fixture() - Load static data
 *
 * @author Veeresh Bikkaneti
 */

describe("System and Filesystem Capabilities", () => {
  const tempFileName = "cypress/fixtures/temp-system-test.json";

  // ========================================================================
  // SYSTEM COMMANDS
  // ========================================================================

  describe("System Commands (cy.exec)", () => {
    it("should execute a system command", () => {
      // cy.exec runs a command in the shell
      // using 'echo' which works on both Windows and Unix (usually)
      // On Windows PowerShell: echo "Hello World" returns "Hello World"
      const msg = "Hello from Cypress";
      cy.exec(`echo ${msg}`).then((result) => {
        expect(result.code).to.eq(0);
        expect(result.stdout).to.contain(msg);
      });
    });
  });

  // ========================================================================
  // NODE TASKS
  // ========================================================================

  describe("Node Tasks (cy.task)", () => {
    it("should execute a task to log message to console", () => {
      cy.task(
        "log",
        "This message is printed to the terminal via cy.task()",
      ).should("eq", "This message is printed to the terminal via cy.task()");
    });

    it("should execute a task to get value from backend", () => {
      cy.task("getTimestamp").then((ts) => {
        expect(ts).to.be.a("number");
        const now = Date.now();
        expect(ts as number).to.be.lte(now);
      });
    });
  });

  // ========================================================================
  // FILE SYSTEM OPERATIONS
  // ========================================================================

  describe("File System (cy.readFile / cy.writeFile)", () => {
    it("should write to a file and read it back", () => {
      const data = {
        test: "System Capability",
        timestamp: Date.now(),
      };

      // Write file
      cy.writeFile(tempFileName, data);

      // Read file and verify content
      cy.readFile(tempFileName).then((content) => {
        expect(content).to.deep.equal(data);
      });
    });

    it("should read a file using cy.task (server-side read)", () => {
      // This uses the custom task defined in cypress.config.ts
      // We need absolute path or relative to project root for fs.readFileSync
      // Our task uses whatever path we send.

      // Let's write a simple text file first
      const textFile = "cypress/fixtures/task-read.txt";
      const content = "Read me via task";
      cy.writeFile(textFile, content);

      // Reading via cy.readFile (client side check)
      cy.readFile(textFile).should("eq", content);

      // Reading via cy.task (server side check)
      cy.task("readFileMaybe", textFile).then((val) => {
        expect(val).to.eq(content);
      });
    });
  });

  describe("Fixtures (cy.fixture)", () => {
    it("cy.fixture() loads products.json", () => {
      cy.fixture("products.json").its("products").should("have.length.gt", 0);
      cy.fixture("products.json")
        .its("products.0.name")
        .should("eq", "Premium Laptop");
    });

    it("products.json fixture drives the AUT product grid", () => {
      cy.fixture("products.json").then((data) => {
        cy.intercept("GET", "/api/products", data).as("products");
        cy.visit("/");
        cy.wait("@products");
        cy.get("[data-testid=product-card]").should(
          "have.length",
          data.products.length,
        );
        cy.contains("[data-testid=product-card]", "Premium Laptop").should(
          "be.visible",
        );
      });
    });
  });

  after(() => {
    // Cleanup (optional, cy.writeFile overwrites, but good practice)
    // cy.exec(`rm ${tempFileName}`); // Platform specific, skip for now
  });
});
