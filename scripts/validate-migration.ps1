# Cypress to Playwright Migration Validation Script (PowerShell)
# Run this after each migration batch to ensure quality gates are met

$ErrorActionPreference = "Stop"
$script:ErrorCount = 0

function Update-ErrorCount {
    $script:ErrorCount++
}

Write-Host "============================"
Write-Host "Cypress to Playwright Migration Validation"
Write-Host "============================"
Write-Host ""

# Check 0: Infrastructure Check
Write-Host "Check 0: Infrastructure validation..."
if (-not (Test-Path "..\playwright.config.ts")) {
    Write-Host "FAIL: playwright.config.ts not found in project root" -ForegroundColor Red
    Update-ErrorCount
}
else {
    Write-Host "PASS: Playwright configuration found" -ForegroundColor Green
}
Write-Host ""

# Check 1: No Cypress code in tests/
Write-Host "Check 1: Scanning for leftover Cypress code..."
$cypressCalls = Select-String -Path "..\tests\**\*.ts" -Pattern '\bcy\.' -ErrorAction SilentlyContinue
if ($cypressCalls) {
    Write-Host "FAIL: Found cy.* calls in tests/ directory" -ForegroundColor Red
    foreach ($match in $cypressCalls) {
        Write-Host "   -> $($match.Filename):$($match.LineNumber): $($match.Line.Trim())" -ForegroundColor Yellow
    }
    Update-ErrorCount
}
else {
    Write-Host "PASS: No cy.* calls found" -ForegroundColor Green
}
Write-Host ""

# Check 2: No Cypress imports
Write-Host "Check 2: Scanning for Cypress imports..."
$cypressImports = Select-String -Path "..\tests\**\*.ts" -Pattern "from ['""]cypress['""]" -ErrorAction SilentlyContinue
if ($cypressImports) {
    Write-Host "FAIL: Found Cypress imports in tests/" -ForegroundColor Red
    foreach ($match in $cypressImports) {
        Write-Host "   -> $($match.Filename):$($match.LineNumber)" -ForegroundColor Yellow
    }
    Update-ErrorCount
}
else {
    Write-Host "PASS: No Cypress imports found" -ForegroundColor Green
}
Write-Host ""

# Check 3: TypeScript compilation
Write-Host "Check 3: TypeScript compilation..."
try {
    npx tsc --noEmit --project ..\tsconfig.json
    Write-Host "PASS: TypeScript compilation successful" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: TypeScript compilation errors found" -ForegroundColor Red
    Update-ErrorCount
}
Write-Host ""

# Check 4: Semantic locators usage
Write-Host "Check 4: Checking semantic locator usage..."
$semanticCount = (Select-String -Path "..\tests\**\*.ts" -Pattern 'getByRole|getByLabel|getByText|getByPlaceholder|getByAltText|getByTitle' -ErrorAction SilentlyContinue | Measure-Object).Count
$cssCount = (Select-String -Path "..\tests\**\*.ts" -Pattern '\.locator\(' -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Host "   Semantic locators: $semanticCount occurrences"
Write-Host "   CSS selectors: $cssCount occurrences"

if ($semanticCount -gt $cssCount) {
    Write-Host "PASS: Semantic locators are preferred" -ForegroundColor Green
}
elseif ($cssCount -gt 0) {
    Write-Host "WARNING: High usage of CSS selectors ($cssCount) vs Semantic locators ($semanticCount)" -ForegroundColor Yellow
}
else {
    Write-Host "PASS: Balanced or no locator usage detected yet." -ForegroundColor Green
}
Write-Host ""

# Check 5: No waitForTimeout usage
Write-Host "Check 5: Checking for waitForTimeout usage..."
$timeoutUsage = Select-String -Path "..\tests\**\*.ts" -Pattern 'waitForTimeout' -ErrorAction SilentlyContinue
if ($timeoutUsage) {
    Write-Host "WARNING: Found waitForTimeout usage" -ForegroundColor Yellow
    foreach ($match in $timeoutUsage) {
        Write-Host "   -> $($match.Filename):$($match.LineNumber)" -ForegroundColor Gray
    }
}
else {
    Write-Host "PASS: No waitForTimeout found" -ForegroundColor Green
}
Write-Host ""

# Check 6: Run Playwright tests
Write-Host "Check 6: Running Playwright tests..."
npx playwright test
if ($LASTEXITCODE -eq 0) {
    Write-Host "PASS: All Playwright tests passed" -ForegroundColor Green
}
else {
    Write-Host "FAIL: Some Playwright tests failed" -ForegroundColor Red
    Update-ErrorCount
}
Write-Host ""

# Final summary
Write-Host "============================"
if ($script:ErrorCount -eq 0) {
    Write-Host "MIGRATION VALIDATION PASSED" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "MIGRATION VALIDATION FAILED" -ForegroundColor Red
    Write-Host "Found $script:ErrorCount critical issue(s)."
    exit 1
}
