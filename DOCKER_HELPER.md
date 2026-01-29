# Docker Helper Guide 🐳

This guide helps you run the Cypress tests and the test application using Docker. This ensures that everyone runs the tests in the exact same environment, avoiding "it works on my machine" issues.

## Prerequisites

- **Docker Desktop**: Install it from [docker.com](https://www.docker.com/products/docker-desktop/).
- Ensure Docker is running (you should see the whale icon in your taskbar).

---

## Quick Start: Run Everything

The easiest way to run the tests is to spin up the entire environment (Test App + Cypress Runner) and let it finish.

```bash
# Open your terminal in the project root
npm run test:docker
```

**What this does:**
1. Builds the Test Application container.
2. Builds the Cypress Runner container.
3. Starts the app.
4. Runs **ALL** Cypress tests in headless mode.
5. Shuts down automatically when finished.

---

## Advanced: Run Interactively

Sometimes you don't want to run *everything*. Maybe you just want the app running so you can test it manually or run spec files locally.

### 1. Start ONLY the Test App
```bash
docker-compose up -d test-app
```
- `-d` means "detached" mode (runs in the background).
- The app will be available at `http://localhost:3000`.

### 2. Run Specific Tests in Docker
If the app is already running (from step 1), you can run a specific test file inside the Cypress container:

```bash
docker-compose run --rm cypress run --spec "cypress/e2e/tests/login.test.ts"
```

### 3. Stop Everything
When you are done, clean up the containers to free up memory.

```bash
docker-compose down
```

---

## Troubleshooting Docker 🛠️

### Issue: "Port 3000 is already in use"
**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`
**Solution:**
Something on your computer is already using port 3000 (maybe a local Node server?).
1. Find the process: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux).
2. Kill the process.
3. Or, just stop your local `npm start` server if you have one running.

### Issue: "Cypress failed to start"
**Error:** `Cypress failed to verify that your server is running`
**Solution:**
Docker containers need to talk to each other.
- Make sure you are using `baseUrl: 'http://test-app:3000'` in your cypress config **ONLY** when running in Docker.
- (Note: This project handles this automatically via `docker-compose.yml` environment variables).

### Issue: "I can't see the video files"
**Solution:**
The Docker container maps the `./cypress/reports` folder to your local machine.
1. Check your local project folder: `cypress/reports/videos`.
2. You might need to adjust folder permissions if you are on Linux, but on Windows/Mac this usually "just works".

---

## Need Help?
Check the `package.json` scripts or ask the project Maintainer.
