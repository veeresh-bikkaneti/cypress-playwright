/**
 * ============================================================================
 * BUILD SCRIPT - Strip data-testid for Production
 * ============================================================================
 * 
 * PURPOSE:
 * This script removes all data-testid attributes from HTML files for 
 * production builds. This is an industry-standard practice because:
 * 
 * 1. Reduces HTML payload size
 * 2. Prevents exposing internal testing selectors to end users
 * 3. Keeps the DOM cleaner in production
 * 
 * USAGE:
 *   node scripts/strip-testids.js
 * 
 * This will:
 * - Read all HTML files from cypress/test-app/public/
 * - Remove data-testid="..." attributes
 * - Write output to cypress/test-app/dist/
 * 
 * For React/Vue apps, use babel-plugin-react-remove-properties or 
 * vite-plugin-react-remove-attributes instead.
 * 
 * @author Veeresh Bikkaneti
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'cypress', 'test-app', 'public');
const OUTPUT_DIR = path.join(__dirname, '..', 'cypress', 'test-app', 'dist');

/**
 * Remove data-testid attributes from HTML content
 * @param {string} html - HTML content
 * @returns {string} - HTML without data-testid attributes
 */
function stripTestIds(html) {
    // Match data-testid="..." or data-testid='...'
    return html.replace(/\s*data-testid=["'][^"']*["']/g, '');
}

/**
 * Process all HTML files
 */
function processFiles() {
    console.log('🔧 Stripping data-testid attributes for production build...\n');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get all HTML files
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.html'));

    let totalRemoved = 0;

    files.forEach(file => {
        const sourcePath = path.join(SOURCE_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, file);

        const originalContent = fs.readFileSync(sourcePath, 'utf8');
        const strippedContent = stripTestIds(originalContent);

        // Count how many were removed
        const originalMatches = (originalContent.match(/data-testid=/g) || []).length;
        const strippedMatches = (strippedContent.match(/data-testid=/g) || []).length;
        const removed = originalMatches - strippedMatches;
        totalRemoved += removed;

        fs.writeFileSync(outputPath, strippedContent);
        console.log(`  ✅ ${file}: Removed ${removed} data-testid attributes`);
    });

    console.log(`\n📦 Production build complete!`);
    console.log(`   Total data-testid attributes removed: ${totalRemoved}`);
    console.log(`   Output directory: ${OUTPUT_DIR}\n`);
}

// Run the script
processFiles();
