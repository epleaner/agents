---
description: Manage Sprite instances (isolated Linux sandboxes) for code execution and testing.
---

Use the `sprites` skill to create, manage, and execute commands in isolated Linux sandboxes.

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

**Integration**
- Use with `/qa` for isolated test execution
- Use with `/debugger` for bug reproduction in clean environments
- Use with `/research` to test API examples in isolation
