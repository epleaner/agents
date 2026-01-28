## ADDED Requirements

### Requirement: Orchestrator Reflexion Loop
The orchestrator agent SHALL implement a reflexion loop (Generate → Critique → Accept/Revise → Iterate) for all worker task outputs, enabling iterative refinement based on structured critique and quality gate validation.

#### Scenario: Worker output meets acceptance criteria on first attempt
- **WHEN** orchestrator delegates task to worker and worker completes task
- **THEN** orchestrator invokes critic agent with output and acceptance criteria
- **AND** all quality gates pass and critic decision is ACCEPT
- **THEN** orchestrator accepts output and proceeds to next task

#### Scenario: Worker output requires revision
- **WHEN** orchestrator delegates task to worker and worker completes task
- **AND** one or more quality gates fail OR critic detects logical errors
- **THEN** orchestrator re-delegates task to worker with critique feedback
- **AND** reflexion loop repeats (max 3 iterations)

#### Scenario: Max reflexion iterations reached without acceptance
- **WHEN** orchestrator completes 3 reflexion iterations for a task
- **AND** critic still decides REVISE
- **THEN** orchestrator escalates to human review
- **AND** logs escalation to beads issue
- **AND** notifies team via slack-notify skill

### Requirement: Quality Gates for Task Outputs
The orchestrator SHALL run measurable quality gates on all worker task outputs before acceptance.

#### Scenario: All quality gates pass
- **WHEN** orchestrator runs quality gates on worker output
- **AND** tests pass at 100% rate
- **AND** linter reports zero critical errors
- **AND** code coverage ≥ 80%
- **THEN** output is eligible for acceptance

#### Scenario: Critical quality gate fails
- **WHEN** tests fail OR linter reports critical errors
- **THEN** critic decision is REVISE
- **AND** orchestrator triggers reflexion loop

### Requirement: Structured Orchestrator State Management
The orchestrator SHALL maintain explicit state schema tracking current phase, tasks, errors, and checkpoints.

#### Scenario: State transitions between phases
- **WHEN** orchestrator completes all tasks in current phase
- **THEN** orchestrator transitions to next phase
- **AND** creates checkpoint with current state

#### Scenario: State rollback on error
- **WHEN** orchestrator encounters critical error
- **AND** checkpoint exists from previous phase
- **THEN** orchestrator restores state from checkpoint

### Requirement: Critic Agent for Self-Evaluation
The orchestrator SHALL delegate output evaluation to a dedicated critic agent with read-only permissions.

#### Scenario: Critic evaluates and accepts
- **WHEN** all acceptance criteria met and quality gates passed
- **THEN** critic returns decision ACCEPT

#### Scenario: Critic evaluates and requests revision
- **WHEN** acceptance criteria not met OR quality gate failed
- **THEN** critic returns decision REVISE with guidance
