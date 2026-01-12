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
- Create sprite: `/sprites create <name>`
- Execute command: `/sprites exec <name> -- <command>`
- Create checkpoint: `/sprites checkpoint create <name> --name <checkpoint-name>`
- Restore checkpoint: `/sprites checkpoint restore <name> --checkpoint <id>`
- Set network policy: `/sprites policy set <name> --allow <domain>`
- List sprites: `/sprites list`
- Destroy sprite: `/sprites destroy <name>`

**Examples**
```bash
# Create a development environment
/sprites create dev-env

# Run Python code
/sprites exec dev-env -- python -c "print('Hello from Sprite')"

# Create checkpoint before risky operation
/sprites checkpoint create dev-env --name before-upgrade

# Restore if something goes wrong
/sprites checkpoint restore dev-env --checkpoint <checkpoint-id>

# Clean up
/sprites destroy dev-env
```

**Integration**
- Use with `/qa` for isolated test execution
- Use with `/debugger` for bug reproduction in clean environments
- Use with `/research` to test API examples in isolation
