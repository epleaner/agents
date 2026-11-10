## 1. Implementation
- [x] 1.1 Add the Meta-Agent persona to the agent registry (model, temperature, permissions, and skills) alongside orchestrator/builder definitions.
- [x] 1.2 Update Orchestrator + Planner workflows so recurring friction, repeated escalations, or missing tooling automatically trigger a Meta-Agent review with transcripts, beads links, and outstanding todos.
- [x] 1.3 Extend `/workflow feature-development` (and similar chains) with a post-release Meta-Agent checkpoint that blocks completion until improvement todos are filed or resolved.
- [x] 1.4 Expand the skill catalog to map `openspec`, `bd`, and `slack-notify` access for the Meta-Agent, including logging requirements for every improvement action.
- [x] 1.5 Validate by running a dry-run session that exercises the Meta-Agent path, confirming new todos, spec updates, and notifications are captured in beads/OpenSpec before sign-off.
