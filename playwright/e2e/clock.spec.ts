import { test, expect } from '@playwright/test';

// ============================================================================
// TIME MANIPULATION - page.clock
// ============================================================================

test.describe('Time Manipulation', () => {

    test('should control application time', async ({ page }) => {
        // Initialize clock at specific time
        await page.clock.install({ time: new Date('2023-01-01T00:00:00Z') });

        await page.goto('/');

        const pageTime = await page.evaluate(() => Date.now());
        // Allow for small time difference if clock install is slightly delayed or adjusted
        expect(pageTime).toBeGreaterThanOrEqual(new Date('2023-01-01T00:00:00Z').getTime());
        expect(pageTime).toBeLessThan(new Date('2023-01-01T00:00:05Z').getTime());
    });

    test('should trigger delayed actions instantly with clock.fastForward()', async ({ page }) => {
        await page.clock.install();
        await page.goto('/');

        // Initialize delayed element logic in the page
        await page.evaluate(() => {
            setTimeout(() => {
                const el = document.createElement('div');
                el.id = 'delayed-msg';
                el.innerText = 'Timeout Complete';
                document.body.appendChild(el);
            }, 5000);
        });

        // Verify message is NOT there yet
        await expect(page.locator('#delayed-msg')).not.toBeVisible();

        // Advance time by 5 seconds
        await page.clock.fastForward(5000);

        // Verify message appears
        await expect(page.locator('#delayed-msg')).toBeVisible();
    });
});
