# Cypress Test Application

A self-contained test environment for learning and demonstrating **ALL** Cypress.io capabilities.

## 🎯 What is Cypress?

Cypress is a **free, open-source** end-to-end testing framework. **No registration or account required!** 
Everything runs locally on your machine.

## 📁 Architecture

```
cypressAllure/
├── config/
│   └── config.config.ts     # Cypress configuration
├── cypress/
│   ├── e2e/tests/           # Test files
│   │   ├── api.test.ts      # API interception tests
│   │   ├── forms.test.ts    # Form interaction tests
│   │   ├── dialogs.test.ts  # Alert/confirm/prompt tests
│   │   ├── browser.test.ts  # Viewport/scroll tests
│   │   └── storage.test.ts  # Cookie/localStorage tests
│   ├── fixtures/            # Test data (JSON files)
│   ├── support/             # Custom commands & setup
│   │   ├── commands.ts      # Custom Cypress commands
│   │   └── e2e.ts           # Global test configuration
│   └── test-app/            # ← The Application Under Test (AUT)
│       ├── server.js        # Express.js web server
│       ├── public/          # HTML pages to test
│       │   ├── index.html
│       │   ├── login.html
│       │   ├── dashboard.html
│       │   ├── forms.html
│       │   ├── dialogs.html
│       │   └── upload.html
│       └── docker-compose.yml
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start (Step by Step)

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Install Dependencies

Open a terminal and navigate to the cypressAllure folder:

```bash
cd cypress/cypressAllure
npm install
```

This downloads Cypress and other required packages. ⏱️ First time may take 2-3 minutes.

### Step 2: Start the Test Application (AUT)

The test application is a simple web server that Cypress will test against.

```bash
# In a NEW terminal window, navigate to the test-app folder:
cd cypress/cypressAllure/cypress/test-app
npm install
npm start
```

You should see: `Server running on http://localhost:3000`

### Step 3: Run Cypress Tests

With the test app running, open another terminal:

```bash
cd cypress/cypressAllure

# Option A: Interactive Mode (recommended for learning)
npm run cy:open

# Option B: Headless Mode (for CI/CD)
npm run cy:run

# Option C: Full E2E run with Allure report
npm run cy:e2e:run
```

## 📋 Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run cy:open` | Opens Cypress Test Runner (interactive, with browser) |
| `npm run cy:run` | Runs all tests headlessly (no browser window) |
| `npm run cy:e2e:run` | Runs tests + generates Allure report |
| `npm run report` | Opens the Allure test report |

## ❓ Frequently Asked Questions

### Do I need to register on Cypress.io?
**No!** Cypress is completely free and open-source. You don't need any account to use it. The Cypress.io website offers optional paid cloud services, but the core testing tool is 100% free.

### What is the "baseUrl"?
The `baseUrl` in the config points to your test application (`http://localhost:3000`). All `cy.visit('/path')` calls are relative to this URL.

### Why are there TypeScript errors in my editor?
If you see red squiggles, run `npm install` first. The errors disappear once Cypress types are installed.

### What is Allure?
Allure is an optional reporting tool that creates beautiful HTML test reports. It's included but not required.

## 🧪 Test Application Pages

| Page | URL | What It Tests |
|------|-----|---------------|
| Home | `/` | Navigation, products, scroll |
| Login | `/login` | Authentication, form validation |
| Dashboard | `/dashboard` | Protected routes, cookies, localStorage |
| Forms | `/forms` | All input types (text, select, checkbox, etc.) |
| Dialogs | `/dialogs` | Alert, confirm, prompt, custom modals |
| Upload | `/upload` | File upload and download |

## 🔧 API Endpoints (for cy.request() testing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/products` | Get product list |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/orders` | Create order (requires auth) |
| GET | `/api/slow-response?delay=ms` | Simulates slow API |
| GET | `/api/error/:code` | Returns specified error code |

**Test Credentials:**
- Email: `test@example.com`
- Password: `password123`

## 📚 Cypress Capabilities Demonstrated

### Core Commands
- ✅ `cy.visit()` - Navigate to URLs
- ✅ `cy.get()` - Find elements by CSS selector
- ✅ `cy.getByTestId()` - Custom command for data-testid
- ✅ `cy.type()` - Type into inputs
- ✅ `cy.click()` - Click buttons/links
- ✅ `cy.should()` - Make assertions

### Network Testing
- ✅ `cy.intercept()` - Mock/spy on API calls
- ✅ `cy.request()` - Make direct HTTP requests
- ✅ `cy.wait()` - Wait for specific requests

### Form Interactions
- ✅ `cy.type()` - With special keys ({enter}, {selectall})
- ✅ `cy.clear()` - Clear input fields
- ✅ `cy.select()` - Select dropdown options
- ✅ `cy.check()` / `cy.uncheck()` - Checkboxes

### Dialog Handling
- ✅ `cy.on('window:alert')` - Handle alert popups
- ✅ `cy.on('window:confirm')` - Accept/reject confirms
- ✅ `cy.stub()` - Mock window.prompt()

### Browser Control
- ✅ `cy.viewport()` - Test responsive design
- ✅ `cy.scrollTo()` - Scroll the page
- ✅ `cy.window()` - Access window object
- ✅ `cy.screenshot()` - Capture screenshots

### Storage
- ✅ `cy.setCookie()` / `cy.getCookie()` - Cookie management
- ✅ `cy.clearLocalStorage()` - Clear browser storage

## 🐳 Running with Docker (Optional)

If you prefer Docker:

```bash
cd cypress/cypressAllure/cypress/test-app

# Start everything
docker-compose up

# Or run in background
docker-compose up -d
```

## 🔍 Troubleshooting

### "Cannot find module 'cypress'"
Run `npm install` in the cypressAllure folder first.

### "Connection refused" or "baseUrl not accessible"
Make sure the test app is running (`npm start` in test-app folder).

### Port 3000 already in use
```bash
# Windows - find and kill the process
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### Allure report won't open
Make sure you have Java installed (required for Allure).

## 📖 Learning Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Examples](https://example.cypress.io/)
- [Cypress YouTube Channel](https://www.youtube.com/@Aborecord)

---
**Author:** Veeresh Bikkaneti
