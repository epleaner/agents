Beads: `agents-duo`

## 1. Plan
- [ ] 1.1 Lock the evaluator output contract (no JSON): evaluator stdout MUST contain exactly these sections and nothing else:
  - `<EVALUATION>...</EVALUATION>`
  - `<CHANGES>...</CHANGES>`
  - last line: `<SCORE>NN</SCORE>` (integer 0-100)
  Acceptance:
  - Parsing rules are written down (strict tag match, score final line, 0-100).
  - Failure behavior is defined: one retry on invalid output, then hard fail.
- [ ] 1.2 Lock evidence bundle contract + CLI surface (KISS):
  - default evidence: `git status --porcelain` + `git diff` (exact args documented in evaluator instructions)
  - optional modes: `paths` (paths only) and `files` (file snapshots)
  Acceptance:
  - Evidence bundle defaults and optional modes are written down.
  - `--evaluator-instructions <file>` is the single source of truth for how to interpret evidence.
  Validation:
  - `openspec validate add-adversarial-worker-evaluator-loop --strict`

## 2. Build
- [ ] 2.1 Implement duo CLI (minimal):
  - entrypoint: `projects/duo/duo.ts`
  - optional: `--submission <file>`
  - defaults: worker/evaluator agents, `--threshold 95`, `--max-iterations 10`, `--evidence diff`
  - evidence modes: `diff` (default), `paths`, `files` with explicit `--paths <csv>`
  Acceptance:
  - `--help` documents defaults, evidence modes, and exit codes.
- [ ] 2.2 Implement evidence bundle assembly:
  - `diff`: `git status --porcelain` + `git diff`
  - `paths`: restrict `git status --porcelain` and `git diff` to the provided paths
  - `files`: include full contents of the provided file paths
  Acceptance:
  - Evidence bundle is deterministic for a given repo state.
  - Default evidence is diff-based.
- [ ] 2.3 Implement evaluator prompt wiring:
  - attach `--rubric` and `--evaluator-instructions` contents verbatim
  - attach evidence bundle as a clearly delimited block
  - NEVER show rubric/evidence to the worker
  Acceptance:
  - Worker prompt contains only task + evaluator feedback (no rubric/evidence).
  - Evaluator prompt contains rubric + evaluator instructions + evidence bundle.
- [ ] 2.4 Implement tag-based evaluator output parsing + one-retry behavior:
  - parse `<EVALUATION>` and `<CHANGES>` bodies
  - parse score ONLY from the final line `<SCORE>NN</SCORE>`
  - if parse fails or score out of range: re-run evaluator once with a short correction instruction; if still invalid, exit non-zero
  Acceptance:
  - One retry max; second failure exits with a parse error.
- [ ] 2.5 Implement the loop controller:
  - first: run evaluator -> parse -> stop if score >= threshold
  - otherwise iterate: run worker -> collect evidence -> run evaluator -> parse -> stop when score >= threshold or max iterations reached
  - print a small, human-readable per-iteration summary (score + next action)
  Acceptance:
  - Exit codes are stable and documented:
    - `0`: accepted (score >= threshold)
    - `2`: max iterations reached without acceptance
    - `3`: evaluator output invalid after one retry
    - `4`: invocation failure
    - `5`: bad args
  Validation:
  - `npx tsx projects/duo/duo.ts --help`
  - `npx tsx projects/duo/duo.ts --smoke-parse`

## 3. QA
- [ ] 3.1 Add a small test/smoke harness for parsing + retry:
  - valid tagged output parses
  - invalid output triggers exactly one retry
  - still-invalid output returns the parse-error exit code
  Acceptance:
  - Tests cover tag parsing, score final-line rule, and one-retry limit.
- [ ] 3.2 Add a small test/smoke harness for evidence bundling:
  - `diff` includes `git status --porcelain` + diff text
  - `paths` is paths-only and deterministic
  - `files` is deterministic and respects include list
  Acceptance:
  - Evidence bundle content matches the selected mode.
  Validation:
  - `node --test .opencode/tests/duo*.test.js`
  - `openspec validate add-adversarial-worker-evaluator-loop --strict`

## 4. Release
- [ ] 4.1 Document usage + contract:
  - CLI example(s) in `.opencode/AGENTS.md`
  - mention beads `agents-duo`
  - document tag-based evaluator output + one-retry behavior + evidence defaults
  Acceptance:
  - Docs include the exact required tags and the score final-line rule.
  Validation:
  - `rg -n "duo.ts" .opencode/AGENTS.md`
  - `rg -n "<SCORE>" .opencode/AGENTS.md`
  - `openspec validate add-adversarial-worker-evaluator-loop --strict`
- [ ] 4.2 Add minimal prompts:
  - `projects/duo/prompts/rubric.md`
  - `projects/duo/prompts/evaluator-instructions.md` (explicitly defines evidence bundle semantics for diff/paths/files)
  Acceptance:
  - Prompts are sufficient to run the script end-to-end.
  Validation:
  - `ls projects/duo/prompts`
  - `rg -n "\\bdiff\\b" projects/duo/prompts/*`
  - `rg -n "\\bpaths\\b" projects/duo/prompts/*`
  - `rg -n "\\bfiles\\b" projects/duo/prompts/*`
  - `openspec validate add-adversarial-worker-evaluator-loop --strict`
