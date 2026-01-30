import { test, expect } from '@playwright/test';

// ============================================================================
// FORM TESTING - Input Interactions & Form Handling
// ============================================================================

test.describe('Form Testing - Input Interactions', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/forms');
    });

    // ==========================================================================
    // Text Input (fill, type, press)
    // ==========================================================================

    test.describe('Text Input', () => {
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
            // Type with Enter key using .press()
            await page.getByTestId('fullname-input').fill('John');
            await page.getByTestId('fullname-input').press('Enter');

            // Select all using keyboard shortcut logic setup for test
            await page.getByTestId('fullname-input').click();
            await page.keyboard.press('Control+A');
            await page.keyboard.type('Jane Doe');
            await expect(page.getByTestId('fullname-input')).toHaveValue('Jane Doe');
        });

        test('should type with configurable delay', async ({ page }) => {
            await page.getByTestId('username-input').pressSequentially('slowtyping', { delay: 100 });
            await expect(page.getByTestId('username-input')).toHaveValue('slowtyping');
        });
    });

    // ==========================================================================
    // Clearing Inputs
    // ==========================================================================

    test.describe('Clearing Inputs', () => {
        test('should clear text input', async ({ page }) => {
            await expect(page.getByTestId('editable-input')).toHaveValue('Edit this text');
            await page.getByTestId('editable-input').fill('');
            await expect(page.getByTestId('editable-input')).toHaveValue('');
        });

        test('should use clear button to clear input', async ({ page }) => {
            await page.getByTestId('clear-btn').click();
            await expect(page.getByTestId('editable-input')).toHaveValue('');
        });
    });

    // ==========================================================================
    // Dropdown Selection (selectOption)
    // ==========================================================================

    test.describe('Dropdown Selection', () => {
        test('should select option by value', async ({ page }) => {
            await page.getByTestId('country-select').selectOption('us');
            await expect(page.getByTestId('country-select')).toHaveValue('us');
        });

        test('should select option by label', async ({ page }) => {
            await page.getByTestId('country-select').selectOption({ label: 'United Kingdom' });
            await expect(page.getByTestId('country-select')).toHaveValue('uk');
        });

        test('should select option by index', async ({ page }) => {
            await page.getByTestId('country-select').selectOption({ index: 2 });
            await expect(page.getByTestId('country-select')).not.toHaveValue('');
        });

        test('should select multiple options', async ({ page }) => {
            await page.getByTestId('languages-select').selectOption(['en', 'es', 'fr']);
            // Verification of multi-select value in PW is usually getting all selected options
            // Basic check if values are set
            const val = await page.getByTestId('languages-select').inputValue();
            // Note: inputValue() returns first selected value. To check all:
            const values = await page.getByTestId('languages-select').evaluate((sel: HTMLSelectElement) =>
                Array.from(sel.selectedOptions).map(option => option.value)
            );
            expect(values).toEqual(['en', 'es', 'fr']);
        });
    });

    // ==========================================================================
    // Checkboxes & Radio Buttons
    // ==========================================================================

    test.describe('Checkboxes & Check Handling', () => {
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
            // Playwright doesn't have a multi-check helper, iterate
            const boxes = ['technology', 'music'];
            for (const b of boxes) {
                await page.getByTestId(`interest-${b}`).check();
            }
            await expect(page.getByTestId('interest-technology')).toBeChecked();
            await expect(page.getByTestId('interest-music')).toBeChecked();
        });

        test('should force check hidden checkbox', async ({ page }) => {
            await page.getByTestId('terms-checkbox').check({ force: true });
            await expect(page.getByTestId('terms-checkbox')).toBeChecked();
        });
    });

    test.describe('Radio Buttons', () => {
        test('should select radio button', async ({ page }) => {
            await page.getByTestId('gender-male').check();
            await expect(page.getByTestId('gender-male')).toBeChecked();
            await expect(page.getByTestId('gender-female')).not.toBeChecked();
        });
    });

    // ==========================================================================
    // Focus Management
    // ==========================================================================

    test.describe('Focus Management', () => {
        test('should focus on input element', async ({ page }) => {
            await page.getByTestId('fullname-input').focus();
            await expect(page.getByTestId('fullname-input')).toBeFocused();
        });

        test('should blur focused element', async ({ page }) => {
            await page.getByTestId('fullname-input').focus();
            await page.getByTestId('fullname-input').blur();
            await expect(page.getByTestId('fullname-input')).not.toBeFocused();
        });

        test('should trigger validation on blur', async ({ page }) => {
            await page.goto('/login');
            await page.getByTestId('email-input').fill('invalid-email');
            await page.getByTestId('email-input').blur();
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

        test('should interact with range slider', async ({ page }) => {
            // Set range value via JS as 'input' event trigger might be complex with drag
            await page.getByTestId('satisfaction-range').fill('75');
            await expect(page.getByTestId('satisfaction-range')).toHaveValue('75');
        });
    });

    // ==========================================================================
    // Form Submission
    // ==========================================================================

    test.describe('Form Submission', () => {
        test('should submit form via button click', async ({ page }) => {
            await page.getByTestId('fullname-input').fill('John Doe');
            await page.getByTestId('text-submit-btn').click();
            await expect(page.getByTestId('form-output')).toBeVisible();
            await expect(page.getByTestId('output-tbody')).toContainText('John Doe');
        });

        test('should submit form via enter key', async ({ page }) => {
            await page.getByTestId('fullname-input').fill('Jane Doe');
            await page.getByTestId('fullname-input').press('Enter');
            await expect(page.getByTestId('form-output')).toBeVisible();
        });
    });
});
