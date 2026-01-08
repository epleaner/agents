---
name: self-improve
description: Reflect on session friction, tooling gaps, and process improvements.
---
## What I do
- Audit the current session for recurring friction or blockers.
- Identify tooling gaps or missing capabilities.
- Propose improvements to AGENTS guidance, skills, or workflows.
- File issues or update docs for systemic fixes.
- Log improvements to knowledge graph for future sessions.

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

4. **Document & Track**
   - Log findings to knowledge graph
   - File beads issues for actionable improvements
   - Update relevant docs inline when possible

## Output Format
```
## Session Reflection

### Friction Points
- <issue 1>: <impact> → <proposed fix>
- <issue 2>: <impact> → <proposed fix>

### Improvements Made
- <change 1>: <file/location>
- <change 2>: <file/location>

### Issues Filed
- <issue ID>: <description>

### Knowledge Graph Entry
- Source: self-improve
- Session: <date/context>
- Findings: <summary>
- Actions: <what was done>
```

## Scripts

The `scripts/review-learnings` script helps review and update meta-learning ledgers:

```bash
# Interactive review of entries needing attention
scripts/review-learnings

# List all entries (read-only)
scripts/review-learnings --all
```

The script scans `learnings/` for entries in `new`, `needs-agents-update`, or `needs-spec-change` states and prompts for status/owner/follow-up updates.

## Guidelines
1. Be specific about friction—vague complaints don't lead to fixes.
2. Propose concrete, actionable improvements.
3. File issues for anything that can't be fixed immediately.
4. Always log to knowledge graph so future sessions benefit.
5. If friction repeats twice, require a beads issue.
