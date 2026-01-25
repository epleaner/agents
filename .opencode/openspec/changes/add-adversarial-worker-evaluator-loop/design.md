## Context
We want a deterministic, repeatable 2-agent loop that converges toward high-quality changes by alternating:
1) a worker that edits the repo toward the goal, and
2) an evaluator that grades the current state against a rubric using a bounded evidence bundle.

This is intentionally additive and local-first (a script in `.opencode/scripts/`). It does not replace existing flows.

## Goals / Non-Goals
- Goals:
  - Provide a worker/evaluator loop with a numeric score and threshold gating (default threshold: 95)
  - Make evaluator evidence explicit via an "evidence bundle" contract (diff vs files)
  - Enforce strict role isolation via agent selection and prompt boundaries
  - Produce machine-parseable evaluator output so the loop can be automated
- Non-Goals:
  - A general multi-agent planner/orchestrator framework
  - Distributed execution, parallel workers, or persistent remote services
  - Replacing Ralph mode

## CLI Interface
Script name:
- canonical entrypoint: `projects/duo/duo.ts`

Invocation:
```bash
npx tsx projects/duo/duo.ts
```

Flags:
- `--submission <file>`: optional extra submission text for evaluator input (default: empty)
- `--threshold <0-100>`: minimum score to accept (default: 95)
- `--max-iterations <N>`: maximum loop iterations (default: 10)
- `--rubric <file>`: evaluator rubric file (default: `projects/duo/prompts/rubric.md`)
- `--evaluator-instructions <file>`: evaluator instructions file (default: `projects/duo/prompts/evaluator-instructions.md`)
- `--evidence <mode>`: `diff` | `paths` | `files` (default: `diff`)
- `--paths <csv>`: comma-separated paths (required for `paths` and `files`)
- `--worker-agent <name>`: worker agent name (default: `builder`)
- `--evaluator-agent <name>`: evaluator agent name (default: `evaluator`)
- `--output-dir <dir>`: write per-iteration artifacts here

Notes:
- Defaults choose least-risk behavior: evaluator uses a read-only agent, evidence defaults to `git diff`.

## Capture Modes (Evidence Bundle)

### Mode: diff
Evidence bundle includes:
- `git status --porcelain` (to show changed paths)
- `git diff`

### Mode: paths
Evidence bundle includes:
- `git status --porcelain -- <paths...>`
- `git diff -- <paths...>`

### Mode: files
Evidence bundle includes:
- For each provided file path: path + full content

The evaluator prompt MUST state that only this evidence bundle should be used as evidence (even if the evaluator agent technically can read the repo).

## Data Contracts

### Worker input
Iteration 1..N: worker receives:
- a minimal built-in instruction to apply <CHANGES>
- the previous evaluator output only

The worker MUST NOT receive the evaluator rubric.

### Evaluator input
The evaluator receives:
- the rubric prompt (`--rubric`)
- the evaluator instruction prompt (`--evaluator-instructions`)
- the evidence bundle (diff/paths/files)
- the submission text (optional), plus worker stdout after worker runs

The loop begins with an evaluator run against the current evidence bundle (before any worker iteration).

### Evaluator output
The evaluator MUST output exactly 3 tagged sections in this order, and nothing else:

<EVALUATION> ... </EVALUATION>

<CHANGES>
- bullets
</CHANGES>

<SCORE>0-100</SCORE>

The final output line MUST be the <SCORE> tag.

## Role Isolation
- Worker uses a write-capable agent (default `builder`).
- Evaluator uses a read-only agent (default `evaluator`).
- The script maintains strict prompt boundaries:
  - rubric is evaluator-only
  - evidence bundle is evaluator-only
  - evaluator feedback is worker-only
- The evaluator instructions MUST reinforce that the evaluator uses only the evidence bundle and must emit the tagged output contract.

## Exit Codes
- `0`: accepted (score >= threshold)
- `2`: max iterations reached without acceptance
- `3`: evaluator output malformed after one retry
- `4`: invocation failure
- `5`: bad args
