## 1. Learnings Directory & Index
- [x] 1.1 Create the `learnings/` directory with `meta-learnings.md`, `recurring-tasks.md`, `failures-and-resolutions.md`, and `candidate-automations.md` ledgers.
- [x] 1.2 Add a `learnings/index.md` file that summarizes each ledger (categories, latest entries, status) so agents can quickly navigate meta topics.

## 2. Entry Templates & Classification
- [x] 2.1 Document the mandatory entry template at the top of every ledger (date/session, bead/change IDs, knowledge type, meta category, owner, summary, recommended action, status).
- [x] 2.2 Define allowed values for knowledge type/status and note how they map to promotion outcomes (e.g., informational, needs AGENTS update, needs OpenSpec change).

## 3. Review & Promotion Workflow
- [x] 3.1 Create a custom "review learnings" command/workflow that lists new ledger entries, prompts owners for next steps, and records results back into the ledger/index.
- [x] 3.2 Document the lifecycle for promoting entries into AGENTS/specs/config (who is responsible, how to link back to ledger IDs, how to close out entries once promoted).

## 4. Spec & Guidance Updates
- [x] 4.1 Extend `codex-multi-agent-suite` spec to cover the ledger/index structure and review workflow.
- [x] 4.2 Update AGENTS/OpenSpec guidance so Orchestrator/Meta-Agent run the review command during session wrap-up and ensure promotions are filed when criteria are met.

## 5. Validation
- [x] 5.1 Run `openspec validate add-meta-learnings-registry --strict` and resolve any failures.
