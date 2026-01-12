---
name: sprites
description: Manage isolated Linux sandboxes (Sprites) for code execution, testing, and development workflows.
---

## What I do
- Create, list, update, and destroy Sprite instances (isolated Linux sandboxes)
- Execute commands inside Sprites with stdin/stdout streaming
- Manage checkpoints (snapshots) for state preservation and rollback
- Configure network policies for outbound access control
- Proxy TCP connections to ports inside Sprites

## Usage Template
```
Action: <create | list | get | destroy | exec | checkpoint | restore | policy>
Sprite: <sprite-name or ID>
Command: <optional: command to execute inside sprite>
Options: <optional: additional flags like --checkpoint-name, --network-policy>
```

## Process

### 1. Identify Action and Validate Context
- Determine the requested operation (create, exec, checkpoint, etc.)
- Verify SPRITES_TOKEN environment variable is set
- Checkpoint: If token missing, instruct user to set `export SPRITES_TOKEN=<token>`
- Decision: Route to appropriate workflow based on action type

### 2. Execute Sprite Operation

#### Creating a Sprite
- Run: `sprites create <name>` or use SDK equivalent
- Validate sprite name (alphanumeric, hyphens allowed)
- Checkpoint: Confirm sprite creation succeeded before proceeding
- Return sprite ID and status

#### Listing Sprites
- Run: `sprites list` to show all sprites
- Parse output to extract sprite names, IDs, and statuses
- Decision: If filtering needed, apply status/name filters

#### Executing Commands
- Verify sprite exists: `sprites get <name>`
- Run command: `sprites exec <name> -- <command>`
- For interactive commands, note stdin/stdout handling requirements
- Checkpoint: Capture exit code and output streams separately
- Decision: If command fails (exit code ≠ 0), report stderr and suggest fixes

#### Managing Checkpoints
- **Create**: `sprites checkpoint create <sprite-name> --name <checkpoint-name>`
- **List**: `sprites checkpoint list <sprite-name>`
- **Restore**: `sprites checkpoint restore <sprite-name> --checkpoint <checkpoint-id>`
- Checkpoint: Verify checkpoint creation before considering it available for restore
- Decision: If restoring, warn that current state will be lost

#### Network Policy
- **Get**: `sprites policy get <sprite-name>`
- **Set**: `sprites policy set <sprite-name> --allow <domain> --deny <domain>`
- Use DNS-based filtering rules (allow/deny lists)
- Checkpoint: Validate policy syntax before applying

### 3. Handle Errors and Edge Cases
- **Sprite not found**: Suggest `sprites list` to see available sprites
- **Command timeout**: Recommend increasing timeout or using async exec
- **Network policy conflicts**: Explain allow/deny precedence
- **Checkpoint restore failure**: Check if checkpoint exists and sprite is idle

### 4. Format Output
- For create/destroy: Confirm action with sprite ID
- For exec: Return stdout, stderr, and exit code separately
- For list: Present table format with name, ID, status, created date
- For checkpoints: Show checkpoint ID, name, size, and timestamp

## Output Format

### Sprite Creation
```markdown
✓ Sprite created: <sprite-name>
- ID: <sprite-id>
- Status: running
- Created: <timestamp>

Next steps:
- Run commands: `sprites exec <sprite-name> -- <command>`
- Create checkpoint: `sprites checkpoint create <sprite-name> --name <checkpoint-name>`
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

To restore: `sprites checkpoint restore <sprite-name> --checkpoint <checkpoint-id>`
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
- Check available sprites: `sprites list`
- Create sprite: `sprites create nonexistent-sprite`

Related commands:
- sprites list
- sprites create <name>

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

1. **Always verify SPRITES_TOKEN** - Check environment variable before any operation. Fail fast with clear instructions if missing.

2. **Separate stdout and stderr** - When executing commands, always capture and display both streams separately for debugging.

3. **Provide exit codes** - Include command exit codes in exec output so users can script conditional logic.

4. **Checkpoint before risky operations** - Suggest creating checkpoints before destructive commands or major state changes.

5. **Use explicit sprite names** - Avoid ambiguous references; always use the exact sprite name or ID.

6. **Handle long-running commands** - For commands that may take >30s, mention async exec options or WebSocket streaming.

7. **Network policy precedence** - When setting policies, explain that deny rules override allow rules.

8. **Clean up resources** - Remind users to destroy sprites when done to avoid unnecessary costs.

9. **Validate before execute** - Check sprite status (running vs stopped) before exec operations.

10. **Cross-reference with qa skill** - When running tests inside sprites, coordinate with `qa` skill for test result parsing.

## Common Workflows

### Development Environment Setup
```bash
# Create sprite
sprites create dev-env

# Install dependencies
sprites exec dev-env -- npm install

# Create checkpoint after setup
sprites checkpoint create dev-env --name deps-installed

# Run tests
sprites exec dev-env -- npm test

# If tests fail, restore to checkpoint
sprites checkpoint restore dev-env --checkpoint <checkpoint-id>
```

### Isolated Test Execution
```bash
# Create sprite for testing
sprites create test-runner

# Copy code into sprite (via exec with stdin)
sprites exec test-runner -- bash -c 'cat > test.py' < test.py

# Run tests
sprites exec test-runner -- python test.py

# Destroy after tests complete
sprites destroy test-runner
```

### Network Policy Testing
```bash
# Create sprite
sprites create isolated-env

# Deny all outbound by default
sprites policy set isolated-env --deny '*'

# Allow specific domains
sprites policy set isolated-env --allow 'api.example.com' --allow 'cdn.example.com'

# Test network access
sprites exec isolated-env -- curl https://api.example.com
```

## CLI Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `sprites create <name>` | Create new sprite | `sprites create my-env` |
| `sprites list` | List all sprites | `sprites list` |
| `sprites get <name>` | Get sprite details | `sprites get my-env` |
| `sprites destroy <name>` | Delete sprite | `sprites destroy my-env` |
| `sprites exec <name> -- <cmd>` | Execute command | `sprites exec my-env -- ls -la` |
| `sprites checkpoint create <name>` | Create checkpoint | `sprites checkpoint create my-env --name backup` |
| `sprites checkpoint list <name>` | List checkpoints | `sprites checkpoint list my-env` |
| `sprites checkpoint restore <name>` | Restore checkpoint | `sprites checkpoint restore my-env --checkpoint <id>` |
| `sprites policy get <name>` | Get network policy | `sprites policy get my-env` |
| `sprites policy set <name>` | Set network policy | `sprites policy set my-env --allow example.com` |

## Integration Notes

- **With `qa` skill**: Use sprites for isolated test execution, then parse results with qa skill
- **With `debugger` skill**: Create sprite, reproduce bug in isolation, checkpoint failing state
- **With `release` skill**: Test deployment scripts in sprite before running in production
- **With `research` skill**: Fetch documentation inside sprite to test API examples in isolation

## Security Considerations

1. **Token management**: Never log or expose SPRITES_TOKEN in command output
2. **Network isolation**: Use network policies to prevent unintended outbound connections
3. **Resource cleanup**: Always destroy sprites after use to prevent token/resource leaks
4. **Checkpoint sensitivity**: Checkpoints may contain secrets; manage access carefully
5. **Command injection**: Sanitize user input before passing to exec commands
