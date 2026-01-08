---
name: qa
description: Run linters, tests, and formatters to validate code quality.
---
## What I do
- Run linters (eslint, prettier, etc.) per repository standards.
- Execute unit and integration tests.
- Run Playwright/e2e tests when applicable.
- Apply minimal formatting fixes to get clean signals.
- Report results with pass/fail status and blockers.

## Usage Template
```
Scope: <all | specific files/directories>
Checks: <lint, test, format, e2e, all>
Fix: <true | false - whether to auto-fix issues>
```

## Output Format
Provide results as:
- **Lint**: PASS/FAIL + issue count
- **Tests**: PASS/FAIL + summary (X passed, Y failed)
- **Format**: PASS/FAIL + files changed
- **Blockers**: Issues that must be fixed before proceeding
- **Warnings**: Non-blocking issues to address later

## Commands Reference
```bash
# Common lint/test commands
npm run lint
npm run test
npm run format
npx playwright test
```

## Guidelines
1. Run checks in order: lint → format → test → e2e.
2. Apply only minimal fixes—push larger defects back for review.
3. Record every check with command and outcome.
4. Refuse to pass QA if blockers remain.
