---
name: propose-new
description: Create a new OpenSpec change proposal with research and spec deltas.
---
## What I do
- Research requirements and prior art before proposing.
- Scaffold OpenSpec change artifacts (proposal.md, tasks.md, design.md).
- Draft spec deltas with requirements and scenarios.
- Validate proposals before handoff.

## Usage Template
```
Change: <description of the change>
ID: <optional: verb-led change ID, will be deduced if not provided>
Constraints: <optional: limitations, requirements>
Acceptance: <optional: how to know it's done>
```

## Process

1. **Deduce Change ID** (if not provided)
   - Analyze the request
   - Generate verb-led ID (e.g., `add-dark-mode`, `fix-auth-flow`)

2. **Research**
   - Review `openspec/project.md` and existing specs
   - Run `openspec list` and `openspec list --specs`
   - Search codebase for related implementations
   - Note gaps requiring clarification

3. **Scaffold Artifacts**
   - Create `openspec/changes/<id>/proposal.md`
   - Create `openspec/changes/<id>/tasks.md`
   - Create `openspec/changes/<id>/design.md` (if needed)

4. **Draft Spec Deltas**
   - Create `changes/<id>/specs/<capability>/spec.md`
   - Use `## ADDED|MODIFIED|REMOVED Requirements`
   - Include `#### Scenario:` for each requirement

5. **Validate**
   - Run `openspec validate <id> --strict`
   - Resolve all issues before sharing

## Output
- Summary of proposal with clarified assumptions
- Open questions requiring user input
- Validation status

## Guidelines
1. Do not write code—only design documents.
2. Keep tasks actionable with validation steps.
3. Cite research sources in the proposal.
4. Ask clarifying questions for ambiguous requirements.
