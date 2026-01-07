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

## Process

1. **Identify Change**
   - Use provided ID, or
   - Run `openspec list` to find matching changes
   - Confirm which change to archive

2. **Verify Completion**
   - Check all tasks in tasks.md are marked complete
   - Ensure implementation matches proposal scope
   - Confirm tests are passing

3. **Archive**
   - Run `openspec archive <id> --yes`
   - Use `--skip-specs` only for tooling-only changes

4. **Validate**
   - Run `openspec validate --strict`
   - Check specs were updated correctly
   - Verify change is in `changes/archive/`

## Output
- Archive confirmation
- Spec update summary
- Validation status

## Guidelines
1. Don't archive incomplete changes.
2. Review spec updates before confirming.
3. Address any validation issues before finishing.
