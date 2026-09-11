/**
 * ============================================================================
 * SESSION TESTING - Caching Authentication State
 * ============================================================================
 *
 * PURPOSE:
 * Demonstrates cy.session() to cache and restore cookies, localStorage, and
 * sessionStorage to reduce test setup time.
 *
 * CAPABILITIES DEMONSTRATED:
 * - cy.session()
 * - cy.login() (custom command efficient usage)
 * - Validating session restoration
 *
 * @author Veeresh Bikkaneti
 */

describe("Session Testing - Caching / Restore", () => {
  const loadUser = () =>
    cy.fixture("users.json").then((data) => ({
      email: data.valid_credentials.emailId as string,
      password: data.valid_credentials.password as string,
    }));

  /**
   * Define the login session
   * This function will run once per session id, then restore from cache
   */
  const login = (user: { email: string; password: string }) => {
    cy.session(
      [user.email],
      () => {
        cy.visit("/login");
        cy.get('[data-testid="email-input"]').type(user.email);
        cy.get('[data-testid="password-input"]').type(user.password);
        cy.get('[data-testid="submit-btn"]').click();
        cy.url().should("include", "/dashboard");
      },
      {
        validate() {
          cy.getCookie("authToken").should("exist");
        },
      },
    );
  };

  /**
   * Test 1: First test uses the session
   */
  it("should log in via session for Test 1", () => {
    loadUser().then((user) => {
      login(user);
      cy.visit("/dashboard");
      cy.get("h1").should("contain", "Dashboard");
    });
  });

  it("cy.login() custom command lands on dashboard", () => {
    loadUser().then((user) => {
      cy.login(user.email, user.password);
      cy.get('[data-testid="page-title"]').should("contain", "Dashboard");
    });
  });

  /**
   * Test 2: Second test restores the session (much faster)
   */
  it("should restore session for Test 2 behavior", () => {
    loadUser().then((user) => {
      login(user);
      cy.visit("/dashboard");
      cy.get('[data-testid="page-title"]').should("contain", "Dashboard");
      cy.get('[data-testid="sidebar"]').should("be.visible");
    });
  });

  /**
   * Test 3: Navigate using sidebar after session restore
   */
  it("should allow navigation with restored session", () => {
    loadUser().then((user) => {
      login(user);
      cy.visit("/dashboard");
      cy.get('[data-testid="orders-section"]').should("not.be.visible");
      cy.get('[data-testid="nav-orders"]').click();
      cy.get('[data-testid="orders-section"]').should("be.visible");
      cy.get('[data-testid="stats-grid"]').should("not.be.visible");
    });
  });

  /**
   * Test 4: Clear session
   */
  it("should handle session clearing", () => {
    // Clear all sessions
    Cypress.session.clearAllSavedSessions();

    // Clear any remaining auth tokens
    cy.clearLocalStorage("authToken");
    cy.clearCookies();

    cy.visit("/dashboard");

    // Dashboard redirects to login on auth failure
    cy.url().should("include", "/login");
    // The warning test is invalid because of the redirect
    // cy.get('[data-testid="auth-warning"]').should('be.visible');
  });
});
