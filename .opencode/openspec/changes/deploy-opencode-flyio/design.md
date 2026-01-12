# Design: Deploy OpenCode to Fly.io

## Context
OpenCode is a blueprint repository for AI-assisted development workflows. It includes agents, skills, commands, and the OpenSpec framework for change management. The repository uses Node.js dependencies and the beads issue tracking system.

To enable remote access, we deploy to Fly.io - a platform that runs Docker containers on lightweight VMs (Machines) with support for persistent volumes and SSH access.

## Goals / Non-Goals

**Goals:**
- Enable running OpenCode agents from any device with internet access
- Preserve workspace state (beads database, session data, config) across deploys
- Minimize cost while maintaining acceptable performance
- Secure access via Fly.io's built-in SSH (no exposed HTTP endpoints)
- Simple one-command deployment workflow

**Non-Goals:**
- Web-based terminal UI (out of scope; SSH-only for MVP)
- Multi-tenant deployment (single user per instance)
- Auto-scaling (single Machine is sufficient for CLI workloads)
- Custom domain or HTTPS certificates (no web server)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Machine                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  flyctl ssh console                                      │   │
│  │  - Interactive shell access                              │   │
│  │  - Run opencode commands                                 │   │
│  │  - Access beads, git, etc.                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SSH (encrypted)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Fly.io Infrastructure                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Fly Machine (shared-cpu-1x, 512MB RAM)                  │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │  Container                                          ││   │
│  │  │  - Node.js 20 (Alpine)                              ││   │
│  │  │  - OpenCode CLI                                     ││   │
│  │  │  - git, curl, bash                                  ││   │
│  │  │  - Repository code at /app                          ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  │                          │                               │   │
│  │                          ▼                               │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │  Persistent Volume (1GB)                            ││   │
│  │  │  Mounted at /app/.opencode                          ││   │
│  │  │  - beads database                                   ││   │
│  │  │  - session data                                     ││   │
│  │  │  - ralph state                                      ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Fly Secrets (encrypted at rest)                        │   │
│  │  - ANTHROPIC_API_KEY                                    │   │
│  │  - OPENAI_API_KEY                                       │   │
│  │  - Other LLM provider keys                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Decisions

### 1. Base Image: Node.js 20 Alpine

**Decision:** Use `node:20-alpine` as the base image.

**Rationale:**
- Alpine is ~5MB base, resulting in smaller image sizes (~150MB total vs ~400MB for Debian)
- Node.js 20 LTS for stability and long-term support
- OpenCode CLI and dependencies are Node.js-based
- Alpine includes apk for installing additional packages (git, curl, bash)

**Alternative considered:** `node:20-slim` (Debian-based)
- Pros: Better glibc compatibility, more packages available
- Cons: Larger image size (~180MB base), slower deploys
- Verdict: Alpine sufficient for our needs; switch to slim if compatibility issues arise

### 2. No HTTP Service (SSH-Only Access)

**Decision:** Disable HTTP/HTTPS services; access exclusively via `flyctl ssh console`.

**Rationale:**
- Reduces attack surface (no open ports)
- Simpler configuration (no TLS certificates, no reverse proxy)
- CLI-first tool; web UI is not required
- Fly.io SSH is already encrypted and authenticated

**Alternative considered:** Web terminal (ttyd, gotty)
- Pros: Browser-based access, no flyctl required
- Cons: Security complexity, authentication needed, additional dependencies
- Verdict: Defer to future enhancement if demand exists

### 3. Persistent Volume for .opencode Data

**Decision:** Mount a 1GB persistent volume at `/app/.opencode`.

**Rationale:**
- Preserves beads database across deploys
- Maintains Ralph session state and meta-learnings
- Retains OpenSpec changes in progress
- Volume survives Machine restarts and redeployments

**Volume sizing:**
- 1GB is generous for metadata and session files
- Scale up if storing large artifacts (e.g., meeting transcripts)
- Monitor with `df -h /app/.opencode`

### 4. Machine Size: shared-cpu-1x with 512MB RAM

**Decision:** Start with the smallest Fly.io Machine size.

**Rationale:**
- OpenCode CLI and agents are not CPU-intensive (LLM inference is external)
- 512MB RAM is sufficient for Node.js process + git operations
- Cost-effective (~$5/month for shared CPU)
- Easy to scale up if performance issues arise

**Scaling path:**
| Size | vCPU | RAM | Monthly Cost | Use Case |
|------|------|-----|--------------|----------|
| shared-cpu-1x | 1 (shared) | 256MB | ~$3 | Minimal |
| shared-cpu-1x | 1 (shared) | 512MB | ~$5 | **Recommended** |
| shared-cpu-1x | 1 (shared) | 1GB | ~$10 | Heavy workloads |
| performance-1x | 1 (dedicated) | 2GB | ~$30 | Production teams |

### 5. Secrets Management via Fly Secrets

**Decision:** Store LLM API keys as Fly secrets, not in Dockerfile or fly.toml.

**Rationale:**
- Secrets are encrypted at rest and in transit
- Not exposed in container image layers
- Easy rotation via `flyctl secrets set`
- Automatically injected as environment variables

**Required secrets:**
```bash
flyctl secrets set ANTHROPIC_API_KEY=sk-ant-...
flyctl secrets set OPENAI_API_KEY=sk-...
# Optional:
flyctl secrets set GOOGLE_AI_API_KEY=...
flyctl secrets set GITHUB_TOKEN=ghp_...
```

### 6. Keep Container Running with Sleep Infinity

**Decision:** Default CMD is `sleep infinity` to keep container running for SSH access.

**Rationale:**
- Fly Machines need a process to stay alive
- SSH access requires running container
- No foreground service needed (unlike web apps)
- Low resource usage while idle

**Alternative considered:** Supervisor process (s6-overlay)
- Pros: Process management, restart handling
- Cons: Complexity overkill for single-process use case
- Verdict: KISS principle; sleep infinity is sufficient

## Dockerfile Specification

```dockerfile
# OpenCode Agents - Fly.io Deployment
# Optimized for AI-assisted development workflows

FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    openssh-client \
    jq \
    && rm -rf /var/cache/apk/*

# Install OpenCode CLI globally
RUN npm install -g @opencode-ai/cli

# Set up working directory
WORKDIR /app

# Copy repository files
COPY . .

# Install Node.js dependencies for .opencode
RUN cd .opencode && npm install --production && cd ..

# Create volume mount point (will be overlaid by Fly volume)
RUN mkdir -p /app/.opencode

# Set environment defaults
ENV NODE_ENV=production
ENV OPENCODE_DATA_DIR=/app/.opencode

# Keep container running for SSH access
CMD ["sleep", "infinity"]
```

**Image layers explained:**
1. Alpine base with Node.js 20
2. System packages (git for repo operations, curl for API calls, bash for scripts)
3. OpenCode CLI installed globally
4. Repository code copied
5. NPM dependencies installed
6. Volume mount point created
7. Sleep infinity to keep alive

## fly.toml Configuration

```toml
# Fly.io configuration for OpenCode Agents
# Customize app name before first deployment

app = "opencode-agents"  # Change to your unique app name
primary_region = "sjc"   # Change to your nearest region

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  OPENCODE_DATA_DIR = "/app/.opencode"

# No HTTP service - SSH access only
# Uncomment below if you want health checks
# [[services]]
#   internal_port = 8080
#   protocol = "tcp"

[mounts]
  source = "opencode_data"
  destination = "/app/.opencode"

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"

# Prevent auto-stop when idle (keep Machine running for SSH)
[experimental]
  auto_rollback = true
```

**Configuration notes:**
- `app`: Must be globally unique on Fly.io; customize before deploy
- `primary_region`: Choose nearest for lowest latency (sjc=San Jose, iad=Virginia, lhr=London, etc.)
- `mounts`: Creates persistent volume named `opencode_data`
- `vm`: Smallest size; increase `memory` to `1gb` if needed
- No `[[services]]` block = no exposed ports (SSH only)

## Security Considerations

### Access Control
- SSH access requires `flyctl auth login` (Fly.io account)
- No anonymous access possible
- Organization-level access control via Fly.io teams

### Secrets
- API keys stored as Fly secrets (encrypted)
- Never commit keys to Dockerfile or fly.toml
- Rotate keys via `flyctl secrets set` without redeploy

### Network
- No public HTTP/HTTPS ports
- SSH tunnel encrypted end-to-end
- Fly.io internal network isolated

### Container Security
- Non-root user recommended (future enhancement)
- Alpine minimizes attack surface
- Regular base image updates via rebuild

## Remote Access Methods

### Primary: flyctl SSH Console

```bash
# Interactive shell
flyctl ssh console -a opencode-agents

# Run single command
flyctl ssh console -a opencode-agents -C "opencode --version"

# With specific Machine (if multiple)
flyctl ssh console -a opencode-agents -s <machine-id>
```

### SSH Configuration (Optional)

Add to `~/.ssh/config` for easier access:
```
Host opencode-fly
  HostName <app-name>.fly.dev
  User root
  ProxyCommand flyctl proxy <app-name> %h:%p
```

Then: `ssh opencode-fly`

### File Transfer

```bash
# Upload file
flyctl ssh sftp shell -a opencode-agents
put local-file.txt /app/

# Download file
get /app/output.json ./

# Or use flyctl console with cat/base64
flyctl ssh console -a opencode-agents -C "cat /app/file.txt" > local.txt
```

## Cost Breakdown

### Fly.io Resources

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| Machine | shared-cpu-1x, 512MB RAM | ~$5.40 |
| Persistent Volume | 1GB | ~$0.15 |
| Outbound Data | First 100GB free | $0.00 |
| **Subtotal** | | **~$5.55/month** |

### Cost Optimization Tips

1. **Stop when not in use:**
   ```bash
   flyctl machine stop -a opencode-agents  # Stop billing
   flyctl machine start -a opencode-agents  # Resume
   ```

2. **Use auto-stop (trade-off: startup latency):**
   ```toml
   [experimental]
     auto_stop_machines = true
     auto_start_machines = true
   ```

3. **Reduce memory if possible:**
   - 256MB works for simple tasks
   - 512MB recommended for Ralph mode sessions

4. **Regional pricing:**
   - Some regions slightly cheaper
   - Usually minimal difference

### External Costs (Not Included)

| Service | Estimated Cost |
|---------|----------------|
| Anthropic Claude API | $3-15/1M tokens (varies by model) |
| OpenAI API | $0.50-60/1M tokens (varies by model) |
| GitHub API | Free for basic usage |

**Total realistic monthly cost:** $10-50 depending on LLM usage

## Deployment Workflow

### Initial Setup (One-Time)

```bash
# 1. Install flyctl
brew install flyctl  # macOS
# or: curl -L https://fly.io/install.sh | sh

# 2. Authenticate
flyctl auth login

# 3. Create app (from repository root)
flyctl launch --no-deploy
# - Choose app name (must be unique)
# - Select region
# - Skip PostgreSQL, Redis

# 4. Create persistent volume
flyctl volumes create opencode_data --size 1 --region <your-region>

# 5. Set secrets
flyctl secrets set ANTHROPIC_API_KEY=sk-ant-...
flyctl secrets set OPENAI_API_KEY=sk-...

# 6. Deploy
flyctl deploy
```

### Subsequent Deployments

```bash
# Rebuild and deploy latest code
flyctl deploy

# Or use deployment script
.opencode/scripts/deploy-flyio.sh
```

### Accessing the Deployed Environment

```bash
# SSH into container
flyctl ssh console -a opencode-agents

# Inside container:
cd /app
opencode --version
bd status
git status
```

## Rollback and Recovery

### Rollback Deployment

```bash
# List recent deployments
flyctl releases -a opencode-agents

# Rollback to previous release
flyctl deploy --image <previous-image-ref>
```

### Volume Backup

```bash
# Create snapshot
flyctl volumes snapshots create <volume-id>

# List snapshots
flyctl volumes snapshots list <volume-id>

# Restore from snapshot
flyctl volumes create opencode_data_restored --snapshot-id <snap-id>
```

### Disaster Recovery

1. Volume data persists independently of Machine
2. Redeploy creates new Machine, attaches existing volume
3. Git repository is the source of truth; volume is for state

## Migration Path

### From Local to Fly.io

1. Commit all local changes to git
2. Push to remote (GitHub, GitLab, etc.)
3. Deploy to Fly.io
4. `flyctl ssh console` and clone repository
5. Continue working in cloud environment

### From Fly.io to Local

1. SSH into Fly.io Machine
2. Commit and push all changes
3. Pull changes locally
4. Export any non-git state (beads export if needed)

## Open Questions

1. **Multi-user access:** Should we support team access with separate Machines?
2. **Web terminal:** Is browser-based access (via gotty/ttyd) worth the complexity?
3. **Auto-scaling:** Should Machine auto-stop during inactivity to save costs?
4. **Monitoring:** Do we need Fly.io metrics integration or external monitoring?

## Future Enhancements

1. **Health check endpoint:** Optional HTTP health check for monitoring
2. **Web terminal:** Browser-based terminal access (gotty or similar)
3. **CI/CD integration:** GitHub Actions workflow for auto-deploy
4. **Multi-region:** Deploy to multiple regions for redundancy
5. **Dockerfile optimization:** Multi-stage build for smaller images
