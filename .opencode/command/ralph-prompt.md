---
description: Generate a Ralph mode prompt with beads integration and iteration guidance.
---

Generate an autonomous Ralph mode prompt for the following task. Include beads issue tracking directives, iteration strategy, completion criteria, and quality gates.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Provide a clear task description (what needs to be accomplished)
2. Optionally specify max iterations (default: 50)
3. Optionally disable quality gates for simple tasks (default: enabled)
4. The generated prompt will include:
   - Beads integration commands for issue tracking
   - Iteration strategy for breaking down work
   - Explicit completion criteria with `- [x] TASK_COMPLETE` marker
   - Quality gates (tests, lints, builds)
   - Safety guards to prevent common mistakes

**Examples**

Simple task:
```
/ralph-prompt Fix the login bug in auth.ts
```

Complex feature:
```
/ralph-prompt Implement user authentication with JWT tokens, including login, logout, token refresh, and tests. Max iterations: 30.
```

Quick fix without quality gates:
```
/ralph-prompt Fix typo in README.md line 42. Disable quality gates.
```

**Output**
The command will generate a complete Ralph mode prompt that you can:
1. Save to a file: `prompt.md`
2. Run with Ralph: `.opencode/scripts/ralph.ts --prompt prompt.md`
3. Or run inline: `.opencode/scripts/ralph.ts "$(cat prompt.md)"`
