# Cypress to Playwright Migration Project

> 🎓 **Perfect for beginners!** Learn test automation by exploring real Cypress and Playwright tests side-by-side.

[![Playwright](https://img.shields.io/badge/Playwright-v1.41+-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev)
[![Cypress](https://img.shields.io/badge/Cypress-v12+-17202C?style=flat-square&logo=cypress)](https://cypress.io)
[![Agents](https://img.shields.io/badge/AI_Agents-Active-8A2BE2?style=flat-square)](./.github/README.md)

---

## 🤔 What is this project?

This is a **learning playground** that shows you how to migrate from Cypress to Playwright. It includes:

1. ✅ **A working test app** - A simple website to test against (no setup headaches!)
2. ✅ **Real Cypress tests** - See how tests are written in Cypress
3. ✅ **Real Playwright tests** - See the same tests migrated to Playwright
4. ✅ **AI helpers** - Optional AI agents that can help you write or fix tests

**Perfect for**:
- 👨‍💻 Beginners learning test automation
- 🔄 Teams migrating from Cypress to Playwright
- 🎯 Interview prep (show off your testing skills!)

---

## 🚀 Get Started in 5 Minutes

### Step 1: Check You Have Node.js

You need Node.js version 16 or higher. Check by running:

```bash
node --version
```

**Don't have Node.js?** Download it from [nodejs.org](https://nodejs.org/)

### Step 2: Download This Project

```bash
# Clone the repository
git clone <repository-url>
cd cypress-playwright

# Install everything
npm install

# Install Playwright browsers (this takes a minute)
npx playwright install
```

**What just happened?** 
- `npm install` downloaded all the testing tools
- `npx playwright install` downloaded the browsers Playwright needs

### Step 3: Run Your First Test!

**Option A: Run Playwright Tests (Recommended)**

```bash
npx playwright test
```

That's it! Playwright will:
1. ✅ Start the test app automatically
2. ✅ Run all tests
3. ✅ Show you the results

**See the results**:
```bash
npx playwright show-report
```

**Option B: Run Cypress Tests**

```bash
# Terminal 1: Start the app
cd app-under-test
npm run dev

# Terminal 2: Run Cypress tests
npm run cy:run
```

---

## 📚 What Can I Do Here?

### 1. Learn Test Automation Basics

**Start here** if you're new to testing:

1. Look at the test app: http://localhost:3000 (after running `cd app-under-test && npm run dev`)
2. Read a simple test: `playwright/e2e/auth/login.spec.ts`
3. Run just that test: `npx playwright test login.spec.ts --headed`

The `--headed` flag shows the browser so you can see what's happening!

### 2. Compare Cypress vs Playwright

**See the difference** between the two frameworks:

- **Cypress version**: `cypress/e2e/tests/login.test.ts`
- **Playwright version**: `playwright/e2e/auth/login.spec.ts`

**Key differences**:
- Cypress uses `cy.` commands (like `cy.get()`)
- Playwright uses `await page.` (like `await page.fill()`)
- Playwright needs `await` but is more powerful!

### 3. Try the AI Helpers (Optional)

If you use **GitHub Copilot** in VS Code, try these commands:

```
@qa-orchestrator create tests for login
/playwright-create checkout flow
/cypress-heal cypress/e2e/broken-test.cy.ts
```

**Don't have GitHub Copilot?** No worries! You can still learn everything manually.

---

## 🎯 Common Tasks

### Run a Single Test

```bash
# Playwright (easier - auto-starts app)
npx playwright test login.spec.ts

# Cypress (need to start app first)
cd app-under-test && npm run dev    # Terminal 1
npm run cy:run -- --spec "cypress/e2e/tests/login.test.ts"  # Terminal 2
```

### See Tests Run in the Browser

```bash
# Playwright
npx playwright test --headed

# Or use UI mode (interactive!)
npx playwright test --ui
```

### Debug a Failing Test

```bash
# Playwright shows you exactly what happened
npx playwright test --debug

# Or check the report
npx playwright show-report
```

---

## 📂 Project Structure Explained

```
cypress-playwright/
│
├── app-under-test/          # 🌐 The website being tested
│   ├── server.js            #    - Starts the test server
│   └── public/              #    - HTML pages for testing
│
├── cypress/                 # 🧪 OLD way (Cypress tests)
│   ├── e2e/tests/           #    - Test files
│   └── support/commands.ts  #    - Custom helper commands
│
├── playwright/              # ✨ NEW way (Playwright tests)
│   ├── e2e/                 #    - Test files
│   ├── pages/               #    - Page Objects (reusable code)
│   └── fixtures/            #    - Test data and helpers
│
├── test-output/             # 📊 Test results appear here
│   ├── playwright-output/   #    - Playwright reports
│   └── cypress-output/      #    - Cypress reports
│
└── .github/                 # 🤖 AI agent configurations (optional)
```

---

## ❓ Help! Something's Not Working

### "Port 3000 is already in use"

Something is already running on port 3000. Kill it:

**Windows:**
```powershell
npx kill-port 3000
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill
```

### "Cannot navigate to invalid URL"

The test app isn't running. Playwright should start it automatically, but if not:

```bash
# Start it manually
cd app-under-test
npm install   # Make sure dependencies are installed
npm run dev   # Start the server
```

Wait for "Server running on http://localhost:3000" then run tests.

### "Playwright browser not found"

The Playwright browsers aren't installed:

```bash
npx playwright install
```

### "Tests are failing"

1. **First, check the app is running**: Visit http://localhost:3000
2. **Check the error message**: Run `npx playwright show-report`
3. **See what happened**: Screenshots and videos are in `test-output/`

---

## 🎓 Learning Path

**Complete beginner?** Follow this path:

### Week 1: Understand the Basics
- [ ] Run Playwright tests and see them pass
- [ ] Open `login.spec.ts` and read the comments
- [ ] Run ONE test with `--headed` to watch it work
- [ ] Look at the HTML report: `npx playwright show-report`

### Week 2: Write Your First Test
- [ ] Look at `app-under-test/public/` to see what you can test
- [ ] Copy `login.spec.ts` and modify it (change the test data)
- [ ] Add a new test case
- [ ] Make it fail on purpose, then fix it

### Week 3: Understand Page Objects
- [ ] Read `playwright/pages/LoginPage.ts`
- [ ] See how tests use it: `playwright/e2e/auth/login.spec.ts`
- [ ] Create your own Page Object for a different page

### Week 4: Compare Frameworks
- [ ] Run the same test in both Cypress and Playwright
- [ ] Compare the syntax differences
- [ ] Understand why async/await is needed in Playwright

---

## 🚀 Advanced Features

### Run Tests in Parallel

```bash
# Playwright runs in parallel by default
npx playwright test

# Cypress can too
npm run cy:run -- --parallel
```

### Run Tests in Different Browsers

```bash
# Playwright
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Cypress
npm run cy:run -- --browser chrome
npm run cy:run -- --browser firefox
```

### Generate Test Report

```bash
# Playwright (automatic)
npx playwright show-report

# Cypress (after running tests)
# Open: test-output/cypress-output/html/index.html
```

---

## 🤖 About the AI Agents (Optional)

This project includes AI helpers that can:
- ✅ Write tests for you based on descriptions
- ✅ Fix broken tests automatically
- ✅ Migrate Cypress tests to Playwright

**How to use them**: See the [AI Guide](./.github/README.md)

**Don't want to use AI?** That's fine! Everything can be done manually.

---

## 📖 Further Reading

| Guide | What You'll Learn |
|-------|-------------------|
| [Migration Guide](./docs/MIGRATION_GUIDE.md) | How to convert Cypress code to Playwright |
| [Playwright Test Setup](./playwright/TEST_SETUP.md) | Why tests auto-start the server |
| [AI Agents Guide](./.github/README.md) | How to use AI helpers |

---

## 💡 Tips for Success

1. **Start small**: Run one test at a time until you understand it
2. **Use `--headed`**: See what the test is doing in a real browser
3. **Read error messages**: Playwright gives great error messages with screenshots
4. **Check the reports**: Visual HTML reports make debugging easy
5. **Don't skip Page Objects**: They make your tests easier to maintain

---

## 🙋 FAQ

**Q: Do I need to know Cypress to use this?**  
A: No! You can just learn Playwright. The Cypress tests are here for comparison.

**Q: Can I use this for my real project?**  
A: Yes! The patterns here work for real projects. Just replace `app-under-test` with your app.

**Q: Why are there two testing frameworks?**  
A: This shows you how to migrate FROM Cypress TO Playwright. Most new projects should just use Playwright.

**Q: Is Playwright better than Cypress?**  
A: Playwright is newer and more powerful (supports multiple browsers, faster, more features). But Cypress is still great!

**Q: Do I need the AI agents?**  
A: Nope! They're optional helpers. You can learn everything without them.

**Q: How long does it take to learn this?**  
A: Basics: 1-2 days. Comfortable: 1-2 weeks. Proficient: 1-2 months of practice.

---

## 🤝 Contributing

Found a bug? Have a suggestion? Open an issue!

Want to add more examples? Pull requests welcome!

---

## 📜 License

MIT License - feel free to use this for learning or your own projects!

---

**Ready to start?** Run this now:

```bash
npx playwright test --headed
```

Watch the magic happen! 🎩✨
