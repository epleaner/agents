# Design: Deploy OpenCode Web to Railway with GitHub OAuth

## Context
OpenCode is a blueprint repository for AI-assisted development workflows with agents, skills, commands, and the OpenSpec framework. OpenCode Web provides a browser-based interface for managing sessions and interacting with agents. To enable remote access with secure authentication, we deploy to Railway - a platform that provides built-in GitHub OAuth, automatic HTTPS, persistent storage, and simple Node.js deployment.

## Goals / Non-Goals

**Goals:**
- Enable browser-based access to OpenCode Web from any device
- Secure access via GitHub OAuth (only authorized GitHub username)
- Preserve workspace state (beads database, session data, config) across deploys
- Provide shell access for git operations and debugging
- Minimize cost while maintaining acceptable performance
- Simple one-command deployment workflow
- Auto-sync agents repository on deploy

**Non-Goals:**
- Multi-tenant deployment (single user per instance)
- Auto-scaling (single instance sufficient for personal use)
- Custom authentication beyond GitHub OAuth
- Real-time collaboration features
- Mobile app (web-only for MVP)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  https://your-app.up.railway.app                        │   │
│  │  - OpenCode Web UI                                       │   │
│  │  - Session management                                    │   │
│  │  - Server status                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS (GitHub OAuth)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Railway Infrastructure                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Auth Proxy (Node.js Express)                           │   │
│  │  - GitHub OAuth flow                                     │   │
│  │  - Username allowlist check                              │   │
│  │  - Session management                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  OpenCode Web Server (port 4096)                        │   │
│  │  - Node.js 20                                            │   │
│  │  - OpenCode CLI                                          │   │
│  │  - git, curl, bash                                       │   │
│  │  - Repository code at /app                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Persistent Disk (5GB)                                   │   │
│  │  Mounted at /app/data                                    │   │
│  │  - .opencode/ (beads, sessions, config)                 │   │
│  │  - workspace/ (cloned agents repo)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Railway Environment Variables (encrypted)               │   │
│  │  - GITHUB_CLIENT_ID                                      │   │
│  │  - GITHUB_CLIENT_SECRET                                  │   │
│  │  - ALLOWED_GITHUB_USERNAME                               │   │
│  │  - SESSION_SECRET                                        │   │
│  │  - ANTHROPIC_API_KEY                                     │   │
│  │  - OPENAI_API_KEY                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Decisions

### 1. Platform: Railway over Fly.io

**Decision:** Use Railway as the deployment platform.

**Rationale:**
- Built-in GitHub OAuth support (no custom implementation needed)
- Simpler configuration for web applications
- Automatic HTTPS with custom domains
- Persistent disk included (no separate volume management)
- Better DX for Node.js applications
- One-click deploy from GitHub repo

**Alternative considered:** Fly.io
- Pros: More infrastructure control, slightly cheaper for minimal workloads
- Cons: Requires custom GitHub OAuth implementation, more complex setup for web apps, separate volume management
- Verdict: Railway's simplicity and built-in OAuth outweigh Fly.io's flexibility for this use case

### 2. Authentication: GitHub OAuth with Username Allowlist

**Decision:** Use GitHub OAuth with server-side username validation.

**Rationale:**
- No password management needed
- Leverages existing GitHub authentication
- Simple allowlist check (environment variable: `ALLOWED_GITHUB_USERNAME`)
- Can expand to multiple users later if needed
- Railway provides OAuth callback URL automatically

**Implementation:**
```javascript
// Auth middleware checks GitHub username
app.use((req, res, next) => {
  if (!req.session.githubUsername) {
    return res.redirect('/auth/github');
  }
  if (req.session.githubUsername !== process.env.ALLOWED_GITHUB_USERNAME) {
    return res.status(403).send('Unauthorized');
  }
  next();
});
```

**Alternative considered:** Basic auth with password
- Pros: Simpler implementation
- Cons: Password management, less secure, no identity verification
- Verdict: GitHub OAuth provides better security and UX

### 3. Architecture: Auth Proxy + OpenCode Web

**Decision:** Run auth proxy on port 3000, proxy authenticated requests to OpenCode Web on port 4096.

**Rationale:**
- Separation of concerns (auth vs application logic)
- OpenCode Web remains unchanged (no code modifications)
- Auth proxy handles OAuth flow and session management
- Easy to debug and test independently

**Flow:**
1. User visits `https://your-app.up.railway.app`
2. Auth proxy checks session
3. If not authenticated, redirect to GitHub OAuth
4. After OAuth callback, validate username against allowlist
5. If authorized, create session and proxy to OpenCode Web
6. All subsequent requests proxied with session validation

### 4. Persistent Storage: Railway Disk Mount

**Decision:** Mount Railway persistent disk at `/app/data` with symlinks to `.opencode/`.

**Rationale:**
- Railway provides persistent disk that survives deploys
- 5GB default size (expandable)
- Automatic backups
- Survives container restarts and redeployments

**Directory structure:**
```
/app/data/
├── .opencode/          # Beads DB, sessions, config
├── workspace/          # Cloned agents repo
└── logs/               # Application logs
```

**Symlink strategy:**
```bash
# In start script
ln -sf /app/data/.opencode /app/.opencode
ln -sf /app/data/workspace /app/workspace
```

### 5. Git Sync: Auto-clone on First Deploy

**Decision:** Automatically clone agents repo on first deploy, manual pull for updates.

**Rationale:**
- Ensures workspace is ready immediately
- Manual pull gives control over when to update
- Avoids conflicts with local changes

**Implementation:**
```bash
# In start script
if [ ! -d /app/data/workspace/.git ]; then
  git clone https://github.com/YOUR_USERNAME/agents.git /app/data/workspace
fi
```

**Manual sync command:**
```bash
railway run bash -c "cd /app/data/workspace && git pull"
```

### 6. OpenCode Web Configuration

**Decision:** Configure OpenCode Web to bind to `0.0.0.0:4096` with password disabled (auth handled by proxy).

**Rationale:**
- Auth proxy handles authentication
- OpenCode Web only accessible via proxy (not exposed externally)
- Port 4096 is OpenCode Web default
- Binding to 0.0.0.0 allows proxy to connect

**Configuration file:** `.opencode/config/railway-opencode.json`
```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "cors": ["http://localhost:3000"]
  }
}
```

**Environment variables:**
```bash
OPENCODE_SERVER_PASSWORD=""  # Disabled (auth via proxy)
OPENCODE_DATA_DIR="/app/data/.opencode"
```

### 7. Process Management: Single Process with Proxy

**Decision:** Run auth proxy as main process, spawn OpenCode Web as child process.

**Rationale:**
- Railway expects single process per service
- Auth proxy manages OpenCode Web lifecycle
- Graceful shutdown handling
- Logs from both processes captured

**Start script:**
```bash
#!/bin/bash
# Start OpenCode Web in background
opencode web --config /app/.opencode/config/railway-opencode.json &
OPENCODE_PID=$!

# Start auth proxy in foreground
node /app/.opencode/scripts/railway-auth-proxy.js

# Cleanup on exit
trap "kill $OPENCODE_PID" EXIT
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name:** OpenCode Web (Railway)
   - **Homepage URL:** `https://your-app.up.railway.app`
   - **Authorization callback URL:** `https://your-app.up.railway.app/auth/github/callback`
4. Click "Register application"
5. Copy **Client ID** and **Client Secret**

### 2. Set Railway Environment Variables

```bash
railway variables set GITHUB_CLIENT_ID=your_client_id
railway variables set GITHUB_CLIENT_SECRET=your_client_secret
railway variables set ALLOWED_GITHUB_USERNAME=your_github_username
railway variables set SESSION_SECRET=$(openssl rand -hex 32)
```

### 3. OAuth Flow

```
User → /auth/github
  ↓
GitHub OAuth consent screen
  ↓
GitHub → /auth/github/callback?code=...
  ↓
Exchange code for access token
  ↓
Fetch user profile (username)
  ↓
Check username === ALLOWED_GITHUB_USERNAME
  ↓
Create session → Redirect to /
```

## Railway Configuration

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "bash .opencode/scripts/start-railway.sh",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  },
  "healthcheck": {
    "path": "/health",
    "timeout": 10,
    "interval": 30
  }
}
```

### Environment Variables (set via Railway dashboard or CLI)

**Required:**
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret
- `ALLOWED_GITHUB_USERNAME` - Your GitHub username
- `SESSION_SECRET` - Random secret for session encryption
- `ANTHROPIC_API_KEY` - Claude API key
- `NODE_ENV=production`

**Optional:**
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_AI_API_KEY` - Google AI API key
- `GITHUB_TOKEN` - For private repo access
- `AGENTS_REPO_URL` - URL of agents repo to clone (default: inferred from git remote)

## Security Considerations

### Access Control
- GitHub OAuth ensures only authenticated GitHub users
- Username allowlist restricts to specific GitHub account
- Session-based authentication with secure cookies
- HTTPS enforced by Railway (automatic TLS)

### Secrets Management
- All secrets stored as Railway environment variables (encrypted at rest)
- Never commit secrets to repository
- Session secret rotated periodically
- API keys isolated per environment

### Network Security
- OpenCode Web only accessible via auth proxy (not exposed externally)
- Auth proxy validates all requests
- CORS configured to only allow proxy origin
- Railway provides DDoS protection

### Container Security
- Node.js 20 LTS (security updates)
- Minimal dependencies
- Regular base image updates via Railway auto-deploy
- Non-root user (Railway default)

## Cost Breakdown

### Railway Resources

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| Starter Plan | 512MB RAM, 1GB disk | $5.00 |
| Pro Plan | 1GB RAM, 5GB disk | $10.00 |
| Outbound Data | First 100GB free | $0.00 |
| Custom Domain | Optional | $0.00 |
| **Recommended** | **Pro Plan** | **$10.00/month** |

### Cost Optimization Tips

1. **Use Starter plan for testing:**
   - 512MB RAM sufficient for light usage
   - Upgrade to Pro if needed

2. **Enable auto-sleep (Railway feature):**
   - Automatically sleep after 30 min inactivity
   - Wake on first request (2-3 second delay)
   - Reduces costs for infrequent usage

3. **Monitor resource usage:**
   - Railway dashboard shows RAM/CPU usage
   - Upgrade only if consistently hitting limits

4. **Optimize disk usage:**
   - Regularly clean up old logs
   - Archive old beads issues
   - 5GB should be sufficient for most use cases

### External Costs (Not Included)

| Service | Estimated Cost |
|---------|----------------|
| Anthropic Claude API | $3-15/1M tokens (varies by model) |
| OpenAI API | $0.50-60/1M tokens (varies by model) |
| GitHub API | Free for basic usage |

**Total realistic monthly cost:** $15-30 depending on LLM usage

## Deployment Workflow

### Initial Setup (One-Time)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli
# or: brew install railway

# 2. Authenticate
railway login

# 3. Create new project
railway init
# Select: "Empty Project"
# Name: "opencode-web"

# 4. Link to GitHub repo (optional, for auto-deploy)
railway link

# 5. Add persistent disk
railway volume create
# Name: "opencode-data"
# Mount path: "/app/data"

# 6. Set environment variables
railway variables set GITHUB_CLIENT_ID=your_client_id
railway variables set GITHUB_CLIENT_SECRET=your_client_secret
railway variables set ALLOWED_GITHUB_USERNAME=your_github_username
railway variables set SESSION_SECRET=$(openssl rand -hex 32)
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set NODE_ENV=production

# 7. Deploy
railway up
```

### Subsequent Deployments

```bash
# Deploy latest code
railway up

# Or use deployment script
.opencode/scripts/deploy-railway.sh
```

### Accessing the Deployed Environment

**Web UI:**
```bash
# Get deployment URL
railway domain

# Open in browser
open $(railway domain)
```

**Shell access:**
```bash
# Interactive shell
railway run bash

# Run single command
railway run bash -c "opencode --version"

# Inside shell:
cd /app/data/workspace
git pull
bd status
```

## Access Methods

### 1. Web UI (Primary)

**URL:** `https://your-app.up.railway.app`

**Features:**
- OpenCode Web interface
- Session management
- Server status
- Terminal attachment (via web)

**Authentication flow:**
1. Visit URL
2. Redirected to GitHub OAuth
3. Authorize app
4. Redirected back to OpenCode Web
5. Session persists for 7 days

### 2. Shell Access (Railway CLI)

**Interactive shell:**
```bash
railway run bash
```

**Run commands:**
```bash
# Check OpenCode version
railway run bash -c "opencode --version"

# Check beads status
railway run bash -c "bd status"

# Pull latest agents repo
railway run bash -c "cd /app/data/workspace && git pull"
```

### 3. Git Operations

**Clone agents repo (automatic on first deploy):**
```bash
# Happens automatically in start script
# Manual: railway run bash -c "git clone https://github.com/YOUR_USERNAME/agents.git /app/data/workspace"
```

**Pull updates:**
```bash
railway run bash -c "cd /app/data/workspace && git pull"
```

**Push changes:**
```bash
railway run bash -c "cd /app/data/workspace && git add . && git commit -m 'Update from Railway' && git push"
```

### 4. Logs and Monitoring

**View logs:**
```bash
railway logs
```

**Monitor resource usage:**
```bash
railway status
```

## Rollback and Recovery

### Rollback Deployment

```bash
# List recent deployments
railway deployments

# Rollback to previous deployment
railway rollback <deployment-id>
```

### Volume Backup

Railway automatically backs up persistent volumes. To restore:

```bash
# List volume snapshots (via Railway dashboard)
# Restore from snapshot (via Railway dashboard)
```

### Disaster Recovery

1. **Code:** Git repository is source of truth
2. **Data:** Railway volume backups (automatic)
3. **Secrets:** Document in secure location (1Password, etc.)
4. **Recovery:** Redeploy from git + restore volume + set secrets

## Migration Path

### From Local to Railway

1. Commit all local changes to git
2. Push to remote (GitHub)
3. Deploy to Railway (follows setup above)
4. Access via web UI or Railway CLI
5. Continue working in cloud environment

### From Railway to Local

1. Shell into Railway: `railway run bash`
2. Commit and push all changes from `/app/data/workspace`
3. Pull changes locally
4. Export any non-git state if needed

## Troubleshooting

### Common Issues

**1. "Unauthorized" after GitHub OAuth**
- Check `ALLOWED_GITHUB_USERNAME` matches your GitHub username exactly
- Check Railway logs: `railway logs`

**2. "Cannot connect to OpenCode Web"**
- Verify OpenCode Web is running: `railway run bash -c "ps aux | grep opencode"`
- Check port 4096 is listening: `railway run bash -c "netstat -tlnp | grep 4096"`

**3. "Session expired"**
- Sessions expire after 7 days
- Re-authenticate via GitHub OAuth

**4. "Disk full"**
- Check disk usage: `railway run bash -c "df -h /app/data"`
- Clean up old logs: `railway run bash -c "rm -rf /app/data/logs/*"`
- Upgrade volume size via Railway dashboard

**5. "Git pull fails"**
- Check git credentials: `railway run bash -c "cd /app/data/workspace && git remote -v"`
- Set GITHUB_TOKEN if private repo: `railway variables set GITHUB_TOKEN=ghp_...`

## Open Questions

1. **Multi-user support:** Should we support multiple GitHub usernames (comma-separated allowlist)?
2. **Custom domain:** Should we document custom domain setup?
3. **Auto-deploy:** Should we enable GitHub webhook for auto-deploy on push?
4. **Monitoring:** Do we need external monitoring (UptimeRobot, etc.)?
5. **Backup strategy:** Should we implement automated volume backups beyond Railway's default?

## Future Enhancements

1. **Multiple users:** Expand allowlist to support team access
2. **Custom domain:** Add custom domain setup documentation
3. **Auto-deploy:** GitHub webhook integration for automatic deployments
4. **Monitoring:** External uptime monitoring and alerting
5. **CI/CD:** GitHub Actions workflow for automated testing before deploy
6. **Multi-region:** Deploy to multiple Railway regions for redundancy
7. **WebSocket support:** Real-time updates in OpenCode Web UI

## Appendix: Advanced Security (Optional)

For advanced security features beyond the 3 essential layers, see `security-enhancements.md`. These include:

- Rate limiting
- IP allowlists
- Session hardening
- Request logging
- Automated alerts
- Emergency shutdown

**These are optional.** The 3 essential layers (GitHub OAuth + allowlist, LLM spending limits, Railway auto-sleep) provide sufficient security for personal use.
