# Railway Deployment Troubleshooting

Common issues and solutions for the OpenCode Web Railway deployment.

## 1. "Unauthorized" After OAuth Login

**Symptom:** GitHub OAuth completes but you see "Unauthorized" or are redirected to an error page.

**Cause:** Your GitHub username is not in the allowed list.

**Solution:**
```bash
# Check current allowed username
railway variables get ALLOWED_GITHUB_USERNAME

# Update to match your GitHub username exactly (case-sensitive)
railway variables set ALLOWED_GITHUB_USERNAME=YourGitHubUsername
```

**Note:** The username check is case-sensitive. Ensure it matches your GitHub username exactly.

## 2. Cannot Connect to OpenCode Web

**Symptom:** Browser shows connection refused or timeout.

**Possible Causes:**
1. Service not running
2. No domain assigned
3. Health check failing

**Solutions:**

```bash
# Check service status
railway status

# View recent logs
railway logs --lines 50

# Ensure domain is assigned
railway domain

# Check if the container is healthy
railway logs --filter "@level:error"
```

If logs show startup errors, check that all required environment variables are set:
```bash
railway variables list
```

Required variables:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ALLOWED_GITHUB_USERNAME`
- `SESSION_SECRET`
- `ANTHROPIC_API_KEY`

## 3. Session Expired / Logged Out Unexpectedly

**Symptom:** You're logged out after a short period or between page loads.

**Possible Causes:**
1. `SESSION_SECRET` not set or changed
2. Cookie issues with the domain

**Solutions:**

```bash
# Ensure SESSION_SECRET is set and stable
railway variables get SESSION_SECRET

# If not set, generate one
railway variables set SESSION_SECRET=$(openssl rand -hex 32)
```

After setting, redeploy:
```bash
railway up
```

**Note:** Changing `SESSION_SECRET` will invalidate all existing sessions.

## 4. Disk Full / Storage Issues

**Symptom:** Operations fail with "no space left on device" or similar errors.

**Possible Causes:**
1. Log files accumulated
2. Git history too large
3. Volume not properly mounted

**Solutions:**

```bash
# Connect to the container
railway run bash

# Check disk usage
df -h
du -sh /app/data/*

# Clean up logs (if applicable)
rm -rf /app/data/logs/*.log

# Clean up git objects
cd /app/data/repos/your-repo
git gc --aggressive
```

To expand volume size, you'll need to create a new larger volume:
1. Go to Railway dashboard
2. Navigate to your project's Volumes
3. Create a new volume with more space
4. Migrate data and update mount path

## 5. Git Pull/Push Fails

**Symptom:** Git operations fail with authentication errors or permission denied.

**Possible Causes:**
1. `GITHUB_TOKEN` not set or expired
2. Token lacks required permissions
3. Repository access issues

**Solutions:**

```bash
# Check if GITHUB_TOKEN is set
railway variables get GITHUB_TOKEN

# Set or update the token (create at GitHub Settings → Developer settings → Personal access tokens)
railway variables set GITHUB_TOKEN=ghp_...
```

Required token permissions:
- `repo` (full repository access)
- `read:user` (if using private repos)

Test the token:
```bash
railway run bash
cd /app/data/repos/your-repo
git fetch origin
```

## 6. OAuth Callback URL Mismatch

**Symptom:** After GitHub login, you see "redirect_uri mismatch" error.

**Cause:** The OAuth app's callback URL doesn't match your Railway domain.

**Solution:**

1. Get your Railway domain:
   ```bash
   railway domain
   ```

2. Go to GitHub Settings → Developer settings → OAuth Apps → Your App

3. Update "Authorization callback URL" to:
   ```
   https://your-app.railway.app/auth/callback
   ```

4. Save and try logging in again.

## 7. Build Fails During Deployment

**Symptom:** `railway up` fails with build errors.

**Common Causes:**
1. Missing Dockerfile or nixpacks configuration
2. Dependency installation failures
3. Memory limits during build

**Solutions:**

Check build logs:
```bash
railway logs --type build
```

For memory issues, you may need to upgrade your Railway plan or optimize the build.

For dependency issues, ensure your `package.json` and lock files are committed and up to date.

## 8. LLM API Errors

**Symptom:** OpenCode responds with API errors or "model not available."

**Possible Causes:**
1. API key not set or invalid
2. API key lacks credits/quota
3. Model name incorrect

**Solutions:**

```bash
# Check API keys are set
railway variables get ANTHROPIC_API_KEY
railway variables get OPENAI_API_KEY

# Update if needed
railway variables set ANTHROPIC_API_KEY=sk-ant-...
```

Verify API keys are valid by testing directly:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

## Getting Help

If issues persist:

1. Check Railway status: https://status.railway.app/
2. Review full design docs: `.opencode/openspec/changes/deploy-opencode-web-railway/design.md`
3. Check Railway community: https://discord.gg/railway
4. File an issue: https://github.com/anomalyco/opencode/issues
