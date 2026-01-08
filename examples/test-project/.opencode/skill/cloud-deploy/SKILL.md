---
name: cloud-deploy
description: Execute the cloud deployment workflow for the OpenCode configuration bundle, including packaging, validation, and remote rollout.
compatibility: Requires tar, rsync, curl, and jq
---
## Workflow
1. Package `.opencode/` + dependencies into the `dist/opencode-bundle.tar.gz` artifact.
2. Run CI validation (`npm run lint && npm run test && openspec validate plan-opencode-setup --strict`).
3. Apply environment overrides (secrets, provider auth) from `deploy/env/<target>.json`.
4. Upload bundle to the target (SSH, S3, or container registry) and restart the OpenCode service.
5. Verify remote `opencode --version` and `opencode agent list` show the new agents/skills.
6. Post deployment status to Slack and update beads/OpenSpec tasks plus the knowledge graph.

## Scripts

The `scripts/portable-config-bundle` script handles packaging, installation, and syncing:

```bash
# Package the .opencode bundle
scripts/portable-config-bundle package [--output PATH] [--include-node-modules]

# Install a packaged bundle
scripts/portable-config-bundle install [--archive PATH] [--dest PATH]

# Sync bundle into a repository
scripts/portable-config-bundle update --repo PATH [--bundle-dir PATH]

# List bundle contents
scripts/portable-config-bundle inventory

# Verify the full workflow
scripts/portable-config-bundle verify [--repo PATH]
```

## Usage Template
```
Target: staging-opencode
Overrides: deploy/env/staging.json
Notes: include GPT-5.1 Codex tokens, refresh Slack webhook
```
I will respond with command plan, logs, and success/failure summary.
