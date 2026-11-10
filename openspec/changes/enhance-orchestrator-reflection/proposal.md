# Change: Add SOTA Reflection Capabilities to Orchestrator Agent

## Why
The orchestrator agent currently lacks critical state-of-the-art (SOTA) reflection capabilities that enable self-critique, iterative refinement, and structured state management. Research from AWS Strands Agents (Reflexion pattern), COCO Framework (Bidirectional Reflection Protocol), Agent-R (self-training), and LangGraph multi-agent patterns demonstrates that reflection loops significantly improve agent output quality and reduce errors. Without these capabilities, the orchestrator cannot:
- Detect and correct suboptimal worker outputs before accepting them
- Learn from mistakes within a session through structured feedback
- Maintain explicit state for complex multi-phase workflows
- Provide oversight of its own decision-making process

This change implements proven reflection patterns to elevate orchestrator capabilities to SOTA standards.

## What Changes
- **Reflexion Loop**: Implement Generate → Critique → Accept/Revise → Iterate cycle for worker task outputs
- **Quality Gates**: Add post-task quality checks with measurable acceptance criteria (tests pass, coverage ≥ 80%, zero critical linter errors)
- **Structured State Management**: Define explicit `OrchestratorState` schema for tracking phases, tasks, errors, and context
- **Critic Agent/Prompt**: Create self-critique capability that evaluates worker outputs against acceptance criteria
- **Iteration Control**: Max 3 reflexion iterations per task to prevent infinite loops
- **BRP Monitoring** (Optional/Future): Design bidirectional reflection protocol for asynchronous oversight (deferred to Phase 2)

## Impact
- **Affected specs:** `codex-multi-agent-suite` gains Orchestrator Reflection requirements
- **Affected code:**
  - `.opencode/agent/orchestrator.md` - Add reflection protocol documentation
  - `.opencode/agent/critic.md` (new) - Critic agent definition for self-critique
  - `.opencode/command/dev.md` - Update `/dev` command to include reflexion step
  - Future: `.opencode/skill/reflect/` - Reflection skill implementation
- **Related beads:** agents-77a (Add Reflexion loop to orchestrator agent)
- **Breaking changes:** None - this is purely additive functionality
- **Migration path:** Existing workflows unchanged; reflection is automatic for new orchestrator invocations

## Acceptance Criteria
- Orchestrator can invoke critic agent after worker task completion
- Reflexion loop triggers revision when quality gates fail
- Max 3 iterations respected, escalation occurs on failure
- Quality metrics (tests, coverage, linter) captured and logged
- State schema documented and used in orchestrator

## References
- AWS Strands Agents (Reflexion): https://aws.amazon.com/blogs/machine-learning/customize-agent-workflows-with-advanced-orchestration-techniques-using-strands-agents/
- COCO Framework (BRP): https://arxiv.org/html/2508.13815
- Agent-R (Self-Training): https://arxiv.org/html/2501.11425v3
- LangGraph Multi-Agent Patterns: https://blog.langchain.com/langgraph-multi-agent-workflows
- Debate-Reflection Cycles: https://www.emergentmind.com/topics/debate-reflection-cycles
