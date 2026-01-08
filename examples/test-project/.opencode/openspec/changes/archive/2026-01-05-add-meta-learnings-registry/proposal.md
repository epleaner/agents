# Change: Add Meta-Learnings Registry Workflow

## Why
Ongoing sessions surface recurring process issues, automation ideas, and failure patterns, yet there is no durable place to capture them or promote actionable items into AGENTS/spec guidance. Without a structured registry and review ritual, the same improvements are rediscovered repeatedly and we risk updating specs ad hoc without provenance. We need a lightweight but auditable ledger-plus-index so the Meta-Agent can curate insights and deliberately feed them into OpenSpec/AGENTS changes.

## What Changes
- Create a `learnings/` directory containing category-specific ledgers plus a centralized `index.md` that summarizes recent entries, status, and promotion targets so agents can quickly locate relevant meta knowledge.
- Define a custom "review learnings" command/workflow the Meta-Agent runs at session close to list new ledger entries, prompt owners for promotion decisions, and mark outcomes (e.g., promote to AGENTS, propose new spec delta, or close as informational).
- Document the lifecycle for promoting ledger entries into canonical references: when an entry becomes actionable, the Meta-Agent (or delegate) must update the appropriate AGENTS section or draft an OpenSpec change, linking back to the ledger entry ID for traceability.
- Extend the `codex-multi-agent-suite` spec to codify the ledger structure, index expectations, review command, and explicitly state that the knowledge graph remains domain-only while meta learnings stay in ledgers/specs/AGENTS.

## Impact
- Affected specs: `codex-multi-agent-suite`
- Affected process/code: agent runbooks (Meta-Agent + Orchestrator), AGENTS instructions referencing `learnings/`, the new review command/script, and automation or CI checks ensuring ledgers and index stay in sync.
