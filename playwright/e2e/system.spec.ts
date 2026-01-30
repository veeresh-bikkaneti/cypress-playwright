import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

// ============================================================================
// SYSTEM & FILESYSTEM CAPABILITIES
// ============================================================================

test.describe('System and Filesystem Capabilities', () => {

    const tempFileName = 'playwright/fixtures/temp-system-test.json';

    // ========================================================================
    // SYSTEM COMMANDS
    // ========================================================================

    test.describe('System Commands (Node.exec)', () => {
        test('should execute a system command', async () => {
            const msg = 'Hello from Playwright';
            // Playwright runs in Node, so we use child_process directly!
            const { stdout } = await execAsync(`echo ${msg}`);
            expect(stdout).toContain(msg);
        });
    });

    // ========================================================================
    // NODE TASKS (Native Mode)
    // ========================================================================

    test.describe('Node Tasks (Native)', () => {
        test('should log message to console', async () => {
            console.log('This message is printed to the terminal naturally in Playwright');
        });

        test('should get value from backend (Node)', async () => {
            const ts = Date.now();
            expect(typeof ts).toBe('number');
            expect(ts).toBeLessThanOrEqual(Date.now());
        });
    });

    // ========================================================================
    // FILE SYSTEM OPERATIONS
    // ========================================================================

    test.describe('File System (fs module)', () => {

        // Ensure directory exists
        const dir = path.dirname(tempFileName);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        test('should write to a file and read it back', async () => {
            const data = {
                test: 'System Capability',
                timestamp: Date.now()
            };

            // Write file using native fs
            fs.writeFileSync(tempFileName, JSON.stringify(data));

            // Read file
            const content = JSON.parse(fs.readFileSync(tempFileName, 'utf-8'));
            expect(content).toEqual(data);
        });

        test.afterAll(() => {
            if (fs.existsSync(tempFileName)) {
                fs.unlinkSync(tempFileName);
            }
        });
    });
});
