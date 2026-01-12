# Tasks: Deploy OpenCode to Fly.io

---

## 1. Core Infrastructure Files

**Purpose:** Create the essential files needed for Fly.io deployment
**Dependencies:** None (can start immediately)
**Estimated effort:** 2-3 hours

- [ ] 1.1 Create Dockerfile for OpenCode environment
      File: `Dockerfile` (new file, ~50 lines)
      Content:
      - Base image: `node:20-alpine`
      - Install: git, curl, bash, openssh-client, jq
      - Install OpenCode CLI globally via npm
      - Copy repository, install .opencode dependencies
      - Set WORKDIR to /app
      - CMD: `sleep infinity` (keep container running)
      Validation: `docker build -t opencode-test . && docker run --rm opencode-test opencode --version`
      Success: Image builds without errors, opencode command available

- [ ] 1.2 Create fly.toml configuration
      File: `fly.toml` (new file, ~40 lines)
      Content:
      - App name placeholder: `opencode-agents`
      - Primary region: `sjc` (configurable)
      - Build section pointing to Dockerfile
      - Environment variables: NODE_ENV, OPENCODE_DATA_DIR
      - Mount section: `opencode_data` volume at `/app/.opencode`
      - VM section: `shared-cpu-1x`, `512mb` memory
      - No HTTP services (SSH-only)
      Validation: `flyctl config validate` (requires flyctl installed)
      Success: Config validates without errors

- [ ] 1.3 Create deployment script
      File: `.opencode/scripts/deploy-flyio.sh` (new file, ~150 lines)
      Features:
      - Check flyctl installation and auth status
      - Detect if app exists or needs creation
      - Create volume if not exists
      - Prompt for secrets if not set
      - Run `flyctl deploy`
      - Display SSH connection instructions
      Validation: `bash -n .opencode/scripts/deploy-flyio.sh` (syntax check)
      Success: Script passes syntax check, displays help with `--help`

---

## 2. Secrets and Security Setup

**Purpose:** Document and script secure handling of API keys
**Dependencies:** Section 1 complete
**Estimated effort:** 1 hour

- [ ] 2.1 Document required secrets
      File: `design.md` (update "Security Considerations" section)
      Document:
      - ANTHROPIC_API_KEY (required for Claude)
      - OPENAI_API_KEY (optional, for GPT models)
      - GOOGLE_AI_API_KEY (optional, for Gemini)
      - GITHUB_TOKEN (optional, for private repos)
      Validation: `grep -q "ANTHROPIC_API_KEY" .opencode/openspec/changes/deploy-opencode-flyio/design.md`
      Success: All secrets documented with usage notes

- [ ] 2.2 Add secrets setup to deployment script
      File: `.opencode/scripts/deploy-flyio.sh` (update)
      Logic:
      - Check if secrets exist: `flyctl secrets list`
      - If ANTHROPIC_API_KEY missing, prompt user
      - Provide example commands in output
      Validation: Run script, verify it prompts for missing secrets
      Success: Script detects and prompts for missing required secrets

---

## 3. Persistent Volume Configuration

**Purpose:** Ensure workspace data persists across deployments
**Dependencies:** Section 1 complete
**Estimated effort:** 1 hour

- [ ] 3.1 Add volume creation to deployment script
      File: `.opencode/scripts/deploy-flyio.sh` (update)
      Logic:
      - Check if volume exists: `flyctl volumes list`
      - If not, create: `flyctl volumes create opencode_data --size 1 --region $REGION`
      - Verify mount in fly.toml matches volume name
      Validation: Deploy, then `flyctl ssh console -C "ls -la /app/.opencode"`
      Success: Volume mounted and writable at /app/.opencode

- [ ] 3.2 Document volume backup procedures
      File: `design.md` (update "Rollback and Recovery" section)
      Include:
      - `flyctl volumes snapshots create` command
      - `flyctl volumes snapshots list` command
      - Restore procedure from snapshot
      Validation: `grep -q "snapshots create" design.md`
      Success: Backup procedures documented with examples

---

## 4. Deployment Testing

**Purpose:** Verify deployment works end-to-end
**Dependencies:** Sections 1-3 complete
**Estimated effort:** 2-3 hours

- [ ] 4.1 Test local Docker build
      Command: `docker build -t opencode-flyio-test .`
      Verify:
      - Build completes without errors
      - Image size reasonable (<200MB)
      - All expected binaries present
      Validation: `docker run --rm opencode-flyio-test which git opencode node`
      Success: All binaries found in container

- [ ] 4.2 Test Fly.io deployment
      Commands:
      ```bash
      flyctl launch --no-deploy  # First time only
      flyctl volumes create opencode_data --size 1
      flyctl secrets set ANTHROPIC_API_KEY=test-key
      flyctl deploy
      ```
      Validation: `flyctl status` shows running Machine
      Success: Machine running, deployment successful

- [ ] 4.3 Test SSH access
      Command: `flyctl ssh console -a opencode-agents`
      Verify inside container:
      - `opencode --version` works
      - `git --version` works
      - `node --version` shows v20.x
      - `/app/.opencode` is writable
      Validation: All commands succeed inside SSH session
      Success: Interactive shell access working

- [ ] 4.4 Test persistence across redeploy
      Procedure:
      1. SSH in, create test file: `touch /app/.opencode/test-persist`
      2. Redeploy: `flyctl deploy`
      3. SSH in, verify file exists
      Validation: `flyctl ssh console -C "ls /app/.opencode/test-persist"`
      Success: File persists after redeploy

- [ ] 4.5 Test OpenCode agent execution
      Procedure:
      1. SSH into container
      2. Set up ANTHROPIC_API_KEY (already in secrets)
      3. Run: `opencode run "What is 2+2?"`
      Validation: Agent responds with correct answer
      Success: OpenCode agent executes successfully via SSH

---

## 5. Documentation

**Purpose:** Enable users to deploy and use the Fly.io environment
**Dependencies:** Sections 1-4 complete
**Estimated effort:** 2 hours

- [ ] 5.1 Add deployment section to README
      File: `README.md` (update, add "Cloud Deployment" section)
      Include:
      - Prerequisites (flyctl, Fly.io account)
      - Quick start (3-5 commands)
      - Link to full design.md for details
      Validation: `grep -q "flyctl" README.md`
      Success: README includes deployment quickstart

- [ ] 5.2 Create deployment troubleshooting guide
      File: `.opencode/openspec/changes/deploy-opencode-flyio/troubleshooting.md` (new file)
      Cover:
      - "Machine not starting" - check logs with `flyctl logs`
      - "Volume not mounting" - verify region matches
      - "SSH connection failed" - check `flyctl auth status`
      - "OpenCode command not found" - verify Dockerfile
      Validation: File exists with 4+ troubleshooting sections
      Success: Common issues documented with solutions

- [ ] 5.3 Add AGENTS.md section for Fly.io deployment
      File: `.opencode/AGENTS.md` (update, add cloud deployment section)
      Add:
      ```markdown
      ## Cloud Deployment (Fly.io)
      
      ```bash
      # Deploy to Fly.io
      .opencode/scripts/deploy-flyio.sh
      
      # SSH into cloud environment
      flyctl ssh console -a opencode-agents
      
      # Run commands remotely
      flyctl ssh console -C "opencode run 'your task here'"
      ```
      ```
      Validation: `grep -q "deploy-flyio" AGENTS.md`
      Success: AGENTS.md includes Fly.io quickstart

---

## 6. Cost Optimization

**Purpose:** Document and implement cost-saving features
**Dependencies:** Section 4 complete
**Estimated effort:** 1 hour

- [ ] 6.1 Document cost breakdown
      File: `design.md` (already in "Cost Breakdown" section)
      Verify:
      - Machine cost (~$5/month)
      - Volume cost (~$0.15/GB/month)
      - Data transfer (usually free)
      - LLM API costs (external)
      Validation: `grep -q "\\$5" design.md`
      Success: All costs documented with estimates

- [ ] 6.2 Add Machine stop/start commands to script
      File: `.opencode/scripts/deploy-flyio.sh` (update)
      Add flags:
      - `--stop` - Stop Machine to pause billing
      - `--start` - Start Machine
      - `--status` - Show current Machine state
      Validation: `.opencode/scripts/deploy-flyio.sh --help` shows new flags
      Success: Script supports stop/start/status operations

---

## 7. Spec Deltas

**Purpose:** Update OpenSpec with Fly.io deployment requirements
**Dependencies:** Sections 1-6 complete
**Estimated effort:** 1 hour

- [ ] 7.1 Create cloud-deployment-workflow spec delta
      File: `.opencode/openspec/changes/deploy-opencode-flyio/specs/cloud-deployment-workflow/spec.md`
      Add ADDED requirements:
      - Fly.io Deployment
      - Container Configuration
      - Persistent Storage
      - Secure Access
      Validation: `openspec validate deploy-opencode-flyio --strict`
      Success: OpenSpec validation passes

---

## Summary

| Section | Tasks | Estimated Hours |
|---------|-------|-----------------|
| 1. Core Infrastructure | 3 | 2-3 |
| 2. Secrets & Security | 2 | 1 |
| 3. Persistent Volume | 2 | 1 |
| 4. Deployment Testing | 5 | 2-3 |
| 5. Documentation | 3 | 2 |
| 6. Cost Optimization | 2 | 1 |
| 7. Spec Deltas | 1 | 1 |
| **Total** | **18** | **10-12 hours** |

---

## Acceptance Criteria

1. **Dockerfile builds successfully** - `docker build` completes without errors
2. **fly.toml validates** - `flyctl config validate` passes
3. **Deployment script works** - `.opencode/scripts/deploy-flyio.sh` deploys to Fly.io
4. **SSH access functional** - `flyctl ssh console` provides interactive shell
5. **Data persists** - Files in `/app/.opencode` survive redeploys
6. **OpenCode runs** - Agents execute successfully via SSH
7. **Documentation complete** - README, AGENTS.md, and troubleshooting guide updated
8. **OpenSpec valid** - `openspec validate deploy-opencode-flyio --strict` passes

---

## Next Steps After Implementation

1. Run `openspec validate deploy-opencode-flyio --strict`
2. Create beads issue: `bd create --title "Implement Fly.io deployment"`
3. Begin implementation with Section 1
4. Test each section before proceeding
5. Update this tasks.md as items complete
