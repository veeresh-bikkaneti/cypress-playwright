/**
 * ============================================================================
 * DIALOG TESTING - Alerts, Confirms, Prompts & Custom Modals
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates Cypress's dialog handling capabilities including:
 * - cy.on('window:alert') - Handle alert dialogs
 * - cy.on('window:confirm') - Handle confirm dialogs
 * - cy.stub() - Stub window methods
 * - Custom modal interaction
 * 
 * DIALOG HANDLING FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                       DIALOG HANDLING FLOW                              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────┐   window.alert()   ┌─────────────────────────────┐    │
 * │  │   App Code  │ ──────────────────►│ cy.on('window:alert')       │    │
 * │  │             │                    │   - Capture message         │    │
 * │  │             │                    │   - Auto dismiss            │    │
 * │  └─────────────┘                    └─────────────────────────────┘    │
 * │                                                                         │
 * │  ┌─────────────┐   window.confirm() ┌─────────────────────────────┐    │
 * │  │   App Code  │ ──────────────────►│ cy.on('window:confirm')     │    │
 * │  │             │                    │   - Return true/false       │    │
 * │  │             │                    │   - Control flow            │    │
 * │  └─────────────┘                    └─────────────────────────────┘    │
 * │                                                                         │
 * │  ┌─────────────┐   window.prompt()  ┌─────────────────────────────┐    │
 * │  │   App Code  │ ──────────────────►│ cy.stub(win, 'prompt')      │    │
 * │  │             │                    │   - Return custom value     │    │
 * │  │             │                    │   - Assert calls            │    │
 * │  └─────────────┘                    └─────────────────────────────┘    │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @author Veeresh Bikkaneti
 */

describe('Dialog Testing - Alerts, Confirms, Prompts', () => {

    beforeEach(() => {
        cy.visit('/dialogs');
    });

    // ==========================================================================
    // cy.on('window:alert') - Alert Handling
    // ==========================================================================

    describe('Alert Dialogs', () => {

        /**
         * Capture alert message
         */
        it('should capture alert message', () => {
            // Set up alert listener BEFORE triggering alert
            cy.on('window:alert', (message) => {
                expect(message).to.equal('This is an alert message!');
            });

            cy.getByTestId('alert-btn').click();

            // Verify result in UI
            cy.getByTestId('native-dialog-result').should('contain', 'Alert was shown');
        });

        /**
         * Stub alert to prevent browser popup
         */
        it('should stub alert to prevent popup', () => {
            cy.window().then((win) => {
                cy.stub(win, 'alert').as('alertStub');
            });

            cy.getByTestId('alert-btn').click();

            // Assert alert was called with correct message
            cy.get('@alertStub').should('have.been.calledWith', 'This is an alert message!');
        });

        /**
         * Count alert calls
         */
        it('should count multiple alert calls', () => {
            cy.window().then((win) => {
                cy.stub(win, 'alert').as('alertStub');
            });

            // Click alert button multiple times
            cy.getByTestId('alert-btn').click();
            cy.getByTestId('alert-btn').click();
            cy.getByTestId('alert-btn').click();

            // Assert call count
            cy.get('@alertStub').should('have.been.calledThrice');
        });
    });

    // ==========================================================================
    // cy.on('window:confirm') - Confirm Handling
    // ==========================================================================

    describe('Confirm Dialogs', () => {

        /**
         * Accept confirm dialog (default)
         */
        it('should accept confirm dialog by default', () => {
            // Cypress automatically accepts confirms
            cy.getByTestId('confirm-btn').click();

            cy.getByTestId('native-dialog-result').should('contain', 'User clicked OK');
        });

        /**
         * Reject confirm dialog
         */
        it('should reject confirm dialog', () => {
            // Return false to reject
            cy.on('window:confirm', () => false);

            cy.getByTestId('confirm-btn').click();

            cy.getByTestId('native-dialog-result').should('contain', 'User clicked Cancel');
        });

        /**
         * Conditionally respond to confirm
         */
        it('should conditionally respond to confirm based on message', () => {
            cy.on('window:confirm', (message) => {
                // Accept if message contains 'proceed'
                return message.includes('proceed');
            });

            cy.getByTestId('confirm-btn').click();

            cy.getByTestId('native-dialog-result').should('contain', 'User clicked OK');
        });

        /**
         * Capture confirm message
         */
        it('should capture confirm message', () => {
            cy.on('window:confirm', (message) => {
                expect(message).to.equal('Do you want to proceed?');
                return true;
            });

            cy.getByTestId('confirm-btn').click();
        });

        /**
         * Stub confirm for assertions
         */
        it('should stub confirm for detailed assertions', () => {
            cy.window().then((win) => {
                cy.stub(win, 'confirm').returns(true).as('confirmStub');
            });

            cy.getByTestId('confirm-btn').click();

            // Assert on the stub
            cy.get('@confirmStub')
                .should('have.been.calledOnce')
                .and('have.been.calledWith', 'Do you want to proceed?');
        });
    });

    // ==========================================================================
    // Prompt Handling (via cy.stub())
    // ==========================================================================

    describe('Prompt Dialogs', () => {

        /**
         * Stub prompt with return value
         */
        it('should stub prompt and return value', () => {
            cy.window().then((win) => {
                cy.stub(win, 'prompt').returns('Test User').as('promptStub');
            });

            cy.getByTestId('prompt-btn').click();

            // Verify the returned value was used
            cy.getByTestId('native-dialog-result').should('contain', 'User entered: "Test User"');
        });

        /**
         * Stub prompt to simulate cancel
         */
        it('should stub prompt to simulate cancel', () => {
            cy.window().then((win) => {
                cy.stub(win, 'prompt').returns(null).as('promptStub');
            });

            cy.getByTestId('prompt-btn').click();

            cy.getByTestId('native-dialog-result').should('contain', 'User cancelled');
        });

        /**
         * Assert prompt was called with default value
         */
        it('should verify prompt default value', () => {
            cy.window().then((win) => {
                cy.stub(win, 'prompt').returns('Entered Name').as('promptStub');
            });

            cy.getByTestId('prompt-btn').click();

            // Verify prompt was called with message and default value
            cy.get('@promptStub').should(
                'have.been.calledWith',
                'Please enter your name:',
                'Guest'
            );
        });

        /**
         * Dynamic prompt responses
         */
        it('should provide dynamic prompt responses', () => {
            let callCount = 0;

            cy.window().then((win) => {
                cy.stub(win, 'prompt').callsFake(() => {
                    callCount++;
                    return `Response ${callCount}`;
                }).as('promptStub');
            });

            cy.getByTestId('prompt-btn').click();
            cy.getByTestId('native-dialog-result').should('contain', 'Response 1');

            cy.getByTestId('prompt-btn').click();
            cy.getByTestId('native-dialog-result').should('contain', 'Response 2');
        });
    });

    // ==========================================================================
    // Custom Modal Dialogs
    // ==========================================================================

    describe('Custom Modal Dialogs', () => {

        /**
         * Open and close info modal
         */
        it('should open and close info modal', () => {
            // Open modal
            cy.getByTestId('info-modal-btn').click();

            // Verify modal is visible
            cy.getByTestId('info-modal').should('have.class', 'show');
            cy.getByTestId('info-modal-title').should('contain', 'Information');

            // Close modal
            cy.getByTestId('info-modal-close').click();

            // Verify modal is hidden
            cy.getByTestId('info-modal').should('not.have.class', 'show');
        });

        /**
         * Handle delete confirmation modal
         */
        it('should handle delete confirmation modal - confirm', () => {
            cy.getByTestId('delete-modal-btn').click();

            // Verify modal content
            cy.getByTestId('delete-modal').should('have.class', 'show');
            cy.getByTestId('delete-modal-content').should('contain', 'cannot be undone');

            // Click confirm
            cy.getByTestId('delete-modal-confirm').click();

            // Verify result
            cy.getByTestId('delete-modal').should('not.have.class', 'show');
            cy.getByTestId('modal-result').should('contain', 'Item deleted');
        });

        /**
         * Handle delete confirmation modal - cancel
         */
        it('should handle delete confirmation modal - cancel', () => {
            cy.getByTestId('delete-modal-btn').click();
            cy.getByTestId('delete-modal-cancel').click();

            cy.getByTestId('delete-modal').should('not.have.class', 'show');
            cy.getByTestId('modal-result').should('contain', 'Delete cancelled');
        });

        /**
         * Fill form inside modal
         */
        it('should fill and submit form inside modal', () => {
            cy.getByTestId('form-modal-btn').click();

            // Fill modal form
            cy.getByTestId('modal-name-input').type('John Doe');
            cy.getByTestId('modal-message-input').type('This is a test message');

            // Submit form
            cy.getByTestId('form-modal-submit').click();

            // Verify submission
            cy.getByTestId('form-modal').should('not.have.class', 'show');
            cy.getByTestId('modal-result')
                .should('contain', 'John Doe')
                .and('contain', 'test message');
        });

        /**
         * Close modal by clicking overlay
         */
        it('should close modal by clicking overlay', () => {
            cy.getByTestId('info-modal-btn').click();
            cy.getByTestId('info-modal').should('have.class', 'show');

            // Click the overlay (outside modal content)
            cy.getByTestId('info-modal').click('topLeft');

            cy.getByTestId('info-modal').should('not.have.class', 'show');
        });
    });

    // ==========================================================================
    // Window Events
    // ==========================================================================

    describe('Window Events', () => {

        /**
         * Handle beforeunload event
         */
        it('should handle beforeunload event', () => {
            // Enable leave warning
            cy.getByTestId('beforeunload-btn').click();
            cy.getByTestId('event-result').should('contain', 'ENABLED');

            // Cypress automatically handles beforeunload, so the test continues
            // In real scenario, this would show a browser confirmation
        });

        /**
         * Handle uncaught exceptions
         */
        it('should handle triggered errors gracefully', () => {
            // Our e2e.ts already handles uncaught exceptions
            cy.getByTestId('error-btn').click();

            // Test continues despite the error
            cy.getByTestId('event-result').should('contain', 'Error triggered');
        });

        /**
         * Spy on console methods
         */
        it('should spy on console methods', () => {
            cy.window().then((win) => {
                cy.spy(win.console, 'log').as('consoleLog');
                cy.spy(win.console, 'warn').as('consoleWarn');
            });

            cy.getByTestId('console-btn').click();

            // Assert console methods were called
            cy.get('@consoleLog').should('have.been.calledWith', 'Console log test message');
            cy.get('@consoleWarn').should('have.been.calledWith', 'Console warn test message');
        });
    });

    // ==========================================================================
    // Popup Windows
    // ==========================================================================

    describe('Popup Windows', () => {

        /**
         * Stub window.open
         */
        it('should stub window.open to prevent popup', () => {
            cy.window().then((win) => {
                cy.stub(win, 'open').as('windowOpen');
            });

            cy.getByTestId('popup-btn').click();

            // Assert window.open was called
            cy.get('@windowOpen').should('have.been.calledOnce');
        });

        /**
         * Verify popup parameters
         */
        it('should verify popup window parameters', () => {
            cy.window().then((win) => {
                cy.stub(win, 'open').as('windowOpen');
            });

            cy.getByTestId('popup-btn').click();

            // Assert call arguments
            cy.get('@windowOpen').should(
                'have.been.calledWith',
                '/',
                'popup',
                Cypress.sinon.match.string
            );
        });
    });
});
