/**
 * ============================================================================
 * FORM TESTING - Input Interactions & Form Handling (Playwright Migration)
 * ============================================================================
 * 
 * Migrated from: cypress/e2e/tests/forms.test.ts
 * 
 * PURPOSE:
 * Demonstrates Playwright's form interaction capabilities including:
 * - fill() - Text input
 * - clear() - Clear input fields  
 * - selectOption() - Dropdown selection
 * - check() / uncheck() - Checkbox and radio handling
 * - focus() / blur() - Focus management
 * - Form validation testing
 * 
 * MIGRATION NOTES:
 * - cy.type() → fill() or type() (fill is preferred)
 * - cy.clear() → clear()
 * - cy.select() → selectOption()
 * - cy.check() → check()
 * - cy.uncheck() → uncheck()
 * - cy.focus() → focus()
 * - cy.blur() → blur()
 * - cy.getByTestId() → page.getByTestId()
 * - All actions properly awaited
 * 
 * @author Veeresh Bikkaneti (Migrated to Playwright)
 */

import { test, expect } from '@playwright/test';

test.describe('Form Testing - Input Interactions', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/forms');
    });

    // ==========================================================================
    // fill() / type() - Text Input
    // ==========================================================================

    test.describe('fill() / type() - Text Input', () => {

        test('should type text into input fields', async ({ page }) => {
            await page.getByTestId('fullname-input').fill('John Doe');
            await expect(page.getByTestId('fullname-input')).toHaveValue('John Doe');

            await page.getByTestId('username-input').fill('johndoe');
            await expect(page.getByTestId('username-input')).toHaveValue('johndoe');

            await page.getByTestId('email-field-input').fill('john@example.com');
            await expect(page.getByTestId('email-field-input')).toHaveValue('john@example.com');
        });

        test('should type into textarea with multiline text', async ({ page }) => {
            const multilineText = 'Line 1\nLine 2\nLine 3';

            await page.getByTestId('bio-textarea').fill(multilineText);
            await expect(page.getByTestId('bio-textarea')).toHaveValue(multilineText);
        });

        test('should use special key sequences', async ({ page }) => {
            const input = page.getByTestId('fullname-input');

            // Type with Enter key
            await input.fill('John');
            await input.press('Enter');

            // Select all and replace
            await input.press('Control+a'); // Or 'Meta+a' on Mac
            await input.fill('Jane Doe');

            await expect(input).toHaveValue('Jane Doe');
        });

        test('should type with configurable delay', async ({ page }) => {
            // In Playwright, use type() instead of fill() for character-by-character typing
            await page.getByTestId('username-input').type('slowtyping', { delay: 100 });
            await expect(page.getByTestId('username-input')).toHaveValue('slowtyping');
        });

        test('should type special characters', async ({ page }) => {
            // No need to escape curly braces in Playwright
            await page.getByTestId('fullname-input').fill('Price: $100 {special}');
            await expect(page.getByTestId('fullname-input')).toHaveValue('Price: $100 {special}');
        });

        test('should simulate keyboard shortcuts', async ({ page }) => {
            const input = page.getByTestId('fullname-input');

            await input.fill('Select All');
            // Clear using keyboard shortcut
            await input.press('Control+a');
            await input.press('Backspace');

            await expect(input).toHaveValue('');
        });
    });

    // ==========================================================================
    // clear() - Clearing Inputs
    // ==========================================================================

    test.describe('clear() - Clearing Inputs', () => {

        test('should clear text input', async ({ page }) => {
            const editableInput = page.getByTestId('editable-input');

            await expect(editableInput).toHaveValue('Edit this text');
            await editableInput.clear();
            await expect(editableInput).toHaveValue('');
        });

        test('should clear and retype value', async ({ page }) => {
            const editableInput = page.getByTestId('editable-input');

            await editableInput.clear();
            await editableInput.fill('New value');
            await expect(editableInput).toHaveValue('New value');
        });

        test('should use clear button to clear input', async ({ page }) => {
            await expect(page.getByTestId('editable-input')).not.toHaveValue('');
            await page.getByTestId('clear-btn').click();
            await expect(page.getByTestId('editable-input')).toHaveValue('');
        });
    });

    // ==========================================================================
    // selectOption() - Dropdown Selection
    // ==========================================================================

    test.describe('selectOption() - Dropdown Selection', () => {

        test('should select option by value', async ({ page }) => {
            await page.getByTestId('country-select').selectOption('us');
            await expect(page.getByTestId('country-select')).toHaveValue('us');
        });

        test('should select option by visible text', async ({ page }) => {
            await page.getByTestId('country-select').selectOption({ label: 'United Kingdom' });
            await expect(page.getByTestId('country-select')).toHaveValue('uk');
        });

        test('should select option by index', async ({ page }) => {
            await page.getByTestId('country-select').selectOption({ index: 2 });
            await expect(page.getByTestId('country-select')).not.toHaveValue('');
        });

        test('should select multiple options in multi-select', async ({ page }) => {
            await page.getByTestId('languages-select').selectOption(['en', 'es', 'fr']);

            // Verify multiple selections
            const selectedValues = await page.getByTestId('languages-select').evaluate((el: HTMLSelectElement) => {
                return Array.from(el.selectedOptions).map(option => option.value);
            });

            expect(selectedValues).toEqual(['en', 'es', 'fr']);
        });

        test('should assert on selected option text', async ({ page }) => {
            await page.getByTestId('country-select').selectOption({ label: 'Germany' });

            const selectedText = await page.getByTestId('country-select').locator('option:checked').textContent();
            expect(selectedText).toBe('Germany');
        });
    });

    // ==========================================================================
    // check() / uncheck() - Checkboxes & Radio Buttons
    // ==========================================================================

    test.describe('check() / uncheck() - Checkboxes', () => {

        test('should check a checkbox', async ({ page }) => {
            await page.getByTestId('interest-technology').check();
            await expect(page.getByTestId('interest-technology')).toBeChecked();
        });

        test('should uncheck a checkbox', async ({ page }) => {
            await page.getByTestId('interest-sports').check();
            await expect(page.getByTestId('interest-sports')).toBeChecked();

            await page.getByTestId('interest-sports').uncheck();
            await expect(page.getByTestId('interest-sports')).not.toBeChecked();
        });

        test('should check multiple checkboxes', async ({ page }) => {
            // Check specific checkboxes
            await page.getByTestId('interest-technology').check();
            await page.getByTestId('interest-music').check();

            // Verify specific ones are check checked
            await expect(page.getByTestId('interest-technology')).toBeChecked();
            await expect(page.getByTestId('interest-music')).toBeChecked();
            await expect(page.getByTestId('interest-sports')).not.toBeChecked();
        });

        test('should force check hidden checkbox', async ({ page }) => {
            // Some checkboxes may be visually hidden but clickable via label
            await page.getByTestId('terms-checkbox').check({ force: true });
            await expect(page.getByTestId('terms-checkbox')).toBeChecked();
        });
    });

    test.describe('Radio Buttons', () => {

        test('should select radio button', async ({ page }) => {
            await page.getByTestId('gender-male').check();
            await expect(page.getByTestId('gender-male')).toBeChecked();

            // Other radio in same group should be unchecked
            await expect(page.getByTestId('gender-female')).not.toBeChecked();
        });

        test('should change radio button selection', async ({ page }) => {
            await page.getByTestId('gender-male').check();
            await page.getByTestId('gender-female').check();

            await expect(page.getByTestId('gender-male')).not.toBeChecked();
            await expect(page.getByTestId('gender-female')).toBeChecked();
        });
    });

    // ==========================================================================
    // focus() / blur() - Focus Management
    // ==========================================================================

    test.describe('focus() / blur() - Focus Management', () => {

        test('should focus on input element', async ({ page }) => {
            await page.getByTestId('fullname-input').focus();
            await expect(page.getByTestId('fullname-input')).toBeFocused();
        });

        test('should blur focused element', async ({ page }) => {
            await page.getByTestId('fullname-input').focus();
            await page.getByTestId('fullname-input').blur();
            await expect(page.getByTestId('fullname-input')).not.toBeFocused();
        });

        test('should use focus and blur buttons', async ({ page }) => {
            // Click focus button
            await page.getByTestId('focus-btn').click();
            await expect(page.getByTestId('editable-input')).toBeFocused();

            // Click blur button
            await page.getByTestId('blur-btn').click();
            await expect(page.getByTestId('editable-input')).not.toBeFocused();
        });

        test('should trigger validation on blur', async ({ page }) => {
            await page.goto('/login');

            await page.getByTestId('email-input').fill('invalid-email');
            await page.getByTestId('email-input').blur();

            // Validation should show error
            await expect(page.getByTestId('email-error')).toBeVisible();
        });
    });

    // ==========================================================================
    // Number & Range Inputs
    // ==========================================================================

    test.describe('Number & Range Inputs', () => {

        test('should handle number input', async ({ page }) => {
            await page.getByTestId('age-input').fill('25');
            await expect(page.getByTestId('age-input')).toHaveValue('25');
        });

        test('should increment/decrement with arrow keys', async ({ page }) => {
            const quantityInput = page.getByTestId('quantity-input');

            await quantityInput.clear();
            await quantityInput.fill('5');
            await quantityInput.press('ArrowUp');
            await expect(quantityInput).toHaveValue('6');

            await quantityInput.press('ArrowDown');
            await quantityInput.press('ArrowDown');
            await expect(quantityInput).toHaveValue('4');
        });

        test('should change range slider value', async ({ page }) => {
            await page.getByTestId('satisfaction-range').fill('75');
            await expect(page.getByTestId('satisfaction-range')).toHaveValue('75');

            // Verify displayed value
            await expect(page.getByTestId('satisfaction-value')).toContainText('75');
        });
    });

    // ==========================================================================
    // Date Inputs
    // ==========================================================================

    test.describe('Date & Time Inputs', () => {

        test('should set date input value', async ({ page }) => {
            await page.getByTestId('birthdate-input').fill('1990-05-15');
            await expect(page.getByTestId('birthdate-input')).toHaveValue('1990-05-15');
        });

        test('should set time input value', async ({ page }) => {
            await page.getByTestId('appointment-input').fill('14:30');
            await expect(page.getByTestId('appointment-input')).toHaveValue('14:30');
        });

        test('should set datetime-local input value', async ({ page }) => {
            await page.getByTestId('meeting-input').fill('2024-12-25T10:00');
            await expect(page.getByTestId('meeting-input')).toHaveValue('2024-12-25T10:00');
        });
    });

    // ==========================================================================
    // Form Submission
    // ==========================================================================

    test.describe('Form Submission', () => {

        test('should submit form via button click', async ({ page }) => {
            await page.getByTestId('fullname-input').fill('John Doe');
            await page.getByTestId('text-submit-btn').click();

            // Verify form output
            await expect(page.getByTestId('form-output')).toBeVisible();
            await expect(page.getByTestId('output-tbody')).toContainText('John Doe');
        });

        test('should submit form via enter key', async ({ page }) => {
            await page.getByTestId('fullname-input').fill('Jane Doe');
            await page.getByTestId('fullname-input').press('Enter');

            await expect(page.getByTestId('form-output')).toBeVisible();
        });

        test('should complete full form workflow', async ({ page }) => {
            // Fill text inputs
            await page.getByTestId('fullname-input').fill('John Smith');
            await page.getByTestId('username-input').fill('jsmith');
            await page.getByTestId('email-field-input').fill('john.smith@example.com');
            await page.getByTestId('bio-textarea').fill('Test user biography');

            // Submit and verify
            await page.getByTestId('text-submit-btn').click();

            const outputTable = page.getByTestId('output-tbody');
            await expect(outputTable).toContainText('John Smith');
            await expect(outputTable).toContainText('jsmith');
            await expect(outputTable).toContainText('john.smith@example.com');
        });
    });
});
