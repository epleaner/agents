# OpenCode Web Railway Deployment

Deploy OpenCode Web to Railway with GitHub OAuth authentication.

## Quick Facts

- **Cost:** $15-30/month (Railway $10 + LLM APIs $5-20)
- **Time:** 16-20 hours implementation
- **Security:** GitHub OAuth + username allowlist + LLM spending limits

## What You Get

1. **Browser Access** - OpenCode Web at `https://your-app.up.railway.app`
2. **GitHub Auth** - Only your GitHub account can access
3. **Shell Access** - `railway run bash` for debugging
4. **Persistent Storage** - Workspace survives deploys
5. **Git Sync** - Auto-clone agents repo
6. **MCP Integration** - AI handles Railway operations via natural language

## Documentation

| File | Purpose |
|------|---------|
| `proposal.md` | Why and what changes |
| `design.md` | Technical architecture and decisions |
| `tasks.md` | Implementation checklist |
| `security-enhancements.md` | Advanced security (optional) |

## Architecture

```
User Browser
    ↓ GitHub OAuth
Railway Auth Proxy (validates username)
    ↓ Proxies requests
OpenCode Web Server (port 4096)
    ↓
Persistent Disk (/app/data)
├── .opencode/ (beads, sessions, config)
├── workspace/ (cloned agents repo)
└── logs/
```

## Quick Start

1. **Follow** `tasks.md` prerequisites and phases
2. **Reference** `design.md` for technical details
3. **Optional:** Review `security-enhancements.md` for advanced security

## Security (3 Essential Layers)

1. ✅ GitHub OAuth + username allowlist
2. ✅ LLM API spending limits  
3. ✅ Railway auto-sleep

Advanced security features in `security-enhancements.md` are **optional**.

## Railway MCP

You have Railway MCP installed - the AI can handle Railway operations via natural language:
- Create projects and environments
- Set environment variables
- Deploy services
- Generate domains
- View logs

Just describe what you want and the AI handles the CLI commands.
