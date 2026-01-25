# Deployment Testing Checklist

This document provides manual testing steps to validate the Railway deployment.

---

## 6.1 Local Integration Test

**Objective:** Verify the auth proxy and OpenCode Web work together locally before deploying.

### Prerequisites
- Environment variables configured (`.env` file or exported)
- Node.js installed
- OpenCode CLI installed

### Steps

- [ ] **1. Set environment variables**
  ```bash
  # Option A: Source from .env file
  source .env
  
  # Option B: Export manually
  export GITHUB_CLIENT_ID="your_client_id"
  export GITHUB_CLIENT_SECRET="your_client_secret"
  export SESSION_SECRET="your_session_secret"
  export ALLOWED_USERS="your_github_username"
  export UPSTREAM_URL="http://localhost:3000"
  ```

- [ ] **2. Start the auth proxy**
  ```bash
  node .opencode/scripts/railway-auth-proxy.js
  ```
  Expected: Server starts on port 8080

- [ ] **3. Start OpenCode Web** (in another terminal)
  ```bash
  opencode web --config .opencode/config/railway-opencode.json
  ```
  Expected: OpenCode Web starts on port 3000

- [ ] **4. Visit http://localhost:8080**
  Expected: Redirected to GitHub OAuth login

- [ ] **5. Complete GitHub OAuth flow**
  - Click "Authorize" on GitHub
  - Expected: Redirected back to app

- [ ] **6. Verify redirected to OpenCode Web**
  Expected: OpenCode Web interface loads

- [ ] **7. Test basic functionality**
  - [ ] Create a new session
  - [ ] Send a test message
  - [ ] Verify response received

### Validation Criteria
| Check | Expected Result |
|-------|-----------------|
| Auth proxy starts | Listening on port 8080 |
| OpenCode Web starts | Listening on port 3000 |
| OAuth redirect works | GitHub login page shown |
| OAuth callback works | Redirected to OpenCode Web |
| Session persists | Can refresh without re-auth |

### Success Criteria
- [ ] OAuth flow completes without errors
- [ ] OpenCode Web accessible and functional
- [ ] Local stack works end-to-end

---

## 6.2 Railway Deployment and OAuth Test

**Objective:** Verify the full deployment works on Railway infrastructure.

### Prerequisites
- Railway CLI installed and authenticated
- Project linked (`railway link`)
- Environment variables set in Railway dashboard

### Steps

- [ ] **1. Deploy to Railway**
  ```bash
  # Option A: Direct deploy
  railway up
  
  # Option B: Using deploy script
  .opencode/scripts/deploy-railway.sh
  ```

- [ ] **2. Wait for deployment to complete**
  ```bash
  railway status
  ```
  Expected: Status shows "deployed" or "running"

- [ ] **3. Get the deployment URL**
  ```bash
  railway domain
  ```
  Note the URL: `https://________________.railway.app`

- [ ] **4. Visit the URL in browser**
  Expected: Redirected to GitHub OAuth

- [ ] **5. Complete GitHub OAuth flow**
  - Authorize the application
  - Expected: Redirected to OpenCode Web

- [ ] **6. Verify username allowlist**
  - [ ] Test with allowed username: Should grant access
  - [ ] (Optional) Test with different GitHub account: Should deny access with 403

- [ ] **7. Test OpenCode Web functionality**
  - [ ] Create new session
  - [ ] Run simple agent command (e.g., "hello")
  - [ ] Check server status page (if available)
  - [ ] Verify agent responses work correctly

- [ ] **8. Test shell access**
  ```bash
  railway run bash
  ```
  Expected: Interactive shell in container

- [ ] **9. Test git operations**
  ```bash
  railway run bash -c "cd /app/data/workspace && git status"
  ```
  Expected: Git repository responds correctly

### Validation Criteria
| Check | Expected Result |
|-------|-----------------|
| Deployment succeeds | `railway status` shows running |
| Domain accessible | HTTPS loads without errors |
| OAuth works | Login redirects correctly |
| Allowlist enforced | Unauthorized users blocked |
| OpenCode Web functional | Can create sessions, run commands |
| Shell access works | `railway run bash` connects |
| Git operations work | Repository commands succeed |

### Success Criteria
- [ ] Full deployment functional with OAuth
- [ ] All features work on Railway infrastructure
- [ ] No errors in deployment logs

---

## 6.3 Persistence and Recovery Test

**Objective:** Verify data survives redeployments using persistent storage.

### Prerequisites
- Successful deployment from 6.2
- Persistent volume configured in Railway

### Steps

- [ ] **1. Create test file in persistent storage**
  ```bash
  railway run bash -c "echo 'persistence-test-$(date +%s)' > /app/data/test-persist.txt"
  ```

- [ ] **2. Create test data in OpenCode Web**
  - [ ] Create a new session with memorable name
  - [ ] Run a few commands to generate history
  - [ ] Note the session ID or name

- [ ] **3. Record current state**
  ```bash
  # Check beads data
  railway run bash -c "ls -la /app/data/.beads/ 2>/dev/null || echo 'No beads data yet'"
  
  # Check git log
  railway run bash -c "cd /app/data/workspace && git log --oneline -3 2>/dev/null || echo 'No git history'"
  ```

- [ ] **4. Trigger a redeploy**
  ```bash
  railway up
  ```
  Wait for deployment to complete.

- [ ] **5. Verify test file persists**
  ```bash
  railway run bash -c "cat /app/data/test-persist.txt"
  ```
  Expected: Shows the content from step 1

- [ ] **6. Verify OpenCode Web data persists**
  - Visit the Railway URL
  - Complete OAuth if needed
  - Check that previous session exists
  - Verify session history is intact

- [ ] **7. Verify git repository intact**
  ```bash
  railway run bash -c "cd /app/data/workspace && git log --oneline -3"
  ```
  Expected: Same commits as before redeploy

- [ ] **8. Verify beads data intact** (if applicable)
  ```bash
  railway run bash -c "ls -la /app/data/.beads/"
  ```

### Validation Criteria
| Check | Expected Result |
|-------|-----------------|
| Test file survives | Content matches original |
| Sessions persist | Previous sessions accessible |
| Session history intact | Commands and responses preserved |
| Git repo survives | Commits and history preserved |
| Beads data survives | Issue tracking data preserved |

### Success Criteria
- [ ] All data survives redeploy
- [ ] Persistent storage working correctly
- [ ] No data loss during deployment cycles

---

## Troubleshooting

### Common Issues

**OAuth callback fails with "redirect_uri mismatch"**
- Verify `GITHUB_CALLBACK_URL` matches GitHub App settings exactly
- Check for trailing slashes

**403 Forbidden after OAuth**
- Verify your GitHub username is in `ALLOWED_USERS`
- Check case sensitivity (GitHub usernames are case-insensitive)

**Data not persisting**
- Verify volume is mounted at `/app/data`
- Check Railway volume configuration in dashboard

**Container crashes on startup**
- Check `railway logs` for error messages
- Verify all required environment variables are set

### Useful Debug Commands

```bash
# View recent logs
railway logs --tail 100

# Check environment variables (redacted)
railway run bash -c "env | grep -E '^(GITHUB|SESSION|ALLOWED|UPSTREAM)' | sed 's/=.*/=****/'"

# Check disk usage
railway run bash -c "df -h /app/data"

# List persistent data
railway run bash -c "find /app/data -type f | head -20"
```

---

## Sign-off

| Test | Tester | Date | Status |
|------|--------|------|--------|
| 6.1 Local Integration | | | |
| 6.2 Railway Deployment | | | |
| 6.3 Persistence | | | |

**Notes:**
_Record any issues, observations, or deviations here._
