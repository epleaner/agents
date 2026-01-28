# Change: Add adversarial worker/evaluator loop script

## Why
Multi-step changes often need iterative refinement based on concrete critique. Today, that loop is manual and inconsistent. A dedicated adversarial 2-agent loop (worker produces changes, evaluator scores and requests revisions) makes quality convergence repeatable and automatable.

## What Changes
- Add a new CLI script that runs a worker/evaluator loop with:
  - score threshold (default: 95)
  - max iterations
  - evaluator rubric prompt
  - evaluator input instruction prompt that defines the evidence bundle (e.g., git diff vs file snapshots)
  - strict role isolation between worker and evaluator
  - evaluate-first flow (score the current repo state before any worker run)
- Add OpenSpec requirements for this capability under `codex-multi-agent-suite`.

## Impact
- **Affected specs:** `codex-multi-agent-suite` gains Adversarial Worker/Evaluator Loop requirements
- **Affected code (planned):** implementation under `projects/duo/` (additive)
- **Related beads:** `agents-duo` (feature, priority 2)
- **Breaking changes:** None (opt-in tooling)
