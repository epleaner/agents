## ADDED Requirements

### Requirement: Adversarial Worker/Evaluator Loop
The Codex multi-agent suite SHALL provide an adversarial 2-agent loop that alternates a worker agent (that may modify the repository) with an evaluator agent (that must not modify the repository) until an evaluation score meets a configured threshold (default: 95) or a maximum iteration limit is reached.

#### Scenario: Accept on score threshold
- **WHEN** the evaluator returns a numeric score greater than or equal to the configured threshold
- **THEN** the loop terminates successfully
- **AND** it reports the final score, iteration count, and evidence mode used.

#### Scenario: Accept before any worker run
- **WHEN** the initial evaluation of the current evidence bundle meets the configured threshold
- **THEN** the loop exits successfully without running the worker.

#### Scenario: Iterate on revision guidance
- **WHEN** the evaluator score is below threshold
- **THEN** the loop provides the evaluator output back to the worker as the only revision guidance
- **AND** it runs another iteration until acceptance or max iterations.

#### Scenario: Evidence bundle bounded evaluation
- **WHEN** the loop runs an evaluation step
- **THEN** it constructs an explicit evidence bundle according to configuration (e.g., git diff vs file snapshots)
- **AND** the evaluator is instructed to use only that evidence bundle as evidence for scoring.

#### Scenario: Strict role isolation
- **WHEN** the loop executes
- **THEN** the worker prompt excludes the evaluator rubric and evidence bundle
- **AND** the evaluator prompt excludes any tool or instruction that would cause repository modification.

### Requirement: Evaluator Output Contract
The evaluator SHALL emit a machine-parseable evaluation result including a numeric score (0-100) and revision guidance. The loop SHALL parse this output and use it to control iteration.

#### Scenario: Evaluator output is parseable
- **WHEN** the evaluator completes an evaluation step
- **THEN** the evaluator output includes exactly the following tagged sections in this order:
  - `<EVALUATION>...</EVALUATION>`
  - `<CHANGES>...</CHANGES>` (one or more bullet lines starting with `-`)
  - `<SCORE>NN</SCORE>` (NN is an integer 0-100, and this tag appears on the final line)
- **AND** each section is separated by a single blank line
- **AND** there is no additional text outside these tags
- **AND** the loop can parse it deterministically to compute pass/fail.

#### Scenario: Pass condition
- **WHEN** the parsed evaluator score is greater than or equal to the configured threshold
- **THEN** the loop terminates successfully.

#### Scenario: Iteration uses evaluator output only
- **WHEN** the parsed evaluator score is below threshold
- **THEN** the loop feeds the full evaluator output back to the worker as the only iteration context
- **AND** it does not provide the worker with evaluator-only artifacts (e.g., evaluator rubric or evidence bundle).

#### Scenario: Malformed output handling
- **WHEN** the evaluator output is malformed or cannot be parsed
- **THEN** the controller retries the evaluator exactly once
- **AND** if the second evaluator output is still malformed, the loop fails.
