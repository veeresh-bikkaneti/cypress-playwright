const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'test-output/cypress-output';
const FAILED_LOG = path.join(OUTPUT_DIR, 'failed-log.json');
const TERMINAL_LOG = path.join(OUTPUT_DIR, 'cypress.log');

console.log(' Diagnosing Cypress Failures...');

if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(' Error: Output directory not found. Run tests first.');
    process.exit(1);
}

// 1. Gather Failed Tests
let failedTests = [];
if (fs.existsSync(FAILED_LOG)) {
    try {
        const logs = JSON.parse(fs.readFileSync(FAILED_LOG, 'utf8'));
        // Assuming structure, adapt if failed-log plugin schema differs
        console.log(` Found ${Object.keys(logs).length} failed test entries.`);
    } catch (e) {
        console.error(' Error parsing failed log:', e.message);
    }
}

// 2. Check Terminal Log for Errors
if (fs.existsSync(TERMINAL_LOG)) {
    const logContent = fs.readFileSync(TERMINAL_LOG, 'utf8');
    const criticalErrors = logContent.split('\n').filter(l => l.includes('Error:') || l.includes('Failed'));
    console.log(` Found ${criticalErrors.length} critical errors in terminal log.`);
    if (criticalErrors.length > 0) {
        console.log(' --- Sample Errors ---');
        console.log(criticalErrors.slice(0, 5).join('\n'));
    }
}

console.log(' Diagnosis Complete. Please share these findings with the Cypress Healer agent.');
