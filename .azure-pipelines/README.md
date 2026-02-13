# Azure DevOps Pipelines

This directory contains Azure DevOps Pipeline definitions that provide the same functionality as the GitHub Actions workflows in `.github/workflows/`.

## Pipelines

| Pipeline | GitHub Actions Equivalent | Purpose |
|----------|--------------------------|---------|
| [`ai-session-logger.yml`](./ai-session-logger.yml) | `ai-session-logger.yml` | Logs AI agent usage to session-log.md |
| [`auto-heal-tests.yml`](./auto-heal-tests.yml) | `auto-heal-tests.yml` | Creates work items for failing tests |
| [`requirement-tracer.yml`](./requirement-tracer.yml) | `requirement-tracer.yml` | Extracts test-to-requirement traceability |

## Setup Instructions

### Prerequisites

1. **Azure DevOps Project** with:
   - Azure Repos (Git)
   - Azure Pipelines enabled
   - Work Items enabled (for auto-heal)

2. **Permissions**:
   - Grant pipeline access to `System.AccessToken` for Git operations
   - Enable "Allow scripts to access the OAuth token" in pipeline settings

### Installation

#### Option 1: Azure DevOps UI

1. Go to **Pipelines** → **Create Pipeline**
2. Select **Azure Repos Git**
3. Choose **Existing Azure Pipelines YAML file**
4. Select the pipeline file from `.azure-pipelines/`
5. Click **Run**

#### Option 2: Azure CLI

```bash
# Login to Azure DevOps
az login
az devops configure --defaults organization=https://dev.azure.com/YOUR_ORG project=YOUR_PROJECT

# Create pipelines
az pipelines create --name "AI Session Logger" --yml-path .azure-pipelines/ai-session-logger.yml --repository YOUR_REPO
az pipelines create --name "Auto-Heal Tests" --yml-path .azure-pipelines/auto-heal-tests.yml --repository YOUR_REPO
az pipelines create --name "Requirement Tracer" --yml-path .azure-pipelines/requirement-tracer.yml --repository YOUR_REPO
```

### Configuration

#### 1. AI Session Logger

**Triggers**:
- Automatic: When test files (`.spec.ts`, `.cy.ts`) are modified
- Manual: Run with parameters to specify agent used

**Required Settings**:
- Enable "Allow scripts to access the OAuth token"
- Grant `Contribute` permission to build service account

**Parameters**:
- `sessionDescription`: Optional description
- `agentUsed`: Which AI agent was used (auto-detected from commit message)

#### 2. Auto-Heal Tests

**Triggers**:
- Manual: Run after CI test failures
- Can be triggered by other pipelines

**Required Settings**:
- Enable Work Items
- Grant `Create` work item permission to build service

**Parameters**:
- `testFile`: Optional specific test file to heal
- `framework`: `playwright` or `cypress`

**Outputs**:
- Creates Azure DevOps Work Item with healing instructions
- Tags: `test-failure`, `ai-healing`, framework name

#### 3. Requirement Tracer

**Triggers**:
- Automatic: When test files are modified
- Pull Request: Posts coverage report as PR comment

**Required Settings**:
- Enable "Allow scripts to access the OAuth token"
- Grant `Contribute to pull requests` permission

**Outputs**:
- Updates `.github/memory/traceability-matrix.md`
- Posts PR comment with coverage report
- Publishes traceability reports as build artifact

---

## Key Differences from GitHub Actions

### Syntax

| Feature | GitHub Actions | Azure Pipelines |
|---------|---------------|-----------------|
| **Triggers** | `on:` | `trigger:`, `pr:` |
| **Jobs** | `jobs:` | `stages:`, `jobs:` |
| **Steps** | `steps:` | `steps:` |
| **Variables** | `${{ }}` | `$()`, `${{ }}` |
| **Outputs** | `::set-output` | `##vso[task.setvariable]` |

### Authentication

**GitHub Actions**:
```yaml
git push
```
Uses `GITHUB_TOKEN` automatically.

**Azure Pipelines**:
```yaml
git -c http.extraheader="AUTHORIZATION: bearer $(System.AccessToken)" push origin HEAD:$(Build.SourceBranchName)
```
Requires explicit `System.AccessToken` usage.

### Issue/Work Item Creation

**GitHub Actions**:
- Uses `actions/github-script` to create issues

**Azure Pipelines**:
- Uses Azure DevOps REST API to create work items
- Requires `$(System.AccessToken)` for authentication

---

## Troubleshooting

### "TF401027: You need the Git 'GenericContribute' permission"

**Solution**: Grant build service account `Contribute` permission:
1. Go to **Project Settings** → **Repositories**
2. Select your repository
3. Go to **Security** tab
4. Find `[Project Name] Build Service`
5. Set `Contribute` to **Allow**

### "Failed to create work item"

**Solution**: Grant work item permissions:
1. Go to **Project Settings** → **Permissions**
2. Find `[Project Name] Build Service`
3. Grant `View work items in this node` and `Create work items in this node`

### Session log not committing

**Solution**: Enable OAuth token access:
1. Edit your pipeline
2. Click **...** (More actions) → **Settings**
3. Enable "Allow scripts to access the OAuth token"
4. Save and re-run

---

## Dual Support Strategy

This repository supports **both** GitHub and Azure DevOps:

| Feature | GitHub | Azure DevOps |
|---------|--------|--------------|
| **Repository** | GitHub Repos | Azure Repos |
| **CI/CD** | GitHub Actions | Azure Pipelines |
| **Issues/Work Items** | GitHub Issues | Azure Boards |
| **Session Logging** | ✅ | ✅ |
| **Auto-Healing** | ✅ | ✅ |
| **Requirement Tracing** | ✅ | ✅ |

**Agent files and prompts work identically** in both environments when used with GitHub Copilot in VS Code.

---

## Migration from GitHub to Azure

If migrating from GitHub Actions:

1. **Import Repository**:
   ```bash
   git remote add azure https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/YOUR_REPO
   git push azure --all
   ```

2. **Create Pipelines**: Follow setup instructions above

3. **Migrate Issues to Work Items**: Use [Azure DevOps Migration Tool](https://marketplace.visualstudio.com/items?itemName=solidify.azure-devops-migration-tools)

4. **Update Documentation**: Both GitHub and Azure pipelines can coexist

---

## Further Reading

- [Azure Pipelines YAML Schema](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema)
- [Azure DevOps REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops)
- [Predefined Variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables)
