## Context
Repeated friction items, automation ideas, and failure patterns surface during Codex sessions but lack a durable, searchable home. The Meta-Agent currently audits transcripts and AGENTS guidance but has no canonical ledger distinct from the domain-only knowledge graph. Without a consistent ledger + index + review workflow, we miss chances to codify improvements in specs/AGENTS and lose provenance on why a change happened.

## Goals / Non-Goals
- **Goals:**
  - Provide a predictable `learnings/` directory with category-specific ledgers plus a shared `index.md` that orients agents to the latest entries.
  - Encode how the Meta-Agent and Orchestrator capture entries, review them with a custom command, and decide whether to promote them into AGENTS/specs.
  - Keep the knowledge graph dedicated to domain knowledge while ledgers/specs/AGENTS store operational/meta learnings.
  - Define clear triggers and statuses for when ledger items become AGENTS edits, OpenSpec proposals, or informational references.
- **Non-Goals:**
  - Building a fully automated ingestion into the knowledge graph (explicitly out of scope).
  - Replacing the knowledge graph or general AGENTS process documentation.
  - Expanding Meta-Agent responsibilities beyond recording, reviewing, and promoting meta learnings.

## Decisions
1. **Directory & Index Structure:** Use `learnings/` at the repository root with four markdown ledgers (`meta-learnings.md`, `recurring-tasks.md`, `failures-and-resolutions.md`, `candidate-automations.md`) plus `index.md`. The index summarizes each ledger, highlights the newest entries, and links to follow-up artifacts so agents can skim before digging into a specific file.
2. **Entry Template & Classification:** Each ledger starts with a template describing required fields: date/session, bead/change IDs, knowledge type (`meta`), subcategory (recurring task, failure, automation idea, etc.), owner, summary, recommended action, status (`new`, `needs-agents-update`, `needs-spec-change`, `in-progress`, `promoted`, `closed`), and links to supporting docs. Templates remind authors that domain facts belong in the knowledge graph, not here.
3. **Review Command Ritual:** Introduce a custom "review learnings" command (CLI or documented script) that the Meta-Agent runs at session wrap-up. It surfaces new/unreviewed entries, prompts for next actions, and helps update statuses plus the index. Output can be pasted into beads/AGENTS notes for transparency.
4. **Promotion Lifecycle:** When the review command flags an actionable entry, the Meta-Agent (or delegate) must either (a) update the relevant AGENTS section/config, (b) draft an OpenSpec change, or (c) file a beads issue. Each follow-up references the ledger entry ID, and the ledger/index record is updated to link back to the canonical change.
5. **Explicit Separation from Knowledge Graph:** Specs and AGENTS instructions reiterate that the knowledge graph remains domain-only context for agents. Meta learnings live in ledgers/index/AGENTS/specs, ensuring we do not overload the graph with operational data.

## Risks / Trade-offs
- **Risk:** Ledgers/index get stale if the review command is skipped. *Mitigation:* Add AGENTS checklist items requiring the Meta-Agent/Orchestrator to run the command before closing sessions.
- **Risk:** The custom command could add overhead. *Mitigation:* Keep input/output simple (read markdown, emit prompts) and allow manual fallback instructions.
- **Risk:** Promotion ownership unclear. *Mitigation:* Record an owner per entry and have Orchestrator track follow-ups through beads/OpenSpec tasks.

## Migration Plan
1. Create the `learnings/` directory with four ledgers, templates, and the shared `index.md` scaffold.
2. Draft the "review learnings" command/workflow documentation so Meta-Agent/Orchestrator can run it consistently.
3. Update AGENTS instructions to reference the ledger index, entry template, review ritual, and promotion requirements.
4. Extend the `codex-multi-agent-suite` spec with the new requirement and scenarios covering ledger maintenance, review workflow, and knowledge-graph separation.
5. Monitor usage and iterate on the command/index structure as real sessions generate entries.

## Open Questions
- Should the review command be a bash/python script committed to the repo, or documented as a manual checklist initially?
- Do we need CI or pre-commit checks that ensure `index.md` references the latest ledger entries/statuses?
- Should ledger entries receive unique IDs beyond timestamps to simplify referencing in beads/OpenSpec changes?
