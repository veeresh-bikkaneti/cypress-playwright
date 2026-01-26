/**
 * ============================================================================
 * FORM TESTING - Input Interactions & Form Handling
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates Cypress's form interaction capabilities including:
 * - cy.type() - Text input with special keys
 * - cy.clear() - Clear input fields
 * - cy.select() - Dropdown selection
 * - cy.check() / cy.uncheck() - Checkbox and radio handling
 * - cy.focus() / cy.blur() - Focus management
 * - Form validation testing
 * 
 * FORM INTERACTION FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         FORM TESTING FLOW                               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────┐   cy.type()    ┌─────────────┐   cy.submit()          │
 * │  │   Locate    │ ──────────────►│   Fill      │ ──────────────►        │
 * │  │   Input     │                │   Input     │                        │
 * │  └─────────────┘                └─────────────┘                        │
 * │                                                                         │
 * │  ┌─────────────┐   cy.select()  ┌─────────────┐                        │
 * │  │   Dropdown  │ ──────────────►│   Option    │                        │
 * │  │   Element   │                │   Selected  │                        │
 * │  └─────────────┘                └─────────────┘                        │
 * │                                                                         │
 * │  ┌─────────────┐   cy.check()   ┌─────────────┐                        │
 * │  │   Checkbox  │ ──────────────►│   Checked   │                        │
 * │  │   Element   │                │   State     │                        │
 * │  └─────────────┘                └─────────────┘                        │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @author Veeresh Bikkaneti
 */

describe('Form Testing - Input Interactions', () => {

    beforeEach(() => {
        cy.visit('/forms');
    });

    // ==========================================================================
    // cy.type() - Text Input
    // ==========================================================================

    describe('cy.type() - Text Input', () => {

        /**
         * Basic text typing
         */
        it('should type text into input fields', () => {
            cy.getByTestId('fullname-input')
                .type('John Doe')
                .should('have.value', 'John Doe');

            cy.getByTestId('username-input')
                .type('johndoe')
                .should('have.value', 'johndoe');

            cy.getByTestId('email-field-input')
                .type('john@example.com')
                .should('have.value', 'john@example.com');
        });

        /**
         * Type into textarea
         */
        it('should type into textarea with multiline text', () => {
            const multilineText = 'Line 1\nLine 2\nLine 3';

            cy.getByTestId('bio-textarea')
                .type(multilineText)
                .should('have.value', multilineText);
        });

        /**
         * Type with special keys
         */
        it('should use special key sequences', () => {
            cy.getByTestId('fullname-input')
                // Type with Enter key
                .type('John{enter}')
                // Type with modifiers
                .type('{selectall}')
                .type('Jane Doe')
                .should('have.value', 'Jane Doe');
        });

        /**
         * Type with delay
         */
        it('should type with configurable delay', () => {
            cy.getByTestId('username-input')
                .type('slowtyping', { delay: 100 })
                .should('have.value', 'slowtyping');
        });

        /**
         * Type special characters
         */
        it('should type special characters', () => {
            // Curly braces need to be escaped
            cy.getByTestId('fullname-input')
                .type('Price: $100 {{}special{}}')
                .should('have.value', 'Price: $100 {special}');
        });

        /**
         * Type keyboard shortcuts
         */
        it('should simulate keyboard shortcuts', () => {
            cy.getByTestId('fullname-input')
                .type('Select All')
                .type('{ctrl+a}')    // Select all
                .type('{backspace}') // Delete
                .should('have.value', '');
        });
    });

    // ==========================================================================
    // cy.clear() - Clearing Inputs
    // ==========================================================================

    describe('cy.clear() - Clearing Inputs', () => {

        /**
         * Clear text input
         */
        it('should clear text input', () => {
            cy.getByTestId('editable-input')
                .should('have.value', 'Edit this text')
                .clear()
                .should('have.value', '');
        });

        /**
         * Clear and retype
         */
        it('should clear and retype value', () => {
            cy.getByTestId('editable-input')
                .clear()
                .type('New value')
                .should('have.value', 'New value');
        });

        /**
         * Use button to clear (for testing clear button functionality)
         */
        it('should use clear button to clear input', () => {
            cy.getByTestId('editable-input').should('not.have.value', '');
            cy.getByTestId('clear-btn').click();
            cy.getByTestId('editable-input').should('have.value', '');
        });
    });

    // ==========================================================================
    // cy.select() - Dropdown Selection
    // ==========================================================================

    describe('cy.select() - Dropdown Selection', () => {

        /**
         * Select by value
         */
        it('should select option by value', () => {
            cy.getByTestId('country-select')
                .select('us')
                .should('have.value', 'us');
        });

        /**
         * Select by visible text
         */
        it('should select option by visible text', () => {
            cy.getByTestId('country-select')
                .select('United Kingdom')
                .should('have.value', 'uk');
        });

        /**
         * Select by index
         */
        it('should select option by index', () => {
            cy.getByTestId('country-select')
                .select(2) // Second option (0-indexed)
                .should('not.have.value', '');
        });

        /**
         * Select multiple options
         */
        it('should select multiple options in multi-select', () => {
            cy.getByTestId('languages-select')
                .select(['en', 'es', 'fr'])
                .invoke('val')
                .should('deep.equal', ['en', 'es', 'fr']);
        });

        /**
         * Assert selected option text
         */
        it('should assert on selected option text', () => {
            cy.getByTestId('country-select').select('Germany');

            cy.getByTestId('country-select')
                .find('option:selected')
                .should('have.text', 'Germany');
        });
    });

    // ==========================================================================
    // cy.check() / cy.uncheck() - Checkboxes & Radio Buttons
    // ==========================================================================

    describe('cy.check() / cy.uncheck() - Checkboxes', () => {

        /**
         * Check single checkbox
         */
        it('should check a checkbox', () => {
            cy.getByTestId('interest-technology')
                .check()
                .should('be.checked');
        });

        /**
         * Uncheck checkbox
         */
        it('should uncheck a checkbox', () => {
            cy.getByTestId('interest-sports')
                .check()
                .should('be.checked')
                .uncheck()
                .should('not.be.checked');
        });

        /**
         * Check multiple checkboxes
         */
        it('should check multiple checkboxes', () => {
            cy.get('input[name="interests"]')
                .check(['technology', 'music'])
                .should('be.checked');

            // Verify specific ones are checked
            cy.getByTestId('interest-technology').should('be.checked');
            cy.getByTestId('interest-music').should('be.checked');
            cy.getByTestId('interest-sports').should('not.be.checked');
        });

        /**
         * Check with force option
         */
        it('should force check hidden checkbox', () => {
            // Some checkboxes may be visually hidden but clickable via label
            cy.getByTestId('terms-checkbox')
                .check({ force: true })
                .should('be.checked');
        });
    });

    describe('Radio Buttons', () => {

        /**
         * Select radio button
         */
        it('should select radio button', () => {
            cy.getByTestId('gender-male')
                .check()
                .should('be.checked');

            // Other radio in same group should be unchecked
            cy.getByTestId('gender-female').should('not.be.checked');
        });

        /**
         * Change radio selection
         */
        it('should change radio button selection', () => {
            cy.getByTestId('gender-male').check();
            cy.getByTestId('gender-female').check();

            cy.getByTestId('gender-male').should('not.be.checked');
            cy.getByTestId('gender-female').should('be.checked');
        });
    });

    // ==========================================================================
    // cy.focus() / cy.blur() - Focus Management
    // ==========================================================================

    describe('cy.focus() / cy.blur() - Focus Management', () => {

        /**
         * Focus on element
         */
        it('should focus on input element', () => {
            cy.getByTestId('fullname-input')
                .focus()
                .should('be.focused');
        });

        /**
         * Blur element
         */
        it('should blur focused element', () => {
            cy.getByTestId('fullname-input')
                .focus()
                .blur()
                .should('not.be.focused');
        });

        /**
         * Use focus/blur buttons
         */
        it('should use focus and blur buttons', () => {
            // Click focus button
            cy.getByTestId('focus-btn').click();
            cy.getByTestId('editable-input').should('be.focused');

            // Click blur button
            cy.getByTestId('blur-btn').click();
            cy.getByTestId('editable-input').should('not.be.focused');
        });

        /**
         * Trigger validation on blur
         */
        it('should trigger validation on blur', () => {
            cy.visit('/login');

            cy.getByTestId('email-input')
                .type('invalid-email')
                .blur();

            // Validation should show error
            cy.getByTestId('email-error').should('be.visible');
        });
    });

    // ==========================================================================
    // Number & Range Inputs
    // ==========================================================================

    describe('Number & Range Inputs', () => {

        /**
         * Type number input
         */
        it('should handle number input', () => {
            cy.getByTestId('age-input')
                .type('25')
                .should('have.value', '25');
        });

        /**
         * Use arrow keys on number input
         */
        it('should increment/decrement with arrow keys', () => {
            cy.getByTestId('quantity-input')
                .clear()
                .type('5')
                .type('{uparrow}')
                .should('have.value', '6')
                .type('{downarrow}{downarrow}')
                .should('have.value', '4');
        });

        /**
         * Interact with range slider
         */
        it('should change range slider value', () => {
            cy.getByTestId('satisfaction-range')
                .invoke('val', 75)
                .trigger('input')
                .should('have.value', '75');

            // Verify displayed value
            cy.getByTestId('satisfaction-value').should('contain', '75');
        });
    });

    // ==========================================================================
    // Date Inputs
    // ==========================================================================

    describe('Date & Time Inputs', () => {

        /**
         * Set date input
         */
        it('should set date input value', () => {
            cy.getByTestId('birthdate-input')
                .type('1990-05-15')
                .should('have.value', '1990-05-15');
        });

        /**
         * Set time input
         */
        it('should set time input value', () => {
            cy.getByTestId('appointment-input')
                .type('14:30')
                .should('have.value', '14:30');
        });

        /**
         * Set datetime-local input
         */
        it('should set datetime-local input value', () => {
            cy.getByTestId('meeting-input')
                .type('2024-12-25T10:00')
                .should('have.value', '2024-12-25T10:00');
        });
    });

    // ==========================================================================
    // Form Submission
    // ==========================================================================

    describe('Form Submission', () => {

        /**
         * Submit form via button click
         */
        it('should submit form via button click', () => {
            cy.getByTestId('fullname-input').type('John Doe');
            cy.getByTestId('text-submit-btn').click();

            // Verify form output
            cy.getByTestId('form-output').should('be.visible');
            cy.getByTestId('output-tbody').should('contain', 'John Doe');
        });

        /**
         * Submit form via enter key
         */
        it('should submit form via enter key', () => {
            cy.getByTestId('fullname-input').type('Jane Doe{enter}');

            cy.getByTestId('form-output').should('be.visible');
        });

        /**
         * Complete form workflow
         */
        it('should complete full form workflow', () => {
            // Fill text inputs
            cy.getByTestId('fullname-input').type('John Smith');
            cy.getByTestId('username-input').type('jsmith');
            cy.getByTestId('email-field-input').type('john.smith@example.com');
            cy.getByTestId('bio-textarea').type('Test user biography');

            // Submit and verify
            cy.getByTestId('text-submit-btn').click();

            cy.getByTestId('output-tbody')
                .should('contain', 'John Smith')
                .and('contain', 'jsmith')
                .and('contain', 'john.smith@example.com');
        });
    });
});
