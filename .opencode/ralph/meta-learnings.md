# Ralph Mode Meta-Learnings

**Shared learnings across all Ralph sessions** - This file is committed to git and shared with the team.

Last updated: 2026-01-08

---

## Patterns That Work

### Task Decomposition
- Break large tasks into numbered subtasks in the prompt
- Include explicit success criteria for each subtask
- Use markdown checkboxes for trackable progress

### Prompt Structure
- Start with clear objective statement
- Include relevant context files via `--file` flag
- Specify completion marker format explicitly

### Safety
- Set conservative iteration limits for exploratory tasks
- Use HITL milestones for long-running sessions
- Review checkpoints periodically

---

## Patterns That Don't Work

### Vague Prompts
- "Make it better" leads to infinite loops
- Missing success criteria causes timeout completions
- Ambiguous scope results in scope creep

### Resource Issues
- Very long prompts can hit token limits
- Too many file attachments slow down iterations
- Insufficient timeout for complex tasks

---

## Project-Specific Context

### Codebase Conventions
- [Add project-specific patterns here]

### Tool Preferences
- [Add preferred tools and approaches here]

---

## Common Pitfalls

1. **Forgetting completion markers**: Agent doesn't know when to stop
2. **Too aggressive iteration limits**: Task times out before completion
3. **Missing context**: Agent lacks information to complete task
4. **Scope creep**: Task expands beyond original intent

---

## Contribution Guidelines

When updating this file:
1. Add learnings from successful sessions
2. Document failures and their root causes
3. Keep entries concise and actionable
4. Include specific examples where helpful
