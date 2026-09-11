# Security Policy

## Air-Gapped Operation Guarantee

**Cypress2Playwright Using AI** is designed for enterprise environments with strict security requirements.

### Core Security Principles

| Principle                    | Guarantee                                                          |
| ---------------------------- | ------------------------------------------------------------------ |
| **Zero Outbound Traffic**    | The plugin makes NO network requests. No data leaves your machine. |
| **No Telemetry**             | No analytics, tracking, phone-home, or usage reporting.            |
| **No API Keys Required**     | No credentials are needed or stored.                               |
| **No External Dependencies** | No runtime npm packages that make network calls.                   |
| **Local-Only Operations**    | All file operations are local filesystem only.                     |

### What This Means for Enterprise Users

1. **No Data Exfiltration** — The plugin itself makes no network requests. Your code, tests, and configurations are never sent anywhere by the plugin.
2. **No Cloud Dependencies** — Works fully offline after installation.
3. **No Vendor Lock-in** — All agent configs use `model: inherit` to respect your local/self-hosted model configuration.
4. **Audit-Friendly** — No hidden network calls to audit; all code is open source.

> **Note:** The AI agents this plugin configures may make outbound calls depending on your AI coding tool's settings (e.g., Copilot calling GitHub's API). That behavior is controlled by the tool itself, not this plugin. This plugin only installs configuration files.

### Network Activity Audit

The plugin and all installed templates have been audited for:

- Zero `fetch()`, `axios`, `http`, `https` calls in plugin code
- No hardcoded API keys or credentials
- No telemetry or analytics code
- No phone-home or tracking mechanisms

### Version pinning (no runtime doc fetch)

Installed `AGENTS.md` and skills tell agents to **pin Cypress and Playwright APIs to the versions in the consumer `package.json`**. They do not instruct the agent to fetch `playwright.dev` or `docs.cypress.io` at runtime.

`--no-fetch` is a safety net: it strips leftover “version check / fetch docs” sections from **files this installer just wrote**. It does **not** walk the rest of the consumer repository.

### Agent Tool Permissions

Vendor adapters declare a small tool set (typically read / search / edit) and `model: inherit`. Permissions are enforced by the user's AI coding tool, not by this plugin. Enterprise users can restrict agent tool access through their AI tool's settings.

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
https://github.com/veeresh-bikkaneti/cypress-playwright/issues

### Security Checklist for Enterprise Deployment

Before deploying in your organization:

- [ ] Verify no outbound network calls (use network monitoring tools)
- [ ] Review all agent configurations for your AI tool
- [ ] Configure `model: inherit` or your preferred local model
- [ ] Test in isolated environment first
- [ ] Audit installed files for compliance with your security policy
