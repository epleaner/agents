---
description: Reflect on session friction, tooling gaps, and propose improvements.
agent: orchestrator
---

Reflect on the current session using the self-improve skill. Identify friction points, tooling gaps, and propose actionable improvements.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Context to Review**

1. Current session history and any blockers encountered.
2. Workarounds that were needed.
3. Missing information or tools.
4. Time sinks or repeated issues.

**Reflection Process**

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
   - Specific changes to AGENTS.md, skills, or workflows.
   - New skills or commands needed.
   - Documentation updates required.
   - Issues to file for larger fixes.

4. **Document & Track**
   - Log findings to `learnings/` ledgers if appropriate.
   - File beads issues for actionable improvements.
   - Update relevant docs inline when possible.

**Output Format**

```
## Session Reflection

### Friction Points
- <issue>: <impact> -> <proposed fix>

### Improvements Made
- <change>: <file/location>

### Issues Filed
- <issue ID>: <description>

### Follow-ups
- <action item for next session>
```

**Guidelines**

1. Be specific about friction—vague complaints don't lead to fixes.
2. Propose concrete, actionable improvements.
3. File issues for anything that can't be fixed immediately.
4. If friction repeats twice, require a beads issue.
5. If no specific friction is provided, review the full session for patterns.
