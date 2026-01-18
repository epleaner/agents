---
name: sprites
description: Manage isolated Linux sandboxes (Sprites) for code execution, testing, and development workflows.
---

## What I do
- Create, list, and destroy Sprite instances (isolated Linux sandboxes with ~8GB RAM, 8 CPUs)
- Execute commands inside Sprites with stdin/stdout streaming or interactive console
- Manage checkpoints (snapshots) for state preservation and rollback (~300ms checkpoint time)
- Proxy local ports through remote Sprite environments (automatic localhost forwarding)
- Manage sprite URLs and authentication settings
- Set active sprite context for directory-based workflows
- Leverage pre-installed tools (Claude Code, Python 3.13, Node.js 22.20, etc.)
- Access built-in Claude Skills in `/.sprite/` for sprite-specific guidance

## Usage Template
```
Action: <create | list | destroy | exec | console | checkpoint | restore | proxy | use | url>
Sprite: <sprite-name> (optional if set via 'sprite use')
Organization: <org-name> (optional, uses default if not specified)
Command: <optional: command to execute inside sprite>
Options: <optional: additional flags like -o, -s, --debug>
```

## Key Concepts

### Sprites are Computers, Not Containers
Sprites are **persistent computers** with real filesystems, not ephemeral containers. This means:
- State persists between sessions (no need to rebuild environments)
- Filesystem survives sprite sleep/wake cycles
- Coding agents don't have to rebuild development environments every time
- You get a real Linux computer (~8GB RAM, 8 CPUs) that you can treat like a remote server

### Fast Checkpoints, Not Slow Creates
Sprites optimize for "slow create, fast start/stop" with checkpoint/restore:
- Creating a sprite takes longer (full environment setup)
- Checkpoints are fast (~300ms) and efficient (copy-on-write)
- Restoring from checkpoint is faster than creating new sprite
- Last 5 checkpoints mounted at `/.sprite/checkpoints` for direct file access

### Scale-to-Zero Architecture
Sprites automatically sleep and wake:
- Sleep after 30 seconds of inactivity
- Wake quickly when needed
- Pay only for active usage (CPU hours, RAM hours, storage GB-hours)
- Filesystem persists during sleep

## Sprite Environment Features

Each sprite includes:

### Pre-installed Tools
- **Claude Code** - AI coding assistant (auto-signs in on first run)
- **Python 3.13** - Latest Python runtime
- **Node.js 22.20** - Latest Node.js LTS
- **Codex CLI** - GitHub Copilot CLI
- **Gemini CLI** - Google's AI assistant
- Additional development tools and utilities

### Built-in Documentation & Skills
- **`/.sprite/docs/agent-context.md`** - Agent-specific documentation
- **`/.sprite/skills/`** - Claude Skills that teach Claude how Sprites work
- **`sprite-env` command** - Internal sprite management tool
- Run `cat /.sprite/docs/agent-context.md` to learn about sprite internals

### Storage Architecture
- **Fast NVMe storage** - Directly attached for performance
- **Durable object storage** - Automatic background sync
- **TRIM-friendly billing** - Pay only for blocks written, bill decreases when you delete
- **Persistent filesystem** - Survives sprite sleep/wake cycles
- **Copy-on-write checkpoints** - Efficient snapshots of writable overlay

### Auto-scaling & Billing
- **Scale-to-zero** - Sprites sleep after 30 seconds of inactivity
- **Fast wake** - Quick resume when needed
- **Usage-based billing** - Pay for CPU hours, RAM hours, and GB-hours of storage
- **Estimated costs**: ~$0.46 for 4-hour intensive coding session, ~$4/month for low-traffic web app

## Process

### 1. Identify Action and Validate Context
- Determine the requested operation (create, exec, checkpoint, etc.)
- Check authentication status (user should run `sprite login` first)
- Verify sprite context: either specified via `-s <name>` flag or set via `sprite use <name>`
- Checkpoint: If not authenticated, instruct user to run `sprite login`
- Note: Sprites are persistent computers with filesystems, not ephemeral containers
- Decision: Route to appropriate workflow based on action type

### 2. Execute Sprite Operation

#### Creating a Sprite
- Run: `sprite create <name>` (optionally with `-o <org>`)
- Validate sprite name (alphanumeric, hyphens allowed)
- Checkpoint: Confirm sprite creation succeeded before proceeding
- Optionally set as active: `sprite use <name>`

#### Listing Sprites
- Run: `sprite list` or `sprite ls` to show all sprites
- Optionally filter by organization: `sprite list -o <org>`
- Parse output to extract sprite names and statuses

#### Executing Commands
- **Non-interactive**: `sprite exec <command>` (uses active sprite) or `sprite -s <name> exec <command>`
- **Interactive shell**: `sprite console` or `sprite c` for full shell access
- Shorthand: `sprite x <command>` for exec
- Checkpoint: Capture exit code and output streams separately
- Decision: If command fails (exit code ≠ 0), report stderr and suggest fixes

#### Managing Checkpoints
- **Create**: `sprite checkpoint create` (uses active sprite, takes ~300ms)
- **List**: `sprite checkpoint list` or `sprite checkpoint ls`
- **Info**: `sprite checkpoint info <id>` for details
- **Restore**: `sprite restore <id>` to restore from checkpoint (async, restarts environment)
- **Access**: Last 5 checkpoints mounted at `/.sprite/checkpoints` for direct file access
- Checkpoint: Verify checkpoint creation before considering it available for restore
- Decision: If restoring, warn that current state will be lost
- Note: Checkpoints use copy-on-write for storage efficiency, capturing only writable overlay

#### Port Proxying
- **Forward ports**: `sprite proxy <port1> [port2...]` to forward local ports through remote proxy
- Use for accessing services running inside sprite from local machine
- Checkpoint: Verify ports are available before proxying

#### URL Management
- **Show URL**: `sprite url` to display sprite's public URL
- **Update auth**: `sprite url update --auth <type>` to change authentication (e.g., public)
- Use for sharing sprite access or testing web services

### 3. Handle Errors and Edge Cases
- **Not authenticated**: Suggest `sprite login` to authenticate with Fly.io
- **No active sprite**: Suggest `sprite use <name>` or use `-s <name>` flag
- **Sprite not found**: Suggest `sprite list` to see available sprites
- **Command timeout**: Recommend using `sprite console` for interactive debugging
- **Checkpoint restore failure**: Check if checkpoint exists with `sprite checkpoint info <id>`
- **Organization access**: Use `-o <org>` flag or `sprite org auth` to add tokens

### 4. Format Output
- For create/destroy: Confirm action with sprite name and status
- For exec: Return stdout, stderr, and exit code separately
- For list: Present table format with sprite names and statuses
- For checkpoints: Show checkpoint ID and timestamp
- For console: Note that interactive shell was opened (output will be in terminal)
- For proxy: Confirm which ports are being forwarded

## Output Format

### Sprite Creation
```markdown
✓ Sprite created: <sprite-name>
- ID: <sprite-id>
- Status: running
- Created: <timestamp>

Next steps:
- Set as active: `sprite use <sprite-name>`
- Run commands: `sprite exec <command>` or `sprite -s <sprite-name> exec <command>`
- Open shell: `sprite console`
- Create checkpoint: `sprite checkpoint create`
```

### Command Execution
```markdown
Command: <command>
Sprite: <sprite-name>

--- STDOUT ---
<stdout content>

--- STDERR ---
<stderr content>

Exit Code: <code>
```

### Checkpoint Management
```markdown
Checkpoint created: <checkpoint-name>
- ID: <checkpoint-id>
- Sprite: <sprite-name>
- Size: <size-mb> MB
- Timestamp: <timestamp>

To restore: `sprite restore <checkpoint-id>`
```

### Error Handling
```markdown
❌ Error: <error-message>

Troubleshooting:
- <suggestion 1>
- <suggestion 2>

Related commands:
- <helpful command>
```

## Examples

### Good: Complete Workflow
```
Action: create
Sprite: test-env

Output:
✓ Sprite created: test-env
- ID: sprite-abc123
- Status: running
- Created: 2026-01-11T10:30:00Z

---

Action: exec
Sprite: test-env
Command: python -c "print(2+2)"

Output:
Command: python -c "print(2+2)"
Sprite: test-env

--- STDOUT ---
4

--- STDERR ---

Exit Code: 0

---

Action: checkpoint
Sprite: test-env
Options: --name working-state

Output:
Checkpoint created: working-state
- ID: ckpt-xyz789
- Sprite: test-env
- Size: 1.2 MB
- Timestamp: 2026-01-11T10:35:00Z

Why: This demonstrates the full lifecycle: create → execute → checkpoint
```

### Good: Error Recovery
```
Action: exec
Sprite: nonexistent-sprite
Command: ls

Output:
❌ Error: Sprite 'nonexistent-sprite' not found

Troubleshooting:
- Check available sprites: `sprite list`
- Create sprite: `sprite create nonexistent-sprite`
- Set active sprite: `sprite use <name>`

Related commands:
- sprite list
- sprite create <name>
- sprite use <name>

Why: Provides actionable error messages with recovery steps
```

### Bad: Vague Command Execution
```
Action: exec
Sprite: my-sprite
Command: run tests

Output:
Command failed

Problem: No stdout/stderr, no exit code, no troubleshooting guidance
Fix: Always capture and display stdout, stderr, exit code, and suggest next steps
```

### Bad: Missing Validation
```
Action: create
Sprite: My Sprite With Spaces!

Output:
Creating sprite...

Problem: Invalid sprite name (spaces, special chars) not caught early
Fix: Validate sprite name format before attempting creation
```

## Guidelines

1. **Authenticate first** - Users must run `sprite login` before any operations. Check authentication status and provide clear instructions if not logged in.

2. **Sprites are persistent computers** - Unlike ephemeral containers, sprites maintain state between sessions. Don't rebuild environments unnecessarily.

3. **Use sprite context** - Prefer `sprite use <name>` to set active sprite for directory, then use commands without `-s` flag for cleaner workflows.

4. **Leverage pre-installed tools** - Claude Code, Python 3.13, Node.js 22.20, and other tools are already installed. No need to install them.

5. **Explore `/.sprite/` directory** - Contains built-in documentation, skills, and sprite internals. Use `cat /.sprite/docs/agent-context.md` for guidance.

6. **Checkpoint liberally** - Checkpoints are fast (~300ms) and efficient (copy-on-write). Create them before risky operations or after successful setups.

7. **Access checkpoint files directly** - Last 5 checkpoints are mounted at `/.sprite/checkpoints` for direct file access without full restore.

8. **Interactive vs non-interactive** - Use `sprite exec` for single commands, `sprite console` for interactive debugging sessions.

9. **Port forwarding is automatic** - `sprite console` automatically forwards ports. Use `sprite proxy <port>` for additional ports.

10. **Public URLs for sharing** - Use `sprite url update --auth public` to make sprite accessible via public URL for demos/testing.

11. **Scale-to-zero awareness** - Sprites sleep after 30 seconds of inactivity. First command after sleep may take slightly longer.

12. **Storage billing optimization** - Delete unused files to reduce storage costs (TRIM-friendly billing).

13. **Organization context** - When working with multiple orgs, use `-o <org>` flag or `sprite org auth` to manage tokens.

14. **Debug mode** - Use `--debug` flag for troubleshooting: `sprite --debug exec <command>` or `sprite --debug=/tmp/debug.log exec <command>`.

15. **Safe YOLO mode for coding agents** - Sprites provide a safe sandbox for running coding agents in `--dangerously-skip-permissions` mode.

16. **Cross-reference with qa skill** - When running tests inside sprites, coordinate with `qa` skill for test result parsing.

## Use Cases

### 1. Safe Coding Agent Sandbox
Run AI coding agents (Claude Code, Codex, Gemini CLI) in YOLO mode (`--dangerously-skip-permissions`) without risking your local system. The worst that can happen is the sprite gets messed up and you restore from checkpoint or destroy it.

### 2. Persistent Development Environment
Unlike ephemeral containers, sprites maintain state between sessions. Set up your dev environment once, checkpoint it, and return to it later without rebuilding.

### 3. Untrusted Code Execution API
Use the Sprites API to run user-submitted code or LLM-generated code in a secure sandbox with configurable network policies and checkpoint/rollback capabilities.

### 4. Reproducible Testing Environment
Create a sprite, install dependencies, checkpoint the clean state, run tests, then restore to clean state for next test run. No test pollution between runs.

### 5. Collaborative Development
Share sprite URLs with team members for pair programming, debugging, or demos. Public URLs allow anyone to access your sprite.

### 6. Multi-Environment Workflows
Create separate sprites for development, staging, and testing. Use `sprite use` to switch between them in different project directories.

## Common Workflows

### Development Environment Setup (Persistent)
```bash
# Authenticate
sprite login

# Create sprite (Python 3.13, Node.js 22.20 already installed!)
sprite create dev-env

# Set as active sprite for this directory
sprite use dev-env

# Install project dependencies
sprite exec npm install

# Create checkpoint after setup (takes ~300ms)
sprite checkpoint create

# Run tests
sprite exec npm test

# If tests fail, restore to checkpoint
sprite checkpoint list
sprite restore <checkpoint-id>

# Next session: just reconnect, environment is still there!
sprite console
```

### Safe Coding Agent Workflow
```bash
# Create sprite for AI agent work
sprite create claude-sandbox
sprite use claude-sandbox

# Open console (Claude Code auto-signs in on first run)
sprite console

# Inside sprite, run Claude in YOLO mode safely
claude --dangerously-skip-permissions "Build a web scraper"

# If something goes wrong, restore from checkpoint
# (Outside sprite)
sprite checkpoint list
sprite restore v0

# Or just destroy and recreate
sprite destroy
sprite create claude-sandbox
```

### Port Forwarding for Web Services
```bash
# Create sprite and start web server
sprite create web-env
sprite use web-env

# Console automatically forwards ports!
sprite console
# (Inside sprite)
npm start  # Access at http://localhost:8080 on your machine

# Or use proxy for specific ports
sprite proxy 3000 8080

# Make sprite URL public for sharing
sprite url update --auth public
sprite url  # Share this URL with team
```

### Multi-Organization Workflow
```bash
# List organizations
sprite org list

# Create sprite in specific org
sprite create -o myorg prod-env

# Execute command in specific org/sprite
sprite -o myorg -s prod-env exec npm test

# Or set context and use
sprite use -o myorg prod-env
sprite exec npm test
```

### Exploring Sprite Internals
```bash
# Connect to sprite
sprite console

# Inside sprite, explore built-in documentation
cat /.sprite/docs/agent-context.md

# Check available Claude Skills
ls /.sprite/skills/

# View checkpoint management help
sprite-env checkpoints --help

# Access checkpoint files directly (last 5 checkpoints)
ls /.sprite/checkpoints/

# Check what tools are pre-installed
which claude python node npm

# View sprite environment variables
env | grep SPRITE
```

## CLI Command Reference

### Authentication & Setup
| Command | Description | Example |
|---------|-------------|---------|
| `sprite login` | Authenticate with Fly.io | `sprite login` |
| `sprite login -o <org>` | Login to specific org | `sprite login -o myorg` |
| `sprite logout` | Remove Sprites configuration | `sprite logout` |
| `sprite org auth` | Add API token | `sprite org auth` |
| `sprite org list` | Show configured tokens | `sprite org list` |
| `sprite auth setup --token <token>` | Set up auth from token | `sprite auth setup --token "org/token"` |

### Sprite Management
| Command | Description | Example |
|---------|-------------|---------|
| `sprite create <name>` | Create new sprite | `sprite create my-env` |
| `sprite create -o <org> <name>` | Create in specific org | `sprite create -o myorg dev-env` |
| `sprite list` | List all sprites | `sprite list` or `sprite ls` |
| `sprite list -o <org>` | List sprites in org | `sprite list -o myorg` |
| `sprite use <name>` | Set active sprite for directory | `sprite use my-env` |
| `sprite use --unset` | Unset active sprite | `sprite use --unset` |
| `sprite destroy` | Delete current sprite | `sprite destroy` |

### Command Execution
| Command | Description | Example |
|---------|-------------|---------|
| `sprite exec <cmd>` | Execute command (non-interactive) | `sprite exec ls -la` |
| `sprite x <cmd>` | Shorthand for exec | `sprite x npm test` |
| `sprite -s <name> exec <cmd>` | Exec in specific sprite | `sprite -s my-env exec pwd` |
| `sprite console` | Open interactive shell | `sprite console` or `sprite c` |
| `sprite --debug exec <cmd>` | Execute with debug logging | `sprite --debug exec npm start` |

### Checkpoints
| Command | Description | Example |
|---------|-------------|---------|
| `sprite checkpoint create` | Create checkpoint | `sprite checkpoint create` |
| `sprite checkpoint list` | List checkpoints | `sprite checkpoint list` |
| `sprite checkpoint info <id>` | Show checkpoint details | `sprite checkpoint info v2` |
| `sprite restore <id>` | Restore from checkpoint | `sprite restore v1` |

### Networking
| Command | Description | Example |
|---------|-------------|---------|
| `sprite proxy <port> [port2...]` | Forward local ports | `sprite proxy 8080 3000` |
| `sprite url` | Show sprite URL | `sprite url` |
| `sprite url update --auth <type>` | Update URL auth (public/private) | `sprite url update --auth public` |

### Advanced
| Command | Description | Example |
|---------|-------------|---------|
| `sprite api <path>` | Make authenticated API call | `sprite api /sprites` |
| `sprite api -s <name> <path>` | API call for specific sprite | `sprite api -s my-env /exec` |
| `sprite upgrade` | Upgrade CLI to latest version | `sprite upgrade` |
| `sprite upgrade --check` | Check for updates | `sprite upgrade --check` |

### Internal Sprite Commands (run inside sprite via console)
| Command | Description | Example |
|---------|-------------|---------|
| `sprite-env checkpoints list` | List checkpoints from inside sprite | `sprite-env checkpoints list` |
| `sprite-env checkpoints create` | Create checkpoint from inside | `sprite-env checkpoints create` |
| `sprite-env checkpoints get <id>` | Get checkpoint details | `sprite-env checkpoints get v2` |
| `sprite-env checkpoints restore <id>` | Restore from checkpoint | `sprite-env checkpoints restore v1` |
| `cat /.sprite/docs/agent-context.md` | View agent documentation | `cat /.sprite/docs/agent-context.md` |
| `ls /.sprite/skills/` | List Claude Skills | `ls /.sprite/skills/` |
| `ls /.sprite/checkpoints/` | Access checkpoint files directly | `ls /.sprite/checkpoints/` |

### Global Flags
| Flag | Description | Example |
|------|-------------|---------|
| `-o, --org <name>` | Specify organization | `sprite -o myorg list` |
| `-s, --sprite <name>` | Specify sprite | `sprite -s my-env exec ls` |
| `--debug[=<file>]` | Enable debug logging | `sprite --debug exec npm test` |
| `-h, --help` | Show help | `sprite --help` |

## Provisioning the Agents Repository

Use the provision script to quickly set up a sprite with the OpenCode agents repo:

```bash
# From the agents repo directory
.opencode/scripts/provision-sprite.sh

# With custom sprite name
.opencode/scripts/provision-sprite.sh --name my-dev-env

# With specific organization
.opencode/scripts/provision-sprite.sh --name my-dev-env --org myorg

# With a specific branch
.opencode/scripts/provision-sprite.sh --branch feature-xyz
```

The provision script will:
1. Create a new sprite (or use existing one)
2. Clone the agents repository from GitHub
3. Install npm dependencies in `.opencode/`
4. Configure environment variables (`OPENCODE_DATA_DIR`, `NODE_ENV`)
5. Create a checkpoint for easy restore

After provisioning, set your API keys:
```bash
sprite -s opencode-dev console

# Inside the sprite:
export OPENROUTER_API_KEY=sk-or-...
export EXA_API_KEY=...
export CONTEXT7_API_KEY=...

# Or add to ~/.bashrc for persistence
echo 'export OPENROUTER_API_KEY=sk-or-...' >> ~/.bashrc
```

### Re-provisioning or Updating

To update an existing sprite with latest changes:
```bash
# Run inside the sprite
sprite -s opencode-dev exec ".opencode/scripts/provision-sprite.sh --inside"

# Or connect and pull manually
sprite -s opencode-dev console
cd ~/workspace/agents
git pull
cd .opencode && npm install
```

### Restoring from Checkpoint

If something breaks, restore to the provisioned state:
```bash
sprite -s opencode-dev checkpoint list
sprite -s opencode-dev restore <checkpoint-id>
```

## Integration Notes

- **With `qa` skill**: Use sprites for isolated test execution with checkpoint/restore for clean test runs
- **With `debugger` skill**: Create sprite, reproduce bug in isolation, checkpoint failing state for analysis
- **With `release` skill**: Test deployment scripts in sprite before running in production
- **With `research` skill**: Fetch documentation inside sprite to test API examples in isolation
- **With coding agents**: Run Claude Code, Codex, or Gemini CLI in YOLO mode safely within sprite sandbox
- **With `/.sprite/skills/`**: Leverage built-in Claude Skills that teach Claude how to use sprite features
- **With API integrations**: Use Sprites API (Go, TypeScript, Python, Elixir SDKs) for programmatic sandbox management

## Security Considerations

1. **Authentication tokens**: Tokens are stored securely by the CLI after `sprite login`. Never share or expose tokens in logs.
2. **Organization access**: Use `sprite org auth` to manage multiple organization tokens. Each org has separate access controls.
3. **URL authentication**: By default, sprite URLs require authentication. Use `sprite url update --auth public` carefully.
4. **Resource cleanup**: Always `sprite destroy` when done to prevent unauthorized access and unnecessary costs.
5. **Checkpoint sensitivity**: Checkpoints may contain secrets, environment variables, and application state. Manage access carefully.
6. **Command injection**: Sanitize user input before passing to `sprite exec` commands.
7. **Debug logs**: When using `--debug`, be aware that logs may contain sensitive information. Use `--debug=<file>` to control output location.
