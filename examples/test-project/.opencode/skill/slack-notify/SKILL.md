---
name: slack-notify
description: Post structured updates to designated Slack channels with beads/OpenSpec references and action items.
---
## What I do
- Send formatted messages to `#eng-ai`, `#shipping`, or other configured channels.
- Include status context (phase, owner, blockers) plus links to beads issues, OpenSpec changes, PRs, and action items.
- Append messages to the knowledge graph so later queries can replay decisions.

## Usage Template
```
Channel: #eng-ai
Title: QA pass for GPT-5.1 Codex agents
Beads: agents-zr8
Change: plan-opencode-setup
Status: QA complete; handing off to Release
Highlights:
- ✅ Lint/test suite (npm run test) PASS
- ✅ Playwright smoke PASS
- ⚠️ Cloud deploy pending (needs secrets)
Actions:
- Release agent to run cloud workflow
- PM to sync Jira task JIRA-123 with new status
Links: PR #12, Test log gist
```
Provide the fields as plain text; the skill formats and posts them.

## Notes
- Keep updates short (<= 8 bullets). Use action verbs.
- Mention owners for each follow-up so action-items skill can remain synchronized.
