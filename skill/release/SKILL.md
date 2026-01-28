---
name: release
description: Handle git hygiene, PR prep, commits, and deployment.
---
## What I do
- Prepare clean git state (no untracked files, clean working tree).
- Summarize diffs and propose commit messages.
- Create/update PRs with proper descriptions.
- Post deployment status updates.

## Usage Template
```
Action: <commit | pr | deploy | status>
Message: <optional: commit message or PR title>
Context: <what changed, why>
```

## Actions

### commit
Prepare and create a commit:
1. Check git status for clean state
2. Stage relevant changes
3. Propose commit message following project conventions
4. Create commit (with user approval)

### pr
Create or update a pull request:
1. Ensure branch is pushed to remote
2. Generate PR description with:
   - Summary of changes
   - Beads/OpenSpec IDs
   - Test evidence
   - Deployment notes

### status
Report current release state:
- Git status (branch, commits ahead/behind)
- PR status if exists
- Deployment status if applicable

## Guidelines
1. Never proceed without QA sign-off.
2. Always include beads/OpenSpec IDs in PR descriptions.
3. Refuse to release if action items remain open.
4. Post deployment status to Slack.
