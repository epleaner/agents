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

## Guardrails
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.
- Identify any vague or ambiguous details and ask the necessary follow-up questions before editing files.
- Do not write any code during the proposal stage. Only create design documents (proposal.md, tasks.md, design.md, and spec deltas). Implementation happens in the apply stage after approval.

## Process

1. **Deduce Change ID** (if not provided)
   - Analyze the request
   - Generate verb-led ID (e.g., `add-dark-mode`, `fix-auth-flow`, `refactor-api-client`)

2. **Clarify Assumptions**
   - Before drafting any design, identify ambiguous mechanisms or trade-offs
   - Ask 1-2 targeted questions when:
     - The implementation approach could go multiple ways (e.g., agent-driven vs programmatic)
     - The scope boundary is unclear (e.g., which components are affected)
     - Success criteria are vague
   - Wait for user response before proceeding to design
   - Document clarified assumptions in proposal.md

3. **Research**
   - Review `openspec/project.md` and existing specs
   - Run `openspec list` and `openspec list --specs`
   - Search existing requirements with `rg -n "Requirement:|Scenario:" openspec/specs` before writing new ones
   - Explore the codebase with `rg <keyword>`, `ls`, or direct file reads so proposals align with current implementation realities
   - Note gaps requiring clarification

4. **Map to Capabilities**
   - Map the change into concrete capabilities or requirements
   - Break multi-scope efforts into distinct spec deltas with clear relationships and sequencing

5. **Scaffold Artifacts**
   - Create `openspec/changes/<id>/proposal.md`
   - Create `openspec/changes/<id>/tasks.md`
   - Create `openspec/changes/<id>/design.md` (when the solution spans multiple systems, introduces new patterns, or demands trade-off discussion)

6. **Draft Spec Deltas**
   - Create `changes/<id>/specs/<capability>/spec.md` (one folder per capability)
   - Use `## ADDED|MODIFIED|REMOVED Requirements`
   - Include at least one `#### Scenario:` per requirement
   - Cross-reference related capabilities when relevant

7. **Draft Tasks**
   - Create `tasks.md` as an ordered list of small, verifiable work items
   - Each task should deliver user-visible progress
   - Include validation (tests, tooling) for each task
   - Highlight dependencies or parallelizable work
   - Use 1-5 point scale for effort estimates (NOT hours): 1=trivial, 2=small, 3=medium, 4=large, 5=very large

8. **Review Tasks**
   - Run `.opencode/skill/review-plan/scripts/review-plan openspec/changes/<id>/tasks.md`
   - Address all critical issues and low-scoring dimensions
   - Iterate until score ≥ 30/40 (75%)
   - Focus on: task decomposition, specificity, validation, dependencies

9. **Validate**
   - Run `openspec validate <id> --strict`
   - Resolve every issue before sharing the proposal

## Reference Commands
- `openspec show <id> --json --deltas-only` - Inspect details when validation fails
- `openspec show <spec> --type spec` - View a specific spec
- `rg -n "Requirement:|Scenario:" openspec/specs` - Search existing requirements

## Output
- Summary of proposal with clarified assumptions
- Open questions requiring user input
- Validation status

## Guidelines
1. Do not write code—only design documents.
2. Keep tasks actionable with validation steps.
3. Cite research sources in the proposal.
4. Ask clarifying questions for ambiguous requirements.
