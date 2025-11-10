# Security Policy

## Supported Versions

The following versions of Epitrello are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Epitrello seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **GitHub Security Advisories** (Preferred):
   - Go to https://github.com/mpJunot/Epitrello/security/advisories/new
   - Click "Report a vulnerability"
   - Fill in the details

2. **Email**:
   - Send an email to [benjamin.maillot@epitech.eu]
   - Use the subject line: "Epitrello Security Vulnerability"

### What to Include

Please include as much of the following information as possible:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Initial Response**: You should receive an acknowledgment within 48 hours
- **Status Updates**: We will keep you informed of the progress
- **Timeline**: We aim to address critical vulnerabilities within 7 days
- **Disclosure**: We follow coordinated disclosure and will work with you on timing

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations and data destruction
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report vulnerabilities as soon as discovered
- Do not access or modify data beyond what is necessary to demonstrate the vulnerability

We will not pursue legal action against researchers who follow these guidelines.

## Security Measures

Epitrello implements several security measures:

### Code Security

- **Automated Security Scanning**: CodeQL runs on every commit
- **Dependency Scanning**: Dependabot alerts for vulnerable dependencies
- **Code Review**: All changes require review before merging
- **Static Analysis**: ESLint with security rules enabled

### Application Security

- **Authentication**: Secure authentication mechanisms
- **Authorization**: Role-based access control
- **Data Encryption**: Encryption at rest and in transit
- **Input Validation**: Strict input validation and sanitization
- **HTTPS Only**: All traffic encrypted via HTTPS
- **CSRF Protection**: Cross-Site Request Forgery protection
- **XSS Prevention**: Content Security Policy and output encoding

### Infrastructure Security

- **Regular Updates**: Dependencies updated regularly via Dependabot
- **Security Headers**: Appropriate security headers configured
- **Rate Limiting**: API rate limiting to prevent abuse
- **Monitoring**: Active monitoring for suspicious activity

## Security Best Practices for Contributors

When contributing to Epitrello, please:

1. **Never commit secrets**: No API keys, passwords, or tokens in code
2. **Use environment variables**: For configuration and sensitive data
3. **Validate input**: Always validate and sanitize user input
4. **Use parameterized queries**: To prevent SQL injection
5. **Implement proper authentication**: Don't roll your own crypto
6. **Follow OWASP guidelines**: Familiarize yourself with OWASP Top 10
7. **Keep dependencies updated**: Regularly update and audit dependencies
8. **Use secure defaults**: Security should be the default, not opt-in
9. **Implement logging**: Log security-relevant events
10. **Review security implications**: Consider security impact of all changes

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed:

- **Critical**: Within 24-48 hours
- **High**: Within 7 days
- **Medium**: Within 30 days
- **Low**: In next regular release

## Acknowledgments

We appreciate the security research community's efforts to improve the security of Epitrello. Contributors who report valid security issues will be acknowledged in our security advisories (unless they prefer to remain anonymous).

### Hall of Fame

Security researchers who have responsibly disclosed vulnerabilities:

- (None yet - be the first!)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## Questions?

If you have any questions about this security policy, please open a discussion in our [GitHub Discussions](https://github.com/mpJunot/Epitrello/discussions).

---

**Last Updated**: November 2025
