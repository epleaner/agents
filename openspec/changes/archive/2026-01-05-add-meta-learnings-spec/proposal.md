# Change: Add Dedicated Meta-Learnings Specification

## Why
Meta-learnings workflows (ledger structure, review command, promotion rules) are currently embedded inside the `codex-multi-agent-suite` specification. As the ledger process grows, we need a focused capability spec so it can evolve independently of the agent roster. Splitting the requirement keeps `codex-multi-agent-suite` centered on agent definitions while giving the Meta-Agent and downstream tooling a dedicated home for ledger/index requirements.

## What Changes
- Introduce a new `meta-learnings` capability spec that captures the ledger directory, entry templates, index expectations, review workflow, and promotion lifecycle.
- Update `codex-multi-agent-suite` to reference the new spec (while still mentioning the Meta-Agent’s responsibility) and remove the inline requirement details.
- Ensure cross-links so both specs stay in sync: codex spec points to the dedicated capability, and the new spec references the Meta-Agent enforcement loop.

## Impact
- Affected specs: `codex-multi-agent-suite`, new `meta-learnings` capability
- Affected process/code: none immediately; documentation-only reorganization keeps behavior the same while clarifying ownership.
