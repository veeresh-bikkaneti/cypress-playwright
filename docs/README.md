# Cypress Capabilities Demo Documentation

Welcome to the comprehensive documentation for the Cypress Capabilities Demo project. This project demonstrates advanced Cypress testing features, including GraphQL testing, custom commands, and secure testing practices.

## 📚 Documentation Index

- **[Examples](examples.md)**: Detailed examples of Cypress test patterns.
- **[Locator Strategy](locator-strategy.md)**: Best practices for selecting elements.
- **[Usage Guide](usage.md)**: How to run and configure the tests.

## 🛡️ Security & OWASP

We prioritize security in our testing practices, following **OWASP Top 10** guidelines.

### Security Best Practices for Users
1. **Sanitize Inputs**: When writing tests, ensure test data does not trigger injection vulnerabilities unless explicitly testing for them.
2. **Sensitive Data**: Use `cypress.env.json` or system environment variables for credentials. **NEVER** commit secrets to the repository.
3. **Secure Cookies**: Verify that authentication cookies are set with `HttpOnly` and `Secure` flags.
4. **Dependency Management**: Run `npm run audit` regularly to check for vulnerable dependencies.

### Security Testing
The suite includes dedicated security tests (`security.test.ts`) that cover:
- **XSS Verification**: Ensuring scripts injected into inputs are not executed.
- **Access Control**: Verifying protected routes redirect unauthorized users.
- **Security Headers**: Checking for strictly enforced security headers.

For more details on running security audits, see the [Security Audit Script](../scripts/README.md).
