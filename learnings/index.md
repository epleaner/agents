# Meta-Learnings Index

Use this index to orient agents to the available ledgers and track which entries need promotion into AGENTS, specs, or configuration. Each ledger entry must be summarized here with its ID, title, category, owner, status, and any follow-up links.

## Ledger Overview
| Ledger | Purpose | Entry ID Prefix | Template Category |
| --- | --- | --- | --- |
| [`meta-learnings.md`](./meta-learnings.md) | Session-level insights about workflows/instructions | `ML-` | `meta-learning` |
| [`recurring-tasks.md`](./recurring-tasks.md) | Repetitive manual tasks that may become commands/skills | `RT-` | `recurring-task` |
| [`failures-and-resolutions.md`](./failures-and-resolutions.md) | Significant breakages plus mitigations | `FR-` | `failure-resolution` |
| [`candidate-automations.md`](./candidate-automations.md) | Potential automations or skills | `CA-` | `candidate-automation` |

## Entry Status Reference
Statuses must be one of:
- `new` – recently recorded; not yet reviewed.
- `needs-agents-update` – requires changes to AGENTS/config documentation.
- `needs-spec-change` – needs an OpenSpec proposal/delta.
- `in-progress` – promotion work underway.
- `promoted` – AGENTS/spec/config updated and linked here.
- `closed` – no action required (informational or superseded).

## Promotion Workflow
1. Append entries to the appropriate ledger during or immediately after sessions.
2. Run `./bin/review-learnings` before closing each session. The command lists entries in `new`, `needs-agents-update`, or `needs-spec-change` states and provides prompts for follow-up.
3. Decide whether to update AGENTS, file a beads issue, or draft an OpenSpec change. Reference the ledger entry ID in every follow-up artifact.
4. Update both the ledger entry and this index with the new status, owner, and links (`Follow-up Links` column).
5. When promotion is complete, mark the status `promoted` and keep the row for historical context.

## Entries
| ID | Title | Ledger | Owner | Status | Follow-up Links |
| --- | --- | --- | --- | --- | --- |
| FR-20260105-001 | Beads daemon 5+ second startup causing workflow slowdowns | failures-and-resolutions.md | Meta-Agent | promoted | AGENTS.md beads troubleshooting section |
| ML-20260107-001 | Orchestrator should delegate meeting queries to fathom subagent | meta-learnings.md | orchestrator | promoted | .opencode/agent/orchestrator.md |
| ML-20260107-002 | Agent responses need direct communication style | meta-learnings.md | all agents | promoted | AGENTS.md, .opencode/agent/orchestrator.md |
