---
description: Start a new stream of work in a separate git worktree.
agent: builder
---
Create a new git worktree and immediately begin work on the given task.

**Syntax:** `/worktree <tree_name> <work_prompt>`

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Workflow Steps**

1. **Parse Arguments**
   - First argument: `<tree_name>` (used as branch name and worktree directory name)
   - Remaining arguments: `<work_prompt>` (task description to begin working on)
   - Base branch: current branch or `main`/`master`
   - Worktree path: `../<tree_name>`

2. **Create Worktree**
   ```bash
   git worktree add -b <tree_name> ../<tree_name> <base-branch>
   ```

3. **Configure Environment**
   ```bash
   export BEADS_NO_DAEMON=1  # Required: worktrees don't support daemon mode
   cd ../<tree_name>
   ```

4. **Begin Work**
   - Immediately start working on `<work_prompt>` using `/dev` workflow
   - No prompts, no beads association—just start building

**Example Usage**
```
/worktree feature-auth Add JWT authentication to the API
/worktree fix-login Fix the login redirect bug on mobile
/worktree refactor-db Migrate from SQLite to PostgreSQL
```

**Output**
- Confirmation of worktree creation
- Begin `/dev` workflow with the provided prompt

**Cleanup** (when done)
```bash
git worktree remove ../<tree_name>
```
