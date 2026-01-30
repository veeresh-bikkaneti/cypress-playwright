import { test, expect } from '@playwright/test';

// ============================================================================
// DIALOG TESTING - Alerts, Confirms, Prompts & Custom Modals
// ============================================================================

test.describe('Dialog Testing - Alerts, Confirms, Prompts', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/dialogs');
    });

    // ==========================================================================
    // Alert Handling
    // ==========================================================================

    test.describe('Alert Dialogs', () => {
        test('should capture alert message', async ({ page }) => {
            // Setup listener
            page.once('dialog', dialog => {
                expect(dialog.message()).toEqual('This is an alert message!');
                dialog.dismiss().catch(() => { });
            });

            await page.getByTestId('alert-btn').click();
        });

        test('should count multiple alert calls', async ({ page }) => {
            let alertCount = 0;
            page.on('dialog', dialog => {
                alertCount++;
                dialog.accept().catch(() => { });
            });

            await page.getByTestId('alert-btn').click();
            await page.getByTestId('alert-btn').click();
            await page.getByTestId('alert-btn').click();

            expect(alertCount).toBe(3);
        });
    });

    // ==========================================================================
    // Confirm Handling
    // ==========================================================================

    test.describe('Confirm Dialogs', () => {
        test('should accept confirm dialog by default', async ({ page }) => {
            page.once('dialog', dialog => dialog.accept());
            await page.getByTestId('confirm-btn').click();
        });

        test('should reject confirm dialog', async ({ page }) => {
            page.once('dialog', dialog => dialog.dismiss());
            await page.getByTestId('confirm-btn').click();
        });

        test('should capture confirm message', async ({ page }) => {
            page.once('dialog', dialog => {
                expect(dialog.message()).toEqual('Do you want to proceed?');
                dialog.accept();
            });
            await page.getByTestId('confirm-btn').click();
        });
    });

    // ==========================================================================
    // Prompt Handling
    // ==========================================================================

    test.describe('Prompt Dialogs', () => {
        test('should stub prompt and return value', async ({ page }) => {
            page.once('dialog', dialog => dialog.accept('Test User'));
            await page.getByTestId('prompt-btn').click();
            await expect(page.getByTestId('native-dialog-result')).toContainText('User entered: "Test User"');
        });

        test('should stub prompt to simulate cancel', async ({ page }) => {
            page.once('dialog', dialog => dialog.dismiss());
            await page.getByTestId('prompt-btn').click();
            await expect(page.getByTestId('native-dialog-result')).toContainText('User cancelled');
        });

        test('should verify prompt default value', async ({ page }) => {
            page.once('dialog', dialog => {
                expect(dialog.message()).toBe('Please enter your name:');
                expect(dialog.defaultValue()).toBe('Guest');
                dialog.accept('Entered Name');
            });
            await page.getByTestId('prompt-btn').click();
        });
    });

    // ==========================================================================
    // Custom Modal Dialogs
    // ==========================================================================

    test.describe('Custom Modal Dialogs', () => {
        test('should open and close info modal', async ({ page }) => {
            await page.getByTestId('info-modal-btn').click();
            await expect(page.getByTestId('info-modal')).toHaveClass(/show/);
            await expect(page.getByTestId('info-modal-title')).toContainText('Information');

            await page.getByTestId('info-modal-close').click();
            await expect(page.getByTestId('info-modal')).not.toHaveClass(/show/);
        });

        test('should handle delete confirmation modal - confirm', async ({ page }) => {
            await page.getByTestId('delete-modal-btn').click();
            await expect(page.getByTestId('delete-modal')).toHaveClass(/show/);
            await expect(page.getByTestId('delete-modal-content')).toContainText('cannot be undone');

            await page.getByTestId('delete-modal-confirm').click();
            await expect(page.getByTestId('delete-modal')).not.toHaveClass(/show/);
            await expect(page.getByTestId('modal-result')).toContainText('Item deleted');
        });

        test('should handle delete confirmation modal - cancel', async ({ page }) => {
            await page.getByTestId('delete-modal-btn').click();
            await page.getByTestId('delete-modal-cancel').click();

            await expect(page.getByTestId('delete-modal')).not.toHaveClass(/show/);
            await expect(page.getByTestId('modal-result')).toContainText('Delete cancelled');
        });

        test('should fill and submit form inside modal', async ({ page }) => {
            await page.getByTestId('form-modal-btn').click();

            await page.getByTestId('modal-name-input').fill('John Doe');
            await page.getByTestId('modal-message-input').fill('This is a test message');

            await page.getByTestId('form-modal-submit').click();
            await expect(page.getByTestId('form-modal')).not.toHaveClass(/show/);

            const result = page.getByTestId('modal-result');
            await expect(result).toContainText('John Doe');
            await expect(result).toContainText('test message');
        });
    });

    // ==========================================================================
    // Popup Windows (page.waitForEvent)
    // ==========================================================================

    test.describe('Popup Windows', () => {
        test('should handle new popup window', async ({ page }) => {
            // Start waiting for new page before clicking. Note no await.
            const popupPromise = page.waitForEvent('popup');
            await page.getByTestId('popup-btn').click();
            const popup = await popupPromise;

            // Wait for popup to load.
            await popup.waitForLoadState();

            // Verify popup url or content
            // The app opens '/' so we just check it loaded
            expect(popup.url()).not.toBe('about:blank');
        });
    });
});
