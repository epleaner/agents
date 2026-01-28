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

## Guardrails
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `./openspec/AGENTS.md` (or `./.opencode/openspec/AGENTS.md` when scaffolded) if you need additional OpenSpec conventions or clarifications. If you don't see it, run `ls openspec` (or `ls .opencode/openspec` when scaffolded) or `openspec update`.

## Process

Track these steps as TODOs and complete them one by one.

1. **Identify Change**
   - If provided explicitly, use that ID
   - If referenced loosely (by title or summary), run `openspec list` to find matching IDs and confirm
   - If not provided, run `openspec list` to show available changes and ask which one to implement

2. **Review Proposal**
   - Read `changes/<id>/proposal.md` for scope and rationale
   - Read `changes/<id>/design.md` for architectural decisions (if present)
   - Read `changes/<id>/tasks.md` for implementation steps and acceptance criteria

3. **Implement**
   - Work through tasks sequentially
   - Keep edits minimal and focused on the requested change
   - Run tests after each significant change

4. **Confirm Completion**
   - Make sure every item in `tasks.md` is finished before updating statuses
   - Update the checklist so each task is marked `- [x]` and reflects reality

5. **Finalize**
   - Reference `openspec list` or `openspec show <item>` when additional context is required
   - If all tasks are complete, use `propose-close` skill to archive the change and apply spec updates

## Reference Commands
- `openspec list` - Show available changes
- `openspec show <id>` - View change details
- `openspec show <id> --json --deltas-only` - Get additional context from the proposal while implementing

## Output
- Progress updates as tasks complete
- Test results
- Final status and next steps

## Guidelines
1. Don't skip tasks or change order without reason.
2. Keep implementation aligned with design.md decisions.
3. Run tests frequently—don't batch all testing to the end.
4. Update tasks.md to reflect actual completion.
