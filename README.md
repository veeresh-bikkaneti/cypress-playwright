# Cypress Automation Framework

## Overview
This project is an automated testing framework using Cypress and TypeScript, designed to test a modern web application including REST and GraphQL APIs.

> **🆕 New to this project?**
> Check out our [Beginner's Guide](BEGINNER_GUIDE.md) for a step-by-step introduction!
> We also have a [Docker Helper Guide](DOCKER_HELPER.md) and [TypeScript Guide](TYPESCRIPT_FOR_CYPRESS.md).

## Architecture
- **Framework**: Cypress + TypeScript
- **Pattern**: Page Object Model (POM) for UI tests; Custom Commands for API interactions
- **Reporting**: Allure + Mochawesome
- **CI/CD**: Docker-ready configuration

### Directory Structure
- `cypress/e2e/tests/`: Test specifications (specs)
- `cypress/e2e/pages/`: Page Object definitions (UI abstraction)
- `cypress/test-app/`: Local Node.js test application (Server + UI)

## How to Run Tests

### Prerequisites
- Node.js (v16+)
- NPM

### 1. Start the Application Server
The tests run against a local server.
```bash
node cypress/test-app/server.js
```
*Note: The server runs on `http://localhost:3000` (UI) and `http://localhost:3001` (Secondary).*

### 2. Run All Tests
To execute the full suite (Headless):
```bash
npm run cy:run
```
*This command waits for port 3000 automatically.*

### 3. Run Specific Tests
To run a specific spec file:
```bash
npx cypress run --browser edge --spec "cypress/e2e/tests/graphql.test.ts"
```

### 4. Open Interactive Mode
To run tests with the Cypress UI runner:
```bash
npm run cy:open
```

### 5. Run with Video Recording
To generate video recordings of the test execution (saved to `cypress/reports/videos`):
```bash
npx cypress run --config video=true
```

### 6. Run with Docker (DevOps Guide)
The project is fully containerized using `docker-compose.yml` in the root. This ensures a consistent environment matching CI.

#### A. Build & Start Environment
To build the test app and runner images:
```bash
# Build images explicitly
docker-compose build

# Pull pre-built images (if using a registry)
docker-compose pull
```

#### B. Execute Tests
**Option 1: Run Full Suite (App + Runner)**
Spins up the app, runs all Cypress tests, and shuts down on completion.
```bash
docker-compose up --abort-on-container-exit --exit-code-from cypress
```

**Option 2: Run Cypress Interactively (Specific Spec)**
If the app is already running (or you want to run one spec against the containerized app):
```bash
# 1. Start the App
docker-compose up -d test-app

# 2. Run Specific Spec
docker-compose run --rm cypress run --spec "cypress/e2e/tests/login.test.ts"
```

#### C. View Results & Artifacts
The containers mount volumes to your local host, so you can view results instantly without entering the container.

| Artifact Type | Host Location | Description |
|---------------|---------------|-------------|
| **HTML Report** | `./cypress/reports/html/index.html` | Open this file in your browser to see the Mochawesome report. |
| **Allure Results** | `./reports/ui/allure-results/` | Raw JSON data for Allure. |
| **Videos** | `./cypress/reports/videos/` | MP4 recordings of the test runs. |
| **Screenshots** | `./cypress/reports/screenshots/` | Images captured during failures. |

#### D. Cleanup
To stop containers and remove volumes:
```bash
docker-compose down -v
```

## Reporting

### Allure Reports
Generate and view Allure reports after a run:
```bash
npm run report
```

### Mochawesome Reports
HTML reports are automatically generated in `cypress/reports/html/`.

## Agentic Workflow & Roles
This project is supported by a team of specialized AI agents defined in `.github/agents/`.

| Agent | Responsibility | Use Case |
|-------|----------------|----------|
| **QA Automation Engineer** | Test Infrastructure & E2E | "Fix flaky tests", "Add regression suite", "Setup CI/CD" |
| **Test Engineer** | Unit/Integration Tests | "Write unit tests for utils", "Check coverage" |
| **Backend Specialist** | API & Database | "Refactor GraphQL parser", "Optimize DB schema" |
| **Frontend Specialist** | UI/UX & Components | "Update design system", "Fix CSS layout", "Accessibility audit" |
| **Product Owner** | Requirements & Scope | "Define acceptance criteria", "Prioritize backlog" |
| **Performance Optimizer** | Speed & Efficiency | "Fix slow load times", "Optimize bundle size" |
| **Documentation Writer** | Docs & Guides | "Update README", "Write API docs", "Create changelog" |
| **Explorer Agent** | Codebase Navigation | "Map project structure", "Find dependencies" |
| **Cypress to Playwright** | Migration Specialist | "Convert cypress tests to playwright" |

## Key Features Tested
- **UI Interactions**: Forms, Dialogs, Modals, Uploads
- **Navigation**: Cross-origin (cy.origin), Reloads, History
- **State**: Storage (Cookies, LocalStorage), Session
- **API**: REST endpoints, GraphQL (Queries/Mutations)
- **Security**: Auth flows, Header checks
