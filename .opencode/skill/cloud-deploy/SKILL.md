---
name: cloud-deploy
description: Execute the cloud deployment workflow for the OpenCode configuration bundle, including packaging, validation, and remote rollout.
---
## Workflow
1. Package `.opencode/` + dependencies into the `dist/opencode-bundle.tar.gz` artifact.
2. Run CI validation (`npm run lint && npm run test && openspec validate plan-opencode-setup --strict`).
3. Apply environment overrides (secrets, provider auth) from `deploy/env/<target>.json`.
4. Upload bundle to the target (SSH, S3, or container registry) and restart the OpenCode service.
5. Verify remote `opencode --version` and `opencode agent list` show the new agents/skills.
6. Post deployment status to Slack and update beads/OpenSpec tasks plus the knowledge graph.

## Usage Template
```
Target: staging-opencode
Overrides: deploy/env/staging.json
Notes: include GPT-5.1 Codex tokens, refresh Slack webhook
```
I will respond with command plan, logs, and success/failure summary.
