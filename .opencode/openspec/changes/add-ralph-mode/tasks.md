## 1. Research & design
- [ ] 1.1 Analyze ralph-orchestrator reference implementation (mikeyobrien/ralph-orchestrator)
- [ ] 1.2 Document core loop algorithm and safety mechanisms
- [ ] 1.3 Define configuration schema (ralph.yml + CLI args)
- [ ] 1.4 Design prompt enhancement strategy for orchestration context injection

## 2. Core orchestration loop (bash script)
- [ ] 2.1 Create `.opencode/scripts/ralph-orchestrator.sh` with main loop structure
- [ ] 2.2 Implement iteration counter and max iteration guard (default: 50)
- [ ] 2.3 Add runtime limit enforcement (default: 2 hours)
- [ ] 2.4 Implement resource quota tracking (token usage, API calls)
- [ ] 2.5 Add graceful shutdown handler (SIGINT, SIGTERM)

## 3. Prompt enhancement
- [ ] 3.1 Implement prompt file loader and validator
- [ ] 3.2 Add orchestration context injection (iteration count, previous outputs)
- [ ] 3.3 Create prompt template system for continuation messages
- [ ] 3.4 Add metadata tracking (iteration history, decision points)

## 4. Completion detection
- [ ] 4.1 Implement marker detection (`- [x] TASK_COMPLETE`, `RALPH_COMPLETE`)
- [ ] 4.2 Add todo integration (check bd todos for completion status)
- [ ] 4.3 Create timeout-based completion heuristics
- [ ] 4.4 Add manual completion override mechanism

## 5. Git checkpointing
- [ ] 5.1 Implement periodic git commit logic (every N iterations)
- [ ] 5.2 Add checkpoint metadata (iteration, timestamp, agent output summary)
- [ ] 5.3 Create checkpoint branch management
- [ ] 5.4 Add rollback capability for failed iterations

## 6. Metrics & telemetry
- [ ] 6.1 Create metrics collection framework
- [ ] 6.2 Track iteration count, duration, success rate
- [ ] 6.3 Track token usage and API call counts (if accessible)
- [ ] 6.4 Generate execution summary report
- [ ] 6.5 Add JSON metrics output for downstream analysis

## 7. Configuration system
- [ ] 7.1 Define ralph.yml schema (max iterations, timeout, checkpoint interval)
- [ ] 7.2 Create default config template in `.opencode/templates/ralph.yml`
- [ ] 7.3 Implement CLI argument parsing with config override
- [ ] 7.4 Add validation for config values
- [ ] 7.5 Document configuration options

## 8. Safety guards & error handling
- [ ] 8.1 Add infinite loop detection (repeated identical outputs)
- [ ] 8.2 Implement API rate limit handling
- [ ] 8.3 Add error recovery strategies (retry, skip, abort)
- [ ] 8.4 Create safety override flags for testing

## 9. Integration & documentation
- [ ] 9.1 Add ralph-orchestrator.sh to AGENTS.md quick reference
- [ ] 9.2 Create usage examples for common scenarios
- [ ] 9.3 Document troubleshooting guide
- [ ] 9.4 Add ralph mode to /dev command integration

## 10. Testing & validation
- [ ] 10.1 Create smoke tests for basic loop execution
- [ ] 10.2 Test completion detection scenarios
- [ ] 10.3 Test safety guards (max iterations, timeout)
- [ ] 10.4 Test git checkpointing and rollback
- [ ] 10.5 Run `openspec validate add-ralph-mode --strict`
- [ ] 10.6 Document validation results in beads issue

## 11. Future skill migration (post-MVP)
- [ ] 11.1 Design skill interface for Ralph orchestration
- [ ] 11.2 Migrate bash logic to skill implementation
- [ ] 11.3 Add skill configuration integration
- [ ] 11.4 Update AGENTS.md with skill invocation patterns
