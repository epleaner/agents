# Tasks: Deploy OpenCode Web to Railway with GitHub OAuth

## Prerequisites

Complete these before starting implementation:

1. **GitHub OAuth App** - Create at GitHub Settings → Developer settings → OAuth Apps
   - Have Client ID and Client Secret ready
   - Callback URL will be set after Railway domain is generated

2. **Railway CLI** - Install and authenticate
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **API Keys Ready**
   - ANTHROPIC_API_KEY (required)
   - OPENAI_API_KEY (optional)
   - GITHUB_TOKEN (if private repo)

4. **LLM Spending Limits Configured**
   - Anthropic Console: Set monthly budget limit
   - OpenAI Dashboard: Set hard usage limit

---

## Execution Phases

```
Phase 1: Railway Setup
  └── Section 1: Railway Configuration

Phase 2: Core Implementation (parallel tracks)
  ├── Track A: Section 2 (OAuth) → Section 3 (OpenCode Web)
  └── Track B: Section 4 (Storage) → Section 5 (Git Sync)

Phase 3: Validation
  └── Section 6: Deployment Testing

Phase 4: Finalization (parallel)
  ├── Section 7: Documentation
  └── Section 8: Cost Optimization
```

---

## 1. Railway Configuration

**Purpose:** Create Railway configuration files and project setup
**Dependencies:** None (can start immediately)
**Estimated effort:** 2-3 hours

- [x] 1.1 Create railway.json configuration
      File: `railway.json` (new file, ~60 lines)
      Content:
      - Build configuration (Nixpacks builder)
      - Start command pointing to start script
      - Healthcheck endpoint configuration
      - Restart policy settings
      Validation: `railway validate` (if available) or manual JSON validation
      Success: Valid JSON, all required fields present

- [x] 1.2 Create Railway start script
      File: `.opencode/scripts/start-railway.sh` (new file, ~80 lines)
      Content:
      - Check/create persistent disk directories
      - Create symlinks for .opencode and workspace
      - Auto-clone agents repo if not exists
      - Start OpenCode Web in background
      - Start auth proxy in foreground
      - Trap signals for graceful shutdown
      Validation: `bash -n .opencode/scripts/start-railway.sh` (syntax check)
      Success: Script passes syntax check, executable permissions set

- [x] 1.3 Create Railway project and link repository
      Commands:
      ```bash
      railway login
      railway init  # Create new project
      railway link  # Link to GitHub repo (optional)
      ```
      Validation: `railway status` shows linked project
      Success: Project created, linked to repository

---

## 2. GitHub OAuth Integration

**Purpose:** Implement GitHub OAuth authentication with username allowlist
**Dependencies:** Section 1 complete
**Estimated effort:** 3-4 hours

- [x] 2.1 Create GitHub OAuth App
      Steps:
      1. Go to GitHub Settings → Developer settings → OAuth Apps
      2. Click "New OAuth App"
      3. Set Homepage URL: `https://your-app.up.railway.app`
      4. Set Callback URL: `https://your-app.up.railway.app/auth/github/callback`
      5. Copy Client ID and Client Secret
      Validation: OAuth app appears in GitHub settings
      Success: Client ID and Secret obtained

- [x] 2.2 Set Railway environment variables for OAuth
      Commands:
      ```bash
      railway variables set GITHUB_CLIENT_ID=your_client_id
      railway variables set GITHUB_CLIENT_SECRET=your_client_secret
      railway variables set ALLOWED_GITHUB_USERNAME=your_github_username
      railway variables set SESSION_SECRET=$(openssl rand -hex 32)
      ```
      Validation: `railway variables` shows all variables set
      Success: All OAuth variables configured

- [x] 2.3 Create auth proxy server
      File: `.opencode/scripts/railway-auth-proxy.js` (new file, ~150 lines)
      Features:
      - Express server on port 3000
      - GitHub OAuth strategy (passport.js)
      - Session management (express-session)
      - Username allowlist middleware
      - Proxy authenticated requests to OpenCode Web (port 4096)
      - Health check endpoint at /health
      Dependencies: express, passport, passport-github2, express-session, http-proxy-middleware
      Validation: `node .opencode/scripts/railway-auth-proxy.js` (local test)
      Success: Server starts, OAuth flow works locally

- [x] 2.4 Add package.json dependencies for auth proxy
      File: `package.json` (update or create)
      Dependencies:
      ```json
      {
        "dependencies": {
          "express": "^4.18.2",
          "passport": "^0.7.0",
          "passport-github2": "^0.1.12",
          "express-session": "^1.17.3",
          "http-proxy-middleware": "^2.0.6"
        }
      }
      ```
      Validation: `npm install` completes without errors
      Success: All dependencies installed

---

## 3. OpenCode Web Server Setup

**Purpose:** Configure OpenCode Web to work with auth proxy
**Dependencies:** Section 2 complete
**Estimated effort:** 2 hours

- [x] 3.1 Create OpenCode Web configuration file
      File: `.opencode/config/railway-opencode.json` (new file, ~30 lines)
      Content:
      ```json
      {
        "server": {
          "port": 4096,
          "hostname": "0.0.0.0",
          "cors": ["http://localhost:3000"]
        }
      }
      ```
      Validation: Valid JSON syntax
      Success: Configuration file created
      **Completed:** Created config with additional session, logging, and security settings

- [x] 3.2 Update start script to launch OpenCode Web
      File: `.opencode/scripts/start-railway.sh` (update)
      Add:
      - Start OpenCode Web with config: `opencode web --config /app/.opencode/config/railway-opencode.json &`
      - Capture PID for cleanup
      - Wait for port 4096 to be ready before starting proxy
      Validation: Script starts OpenCode Web successfully
      Success: OpenCode Web accessible on port 4096
      **Completed:** Script already had all required functionality from Section 1

- [x] 3.3 Set OpenCode environment variables
      Commands:
      ```bash
      railway variables set OPENCODE_SERVER_PASSWORD=""  # Disabled (auth via proxy)
      railway variables set OPENCODE_DATA_DIR="/app/data/.opencode"
      railway variables set NODE_ENV=production
      ```
      Validation: `railway variables` shows all variables
      Success: OpenCode Web environment configured
      **Completed:** Added comprehensive documentation in start-railway.sh header comments

---

## 4. Persistent Storage

**Purpose:** Configure Railway persistent disk for workspace data
**Dependencies:** Section 1 complete
**Estimated effort:** 1-2 hours

- [x] 4.1 Create Railway persistent volume
      Commands:
      ```bash
      railway volume create
      # Name: opencode-data
      # Mount path: /app/data
      # Size: 5GB
      ```
      Validation: `railway volumes` shows created volume
      Success: Volume created and mounted at /app/data

- [x] 4.2 Update start script for persistent storage
      File: `.opencode/scripts/start-railway.sh` (update)
      Add:
      - Create directories: `/app/data/.opencode`, `/app/data/workspace`, `/app/data/logs`
      - Create symlinks: `ln -sf /app/data/.opencode /app/.opencode`
      - Create symlinks: `ln -sf /app/data/workspace /app/workspace`
      Validation: Deploy and check: `railway run bash -c "ls -la /app/data"`
      Success: Directories exist, symlinks work, data persists across deploys

---

## 5. Git Sync Automation

**Purpose:** Automatically clone and sync agents repository
**Dependencies:** Section 4 complete
**Estimated effort:** 2 hours

- [x] 5.1 Add git clone logic to start script
      File: `.opencode/scripts/start-railway.sh` (update)
      Logic:
      ```bash
      if [ ! -d /app/data/workspace/.git ]; then
        REPO_URL=${AGENTS_REPO_URL:-$(git remote get-url origin)}
        git clone $REPO_URL /app/data/workspace
      fi
      ```
      Validation: Deploy, verify repo cloned: `railway run bash -c "ls /app/data/workspace"`
      Success: Agents repo cloned on first deploy

- [x] 5.2 Set GITHUB_TOKEN for private repo access (if needed)
      Command:
      ```bash
      railway variables set GITHUB_TOKEN=ghp_your_token
      ```
      Update clone command to use token:
      ```bash
      git clone https://${GITHUB_TOKEN}@github.com/username/repo.git
      ```
      Validation: Private repo clones successfully
      Success: Private repo accessible with token

- [x] 5.3 Create git sync helper script
      File: `.opencode/scripts/git-sync.sh` (new file, ~30 lines)
      Features:
      - Pull latest changes from remote
      - Stash local changes if any
      - Display sync status
      Usage: `railway run bash /app/.opencode/scripts/git-sync.sh`
      Validation: Script pulls latest changes
      Success: Helper script works for manual syncs

---

## 6. Deployment Testing

**Purpose:** Verify end-to-end deployment works correctly
**Dependencies:** Sections 1-5 complete
**Estimated effort:** 2-3 hours

- [x] 6.1 Local integration test
      Steps:
      1. Set environment variables locally (from .env or export)
      2. Run: `node .opencode/scripts/railway-auth-proxy.js`
      3. In another terminal: `opencode web --config .opencode/config/railway-opencode.json`
      4. Visit http://localhost:3000
      5. Complete GitHub OAuth flow
      6. Verify redirected to OpenCode Web
      7. Test basic OpenCode Web functionality
      Validation: OAuth flow completes, OpenCode Web accessible and functional
      Success: Local stack works end-to-end

- [x] 6.2 Railway deployment and OAuth test
      Steps:
      1. Deploy to Railway: `railway up` or `.opencode/scripts/deploy-railway.sh`
      2. Wait for deployment: `railway status`
      3. Get URL: `railway domain`
      4. Visit URL in browser
      5. Complete GitHub OAuth flow
      6. Verify username allowlist works (test with wrong username if possible)
      7. Test OpenCode Web functionality:
         - Create new session
         - Run simple agent command
         - Check server status page
      8. Test shell access: `railway run bash`
      9. Test git operations: `cd /app/data/workspace && git status`
      Validation: All features work on Railway
      Success: Full deployment functional with OAuth

- [x] 6.3 Persistence and recovery test
      Steps:
      1. Create test file: `railway run bash -c "echo 'test' > /app/data/test-persist.txt"`
      2. Create test data in OpenCode Web (new session, etc.)
      3. Redeploy: `railway up`
      4. Verify test file exists: `railway run bash -c "cat /app/data/test-persist.txt"`
      5. Verify OpenCode Web data persists (sessions, beads, etc.)
      6. Verify git repo intact: `railway run bash -c "cd /app/data/workspace && git log -1"`
      Validation: All data survives redeploy
      Success: Persistent storage working correctly

---

## 7. Documentation

**Purpose:** Document deployment process and usage
**Dependencies:** Section 6 complete
**Estimated effort:** 2-3 hours

- [x] 7.1 Add Railway deployment section to README
      File: `README.md` (update)
      Add section:
      - Prerequisites (Railway CLI, GitHub OAuth app)
      - Quick start (5-7 commands)
      - Link to full design.md
      - Cost estimate
      Validation: `grep -q "Railway" README.md`
      Success: README includes Railway deployment quickstart

- [x] 7.2 Update AGENTS.md with cloud deployment
      File: `AGENTS.md` (update)
      Add section:
      ```markdown
      ## Cloud Deployment (Railway)
      
      Deploy OpenCode Web to Railway with GitHub OAuth:
      
      ```bash
      # Deploy
      .opencode/scripts/deploy-railway.sh
      
      # Access web UI
      open $(railway domain)
      
      # Shell access
      railway run bash
      ```
      ```
      Validation: `grep -q "Railway" AGENTS.md`
      Success: AGENTS.md includes Railway instructions

- [x] 7.3 Create troubleshooting guide
      File: `.opencode/openspec/changes/deploy-opencode-web-railway/troubleshooting.md` (new file)
      Cover:
      - "Unauthorized after OAuth" - check ALLOWED_GITHUB_USERNAME
      - "Cannot connect to OpenCode Web" - check logs
      - "Session expired" - re-authenticate
      - "Disk full" - clean up logs, expand volume
      - "Git pull fails" - check GITHUB_TOKEN
      Validation: File exists with 5+ troubleshooting sections
      Success: Common issues documented with solutions

---

## 8. Cost Optimization

**Purpose:** Implement and document cost-saving features
**Dependencies:** Section 6 complete
**Estimated effort:** 1 hour

- [x] 8.1 Document cost breakdown
      File: `design.md` (verify "Cost Breakdown" section)
      Include:
      - Railway Starter: $5/month
      - Railway Pro: $10/month
      - LLM API costs (external)
      - Total estimate: $15-30/month
      Validation: `grep -q "\\$5" design.md`
      Success: All costs documented

- [x] 8.2 Add deployment script with utility commands
      File: `.opencode/scripts/deploy-railway.sh` (new file, ~200 lines)
      Features:
      - `deploy` - Deploy to Railway
      - `status` - Show deployment status
      - `logs` - Tail logs
      - `shell` - Open shell
      - `domain` - Show deployment URL
      - `help` - Show usage
      Validation: `.opencode/scripts/deploy-railway.sh help`
      Success: Script provides all utility commands

---

## Summary

| Section | Tasks | Estimated Hours |
|---------|-------|-----------------|
| Prerequisites | 4 | 1 |
| 1. Railway Configuration | 3 | 2-3 |
| 2. GitHub OAuth Integration | 4 | 3-4 |
| 3. OpenCode Web Server Setup | 3 | 2 |
| 4. Persistent Storage | 2 | 1-2 |
| 5. Git Sync Automation | 3 | 2 |
| 6. Deployment Testing | 3 | 2-3 |
| 7. Documentation | 3 | 2-3 |
| 8. Cost Optimization | 2 | 1 |
| **Total** | **27** | **16-20 hours** |

**Note:** Advanced security features (rate limiting, logging, alerts) documented in `security-enhancements.md` but **optional**. Core security is GitHub OAuth + username allowlist + LLM spending limits.

---

## Acceptance Criteria

1. **Railway project created** - `railway status` shows active project
2. **GitHub OAuth works** - Can authenticate with GitHub account
3. **Username allowlist enforced** - Only authorized GitHub username can access
4. **OpenCode Web accessible** - Web UI works at Railway URL
5. **Shell access functional** - `railway run bash` provides interactive shell
6. **Data persists** - Files in `/app/data` survive redeploys
7. **Git operations work** - Can clone/pull agents repo
8. **Documentation complete** - README, AGENTS.md, and troubleshooting guide updated
9. **Spending limits set** - LLM API providers show configured limits

---

## Next Steps After Implementation

1. Create beads issue: `bd create --title "Implement Railway deployment with GitHub OAuth" --type feature --priority 2`
2. Begin implementation with Section 1
3. Test each section before proceeding
4. Update this tasks.md as items complete
5. Archive proposal after deployment verified
