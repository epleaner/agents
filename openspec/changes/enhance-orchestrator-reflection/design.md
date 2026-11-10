# Design: Orchestrator Reflection Capabilities

## Context
The orchestrator agent currently operates without structured self-reflection or quality validation mechanisms. State-of-the-art (SOTA) multi-agent systems employ reflection patterns to improve output quality, reduce errors, and enable learning within sessions.

## Goals / Non-Goals

### Goals
- Implement Reflexion pattern for iterative task refinement
- Add measurable quality gates (tests, coverage, linter, logical correctness)
- Define explicit state schema for orchestrator coordination
- Create critic agent for self-evaluation
- Provide escalation path for failed reflexion loops

### Non-Goals
- Implementing BRP monitor agent in this phase (design only)
- Modifying existing worker agents (builder, qa, etc.)
- Changing orchestrator's core delegation logic

## Decisions

### Decision 1: Reflexion Pattern Implementation

**Chosen**: Generate → Critique → Accept/Revise → Iterate (max 3 iterations)

**Algorithm**:
```typescript
async function reflexionLoop(task: Task, worker: Agent, critic: Agent): Promise<TaskOutput> {
  const MAX_ITERATIONS = 3
  let iteration = 0
  let output: TaskOutput
  
  while (iteration < MAX_ITERATIONS) {
    // Generate
    output = await worker.execute(task)
    
    // Run quality gates
    const gateResults = await runQualityGates(output)
    
    // Critique
    const critique = await critic.evaluate({
      task,
      output,
      gateResults,
      acceptanceCriteria: task.acceptanceCriteria
    })
    
    // Accept or Revise
    if (critique.decision === 'ACCEPT' && gateResults.allPassed) {
      return output
    }
    
    // Inject critique feedback into task context
    task.context.revisionGuidance.push({
      iteration,
      critique: critique.rationale,
      failedGates: gateResults.failed,
      recommendations: critique.revisionGuidance
    })
    
    iteration++
  }
  
  // Max iterations reached - escalate
  await escalate({ task, output, iterations: iteration })
  return output
}
```

**Rationale**: 3 iterations balances quality improvement with efficiency. Research shows diminishing returns after 2-3 refinement cycles.

### Decision 2: Quality Gates Definition

**Quality Gates**:

1. **TestPassRateGate** (Critical)
   - Check: `npm test` or equivalent
   - Threshold: 100% pass rate
   - Blocks acceptance: Yes

2. **LinterErrorGate** (Critical)
   - Check: `npm run lint`
   - Threshold: Zero critical errors
   - Blocks acceptance: Yes

3. **CodeCoverageGate** (Warning)
   - Check: `npm test -- --coverage`
   - Threshold: ≥ 80% line coverage
   - Blocks acceptance: No (warning only)

4. **LogicalCorrectnessGate** (Critical)
   - Check: Critic agent evaluation
   - Threshold: No logical errors detected
   - Blocks acceptance: Yes

**Execution Order**: Tests → Linter → Coverage → Logical Correctness
- Fast-fail on automated checks before expensive LLM critique

**Interface**:
```typescript
interface QualityGate {
  name: string
  check: (output: TaskOutput) => Promise<QualityResult>
  threshold: number | string
  critical: boolean
}

interface QualityResult {
  passed: boolean
  metric: number | string
  details: string
}
```

### Decision 3: Structured State Management

**State Schema**:
```typescript
interface OrchestratorState {
  sessionId: string
  currentPhase: 'plan' | 'build' | 'qa' | 'release' | 'reflect'
  tasks: Task[]
  completedTasks: CompletedTask[]
  errors: ErrorRecord[]
  context: SessionContext
  checkpoints: Checkpoint[]
  metrics: SessionMetrics
}

interface Task {
  id: string
  description: string
  assignedAgent: string
  acceptanceCriteria: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

interface SessionContext {
  requirements: string
  acceptanceCriteria: string[]
  constraints: string[]
  beadsIssue?: string
  changeId?: string
}

interface Checkpoint {
  phase: string
  timestamp: Date
  state: Partial<OrchestratorState>
}
```

**State Transitions**:
```
plan → build → qa → release → reflect
  ↑                              ↓
  └──────── (on error) ──────────┘
```

### Decision 4: Critic Agent Design

**Agent Definition**:
- **Name**: critic
- **Model**: claude-sonnet-4-20250514 (temperature 0.2)
- **Permissions**: Read-only (no write/edit/bash)
- **Skills**: None (pure critique)

**Critique Prompt Template**:
```markdown
You are a critic agent evaluating worker output against acceptance criteria.

**Task**: {{task.description}}
**Acceptance Criteria**: {{task.acceptanceCriteria}}
**Worker Output**: {{output.summary}}
**Quality Gate Results**: {{gateResults}}

Evaluate:
1. Does output meet all acceptance criteria?
2. Are there logical errors or edge cases missed?
3. Do quality metrics meet thresholds?

**Output Format**:
Decision: ACCEPT | REVISE
Rationale: <explanation>
Revision Guidance (if REVISE): <specific improvements>
```

### Decision 5: BRP Architecture (Future Phase)

**Components** (design only, implementation deferred):
1. **Monitor Agent**: Asynchronous observer of orchestrator decisions
2. **Feedback Channel**: Structured messages from monitor to orchestrator
3. **Adaptation Logic**: Orchestrator processes feedback and adjusts behavior

**Monitor Responsibilities**:
- Observe task scoping (too large/small?)
- Observe agent selection (correct agent?)
- Observe workflow sequencing (dependencies respected?)

**Feedback Types**:
- Suggestions (advisory)
- Warnings (potential issues)
- Errors (critical problems)

## Risks / Trade-offs

### Risk: Reflexion latency increases workflow duration
- **Mitigation**: Max 3 iterations, short-circuit on critical failures

### Risk: Critic agent produces false positives
- **Mitigation**: Tune critic prompt, use low temperature (0.2)

### Risk: Quality gates too strict
- **Mitigation**: Make coverage gate non-critical (warning only)

## Open Questions

1. Should coverage threshold be configurable per project?
2. When to implement BRP Phase 2?
