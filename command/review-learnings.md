---
description: Run the ledger review workflow and promote actionable meta learnings.
agent: orchestrator
---
Use this command whenever a session produces new entries under `learnings/` or before wrapping up a worklog. It keeps the ledgers, `learnings/index.md`, and downstream AGENTS/spec updates in sync so meta knowledge never gets lost.

1. Ensure the `learnings/` directory exists with the four mandated ledgers plus `index.md`. If it does not, follow the instructions in `openspec/changes/add-meta-learnings-registry/` before proceeding.
2. Run `.opencode/skill/self-improve/scripts/review-learnings` (interactive) or `.opencode/skill/self-improve/scripts/review-learnings --all` (read-only list). The tool scans every ledger entry and highlights those in `new`, `needs-agents-update`, or `needs-spec-change` states.
3. For each surfaced entry, decide the next step:
   - Update the status/owner/follow-up links directly in the prompt (the script writes changes back to the ledger and updates `index.md`).
   - If the entry requires an AGENTS edit, configuration tweak, beads issue, or new OpenSpec change, create the follow-up immediately and record its link in the `Follow-up Links` field.
4. Continue until the script reports "All entries are outside the attention set". If entries remain, rerun the command after addressing the outstanding work.
5. After promotion, double-check that `learnings/index.md` reflects the final status and that every follow-up artifact references the originating ledger ID.
