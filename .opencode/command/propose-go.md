---
description: Implement an approved OpenSpec change proposal.
---
Implement the specified OpenSpec change proposal. If no change ID is provided, deduce it from context or list available changes.

<UserRequest>
  $ARGUMENTS
</UserRequest>

<!-- OPENSPEC:START -->
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.

**Steps**
Track these steps as TODOs and complete them one by one.
1. Determine the change ID:
   - If provided explicitly, use that ID.
   - If referenced loosely (by title or summary), run `openspec list` to find matching IDs and confirm.
   - If not provided, run `openspec list` to show available changes and ask which one to implement.
2. Read `changes/<id>/proposal.md`, `design.md` (if present), and `tasks.md` to confirm scope and acceptance criteria.
3. Work through tasks sequentially, keeping edits minimal and focused on the requested change.
4. Confirm completion before updating statuses—make sure every item in `tasks.md` is finished.
5. Update the checklist after all work is done so each task is marked `- [x]` and reflects reality.
6. Reference `openspec list` or `openspec show <item>` when additional context is required.
7. If all tasks are complete, run `/propose-close` on this change ID to archive it and apply spec updates.

**Reference**
- Use `openspec show <id> --json --deltas-only` if you need additional context from the proposal while implementing.
<!-- OPENSPEC:END -->
