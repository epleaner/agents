---
## 1. Research & Design
**Purpose**: Validate SOTA patterns and design reflection architecture
**Dependencies**: None (can start immediately)
**Estimated effort**: 3 points (medium)

- [x] 1.1 Document Reflexion pattern in design.md
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Content: Algorithm (Generate → Critique → Revise), acceptance criteria, iteration limits
      Validation: `grep -A 15 "Reflexion Pattern" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Section exists with algorithm, acceptance criteria, and iteration control

- [x] 1.2 Document BRP architecture in design.md
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Content: Monitor agent architecture, feedback loops, asynchronous oversight
      Validation: `grep -A 10 "BRP Architecture" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Section exists with monitor agent design and feedback protocol

- [x] 1.3 Define OrchestratorState schema
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Schema fields: currentPhase, tasks, completedTasks, errors, context, checkpoints
      Validation: `grep -A 20 "interface OrchestratorState" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Complete TypeScript interface documented with field descriptions

- [x] 1.4 Define quality gate metrics and thresholds
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Metrics: test pass rate, code coverage, linter errors, logical correctness
      Thresholds: tests 100% pass, coverage ≥ 80%, zero critical linter errors
      Validation: `grep -A 10 "Quality Gates" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: All metrics and thresholds documented with rationale

---

## 2. Reflexion Protocol Implementation
**Purpose**: Implement core reflexion loop for orchestrator
**Dependencies**: Section 1 complete
**Estimated effort**: 4 points (large)

- [x] 2.1 Document reflexion protocol in orchestrator.md
      File: `.opencode/agent/orchestrator.md` (update existing)
      Add section: "## Reflexion Protocol"
      Content: Algorithm, acceptance criteria, iteration limits, escalation rules
      Validation: `grep -A 30 "Reflexion Protocol" .opencode/agent/orchestrator.md`
      Success: Protocol documented with examples and edge cases

- [x] 2.2 Create critic agent definition
      File: `.opencode/agent/critic.md` (new file)
      Model: claude-sonnet-4-20250514 (temperature 0.2)
      Permissions: read-only (no write/edit/bash)
      Skills: None (pure critique, no external calls)
      Validation: `test -f .opencode/agent/critic.md && grep -q "temperature" .opencode/agent/critic.md`
      Success: Critic agent defined with role, model, permissions, and critique prompt template

- [x] 2.3 Define critic prompt template
      File: `.opencode/agent/critic.md` (section: "Critique Prompt Template")
      Template: Task description, acceptance criteria, worker output, quality gate results
      Output format: Decision (ACCEPT/REVISE), Rationale, Revision Guidance
      Validation: `grep -A 20 "Critique Prompt Template" .opencode/agent/critic.md`
      Success: Template includes all evaluation dimensions and structured output format

- [x] 2.4 Define escalation protocol for failed reflexion
      File: `.opencode/agent/orchestrator.md` (section: "Escalation Protocol")
      Triggers: max iterations reached, critic detects critical errors, worker unable to revise
      Actions: log to beads issue, notify via slack-notify skill, pause workflow for human review
      Validation: `grep -A 10 "Escalation Protocol" .opencode/agent/orchestrator.md`
      Success: Escalation triggers and actions documented

---

## 3. Quality Gates Implementation
**Purpose**: Add measurable quality checks for task outputs
**Dependencies**: Section 2 complete
**Estimated effort**: 3 points (medium)

- [x] 3.1 Define quality gate interface
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Interface: QualityGate { name, check, threshold, critical }
      Validation: `grep -A 15 "interface QualityGate" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Interfaces documented with field descriptions

- [x] 3.2 Document test pass rate gate
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Gate: TestPassRateGate - 100% pass rate, critical
      Validation: `grep -A 8 "TestPassRateGate" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Gate documented with check command, threshold, and criticality

- [x] 3.3 Document code coverage gate
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Gate: CodeCoverageGate - ≥ 80% coverage, non-critical (warning)
      Validation: `grep -A 8 "CodeCoverageGate" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Gate documented with check command, threshold, and criticality

- [x] 3.4 Document linter error gate
      File: `.opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Gate: LinterErrorGate - zero critical errors, critical
      Validation: `grep -A 8 "LinterErrorGate" .opencode/openspec/changes/enhance-orchestrator-reflection/design.md`
      Success: Gate documented with check command, threshold, and criticality

---

## 4. Structured State Management
**Purpose**: Implement explicit state schema for orchestrator
**Dependencies**: Section 1 complete
**Estimated effort**: 2 points (small)

- [x] 4.1 Document state schema in orchestrator.md
      File: `.opencode/agent/orchestrator.md` (new section: "State Management")
      Schema: OrchestratorState interface (from design.md)
      Validation: `grep -A 25 "State Management" .opencode/agent/orchestrator.md`
      Success: Schema documented with field descriptions and usage examples

- [x] 4.2 Define state transitions
      File: `.opencode/agent/orchestrator.md` (section: "Phase Transitions")
      Phases: plan → build → qa → release → reflect
      Validation: `grep -A 15 "Phase Transitions" .opencode/agent/orchestrator.md`
      Success: All phase transitions documented with validation rules

- [ ] 4.3 Define checkpoint mechanism (deferred to future phase)
      File: `.opencode/agent/orchestrator.md` (section: "State Checkpoints")
      Trigger: After each phase completion, before critical operations
      Note: Checkpoint/rollback mechanism deferred - core state management complete

---

## 5. Integration with Existing Workflows
**Purpose**: Update /dev command and orchestrator to use reflection
**Dependencies**: Sections 2-4 complete
**Estimated effort**: 3 points (medium)

- [x] 5.1 Update /dev command documentation
      File: `.opencode/command/dev.md` (update existing)
      Add: Reflexion step after each worker task completion
      Workflow: Plan → Build (with reflexion) → QA (with reflexion) → Release
      Validation: `grep -i "reflexion" .opencode/command/dev.md`
      Success: /dev workflow includes reflexion step with description

- [x] 5.2 Document orchestrator invocation pattern
      File: `.opencode/agent/orchestrator.md` (section: "Invoking the Critic")
      Pattern: After worker completes task, orchestrator invokes critic, processes feedback
      Validation: `grep -A 15 "Invoking the Critic" .opencode/agent/orchestrator.md`
      Success: Invocation pattern documented with step-by-step example

- [x] 5.3 Define metrics and logging
      File: `.opencode/agent/orchestrator.md` (section: "Reflection Metrics")
      Metrics: reflexion_iterations_per_task, acceptance_rate, escalation_rate
      Validation: `grep -A 10 "Reflection Metrics" .opencode/agent/orchestrator.md`
      Success: All metrics defined with collection and storage methods

---

## 6. Validation & Documentation
**Purpose**: Ensure proposal is complete and validated
**Dependencies**: Sections 1-5 complete
**Estimated effort**: 2 points (small)

- [ ] 6.1 Run OpenSpec validation (skipped - openspec CLI not installed)
      Command: `openspec validate enhance-orchestrator-reflection --strict`
      Note: Manual verification performed via grep checks

- [x] 6.2 Link to beads issue
      Update: Add reference in proposal.md to agents-77a
      Cross-reference: Note change ID in beads issue
      Validation: `grep -q "agents-77a" .opencode/openspec/changes/enhance-orchestrator-reflection/proposal.md`
      Success: Beads issue and proposal cross-referenced (already present)

---

## Summary
**Total tasks**: 18 tasks across 6 sections
**Completed**: 16/18 (checkpoint mechanism and openspec validation deferred)
**Estimated effort**: 17 points (~2 days)
**Dependencies**: Sequential sections (1 → 2 → 3 → 4 → 5 → 6)

## Implementation Summary (2026-01-11)

Files modified/created:
- `.opencode/agent/orchestrator.md`: Added Reflexion Protocol, State Management, Reflection Metrics (132 new lines, 240 total)
- `.opencode/agent/critic.md`: NEW - Critic agent definition (69 lines)
- `.opencode/command/dev.md`: Updated workflow with reflexion steps (42 lines total)
