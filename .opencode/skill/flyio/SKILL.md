---
name: flyio
description: Deploy and manage the OpenCode agent framework on Fly.io for remote SSH access.
---

## What I do
- Deploy the agent framework to Fly.io using the deployment script
- Manage Fly.io Machine lifecycle (start, stop, status, destroy)
- Configure secrets (API keys) for the deployed environment
- Connect to the remote environment via SSH
- Troubleshoot deployment issues and provide recovery steps

## Usage Template
```
Action: <deploy | status | start | stop | ssh | logs | secrets | destroy>
App Name: <optional: override default "opencode-agents">
Region: <optional: override default "sjc">
Secrets: <optional: key=value pairs for secrets set action>
```

## Process

### 1. Validate Prerequisites
- Check if `flyctl` is installed: `command -v flyctl`
- Check authentication status: `flyctl auth whoami`
- Checkpoint: If not authenticated, instruct user to run `flyctl auth login`
- Decision: If flyctl missing, provide installation instructions (`brew install flyctl`)

### 2. Route to Action

#### Deploy (default action)
- Run: `.opencode/scripts/deploy-flyio.sh`
- Script handles: app creation, volume creation, secrets check, deployment
- Checkpoint: Verify deployment succeeded with `flyctl status -a <app-name>`
- Output: Connection instructions for SSH access

#### Status Check
- Run: `.opencode/scripts/deploy-flyio.sh --status`
- Or directly: `flyctl status -a <app-name>`
- Parse output for Machine state (running, stopped, etc.)
- Decision: If stopped, suggest `--start` to resume

#### Start Machine
- Run: `.opencode/scripts/deploy-flyio.sh --start`
- Or directly: `flyctl machine start -a <app-name> --select`
- Checkpoint: Verify Machine is running after start
- Note: Billing resumes when Machine is running

#### Stop Machine
- Run: `.opencode/scripts/deploy-flyio.sh --stop`
- Or directly: `flyctl machine stop -a <app-name> --select`
- Checkpoint: Confirm Machine stopped
- Note: Billing pauses when Machine is stopped

#### SSH Connection
- Run: `.opencode/scripts/deploy-flyio.sh --ssh`
- Or directly: `flyctl ssh console -a <app-name>`
- For single commands: `flyctl ssh console -a <app-name> -C '<command>'`
- Checkpoint: Verify Machine is running before attempting SSH

#### View Logs
- Run: `.opencode/scripts/deploy-flyio.sh --logs`
- Or directly: `flyctl logs -a <app-name>`
- Use for debugging startup issues or runtime errors

#### Set Secrets
- Run: `flyctl secrets set <KEY>=<value> -a <app-name>`
- Required secrets: `OPENROUTER_API_KEY`, `EXA_API_KEY`
- Optional secrets: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- Checkpoint: Verify secrets set with `flyctl secrets list -a <app-name>`
- Note: Setting secrets triggers a redeploy

#### Destroy App
- Run: `.opencode/scripts/deploy-flyio.sh --destroy`
- Requires confirmation (type app name)
- Warning: This permanently deletes the app and all data
- Decision: Suggest creating a backup first if data exists

### 3. Handle Errors and Edge Cases
- **flyctl not found**: Install with `brew install flyctl` (macOS) or `curl -L https://fly.io/install.sh | sh`
- **Not authenticated**: Run `flyctl auth login`
- **App not found**: Run deploy script to create app
- **Machine not starting**: Check logs with `flyctl logs -a <app-name>`
- **SSH connection failed**: Verify Machine is running, check `flyctl status`
- **Secrets missing**: Set required secrets before deployment
- **Volume issues**: Check volume exists with `flyctl volumes list -a <app-name>`
- **Deployment failed**: Check Dockerfile builds locally with `docker build -t test .`

### 4. Format Output
- For deploy: Show deployment status and SSH connection instructions
- For status: Show Machine state, region, and resource usage
- For start/stop: Confirm action and billing implications
- For ssh: Note that interactive shell was opened
- For logs: Display recent log entries
- For secrets: List configured secrets (names only, not values)
- For destroy: Confirm destruction completed

## Output Format

### Deployment Success
```markdown
## Fly.io Deployment Complete

**App**: <app-name>
**Region**: <region>
**Status**: running

### Connect via SSH
```bash
flyctl ssh console -a <app-name>
```

### Run Commands Directly
```bash
flyctl ssh console -a <app-name> -C 'opencode --version'
```

### Next Steps
1. Set secrets if not already configured:
   ```bash
   flyctl secrets set OPENROUTER_API_KEY=sk-or-... -a <app-name>
   flyctl secrets set EXA_API_KEY=... -a <app-name>
   ```
2. Connect and start working: `flyctl ssh console -a <app-name>`
3. Stop when done to pause billing: `.opencode/scripts/deploy-flyio.sh --stop`
```

### Status Check
```markdown
## Fly.io Status: <app-name>

**Machine State**: <running | stopped | starting>
**Region**: <region>
**VM Size**: shared-cpu-1x (512MB RAM)
**Volume**: opencode_data (1GB)

### Secrets Configured
- OPENROUTER_API_KEY: ✓
- EXA_API_KEY: ✓

### Actions
- Connect: `flyctl ssh console -a <app-name>`
- Stop: `.opencode/scripts/deploy-flyio.sh --stop`
- Logs: `.opencode/scripts/deploy-flyio.sh --logs`
```

### Error Handling
```markdown
## Error: <error-type>

**Message**: <error-message>

### Troubleshooting
1. <step 1>
2. <step 2>

### Related Commands
- <helpful command 1>
- <helpful command 2>
```

## Examples

### Good: Complete Deployment Workflow
```
Action: deploy

Output:
## Fly.io Deployment Complete

**App**: opencode-agents
**Region**: sjc
**Status**: running

### Connect via SSH
flyctl ssh console -a opencode-agents

### Next Steps
1. Set secrets:
   flyctl secrets set OPENROUTER_API_KEY=sk-or-... -a opencode-agents
2. Connect: flyctl ssh console -a opencode-agents
3. Stop when done: .opencode/scripts/deploy-flyio.sh --stop

Why: Provides complete deployment status with actionable next steps
```

### Good: Cost-Conscious Workflow
```
Action: stop

Output:
## Machine Stopped

**App**: opencode-agents
**Previous State**: running
**Current State**: stopped

Billing is now paused. Resume with:
.opencode/scripts/deploy-flyio.sh --start

Why: Confirms action and explains billing implications
```

### Good: Error Recovery
```
Action: ssh
Error: Machine is not running

Output:
## Error: Machine Not Running

**Message**: Cannot SSH to stopped Machine

### Troubleshooting
1. Check status: flyctl status -a opencode-agents
2. Start Machine: .opencode/scripts/deploy-flyio.sh --start
3. Wait for Machine to be running
4. Retry SSH: flyctl ssh console -a opencode-agents

Why: Provides clear recovery path for common error
```

### Bad: Vague Deployment Output
```
Action: deploy

Output:
Deployed successfully.

Problem: No app name, no region, no connection instructions
Fix: Always include app details and actionable next steps
```

### Bad: Missing Prerequisites Check
```
Action: deploy

Output:
Error: command not found: flyctl

Problem: Didn't check prerequisites before attempting deployment
Fix: Always validate flyctl installation and auth status first
```

## Guidelines

1. **Check prerequisites first** - Always verify flyctl is installed and authenticated before any operation.

2. **Use the deployment script** - Prefer `.opencode/scripts/deploy-flyio.sh` over raw flyctl commands for consistency.

3. **Explain billing implications** - When starting/stopping Machines, note the cost impact.

4. **Provide connection instructions** - After deployment or start, always show how to SSH in.

5. **Validate secrets** - Before deployment, check that required secrets are configured.

6. **Suggest cost savings** - Remind users to stop Machines when not in use.

7. **Handle errors gracefully** - Provide specific troubleshooting steps for common failures.

8. **Never expose secret values** - Only show secret names, never actual values.

9. **Confirm destructive actions** - For destroy operations, require explicit confirmation.

10. **Cross-reference with release skill** - Coordinate deployments with git state and release workflows.

## Configuration Reference

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `FLYIO_APP_NAME` | `opencode-agents` | App name on Fly.io |
| `FLYIO_REGION` | `sjc` | Deployment region |

### Required Secrets
| Secret | Description |
|--------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access |
| `EXA_API_KEY` | Exa API key for web search |

### Optional Secrets
| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Direct Anthropic API access |
| `OPENAI_API_KEY` | OpenAI API access |

### Files
| File | Purpose |
|------|---------|
| `fly.toml` | Fly.io app configuration |
| `Dockerfile` | Container build definition |
| `.opencode/scripts/deploy-flyio.sh` | Deployment automation script |

## Cost Reference

| Resource | Cost | Notes |
|----------|------|-------|
| shared-cpu-1x VM | ~$2-5/month | Only when running |
| Stopped Machine | Free | Use `--stop` when not in use |
| 1GB Volume | $0.15/month | Persistent storage |
| Bandwidth | Free (reasonable use) | Included in plan |

## Integration Notes

- **With `release` skill**: Ensure git state is clean before deploying
- **With `qa` skill**: Run tests locally before deploying to Fly.io
- **With `sprites` skill**: Use sprites for development, Fly.io for persistent remote access
- **With `self-improve` skill**: Log deployment friction for future improvements
