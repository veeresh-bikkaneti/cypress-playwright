# Security Policy

## Supported Versions

This project is actively maintained. Security updates are provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 **DO NOT** open a public GitHub issue for security vulnerabilities

Instead, please report security issues privately:

1. **Email**: Send details to the repository owner (check package.json for contact)
2. **GitHub Security Advisories**: Use the "Security" tab in this repository to report privately

### What to include in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (Critical: <7 days, High: <14 days, Medium: <30 days)

### Security Best Practices for Users

When using this testing framework:

1. **Never commit secrets** - Use environment variables for API keys, passwords, etc.
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Review test data** - Ensure test fixtures don't contain sensitive production data
4. **Secure CI/CD** - Use GitHub Secrets for sensitive environment variables
5. **Docker security** - Keep Docker images updated to latest versions

## Security Checklist

Before deploying:

- [ ] Run `npm audit` - Ensure 0 vulnerabilities
- [ ] Check `.gitignore` - Verify secrets are excluded
- [ ] Review environment variables - Use `.env.example` templates
- [ ] Update dependencies - Keep to latest stable versions
- [ ] Enable GitHub branch protection - Require reviews before merge

---

**Last Updated**: 2026-01-27
