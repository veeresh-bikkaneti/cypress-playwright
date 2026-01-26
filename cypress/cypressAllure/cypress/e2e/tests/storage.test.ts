/**
 * ============================================================================
 * STORAGE TESTING - Cookies, localStorage & sessionStorage
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates Cypress's storage management capabilities including:
 * - cy.getCookie() / cy.setCookie() / cy.clearCookie()
 * - cy.getCookies() / cy.clearCookies() / cy.clearAllCookies()
 * - cy.window() with localStorage and sessionStorage
 * - cy.clearLocalStorage() / cy.clearAllSessionStorage()
 * 
 * STORAGE TYPES:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                        STORAGE TYPES                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
 * │  │    Cookies      │  │  localStorage   │  │ sessionStorage  │         │
 * │  │                 │  │                 │  │                 │         │
 * │  │ • Server access │  │ • Client only   │  │ • Tab specific  │         │
 * │  │ • Expiry dates  │  │ • Persistent    │  │ • Cleared on    │         │
 * │  │ • HTTP only     │  │ • ~5MB limit    │  │   tab close     │         │
 * │  │ • Secure flag   │  │                 │  │                 │         │
 * │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @author Veeresh Bikkaneti
 */

describe('Storage Testing - Cookies & Local Storage', () => {

    beforeEach(() => {
        // Clear all storage before each test
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.clearAllSessionStorage();
    });

    // ==========================================================================
    // Cookie Management
    // ==========================================================================

    describe('Cookie Management', () => {

        /**
         * Set a cookie
         */
        it('should set a cookie', () => {
            cy.setCookie('testCookie', 'testValue');

            cy.getCookie('testCookie').then((cookie) => {
                expect(cookie).to.not.be.null;
                expect(cookie.value).to.equal('testValue');
            });
        });

        /**
         * Set cookie with options
         */
        it('should set cookie with options', () => {
            cy.setCookie('secureCookie', 'secureValue', {
                path: '/',
                secure: true,
                httpOnly: true,
                expiry: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            });

            cy.getCookie('secureCookie').should('exist');
        });

        /**
         * Get all cookies
         */
        it('should get all cookies', () => {
            cy.setCookie('cookie1', 'value1');
            cy.setCookie('cookie2', 'value2');
            cy.setCookie('cookie3', 'value3');

            cy.getCookies().then((cookies) => {
                expect(cookies).to.have.length(3);

                const names = cookies.map(c => c.name);
                expect(names).to.include('cookie1');
                expect(names).to.include('cookie2');
                expect(names).to.include('cookie3');
            });
        });

        /**
         * Clear specific cookie
         */
        it('should clear a specific cookie', () => {
            cy.setCookie('cookieToDelete', 'value');
            cy.setCookie('cookieToKeep', 'value');

            cy.clearCookie('cookieToDelete');

            cy.getCookie('cookieToDelete').should('be.null');
            cy.getCookie('cookieToKeep').should('exist');
        });

        /**
         * Clear all cookies
         */
        it('should clear all cookies', () => {
            cy.setCookie('cookie1', 'value1');
            cy.setCookie('cookie2', 'value2');

            cy.clearCookies();

            cy.getCookies().should('have.length', 0);
        });

        /**
         * Verify cookie from server
         */
        it('should verify cookie set by server', () => {
            // Login sets an authToken cookie
            cy.request({
                method: 'POST',
                url: '/api/auth/login',
                body: { email: 'test@example.com', password: 'password123' }
            });

            cy.getCookie('authToken').should('exist');
        });

        /**
         * Use cookies for authentication
         */
        it('should use cookie for authenticated requests', () => {
            // Set auth cookie
            cy.setCookie('authToken', 'mock-token-value');

            cy.visit('/dashboard');

            // Dashboard should recognize the cookie
            // (though in this case the token would need to be valid)
        });
    });

    // ==========================================================================
    // localStorage Management
    // ==========================================================================

    describe('localStorage Management', () => {

        beforeEach(() => {
            cy.visit('/dashboard');
        });

        /**
         * Set localStorage item
         */
        it('should set localStorage item', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('testKey', 'testValue');
            });

            cy.window().its('localStorage').invoke('getItem', 'testKey')
                .should('equal', 'testValue');
        });

        /**
         * Set complex object in localStorage
         */
        it('should store complex object in localStorage', () => {
            const userData = {
                id: 1,
                name: 'Test User',
                preferences: { theme: 'dark', lang: 'en' }
            };

            cy.window().then((win) => {
                win.localStorage.setItem('userData', JSON.stringify(userData));
            });

            cy.window().then((win) => {
                const stored = JSON.parse(win.localStorage.getItem('userData'));
                expect(stored).to.deep.equal(userData);
            });
        });

        /**
         * Clear specific localStorage key
         */
        it('should clear specific localStorage key', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('toDelete', 'value');
                win.localStorage.setItem('toKeep', 'value');
            });

            cy.clearLocalStorage('toDelete');

            cy.window().then((win) => {
                expect(win.localStorage.getItem('toDelete')).to.be.null;
                expect(win.localStorage.getItem('toKeep')).to.equal('value');
            });
        });

        /**
         * Clear localStorage with regex
         */
        it('should clear localStorage matching pattern', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('prefix_item1', 'value1');
                win.localStorage.setItem('prefix_item2', 'value2');
                win.localStorage.setItem('other_item', 'value3');
            });

            cy.clearLocalStorage(/^prefix_/);

            cy.window().then((win) => {
                expect(win.localStorage.getItem('prefix_item1')).to.be.null;
                expect(win.localStorage.getItem('prefix_item2')).to.be.null;
                expect(win.localStorage.getItem('other_item')).to.equal('value3');
            });
        });

        /**
         * Use dashboard buttons to test storage
         */
        it('should use UI buttons to set localStorage', () => {
            cy.getByTestId('set-storage-btn').click();

            cy.window().then((win) => {
                expect(win.localStorage.getItem('testKey')).to.equal('cypress-test-value');
            });

            cy.getByTestId('storage-result').should('contain', 'localStorage set');
        });

        /**
         * Clear localStorage via UI
         */
        it('should clear localStorage via UI', () => {
            // First set some storage
            cy.window().then((win) => {
                win.localStorage.setItem('testItem', 'testValue');
            });

            cy.getByTestId('clear-storage-btn').click();

            cy.getByTestId('storage-result').should('contain', 'cleared');
        });
    });

    // ==========================================================================
    // sessionStorage Management
    // ==========================================================================

    describe('sessionStorage Management', () => {

        beforeEach(() => {
            cy.visit('/');
        });

        /**
         * Set sessionStorage item
         */
        it('should set sessionStorage item', () => {
            cy.window().then((win) => {
                win.sessionStorage.setItem('sessionKey', 'sessionValue');
            });

            cy.window().its('sessionStorage').invoke('getItem', 'sessionKey')
                .should('equal', 'sessionValue');
        });

        /**
         * Clear all sessionStorage
         */
        it('should clear all sessionStorage', () => {
            cy.window().then((win) => {
                win.sessionStorage.setItem('key1', 'value1');
                win.sessionStorage.setItem('key2', 'value2');
            });

            cy.clearAllSessionStorage();

            cy.window().then((win) => {
                expect(win.sessionStorage.length).to.equal(0);
            });
        });
    });

    // ==========================================================================
    // Authentication State with Storage
    // ==========================================================================

    describe('Authentication State Management', () => {

        /**
         * Set up authentication via storage
         */
        it('should set up authentication via storage', () => {
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
            const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

            cy.window().then((win) => {
                win.localStorage.setItem('authToken', mockToken);
                win.localStorage.setItem('user', JSON.stringify(mockUser));
            });

            cy.visit('/dashboard');

            // Should show user info (if token is valid on server)
            // This demonstrates the pattern for setting up auth state
        });

        /**
         * Clear authentication
         */
        it('should clear authentication on logout', () => {
            // Set up auth first
            cy.window().then((win) => {
                win.localStorage.setItem('authToken', 'token');
                win.localStorage.setItem('user', '{}');
            });

            cy.visit('/dashboard');

            // Logout clears storage
            cy.clearLocalStorage('authToken');
            cy.clearLocalStorage('user');

            cy.window().then((win) => {
                expect(win.localStorage.getItem('authToken')).to.be.null;
                expect(win.localStorage.getItem('user')).to.be.null;
            });
        });

        /**
         * Preserve storage between tests (using session)
         */
        it('should demonstrate storage isolation', () => {
            // Each test starts with clean storage (from beforeEach)
            cy.getCookies().should('have.length', 0);

            cy.window().then((win) => {
                expect(win.localStorage.length).to.equal(0);
            });
        });
    });

    // ==========================================================================
    // Cookie/Storage Assertions
    // ==========================================================================

    describe('Storage Assertions', () => {

        /**
         * Assert cookie properties
         */
        it('should assert on cookie properties', () => {
            cy.setCookie('propCookie', 'propValue', {
                path: '/',
                httpOnly: false,
                secure: false
            });

            cy.getCookie('propCookie').should((cookie) => {
                expect(cookie.name).to.equal('propCookie');
                expect(cookie.value).to.equal('propValue');
                expect(cookie.path).to.equal('/');
                expect(cookie.httpOnly).to.equal(false);
            });
        });

        /**
         * Assert localStorage with should
         */
        it('should assert localStorage values', () => {
            cy.visit('/');

            cy.window().then((win) => {
                win.localStorage.setItem('count', '42');
            });

            cy.window()
                .its('localStorage')
                .invoke('getItem', 'count')
                .should('equal', '42');
        });
    });
});
