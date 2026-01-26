# Locator Strategy - Playwright Best Practices

## Table of Contents

1. [Overview](#overview)
2. [Priority Order](#priority-order)
3. [Semantic vs Technical Locators](#semantic-vs-technical-locators)
4. [Accessibility-First Approach](#accessibility-first-approach)
5. [Anti-Patterns](#anti-patterns)
6. [Refactoring Patterns](#refactoring-patterns)
7. [Real-World Examples](#real-world-examples)

## Overview

Playwright strongly recommends **user-facing locators** that mirror how real users interact with your application. This approach creates tests that are:

- **More resilient** to implementation changes
- **Easier to maintain** over time
- **Better for accessibility** by validating proper semantic HTML
- **More readable** for developers and QA

### Core Principle

> **"Locate elements the way users would identify them"**

Users don't care about CSS classes or element IDs. They look for:
- Button labels ("Submit", "Cancel")
- Form field labels ("Email", "Password")  
- Text content ("Welcome back")
- Interactive roles (button, link, checkbox)

## Priority Order

Use this strict priority order when selecting elements:

### 1. **getByRole()** - Highest Priority ⭐

**Use for**: Interactive elements with ARIA roles

```typescript
// Buttons
page.getByRole('button', { name: 'Submit' })
page.getByRole('button', { name: /sign in/i }) // Case-insensitive regex

// Links
page.getByRole('link', { name: 'Learn more' })
page.getByRole('link', { name: 'Home' })

// Form elements
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Remember me' })
page.getByRole('radio', { name: 'Option A' })
page.getByRole('listbox', { name: 'Country' })

// Headings
page.getByRole('heading', { name: 'Dashboard', level: 1 })
page.getByRole('heading', { name: /user profile/i })

// Navigation
page.getByRole('navigation')
page.getByRole('banner') // header
page.getByRole('contentinfo') // footer
```

**Why it's best**:
- Validates proper semantic HTML and accessibility
- Resilient to styling changes
- Matches how screen readers announce elements
- Self-documenting code

**Common roles**:
- `button` - Buttons and button-like elements
- `link` - Hyperlinks
- `textbox` - Text inputs
- `checkbox` - Checkboxes
- `radio` - Radio buttons
- `combobox` - Dropdown selects
- `heading` - Headings (h1-h6)
- `table` - Tables
- `row` - Table rows
- `cell` - Table cells
- `dialog` - Modal dialogs
- `navigation` - Navigation landmarks
- `banner` - Page header
- `contentinfo` - Page footer

### 2. **getByLabel()** - For Form Fields

**Use for**: Form inputs with associated labels

```typescript
// By label text
page.getByLabel('Email address')
page.getByLabel('Password')
page.getByLabel('First name')

// Case-insensitive
page.getByLabel(/email/i)

// Multiple words
page.getByLabel('Confirm password')
```

**Why it's good**:
- Tests that labels are properly associated (accessibility)
- Resilient to input ID changes
- Natural way users identify form fields

**HTML requirements**:
```html
<!-- Explicit association -->
<label for="email">Email address</label>
<input id="email" type="email" />

<!-- Implicit association -->
<label>
  Email address
  <input type="email" />
</label>
```

### 3. **getByPlaceholder()** - For Input Placeholders

**Use for**: Inputs with placeholder text (when no label exists)

```typescript
page.getByPlaceholder('Search...')
page.getByPlaceholder('Enter your email')
page.getByPlaceholder(/search/i)
```

**Best practice**: Use only when labels are not available. Labels are preferred for accessibility.

### 4. **getByText()** - For Text Content

**Use for**: Static text, paragraphs, list items

```typescript
// Exact match
page.getByText('Welcome back!')
page.getByText('No results found')

// Partial match
page.getByText('Welcome', { exact: false })

// Regex
page.getByText(/welcome/i)

// Within a specific element
page.locator('nav').getByText('Home')
```

**Why it's useful**:
- Tests visible text content
- Natural for user-facing messages
- Good for navigation links without explicit roles

### 5. **getByTestId()** - When Semantic Locators Fail

**Use for**: Complex components without semantic attributes

```typescript
page.getByTestId('submit-button')
page.getByTestId('user-profile-card')
page.getByTestId('nav-menu-toggle')
```

**When to use**:
- Third-party components without proper semantics
- Complex UI widgets (date pickers, custom dropdowns)
- Temporary solution while awaiting HTML improvements

**HTML requirement**:
```html
<div data-testid="user-profile-card">
  <!-- Component content -->
</div>
```

**Best practice**: Document why testid is needed and plan to refactor:
```typescript
// TODO: Replace with getByRole once <div> is changed to <button>
await page.getByTestId('custom-dropdown-trigger').click();
```

### 6. **locator()** - Last Resort Only ⚠️

**Use for**: When no other option works

```typescript
page.locator('.btn.btn-primary.submit')
page.locator('#user-profile')
page.locator('div.card:nth-child(3)')
page.locator('xpath=//button[@class="submit"]')
```

**When it's acceptable**:
- Legacy code waiting for refactoring
- Third-party components with no accessibility
- Complex selectors requiring CSS or XPath

**Always add a comment explaining why**:
```typescript
// Using CSS selector because third-party date picker lacks semantic attributes
// TODO: File issue with library to add proper ARIA roles
await page.locator('.react-datepicker__day--selected').click();
```

## Semantic vs Technical Locators

### Semantic Locators (Preferred)

**Definition**: Locators based on what users see and how they interact

```typescript
// ✅ Semantic - based on visible text and role
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');
await page.getByText('Welcome back!').isVisible();
```

**Advantages**:
- Resilient to HTML/CSS refactoring
- Self-documenting test code
- Validates accessibility
- Matches user mental model

### Technical Locators (Avoid)

**Definition**: Locators based on implementation details

```typescript
// ❌ Technical - fragile and opaque
await page.locator('#btn-submit').click();
await page.locator('input[name="email"]').fill('test@example.com');
await page.locator('.welcome-message').isVisible();
```

**Disadvantages**:
- Breaks when CSS classes change
- Doesn't validate accessibility
- Requires understanding implementation
- Hard to maintain

## Accessibility-First Approach

### Why Accessibility Matters for Testing

Following accessibility best practices makes your tests **more reliable** and **more maintainable**. It's a win-win:

| Accessibility Practice | Testing Benefit |
|------------------------|-----------------|
| Proper button elements | Can use `getByRole('button')` |
| Associated labels | Can use `getByLabel()` |
| Semantic headings | Can use `getByRole('heading')` |
| ARIA landmarks | Can navigate by `navigation`, `main`, `banner` |
| Alt text on images | Can verify images with `getByAltText()` |

### Testing Forces Better HTML

Using semantic locators reveals accessibility issues:

```typescript
// ❌ This test will fail if button is a <div>
await page.getByRole('button', { name: 'Submit' }).click();
// Error: No element with role 'button'

// Fix: Change <div> to <button> in HTML
// Now test passes AND page is more accessible
```

**Result**: Your tests drive improvements in HTML semantics.

### ARIA Roles Guide

```typescript
// Navigation
page.getByRole('navigation') // <nav> or role="navigation"
page.getByRole('banner')     // <header> or role="banner"  
page.getByRole('main')       // <main> or role="main"
page.getByRole('contentinfo') // <footer> or role="contentinfo"

// Forms
page.getByRole('form')       // <form> or role="form"
page.getByRole('search')     // role="search"

// Interactive
page.getByRole('button')     // <button> or role="button"
page.getByRole('link')       // <a href="...">
page.getByRole('tab')        // role="tab"
page.getByRole('dialog')     // role="dialog"
```

## Anti-Patterns

### ❌ Anti-Pattern 1: Generic CSS Selectors

```typescript
// ❌ BAD - fragile and non-semantic
await page.locator('.btn.btn-primary.ml-2').click();

// ✅ GOOD - semantic and resilient
await page.getByRole('button', { name: 'Submit' }).click();
```

### ❌ Anti-Pattern 2: Index-Based Selection

```typescript
// ❌ BAD - breaks when order changes
await page.locator('button').nth(2).click();

// ✅ GOOD - identifies specific button
await page.getByRole('button', { name: 'Delete' }).click();
```

### ❌ Anti-Pattern 3: XPath Without Justification

```typescript
// ❌ BAD - hard to read and maintain
await page.locator('xpath=//div[@class="card"][3]//button').click();

// ✅ GOOD - clear intent
await page.locator('.card').nth(2).getByRole('button', { name: 'View' }).click();
```

### ❌ Anti-Pattern 4: Chaining CSS Selectors

```typescript
// ❌ BAD - tightly coupled to HTML structure
await page.locator('div.container > ul.list > li:nth-child(2) > a').click();

// ✅ GOOD - focuses on user-visible content
await page.getByRole('list').getByRole('link', { name: 'Products' }).click();
```

### ❌ Anti-Pattern 5: Over-Specific Selectors

```typescript
// ❌ BAD - more specific than needed
await page.locator('form#login-form input#email-input[type="email"][name="email"]').fill('test@example.com');

// ✅ GOOD - just specific enough
await page.getByLabel('Email').fill('test@example.com');
```

## Refactoring Patterns

### Pattern 1: CSS Class → Role

**Before**:
```typescript
await page.locator('.submit-btn').click();
```

**After**:
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
```

**HTML Change** (if needed):
```html
<!-- Before -->
<div class="submit-btn">Submit</div>

<!-- After -->
<button type="submit">Submit</button>
```

### Pattern 2: ID → Label

**Before**:
```typescript
await page.locator('#email-input').fill('test@example.com');
```

**After**:
```typescript
await page.getByLabel('Email').fill('test@example.com');
```

**HTML Improvement**:
```html
<!-- Before -->
<input id="email-input" type="email" />

<!-- After -->
<label for="email-input">Email</label>
<input id="email-input" type="email" />
```

### Pattern 3: nth-child → Specific Text

**Before**:
```typescript
await page.locator('li:nth-child(3)').click();
```

**After**:
```typescript
await page.getByRole('listitem').filter({ hasText: 'Products' }).click();
// Or simpler:
await page.getByText('Products').click();
```

### Pattern 4: Complex Selector → Scoped Search

**Before**:
```typescript
await page.locator('div.modal div.footer button.primary').click();
```

**After**:
```typescript
const modal = page.getByRole('dialog');
await modal.getByRole('button', { name: 'Confirm' }).click();
```

### Pattern 5: Adding test-id → Temporary Solution

**Before** (no good selectors available):
```typescript
await page.locator('.custom-widget > div > span.trigger').click();
```

**Intermediate** (add data-testid):
```html
<div class="custom-widget">
  <div><span class="trigger" data-testid="widget-trigger">Open</span></div>
</div>
```

```typescript
// Temporary solution with TODO
// TODO: Replace with getByRole once custom-widget is refactored
await page.getByTestId('widget-trigger').click();
```

**After** (proper semantics):
```html
<div class="custom-widget">
  <button type="button">Open</button>
</div>
```

```typescript
// Final solution
await page.getByRole('button', { name: 'Open' }).click();
```

## Real-World Examples

### Example 1: Login Form

**❌ Poor approach** (technical locators):
```typescript
await page.locator('#email').fill('user@example.com');
await page.locator('#password').fill('password123');
await page.locator('button[type="submit"]').click();
```

**✅ Better approach** (semantic locators):
```typescript
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Password').fill('password123');
await page.getByRole('button', { name: 'Log in' }).click();
```

### Example 2: Navigation Menu

**❌ Poor approach**:
```typescript
await page.locator('nav ul li:nth-child(2) a').click();
```

**✅ Better approach**:
```typescript
await page.getByRole('navigation').getByRole('link', { name: 'Products' }).click();
```

### Example 3: Data Table

**❌ Poor approach**:
```typescript
const cell = await page.locator('table tr:nth-child(3) td:nth-child(2)').textContent();
```

**✅ Better approach**:
```typescript
const row = page.getByRole('row', { name: /John Doe/ });
const emailCell = row.getByRole('cell').nth(1); // Still needs nth, but scoped
const email = await emailCell.textContent();
```

### Example 4: Modal Dialog

**❌ Poor approach**:
```typescript
await page.locator('.modal.active .modal-footer .btn-confirm').click();
```

**✅ Better approach**:
```typescript
const dialog = page.getByRole('dialog', { name: 'Confirm Action' });
await dialog.getByRole('button', { name: 'Confirm' }).click();
```

### Example 5: Search Functionality

**❌ Poor approach**:
```typescript
await page.locator('.search-box input').fill('playwright');
await page.locator('.search-box button').click();
```

**✅ Better approach**:
```typescript
await page.getByPlaceholder('Search...').fill('playwright');
await page.getByRole('button', { name: 'Search' }).click();
// Or even better with label:
await page.getByLabel('Search').fill('playwright');
await page.getByRole('button', { name: 'Search' }).click();
```

## Quick Reference

| Element Type | Preferred Locator | Example |
|--------------|-------------------|---------|
| Button | `getByRole('button')` | `page.getByRole('button', { name: 'Submit' })` |
| Link | `getByRole('link')` | `page.getByRole('link', { name: 'Home' })` |
| Text input with label | `getByLabel()` | `page.getByLabel('Email')` |
| Text input with placeholder | `getByPlaceholder()` | `page.getByPlaceholder('Search...')` |
| Checkbox | `getByRole('checkbox')` | `page.getByRole('checkbox', { name: 'Remember me' })` |
| Radio button | `getByRole('radio')` | `page.getByRole('radio', { name: 'Option A' })` |
| Select dropdown | `getByLabel()` | `page.getByLabel('Country')` |
| Heading | `getByRole('heading')` | `page.getByRole('heading', { name: 'Dashboard' })` |
| Static text | `getByText()` | `page.getByText('Welcome!')` |
| Image | `getByAltText()` | `page.getByAltText('Company logo')` |
| Custom component | `getByTestId()` | `page.getByTestId('date-picker')` |

## Escalation Process

When forced to use technical locators:

1. **Document why**: Add comment explaining the limitation
2. **Create TODO**: Plan for refactoring
3. **File issue**: Track HTML improvements needed
4. **Share with team**: Discuss in code review

```typescript
// ESCALATION EXAMPLE:
// Using CSS selector because third-party library lacks semantic markup
// Issue #1234: Request proper ARIA roles from vendor
// TODO: Refactor to getByRole once fixed
await page.locator('.vendor-widget__button--primary').click();
```

## Resources

- [Playwright Locators Documentation](https://playwright.dev/docs/locators)
- [ARIA Roles Reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [WebAIM: Semantic Structure](https://webaim.org/techniques/semanticstructure/)
