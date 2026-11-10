# Change: Add Proposal Agent to the Codex suite

## Why
Right now the Orchestrator and Planner split ownership of OpenSpec changes, but neither agent is dedicated to interrogating vague ideas, researching best practices, and producing high-quality change proposals. As a result, proposal quality varies and implementation often begins before specs are truly crisp. Introducing a Proposal agent centralizes this workflow so every change request receives consistent research, questioning, and OpenSpec scaffolding before Builders engage.

## What Changes
- Add a Proposal agent definition to the Codex multi-agent suite with precise tool/skill permissions (exa web search, read/write limited to `openspec/`).
- Define when the Orchestrator routes work to the Proposal agent (any new change/proposal request, ambiguous scope, or improvements that require OpenSpec deltas).
- Require the Proposal agent to own change scaffolding (proposal/tasks/design/spec) and to log clarifying questions plus research notes before Builder/Planner proceed.
- Update AGENTS/OpenSpec guidance so other roles know how to engage the Proposal agent and how it hands work off downstream.

## Impact
- **Affected specs:** `codex-multi-agent-suite` gains a modified multi-agent requirement and a new dedicated requirement for Proposal agent duties.
- **Related beads:** agents-7ok (this change) and agents-pzm (blueprint command) should reference each other so the Proposal agent can leverage the new scaffolding command outputs.
- **Workflow:** Planner still validates scope, but Proposal agent becomes the default author for OpenSpec artifacts, reducing rework for Builder/QA.
