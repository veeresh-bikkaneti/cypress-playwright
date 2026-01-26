#!/bin/bash
# Cypress to Playwright Migration Validation Script
# Run this after each migration batch to ensure quality gates are met

set -e  # Exit on any initial error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

echo "========================================"
echo -e "${YELLOW}🔍 Cypress to Playwright Migration Validation${NC}"
echo "========================================"
echo ""

# Check 0: Infrastructure Check
echo "📋 Check 0: Infrastructure validation..."
if [ ! -f "../playwright.config.ts" ]; then
  echo -e "${RED}❌ FAIL: playwright.config.ts not found in project root${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ PASS: Playwright configuration found${NC}"
fi
echo ""

# Check 1: No Cypress code in tests/
echo "📋 Check 1: Scanning for leftover Cypress code..."
if grep -r '\bcy\.' ../tests/ --include="*.ts" 2>/dev/null; then
  echo -e "${RED}❌ FAIL: Found cy.* calls in tests/ directory${NC}"
  grep -r '\bcy\.' ../tests/ --include="*.ts" --color
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ PASS: No cy.* calls found${NC}"
fi
echo ""

# Check 2: No Cypress imports
echo "📋 Check 2: Scanning for Cypress imports..."
if grep -r "from ['\"]cypress['\"]" ../tests/ --include="*.ts" 2>/dev/null; then
  echo -e "${RED}❌ FAIL: Found Cypress imports in tests/${NC}"
  grep -r "from ['\"]cypress['\"]" ../tests/ --include="*.ts" --color
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ PASS: No Cypress imports found${NC}"
fi
echo ""

# Check 3: TypeScript compilation
echo "📋 Check 3: TypeScript compilation..."
if npx tsc --noEmit --project ../tsconfig.json; then
  echo -e "${GREEN}✅ PASS: TypeScript compilation successful${NC}"
else
  echo -e "${RED}❌ FAIL: TypeScript compilation errors${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Semantic locators usage
echo "📋 Check 4: Checking semantic locator usage..."
SEMANTIC_COUNT=$(grep -rE 'getByRole|getByLabel|getByText|getByPlaceholder|getByAltText|getByTitle' ../tests/ --include="*.ts" 2>/dev/null | wc -l)
CSS_COUNT=$(grep -rE '\.locator\(' ../tests/ --include="*.ts" 2>/dev/null | wc -l)

echo "   Semantic locators: $SEMANTIC_COUNT occurrences"
echo "   CSS selectors: $CSS_COUNT occurrences"

if [ "$SEMANTIC_COUNT" -gt "$CSS_COUNT" ]; then
  echo -e "${GREEN}✅ PASS: Semantic locators are preferred${NC}"
elif [ "$CSS_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: High usage of CSS selectors ($CSS_COUNT) vs Semantic locators ($SEMANTIC_COUNT)${NC}"
else
  echo -e "${GREEN}✅ PASS: Balanced or no locator usage detected yet.${NC}"
fi
echo ""

# Check 5: No waitForTimeout usage
echo "📋 Check 5: Checking for waitForTimeout usage..."
if grep -r 'waitForTimeout' ../tests/ --include="*.ts" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  WARNING: Found waitForTimeout usage${NC}"
  grep -r 'waitForTimeout' ../tests/ --include="*.ts" --color
else
  echo -e "${GREEN}✅ PASS: No waitForTimeout found${NC}"
fi
echo ""

# Check 6: Run Playwright tests
echo "📋 Check 6: Running Playwright tests..."
if npx playwright test; then
  echo -e "${GREEN}✅ PASS: All Playwright tests passed${NC}"
else
  echo -e "${RED}❌ FAIL: Some Playwright tests failed${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Final summary
echo "========================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ MIGRATION VALIDATION PASSED${NC}"
  echo "   All quality gates met. Ready for next batch."
  exit 0
else
  echo -e "${RED}❌ MIGRATION VALIDATION FAILED${NC}"
  echo "   Found $ERRORS critical issue(s). Fix before proceeding."
  exit 1
fi
