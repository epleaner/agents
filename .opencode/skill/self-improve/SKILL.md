---
name: self-improve
description: Reflect on session friction, tooling gaps, and process improvements.
---
## What I do
- Audit the current session for recurring friction or blockers.
- Identify tooling gaps or missing capabilities.
- Propose improvements to AGENTS guidance, skills, or workflows.
- **Write to learnings ledgers** to record insights for future sessions.
- **Make direct edits** to agents/skills/AGENTS.md to fix issues.
- File beads issues for larger systemic fixes.

## Usage Template
```
Trigger: <end-of-session | friction-encountered | explicit-request>
Context: <what happened, what went wrong>
Scope: <agents | skills | workflows | docs | all>
```

## Reflection Process

1. **Identify Friction**
   - What took longer than expected?
   - What required workarounds?
   - What information was missing?
   - What tools were lacking?

2. **Root Cause Analysis**
   - Is this a one-off or recurring issue?
   - Is it a tooling gap, documentation gap, or process gap?
   - Who/what is affected?

3. **Propose Improvements**
   - Specific changes to AGENTS.md, skills, or workflows
   - New skills or commands needed
   - Documentation updates required
   - Issues to file for larger fixes

4. **Document & Apply**
   - **Write to learnings**: Add entry to appropriate ledger in `.opencode/learnings/`
   - **Make direct edits**: Update agents/skills/AGENTS.md with the fix
   - **Update index**: Add entry to `.opencode/learnings/index.md`
   - File beads issues for anything that can't be fixed immediately

## Learnings Workflow

When you identify an improvement:

1. **Create ledger entry** in the appropriate file:
   - `.opencode/learnings/meta-learnings.md` - workflow/instruction insights
   - `.opencode/learnings/recurring-tasks.md` - repetitive tasks to automate
   - `.opencode/learnings/failures-and-resolutions.md` - breakages and fixes
   - `.opencode/learnings/candidate-automations.md` - automation ideas

2. **Make the direct edit** to fix the issue (agent config, skill, AGENTS.md, etc.)

3. **Update the index** at `.opencode/learnings/index.md`

4. **Mark as promoted** once the fix is applied

The ledger entry serves as a record of what was changed and why—critical for re-applying customizations when base config is updated.

## Output Format
```
## Session Reflection

### Friction Points
- <issue 1>: <impact> → <proposed fix>
- <issue 2>: <impact> → <proposed fix>

### Improvements Made
- <change 1>: <file/location>
- <change 2>: <file/location>

### Learnings Recorded
- <entry ID>: <ledger file> - <summary>

### Issues Filed
- <issue ID>: <description>
```

## Scripts

The `scripts/review-learnings` script helps review and update meta-learning ledgers:

```bash
# Interactive review of entries needing attention
scripts/review-learnings

# List all entries (read-only)
scripts/review-learnings --all
```

The script scans `.opencode/learnings/` for entries in `new`, `needs-agents-update`, or `needs-spec-change` states and prompts for status/owner/follow-up updates.

## Guidelines
1. Be specific about friction—vague complaints don't lead to fixes.
2. Propose concrete, actionable improvements.
3. **Always write to learnings** so the insight is preserved.
4. **Always make the direct edit** to fix the issue immediately.
5. File beads issues for anything that can't be fixed immediately.
6. If friction repeats twice, require a beads issue.
