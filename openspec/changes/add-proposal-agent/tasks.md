## 1. Define Proposal agent scope
- [ ] 1.1 Document when the Orchestrator summons the Proposal agent and what information must be supplied (beads ID, user intent, constraints).
- [ ] 1.2 Enumerate the Proposal agents allowed tools (exa-search, context7-docs) and write permissions (openspec/ only).

## 2. Update specs and guidance
- [ ] 2.1 Modify `codex-multi-agent-suite` to include the Proposal agent in the primary lineup and describe its behaviors, questions workflow, and hand-offs.
- [ ] 2.2 Add a new requirement that captures Proposal agent responsibilities (clarifying questions, research citations, scaffolding standards).
- [ ] 2.3 Update AGENTS/command docs as needed so other agents know how to engage Proposal agent.

## 3. Validation & rollout
- [ ] 3.1 Run `openspec validate add-proposal-agent --strict` and attach results to beads agents-7ok.
- [ ] 3.2 Review cross-agent workflows (Planner, Builder, Meta-Agent) to confirm there are no permission regressions before requesting approval.
