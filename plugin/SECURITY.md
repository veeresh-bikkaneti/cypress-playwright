# Security Policy

## Air-Gapped Operation Guarantee

**Cypress2Playwright Using AI** is designed for enterprise environments with strict security requirements.

### Core Security Principles

| Principle | Guarantee |
|-----------|-----------|
| **Zero Outbound Traffic** | The plugin makes NO network requests. No data leaves your machine. |
| **No Telemetry** | No analytics, tracking, phone-home, or usage reporting. |
| **No API Keys Required** | No credentials are needed or stored. |
| **No External Dependencies** | No runtime npm packages that make network calls. |
| **Local-Only Operations** | All file operations are local filesystem only. |

### What This Means for Enterprise Users

1. **No Data Exfiltration** — The plugin itself makes no network requests. Your code, tests, and configurations are never sent anywhere by the plugin.
2. **No Cloud Dependencies** — Works fully offline after installation.
3. **No Vendor Lock-in** — All agent configs use `model: inherit` to respect your local/self-hosted model configuration.
4. **Audit-Friendly** — No hidden network calls to audit; all code is open source.

> **Note:** The AI agents this plugin configures may make outbound calls depending on your AI coding tool's settings (e.g., Copilot calling GitHub's API). That behavior is controlled by the tool itself, not this plugin. This plugin only installs configuration files.

### Network Activity Audit

The plugin and all installed templates have been audited for:

- ✅ Zero `fetch()`, `axios`, `http`, `https` calls in plugin code
- ✅ Zero outbound network requests in Python scripts
- ✅ No hardcoded API keys or credentials
- ✅ No telemetry or analytics code
- ✅ No phone-home or tracking mechanisms

### Runtime Documentation Fetching

The agent configurations instruct AI tools to fetch official documentation at runtime to ensure version compatibility:

| Source | URLs | Purpose |
|--------|------|---------|
| Playwright docs | `playwright.dev/docs/*` | Ensure API compatibility with installed version |
| Cypress docs | `docs.cypress.io/*` | Ensure API compatibility with installed version |

**Important:** These fetches are performed by the user's AI coding tool (e.g., Copilot, Claude, Cursor) at the user's discretion, not by this plugin. The plugin only installs instructions that tell the AI tool to check documentation. Enterprise users can:

- **Disable outbound fetches** by removing the version-agnostic instructions from the installed templates
- **Configure a local docs mirror** by modifying the URLs in the templates to point to an internal documentation server
- **Block all outbound traffic** at the network level — the plugin will still function with its built-in mappings, just without runtime version checking

### Agent Tool Permissions

The agent configurations declare allowed tools (Read, Write, Edit, Grep, Bash). These permissions are enforced by the user's AI coding tool, not by this plugin. Enterprise users can restrict agent tool access through their AI tool's settings.

### AI Model Configuration

All agent configurations use `model: inherit` which means:

- **No default cloud model** — The plugin does not specify which AI model to use
- **Respects your tool's configuration** — Uses whatever model your AI coding tool is configured with
- **Supports local models** — Works with Ollama, llama.cpp, LocalAI, or any self-hosted model
- **Supports enterprise proxies** — If your organization routes AI requests through a proxy, the plugin respects that

### File Operations

The plugin only performs:

- **Reading** template files from the installed npm package
- **Writing** template files to your project directory
- **No network I/O** — Zero socket connections, HTTP requests, or API calls

### Deployment Context

This plugin is designed for environments that enforce network-level controls. Because it makes zero outbound requests, it can be deployed in:

- Air-gapped / isolated networks
- Enterprise environments with outbound request gating
- Organizations with strict data residency requirements

Note: The plugin itself does not handle PII or regulated data — it installs configuration files. Compliance with specific standards (SOC 2, HIPAA, GDPR, FedRAMP) depends on your broader infrastructure and policies.

### Reporting Security Issues

If you discover a security concern, please open an issue at:
https://github.com/vbikkaneti/cypress-playwright/issues

### Security Checklist for Enterprise Deployment

Before deploying in your organization:

- [ ] Verify no outbound network calls (use network monitoring tools)
- [ ] Review all agent configurations for your AI tool
- [ ] Configure `model: inherit` or your preferred local model
- [ ] Test in isolated environment first
- [ ] Audit installed files for compliance with your security policy
