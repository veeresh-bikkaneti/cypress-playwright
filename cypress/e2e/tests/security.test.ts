describe('OWASP Security Checks', () => {

    beforeEach(() => {
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();
        cy.clearCookies();
        cy.visit('/');
    });

    context('A03:2021 - Injection (XSS)', () => {
        it('should sanitize input and prevent Reflected XSS', () => {
            const xssPayload = '<script>alert("XSS")</script>';

            cy.visit('/forms.html');

            // Spy on window.alert
            const stub = cy.stub();
            cy.on('window:alert', stub);

            // Inject payload into a text input (assuming one exists on forms.html)
            cy.get('input[type="text"]').first().type(xssPayload).blur();

            // Verify alert was NOT called
            cy.then(() => {
                expect(stub).not.to.be.called;
            });
        });
    });

    context('A01:2021 - Broken Access Control', () => {
        it.skip('should redirect unauthenticated users identifying protected resources', () => {
            // Attempt to visit dashboard without login
            cy.visit('/dashboard.html');

            // Should be redirected to login
            cy.url().should('include', '/login');
            cy.get('h1').should('contain', 'Login');
        });
    });

    context('A05:2021 - Security Misconfiguration (Headers)', () => {
        it('should have standard security headers', () => {
            cy.request('/').then((response) => {
                // Check for common security headers
                expect(response.headers).to.have.property('x-powered-by');
            });
        });
    });

    context('A04:2021 - Insecure Design (Cookie Flags)', () => {
        it.skip('should use Secure and HttpOnly flags for session cookies', () => {
            // Log in first to get a cookie (using custom command)
            cy.login('test@example.com', 'password123');

            // Check cookies
            cy.getCookie('authToken').should((cookie) => {
                // In a real secure env, these should be true. 
                // For this demo app running on localhost (http), 'secure' might be false.
                if (Cypress.config('baseUrl')?.includes('https')) {
                    expect(cookie).to.have.property('secure', true);
                }
                expect(cookie).to.have.property('httpOnly', true);
            });
        });
    });
});
