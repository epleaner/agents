---
name: propose-go
description: Implement an approved OpenSpec change proposal.
---
## What I do
- Read and understand the approved proposal.
- Execute tasks from tasks.md sequentially.
- Keep implementation focused and minimal.
- Update task status as work completes.
- Trigger archival when all tasks are done.

## Usage Template
```
ID: <change ID to implement, will be deduced if not provided>
```

## Process

1. **Identify Change**
   - Use provided ID, or
   - Run `openspec list` to find matching changes
   - Confirm which change to implement

2. **Review Proposal**
   - Read `proposal.md` for scope and rationale
   - Read `design.md` for architectural decisions
   - Read `tasks.md` for implementation steps

3. **Implement**
   - Work through tasks sequentially
   - Keep edits minimal and focused
   - Run tests after each significant change
   - Update task checkboxes as completed

4. **Finalize**
   - Confirm all tasks are `- [x]` marked
   - Run final validation
   - Trigger `/propose-close` or `propose-close` skill

## Output
- Progress updates as tasks complete
- Test results
- Final status and next steps

## Guidelines
1. Don't skip tasks or change order without reason.
2. Keep implementation aligned with design.md decisions.
3. Run tests frequently—don't batch all testing to the end.
4. Update tasks.md to reflect actual completion.
