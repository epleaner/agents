---
name: propose-close
description: Archive a completed OpenSpec change and apply spec updates.
---
## What I do
- Verify all tasks are complete.
- Archive the change to `changes/archive/`.
- Apply spec deltas to main specs.
- Validate the final state.

## Usage Template
```
ID: <change ID to archive, will be deduced if not provided>
Skip-specs: <optional: true if no spec updates needed>
```

## Guardrails
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.

## Process

1. **Identify Change**
   - If provided explicitly, use that ID after trimming whitespace
   - If referenced loosely (by title or summary), run `openspec list` to find matching IDs and confirm
   - If not provided, review the conversation, run `openspec list`, and ask which change to archive
   - If you still cannot identify a single change ID, stop and tell the user you cannot archive anything yet

2. **Validate Change Exists**
   - Run `openspec list` (or `openspec show <id>`)
   - Stop if the change is missing, already archived, or otherwise not ready to archive

3. **Verify Completion**
   - Check all tasks in tasks.md are marked complete
   - Ensure implementation matches proposal scope
   - Confirm tests are passing

4. **Archive**
   - Run `openspec archive <id> --yes` so the CLI moves the change and applies spec updates without prompts
   - Use `--skip-specs` only for tooling-only changes that don't affect specs

5. **Review Output**
   - Confirm the target specs were updated
   - Verify the change landed in `changes/archive/`

6. **Validate**
   - Run `openspec validate --strict`
   - Inspect with `openspec show <id>` if anything looks off

## Reference Commands
- `openspec list` - Confirm change IDs before archiving
- `openspec list --specs` - Inspect refreshed specs
- `openspec show <id>` - View change details
- `openspec archive <id> --yes` - Archive without prompts
- `openspec archive <id> --yes --skip-specs` - Archive without applying spec updates

## Output
- Archive confirmation
- Spec update summary
- Validation status

## Guidelines
1. Don't archive incomplete changes.
2. Review spec updates before confirming.
3. Address any validation issues before finishing.
