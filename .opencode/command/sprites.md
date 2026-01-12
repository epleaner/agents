---
description: Manage Sprite instances (persistent Linux computers) for safe coding agent execution and sandboxed development.
---

Use the `sprites` skill to create, manage, and execute commands in persistent Linux sandboxes.

**What are Sprites?**
Sprites are persistent computers (~8GB RAM, 8 CPUs), not ephemeral containers. They include pre-installed tools (Claude Code, Python 3.13, Node.js 22.20) and support fast checkpoints (~300ms) for state management. Perfect for running coding agents in YOLO mode safely.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Specify the action: create, list, get, destroy, exec, checkpoint, restore, or policy
2. Provide sprite name for operations on specific sprites
3. For exec operations, include the command to run
4. For checkpoint operations, specify checkpoint name or ID
5. For network policy, specify allow/deny rules

**Common Operations**
- Authenticate: `/sprites login`
- Create sprite: `/sprites create <name>`
- Set active sprite: `/sprites use <name>`
- Execute command: `/sprites exec <command>`
- Open interactive shell: `/sprites console`
- Create checkpoint: `/sprites checkpoint create`
- Restore checkpoint: `/sprites restore <id>`
- Forward ports: `/sprites proxy <port>`
- List sprites: `/sprites list`
- Destroy sprite: `/sprites destroy`

**Examples**
```bash
# Authenticate and create environment
/sprites login
/sprites create dev-env
/sprites use dev-env

# Run commands
/sprites exec python -c "print('Hello from Sprite')"

# Open interactive shell for debugging
/sprites console

# Create checkpoint before risky operation
/sprites checkpoint create

# Restore if something goes wrong
/sprites checkpoint list
/sprites restore <checkpoint-id>

# Forward port for web service
/sprites exec npm start &
/sprites proxy 3000

# Clean up
/sprites destroy
```

**Key Features**
- **Persistent environments**: State survives between sessions (no rebuilding)
- **Pre-installed tools**: Claude Code, Python 3.13, Node.js 22.20, and more
- **Fast checkpoints**: ~300ms snapshots with copy-on-write efficiency
- **Auto port forwarding**: `sprite console` automatically forwards localhost
- **Built-in docs**: Explore `/.sprite/docs/` and `/.sprite/skills/` inside sprite
- **Scale-to-zero**: Sleep after 30s inactivity, pay only for usage

**Integration**
- Use with `/qa` for isolated test execution with checkpoint/restore
- Use with `/debugger` for bug reproduction in clean environments
- Use with `/research` to test API examples in isolation
- Run coding agents (Claude Code, Codex, Gemini) safely in YOLO mode
