# Change: Deploy OpenCode Web to Railway with GitHub OAuth

## Why
You need remote access to OpenCode Web from anywhere with secure authentication. Currently, OpenCode runs only locally, creating friction when working across devices or needing persistent agent execution. Railway provides the simplest deployment path with:
- Built-in GitHub OAuth integration (no custom auth needed)
- Browser-based OpenCode Web interface
- Shell access via Railway CLI
- Persistent disk for workspace data
- Automatic HTTPS with custom domains
- Simple git sync workflow for agents repo

This enables you to access OpenCode Web from any device, authenticated via your GitHub account, with full shell access and the ability to clone/pull your agents repository remotely.

## What Changes
- Add **Railway configuration** (`railway.json` or `railway.toml`) for deployment settings
- Add **GitHub OAuth integration** with username allowlist (only your GitHub account)
- Add **OpenCode Web server configuration** with authentication middleware
- Add **persistent disk mount** for `.opencode/` data and workspace
- Add **git sync automation** for cloning/pulling agents repo
- Add **deployment script** (`.opencode/scripts/deploy-railway.sh`) for streamlined workflow
- Add **documentation** for Railway deployment, access methods, and cost optimization

## Impact
- **Affected specs:**
  - New spec: `opencode-web-deployment` (Railway deployment capability)
- **Affected code:**
  - New file: `railway.json` (~60 lines)
  - New file: `.opencode/scripts/deploy-railway.sh` (~200 lines)
  - New file: `.opencode/scripts/railway-auth-proxy.js` (~150 lines - GitHub OAuth middleware)
  - New file: `.opencode/config/railway-opencode.json` (~30 lines - OpenCode Web config)
  - Updated: `README.md` (deployment section)
  - Updated: `AGENTS.md` (cloud deployment section)
- **Related beads:** Create issue for Railway deployment implementation
- **Breaking changes:** None - purely additive deployment option
- **Migration path:** Existing local workflows unchanged; Railway deployment is opt-in

## Cost Summary
| Resource | Estimated Monthly Cost |
|----------|------------------------|
| Railway Starter (512MB RAM, 1GB disk) | $5 |
| Railway Pro (1GB RAM, 5GB disk) | $10 |
| Custom domain (optional) | $0 (Railway provides free subdomain) |
| Data Transfer | Usually included |
| **Total** | **$5-10/month** |

Note: LLM API costs (Claude, OpenAI, etc.) are external and vary by usage.

## Access Methods
1. **Web UI** - Browser access at `https://your-app.up.railway.app`
2. **Shell** - Railway CLI: `railway run bash` or `railway shell`
3. **Git Operations** - Auto-sync on deploy + manual pull commands
4. **OpenCode Web** - Full web interface with session management
