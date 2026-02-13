# AI Session Memory & Decision Log

## Purpose
This file tracks AI agent usage, decisions made, and test modifications to provide continuity across sessions and enable requirement traceability.

## How to Use

### Automatic Logging (Recommended)
Use the GitHub Actions workflow that automatically logs AI sessions:
- Workflow: `.github/workflows/ai-session-logger.yml`
- Triggered on: Test file changes, manual dispatch

### Manual Logging
When using AI agents manually, record your session here following the template below.

---

## Session Log Template

```markdown
### Session: [YYYY-MM-DD HH:MM]

**User Request**: [Brief description of what you asked the AI to do]

**Agent(s) Used**: 
- Primary: @[agent-name]
- Supporting: @[agent-name], @[agent-name]

**Requirements Identified**:
- Stated: [List stated requirements]
- Unstated: [List inferred requirements: accessibility, security, performance, etc.]

**Files Modified**:
- [file path] - [what changed]
- [file path] - [what changed]

**Tests Created/Modified**:
- [test file] - [test name] - [linked to requirement ID]

**Decisions Made**:
- [Decision]: [Rationale]
- [Decision]: [Rationale]

**Outcome**: ✅ Success / ⚠️ Partial / ❌ Failed

**Notes**: [Any additional context for future reference]
```

---

## Active Sessions

### Session: 2026-02-13 11:00

**User Request**: Restructure .github with AI orchestrator and QA personas

**Agent(s) Used**:
- Primary: Manual implementation by Antigravity
- Created: @qa-orchestrator, 5 QA personas

**Requirements Identified**:
- Stated: Orchestrator, personas, slash commands, BDD/AAA templates, framework version support
- Unstated: Enterprise compatibility, cost optimization, beginner-friendly docs

**Files Created**:
- `.github/agents/qa-orchestrator/main-orchestrator.md`
- `.github/agents/qa-orchestrator/model-config.json`
- `.github/agents/qa-roles/*.md` (5 personas)
- `.github/prompts/**/*.prompt.md` (5 prompt files)
- `.github/templates/*.md` (3 templates)

**Decisions Made**:
- Model Strategy: 1X for orchestrator, 0X for personas (cost optimization)
- Directory Structure: Framework-specific organization (cypress/, playwright/, qa-roles/)
- Compatibility: Agent mentions over slash commands for enterprise

**Outcome**: ✅ Success - Core infrastructure complete, workflows TBD

**Notes**: User identified missing memory system and workflows - adding in follow-up session

---

## Past Sessions

[Previous sessions will be logged here chronologically]

---

## Requirement Traceability Index

Use this section to link requirements → tests → files for quick reference.

| Requirement ID | Description | Test File(s) | Agent Used | Date Added |
|----------------|-------------|--------------|------------|------------|
| Example: AUTH-001 | User login | `playwright/e2e/login.spec.ts` | @automation-engineer | 2026-02-13 |

---

## AI Decision Patterns

Track common decisions made by AI agents for consistency:

### Test Structure Decisions
- **BDD vs AAA**: Use BDD for user-facing features, AAA for technical components
- **Page Objects**: Always create for pages with 3+ actions
- **Fixtures**: Create for authentication state, test data

### Selector Strategies
- **Priority Order**: `getByRole` → `getByLabel` → `getByTestId` → CSS (last resort)
- **Self-Healing**: Upgrade fragile selectors when test fails 2+ times

### Unstated Requirements
- **Always Include**: Accessibility (keyboard nav), Security (XSS prevention), Performance (< 3s load)
- **Context-Specific**: Add form validation, error handling, edge cases

---

## GitHub Actions Integration

This file is automatically updated by:
- `.github/workflows/ai-session-logger.yml` - Logs file changes attributed to AI
- `.github/workflows/requirement-tracer.yml` - Links tests to requirements
