# Change: Deploy OpenCode agents setup to Fly.io

## Why
Users need the ability to run OpenCode agents from anywhere without relying on a local development machine. A cloud deployment on Fly.io enables:
- Remote access to agents via SSH from any device
- Persistent workspaces that survive machine reboots/upgrades
- Collaboration through shared cloud environments
- CI/CD integration for automated agent workflows
- Always-on availability for long-running Ralph mode sessions

Currently, OpenCode runs exclusively locally, creating friction for users who work across multiple machines or need persistent agent execution.

## What Changes
- Add **Dockerfile** for containerizing the OpenCode environment with all dependencies
- Add **fly.toml** configuration for Fly.io deployment settings
- Add **deployment script** (`.opencode/scripts/deploy-flyio.sh`) for streamlined deployment workflow
- Add **documentation** for Fly.io deployment process and cost optimization
- Define persistent volume strategy for `.opencode/` data preservation across deploys

## Impact
- **Affected code:**
  - New file: `Dockerfile` (~50 lines)
  - New file: `fly.toml` (~40 lines)
  - New file: `.opencode/scripts/deploy-flyio.sh` (~150 lines)
  - Updated: `README.md` (deployment section)
- **Related beads:** Create issue for Fly.io deployment implementation
- **Breaking changes:** None - purely additive deployment option
- **Migration path:** Existing local workflows unchanged; Fly.io deployment is opt-in

## Cost Summary
| Resource | Estimated Monthly Cost |
|----------|------------------------|
| Fly Machine (shared-cpu-1x, 512MB) | ~$5-10 |
| Persistent Volume (1GB) | ~$0.15 |
| Data Transfer | Usually free tier |
| **Total** | **~$5-10/month** |

Note: LLM API costs (Claude, OpenAI, etc.) are external and vary by usage.
