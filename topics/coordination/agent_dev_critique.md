# Agent Dev Critique: Gaps, Failure Modes, and What To Build Next

This document critiques the agent development architectures surveyed in `agent_dev.md` (Gastown, Murmur, Agent of Empires) against the abstract reference architecture and the SOTA patterns it calls out (ReAct, Reflexion, ReWOO, LangGraph-style graphs, OpenAI Evals, Guardrails). It uses the validation and operational discipline from `software_eng.md` (quality gates, DoR/DoD, SLOs, break-glass, RACI-ish roles, DORA-like metrics) to make the critique actionable.

## 1) Executive Critique

- Persistence is still treated as "task state" rather than "operational state": most systems persist a backlog (Gastown Beads/Convoys; Murmur issue backends) but not the full artifact trail (logs, decisions, eval runs) needed for reliable seance/handoff and regression control.
- Seance/handoff exists as a named concept (Gastown) but is underspecified: what must be captured, where it lives, how it is validated, and how it drives the next session is usually missing.
- Termination conditions and iteration budgets are underpowered: even when a heartbeat loop exists (Gastown GUPP/Patrol; Murmur tick loop), there is rarely a hard "stop policy" tied to acceptance criteria and cost/time budgets.
- Merge/conflict handling is recognized (Murmur `needs_resolution`; Gastown "merge queues" emphasis) but not operationalized as a first-class pipeline with gates, ownership, and queue economics.
- QA gates and eval harnesses are the biggest missing loop: the reference architecture calls for QA/Evals, but all three systems are weak here (agent_dev.md notes eval harness/regression as absent).
- Tool safety is improving (Murmur PreToolUse hook + approvals) but remains ad-hoc: schema validation, allowlists, secrets handling, and break-glass are not consistently designed as policy.
- Observability is mostly "human watching a TUI": few systems provide an event log + traces + cost accounting and SLOs for the agent platform itself.
- Role separation is present as labels (Gastown Mayor/Polecats; Murmur manager/planner/coding), but responsibilities blur without a RACI-like contract and explicit decision rights.
- Coordination models bias toward "spawn workers and hope": claim registries (Murmur) prevent collisions, but they do not replace planning, dependency management, and integration sequencing.
- Reliability goals like Gastown NDI are not backed by measurable gates: without metrics and regression tests, NDI becomes an aspiration rather than an engineering property.

## 2) Gaps By Layer

### Runtime

- Symptom/failure mode: agents run too long, repeat work, or loop on the same failure; cost spikes without outcome movement.
- Why it happens: heartbeat loops exist (Gastown continuous work feeding; Murmur orchestrator ticks) but stop conditions are not tied to measurable acceptance criteria, nor enforced with iteration/cost budgets.
- What to build/change:
  - A platform-level stop policy: max iterations, max tool calls, max wall time, max token/cost budget per task, and explicit "done" predicates.
  - Structured termination contracts (Autogen/Swarm-style termination conditions): a task is DONE only if gates pass and acceptance criteria are satisfied; otherwise transition to a labeled failure state (blocked, needs_human, needs_resolution).
  - Checkpointing at safe boundaries (reference architecture): persist state after each tool call and after each gate run.
- How to validate:
  - Gate: runaway rate (tasks exceeding budget) < 1%.
  - Metric: median iterations-to-done, p90 iterations-to-done, and cost-per-done.
  - Eval: replay last N tasks from checkpoints; outcome equivalence >= 95% (same final status and artifacts).

### Orchestration

- Symptom/failure mode: work gets started but not finished; agents pick "ready" work that is not actually ready; parallel agents collide on the same files; integration thrash.
- Why it happens:
  - Murmur's agent-driven selection + claim registry prevents duplicate claiming but does not impose a global plan, dependencies, or integration ordering.
  - Agent of Empires is intentionally not an orchestrator (tmux session manager), so coordination is external and often implicit.
  - Gastown has hierarchical roles (Mayor/Witness/Deacon) and Convoys, but dependency tracking is only partial in the abstract map.
- What to build/change:
  - Definition of Ready (DoR) enforcement (software_eng.md): issues must include acceptance criteria, dependencies, and a validation plan before entering the "ready" pool.
  - A supervisor-owned integration plan (reference architecture): explicit sequencing and a merge queue (single integrator lane) for code-changing outputs.
  - A "critic as policy" loop (Reflexion-like) that classifies failures and drives revision or escalation after repeated failures.
- How to validate:
  - Metric: percent of work items that enter "in progress" and reach "done" without human intervention.
  - Gate: trunk health ("main is always green" principle) with required checks passing on every merge.
  - Eval: collision rate (conflicts per merged PR) and rework rate (same files changed by multiple agents within 24h) trend down.

### State + Memory

- Symptom/failure mode: after restart, agents lose the thread; they re-discover decisions; they cannot explain what changed or why; handoffs are ambiguous.
- Why it happens:
  - Murmur explicitly does not persist chat history; it persists best-effort agent metadata snapshots (`agents.json`) and relies on issue backends for task state.
  - Agent of Empires persists sessions via tmux and local metadata, but not a durable task/artifact/memory model.
  - Gastown has the right primitives (Hooks for persistence; Seance/Handoff as explicit mechanisms; Beads/Convoys), but the content model for seance/handoff is not standardized.
- What to build/change:
  - Treat persistence as three stores (reference architecture): task store, artifact store, and memory tiers.
  - Define a seance/handoff schema (Gastown concept, made concrete):
    - Task identity: issue IDs, branch/worktree, current status.
    - Decision log: key decisions + why (ADR-style from software_eng.md).
    - Current hypothesis and next actions (first 5 minutes executable).
    - Repro/verify commands (how to run gates, how to reproduce bugs).
    - Risk/rollback notes (blast radius, safe operations).
    - What is blocked and who owns it (RACI alignment).
  - Memory write-back policy (MemGPT + Reflexion): store learned heuristics per repo/service and attach them to future tasks via retrieval.
- How to validate:
  - Handoff audit: a fresh session can resume a task within 10 minutes using only the handoff note and artifact store.
  - Metric: "context rework" (time spent rediscovering) decreases; measured via structured event logs.
  - Gate: handoff notes required for tasks that exit due to budget/stop condition.

### Tools + Sandbox

- Symptom/failure mode: unsafe tool calls, secrets leakage, accidental destructive commands, inconsistent environment causing "works on my machine" failures.
- Why it happens:
  - Tool registries and schema-based tool calling are often partial (reference architecture calls for schemas and allowlists; Murmur uses hooks for approvals but not necessarily full contracts everywhere).
  - Sandboxing is optional (AoE docker sandbox) or absent/minimal; without a reproducible sandbox, evals and gates are noisy.
- What to build/change:
  - Tool registry as policy (reference architecture + OpenAI tool calling + Guardrails): strict schemas, allowlists, per-tool budgets, and mandatory logging of tool args/results.
  - Secrets handling defaults (software_eng.md): never log sensitive; secret scanning in CI; least privilege for tokens; separate "read-only" vs "write" tools.
  - Break-glass policy for tool bypasses (software_eng.md): who can override, when allowed, required logging, and required follow-up.
  - Standard sandbox runner for build/test (sprites/container/VM): same commands, same outputs, persistent logs.
- How to validate:
  - Gate: secret scanning blocks merges; zero secrets in repo/logs.
  - Metric: tool denial rate and override rate; overrides require an exception record.
  - Repro metric: identical sandbox run outputs across runs (flake rate near zero for environment).

### QA + Evals

- Symptom/failure mode: regressions ship; agents "think" they fixed the bug but tests fail later; quality depends on human review.
- Why it happens:
  - agent_dev.md explicitly notes eval harness/regression is missing across systems; QA gates integration is partial or absent.
  - Without a harness, there is no way to measure improvements or detect regressions in agent behavior (Reflexion without measurable feedback collapses into opinion).
- What to build/change:
  - Minimal viable eval (OpenAI Evals / SWE-bench framing):
    - A small suite of repo-specific scenarios (10-50) with deterministic setup and a single "pass/fail" verification (tests, golden outputs, or static checks).
    - Capture trajectories (SWE-agent style): tool calls, diffs, gate outputs, and final status.
  - Quality gates as default policy (software_eng.md): build, unit tests, lint/format, type checks, secret scanning, dependency vuln scan; conditional integration/E2E/perf checks.
  - Critic role enforces gates and labels failure mode (refactor needed, missing test, flaky, environment issue, permission issue).
- How to validate:
  - Gate pass rate: required checks 100% for merges; flaky test budget near zero.
  - Regression: weekly eval run; new changes must not degrade pass rate by more than an agreed threshold.
  - Metric: escaped defects (post-merge regressions) trend down.

### UX + Ops

- Symptom/failure mode: humans cannot tell what the agent is doing, why it is stuck, or what to do next; operational load shifts to manual babysitting.
- Why it happens:
  - AoE optimizes for session ergonomics (tmux) but not autonomous status semantics.
  - Murmur has a daemon + TUI/CLI, but persistence and observability are limited (chat in-memory).
  - Gastown emphasizes roles and patrol/oversight, but platform-level SLOs, dashboards, and runbooks are not standardized.
- What to build/change:
  - Agent platform runbook (software_eng.md runbook template): top alerts, safe operations (stop/resume/rollback), and common failure modes.
  - "First 5 minutes" UX: show active tasks, budgets, last gate result, next action, and required approvals.
  - Merge queue UI: show queue depth, conflict states, required gates, and ownership for `needs_resolution` tasks.
- How to validate:
  - MTTR for agent-platform incidents (stuck queue, broken sandbox) improves.
  - Metric: human time per completed task decreases.
  - SLO: platform availability for core operations (start task, run gates, merge) with burn alerts.

## 3) Cross-Cutting Concerns

### Security

- Symptom/failure mode: credential spills, unsafe commands, unreviewed external IO, prompt injection via tool outputs.
- Why it happens: tool surfaces expand faster than policy; approvals exist but lack consistent contracts and auditability.
- What to build/change:
  - Threat model for the agent platform (software_eng.md checklist): assets (secrets, repo integrity, deploy rights), entry points (tools, web fetch, ticket text), trust boundaries.
  - Deny-by-default tool permissions with least privilege; separate read vs write capabilities.
  - Audit logs for all privileged actions; secret redaction at the log sink.
- How to validate:
  - Security gates in CI: secret scanning + SCA + SAST where meaningful.
  - Metric: time-to-patch for critical tool safety issues.

### Cost

- Symptom/failure mode: cost-per-task unpredictable; runaway autonomy; expensive search (ToT/GoT) without value.
- Why it happens: no per-task budgets, no cost attribution, and no decision rights about when to spend more.
- What to build/change:
  - Cost accounting per task and per tool; budgets enforced at runtime.
  - A policy for "spend more": only after a critic-approved justification and only for tasks tagged as high value.
- How to validate:
  - Metric: cost-per-done p50/p90; budget overrun rate.
  - Guardrail: cost regression alerts on eval runs.

### Observability

- Symptom/failure mode: impossible to debug agent failures; only narrative summaries exist.
- Why it happens: event logs/traces are not first-class; chat is treated as the log.
- What to build/change:
  - Unified event log (reference architecture): tool call events, gate results, state transitions, merge events, and approvals.
  - Golden signals for the agent platform (software_eng.md): latency (time-to-first-action, time-to-gate), errors (tool failures), traffic (tasks), saturation (queue depth, concurrency).
- How to validate:
  - Dashboards exist and have owners; deploy markers correlate with failures.
  - Alert rules include meaning + first steps + verification.

### Human factors

- Symptom/failure mode: humans cannot trust the system; agents produce plausible but wrong changes; review load increases.
- Why it happens: success criteria are vague; gates are waived; responsibilities are unclear.
- What to build/change:
  - DoD enforcement (software_eng.md): tests + docs + observability + rollout/rollback plan for non-trivial changes.
  - Review SLAs and CODEOWNERS for critical areas; small batch discipline.
- How to validate:
  - Metric: PR review latency, re-open rate, and post-merge follow-ups.

### Governance (roles, RACI, decision rights)

- Symptom/failure mode: agents act as PM/EM/TL/IC simultaneously; tradeoffs are made implicitly; exceptions are unlogged.
- Why it happens: agent roles exist, but responsibilities and decision rights are not formalized.
- What to build/change:
  - Map human roles to agent roles (software_eng.md RACI baseline):
    - PM-agent: problem framing, success metrics, non-goals; cannot merge code.
    - EM-agent: queue health, WIP limits, exception/break-glass workflow.
    - TL-agent: architecture decisions, gate policy, integration sequencing.
    - IC-agent (executor): implements changes within constraints.
    - QA/critic agent: enforces gates and labels failure modes.
    - SRE/ops agent: SLOs, runbooks, incident playbooks for the platform.
    - Security agent: threat model, permissions policy, secret hygiene.
  - Decision logging (ADR-style): record irreversible or exception decisions.
- How to validate:
  - Audit: every gate waiver has an exception record within 1 hour and follow-up within 24 hours (break-glass policy).
  - Metric: number of unowned "stuck" tasks trends to zero (DRI required).

## 4) Proposed Roadmap (MVP + 3 Increments)

This aligns to the build order and increments in `agent_dev.md`, but tightens them using the operational discipline in `software_eng.md`.

### MVP: Reliable single-repo worker (make "NDI" measurable)

- Critique of current MVP framing: the reference architecture MVP mentions budgets and seance notes, but does not define required content, gate policy, or stop conditions.
- Build:
  - Supervisor + executor + critic (ReWOO split), with explicit termination conditions and hard budgets.
  - Task store + artifact store + standardized seance/handoff notes (schema).
  - Mandatory local gates (tests/lint/format/typecheck) via a sandbox runner.
  - Tool registry with schemas + allowlists + secrets redaction.
- Validate:
  - Required gates pass rate 100% for merges.
  - Handoff audit: resume within 10 minutes.
  - Runaway rate < 1%.

### Increment 1: Multi-task queue + merge queue (operational maturity)

- Critique: "add merge queue" is necessary but insufficient; conflicts must become owned work with verification and queue economics.
- Build:
  - DoR enforcement for backlog entries; explicit dependencies.
  - Merge queue as a serialized pipeline: rebase, run gates, merge, record deploy marker (if applicable).
  - Conflict workflow: `needs_resolution` is a state with an owner, repro steps, and a "done" definition.
- Validate:
  - Conflict rate and integration thrash trend down.
  - Trunk stays green; broken main treated as a Sev-2 for dev productivity (software_eng.md).

### Increment 2: Memory tiering + skill library (reduce rediscovery)

- Critique: adding memory without governance creates stale or unsafe behavior; skills without regression tests become brittle.
- Build:
  - Memory tiers (MemGPT): working summaries + indexed long-term + episodic traces.
  - Reflexion write-back: failure classifications and "lessons" tied to repos/services.
  - Skill registry (Voyager): reusable tool recipes with regression tests and versioning.
- Validate:
  - Reduction in time-to-first-correct-fix on repeated task types.
  - Skill regression suite pass rate 100%; failures block skill promotion.

### Increment 3: Graph orchestration + eval harness (measurement-first autonomy)

- Critique: graph runtimes (LangGraph-like) add complexity unless they buy resumability, observability, and controllable search.
- Build:
  - Explicit orchestration graph with checkpoints and state reducers.
  - Eval harness (OpenAI Evals / SWE-bench style): scenario suites + replay + dashboards.
  - Optional search controller (ToT/GoT) gated behind budgets and only for tasks tagged "hard".
- Validate:
  - Weekly eval trend: pass rate non-decreasing; cost-per-pass controlled.
  - Observability: end-to-end traces for tasks; SLOs for platform operations.

## 5) Metrics And Acceptance Criteria

### Delivery (DORA-like)

- Lead time for changes: first task start (or first commit) -> merged (or deployed) for agent-produced changes.
- Deploy frequency: merges (and optionally deploys) per day/week.
- Change failure rate: percent of merges causing rollback, hotfix, or SLO burn within 24h.
- MTTR: time from detection of agent-platform failure to restored service.

### Quality

- Gate pass rate: required checks (build/tests/lint/type/secret scan) must be 100% at merge.
- Flake rate: near zero; track flaky failures per 1k runs and treat sustained flakes as bugs.
- Escaped defects: post-merge regressions per week (with severity threshold).

### Reliability and operations

- Platform SLOs: task start success rate, gate-run success rate, merge-queue throughput, and approval latency.
- Error budget policy: elevated burn slows risky autonomy; critical burn freezes and routes to reliability work.

### Cost

- Cost per completed task (p50/p90) and cost per successful eval scenario.
- Budget overrun rate (tasks exceeding token/tool/wall-time budgets).

### Human workload

- Human minutes per completed task; review latency; number of required manual interventions per 100 tasks.

## 6) Anti-Patterns And Failure Cases (With Mitigations)

### "Chat is the database"

- Failure: restarts lose critical context; decisions evaporate.
- Mitigation: artifact store + seance/handoff schema; checkpoints after tool calls.

### "No stop condition"

- Failure: runaway loops, high spend, repeated attempts with no new evidence.
- Mitigation: hard budgets + explicit done predicates; Reflexion-style escalation after N failures.

### "Merge queue as an afterthought"

- Failure: parallel work collides; conflicts handled manually; gates skipped to unblock.
- Mitigation: serialized merge pipeline; conflicts become owned tasks with required gates and clear DoD.

### "Approvals without policy"

- Failure: humans approve unsafe actions inconsistently; no audit trail.
- Mitigation: deny-by-default tool registry; allowlists; break-glass with mandatory logging and follow-up.

### "No eval harness"

- Failure: improvements are anecdotal; regressions go unnoticed.
- Mitigation: minimal scenario suite + replay + weekly trend dashboard; block changes on regressions.

### "Roles are labels, not interfaces"

- Failure: agents make product, architecture, and risk decisions implicitly.
- Mitigation: RACI mapping to agent roles; decision rights + ADR logging for irreversible or exception decisions.
