# Security Policy

## Supported Versions

Only the latest version on the `main` branch receives security fixes.

| Version | Supported |
|---|---|
| `main` (latest) | Yes |
| Older commits and forks | No |

## Reporting a Vulnerability

Please **do not** open a public issue for security problems.

Report privately using either option:

1. **GitHub Private Vulnerability Reporting:** go to the **Security** tab of this repository and click **Report a vulnerability**.
2. **Email:** security@example.com (replace with your real address)

Please include:

- A clear description of the issue and its impact
- Steps to reproduce, or a proof of concept
- Affected browser, OS and commit or version
- Any suggested fix, if you have one

## What to Expect

| Step | Target time |
|---|---|
| Acknowledgement of your report | within 3 days |
| Initial assessment | within 7 days |
| Fix or mitigation plan | within 30 days, depending on severity |

You will be kept updated and credited in the fix notes if you wish. Please give us reasonable time to fix the issue before any public disclosure.

## Scope

This project is a static front-end experience with no backend, no database and no user accounts. In scope:

- Cross-site scripting (XSS) or unsafe HTML injection
- Vulnerable or malicious dependencies
- Leaked secrets, tokens or credentials in the repository
- Unsafe loading of third-party scripts or assets
- Misconfigured security headers

Out of scope:

- Denial of service from heavy WebGL rendering on low-end devices
- Issues that need physical access to a device
- Findings from automated scanners with no demonstrated impact
- Vulnerabilities in third-party services (Vercel, GitHub) that should be reported to them directly

## Security Practices

- No secrets or API keys are committed. Use `.env.local` for any future keys; it is git-ignored.
- All assets (model, images) are served from the same origin, not from third-party hosts.
- Dependencies are pinned through `package-lock.json`. Run `npm audit` before releases.
- Pull requests that add new dependencies must explain why they are needed.
- Never use `dangerouslySetInnerHTML` with untrusted content.