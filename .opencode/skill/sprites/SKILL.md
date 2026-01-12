---
name: sprites
description: Manage isolated Linux sandboxes (Sprites) for code execution, testing, and development workflows.
---

## What I do
- Create, list, and destroy Sprite instances (isolated Linux sandboxes)
- Execute commands inside Sprites with stdin/stdout streaming or interactive console
- Manage checkpoints (snapshots) for state preservation and rollback
- Proxy local ports through remote Sprite environments
- Manage sprite URLs and authentication settings
- Set active sprite context for directory-based workflows

## Usage Template
```
Action: <create | list | destroy | exec | console | checkpoint | restore | proxy | use | url>
Sprite: <sprite-name> (optional if set via 'sprite use')
Organization: <org-name> (optional, uses default if not specified)
Command: <optional: command to execute inside sprite>
Options: <optional: additional flags like -o, -s, --debug>
```

## Process

### 1. Identify Action and Validate Context
- Determine the requested operation (create, exec, checkpoint, etc.)
- Check authentication status (user should run `sprite login` first)
- Verify sprite context: either specified via `-s <name>` flag or set via `sprite use <name>`
- Checkpoint: If not authenticated, instruct user to run `sprite login`
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
- **Create**: `sprite checkpoint create` (uses active sprite)
- **List**: `sprite checkpoint list` or `sprite checkpoint ls`
- **Info**: `sprite checkpoint info <id>` for details
- **Restore**: `sprite restore <id>` to restore from checkpoint
- Checkpoint: Verify checkpoint creation before considering it available for restore
- Decision: If restoring, warn that current state will be lost

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

2. **Use sprite context** - Prefer `sprite use <name>` to set active sprite for directory, then use commands without `-s` flag for cleaner workflows.

3. **Separate stdout and stderr** - When executing commands, always capture and display both streams separately for debugging.

4. **Provide exit codes** - Include command exit codes in exec output so users can script conditional logic.

5. **Checkpoint before risky operations** - Suggest creating checkpoints before destructive commands or major state changes.

6. **Interactive vs non-interactive** - Use `sprite exec` for single commands, `sprite console` for interactive debugging sessions.

7. **Organization context** - When working with multiple orgs, use `-o <org>` flag or `sprite org auth` to manage tokens.

8. **Clean up resources** - Remind users to `sprite destroy` when done to avoid unnecessary costs.

9. **Port forwarding for services** - Use `sprite proxy <port>` to access web services running inside sprites from local machine.

10. **Debug mode** - Use `--debug` flag for troubleshooting: `sprite --debug exec <command>` or `sprite --debug=/tmp/debug.log exec <command>`.

11. **Cross-reference with qa skill** - When running tests inside sprites, coordinate with `qa` skill for test result parsing.

## Common Workflows

### Development Environment Setup
```bash
# Authenticate
sprite login

# Create sprite
sprite create dev-env

# Set as active sprite for this directory
sprite use dev-env

# Install dependencies
sprite exec npm install

# Create checkpoint after setup
sprite checkpoint create

# Run tests
sprite exec npm test

# If tests fail, restore to checkpoint
sprite checkpoint list
sprite restore <checkpoint-id>
```

### Interactive Debugging Session
```bash
# Create and activate sprite
sprite create debug-env
sprite use debug-env

# Open interactive shell
sprite console

# (Inside console, run commands interactively)
# npm install
# node --inspect app.js
# exit

# Create checkpoint of working state
sprite checkpoint create
```

### Port Forwarding for Web Services
```bash
# Create sprite and start web server
sprite create web-env
sprite use web-env
sprite exec npm start &

# Forward port 3000 to local machine
sprite proxy 3000

# Access at http://localhost:3000
# Make sprite URL public
sprite url update --auth public
sprite url
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

### Global Flags
| Flag | Description | Example |
|------|-------------|---------|
| `-o, --org <name>` | Specify organization | `sprite -o myorg list` |
| `-s, --sprite <name>` | Specify sprite | `sprite -s my-env exec ls` |
| `--debug[=<file>]` | Enable debug logging | `sprite --debug exec npm test` |
| `-h, --help` | Show help | `sprite --help` |

## Integration Notes

- **With `qa` skill**: Use sprites for isolated test execution, then parse results with qa skill
- **With `debugger` skill**: Create sprite, reproduce bug in isolation, checkpoint failing state
- **With `release` skill**: Test deployment scripts in sprite before running in production
- **With `research` skill**: Fetch documentation inside sprite to test API examples in isolation

## Security Considerations

1. **Authentication tokens**: Tokens are stored securely by the CLI after `sprite login`. Never share or expose tokens in logs.
2. **Organization access**: Use `sprite org auth` to manage multiple organization tokens. Each org has separate access controls.
3. **URL authentication**: By default, sprite URLs require authentication. Use `sprite url update --auth public` carefully.
4. **Resource cleanup**: Always `sprite destroy` when done to prevent unauthorized access and unnecessary costs.
5. **Checkpoint sensitivity**: Checkpoints may contain secrets, environment variables, and application state. Manage access carefully.
6. **Command injection**: Sanitize user input before passing to `sprite exec` commands.
7. **Debug logs**: When using `--debug`, be aware that logs may contain sensitive information. Use `--debug=<file>` to control output location.
