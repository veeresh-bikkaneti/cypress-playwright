describe("OWASP Security Checks", () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
  });

  context("A03:2021 - Injection (XSS)", () => {
    it("reflects the payload as text, not HTML", () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const stub = cy.stub();
      cy.on("window:alert", stub);

      cy.visit("/forms");
      cy.getByTestId("fullname-input").type(xssPayload);
      cy.getByTestId("xss-echo")
        .should("have.text", xssPayload)
        .then(($el) => {
          expect($el.children().length).to.eq(0);
        });
      cy.getByTestId("text-submit-btn").click();
      cy.getByTestId("output-tbody")
        .should("contain", xssPayload)
        .find("script")
        .should("not.exist");
      cy.then(() => expect(stub).not.to.be.called);
    });
  });

  context("A01:2021 - Broken Access Control", () => {
    it("redirects unauthenticated users away from /dashboard", () => {
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
      cy.getByTestId("login-container").should("be.visible");
    });
  });

  context("A05:2021 - Security Misconfiguration (Headers)", () => {
    it("sends nosniff, DENY framing, and no X-Powered-By", () => {
      cy.request("/").then((response) => {
        expect(response.headers["x-content-type-options"]).to.eq("nosniff");
        expect(response.headers["x-frame-options"]).to.eq("DENY");
        expect(response.headers["referrer-policy"]).to.eq("no-referrer");
        expect(response.headers).to.not.have.property("x-powered-by");
      });
    });
  });

  context("A04:2021 - Insecure Design (Cookie Flags)", () => {
    it("sets HttpOnly on the auth cookie after UI login", () => {
      // Secure is N/A on http://127.0.0.1 — HttpOnly is testable.
      cy.login("test@example.com", "password123");
      cy.getCookie("authToken").should((cookie) => {
        expect(cookie, "authToken cookie").to.exist;
        expect(cookie.httpOnly).to.eq(true);
        expect(cookie.secure).to.eq(false);
      });
    });
  });
});
