# Software Engineering Playbook (Beyond Code)

This is a dense, practical guide to building, shipping, and operating software reliably. It is intentionally opinionated and oriented around checklists, templates, quality gates, and clear roles.

------------------------------------------------------------------------------

## 0) Principles (Operational, Not Philosophical)

- Optimize for customer outcomes and system reliability, not activity.
- Make work legible: small batches, explicit decisions, visible risk.
- Prefer reversible decisions; timebox exploration; document irreversibles.
- Every change is a risk trade: reduce blast radius, add detection, add rollback.
- Quality is enforced by automation first, review second, heroics never.

------------------------------------------------------------------------------

## 1) Roles And Interfaces (RACI-ish)

Use this as a baseline. Merge roles in small teams, but keep responsibilities explicit.

### Core Roles

Product Manager (PM)
- Accountable for: problem selection, outcomes, roadmap, requirements quality.
- Owns: discovery, prioritization, GTM coordination, release notes (product-facing).
- Interfaces: EM for scope/capacity tradeoffs; TL for feasibility/sequence; Design for UX; Support/CS for feedback and comms.

Engineering Manager (EM)
- Accountable for: delivery predictability, staffing, execution health, and team operating system.
- Owns: milestone planning, resourcing, priority/interrupt management, escalation hygiene, quality gate enforcement (with TL).
- Interfaces: PM for scope/priority; TL for technical risk vs capacity; SRE/Platform for ops constraints; Security for risk; Support/CS for escalations and customer-impact priorities.

Tech Lead (TL)
- Accountable for: technical direction, architecture decisions, technical risk reduction, and code health.
- Owns: design docs/ADRs, system boundaries/contracts, review standards, refactoring strategy, rollout/rollback design.
- Interfaces: EM for planning/capacity; PM for tradeoffs; SRE/Platform for reliability patterns/SLOs; Security for threat models and security gates; Support/CS for known issues and repro feedback.

Engineers (ICs)
- Responsible for: implementation, tests, docs, operational readiness, on-call participation.
- Owns: code changes, runbooks for owned services, alerts quality, incident follow-ups.

Support / Customer Success (Support/CS)
- Accountable for: customer issue triage quality, escalation hygiene, and customer communication during incidents.
- Owns: ticket triage, reproduction details, known issues tracking, customer-facing incident updates, KB/support docs, escalation routing.
- Interfaces: PM for product feedback and release comms; EM for prioritization/interrupts; TL/ICs for debugging context and fixes; SRE for incident status and mitigations.

Design / Research
- Accountable for: UX coherence, usability risk reduction.
- Owns: prototypes, user flows, content design, validation plans.

QA / Quality Engineering (if present)
- Accountable for: test strategy health, test infra reliability.
- Owns: acceptance test suites, test data management, release validation playbooks.

SRE / Platform
- Accountable for: reliability guardrails, observability, deployment safety, incident process.
- Owns: SLOs, runbook standards, on-call tooling, platform patterns.

Security
- Accountable for: security posture, risk management, incident response for security events.
- Owns: threat models, security reviews, policies for secrets/access, vuln management.

Data / Analytics (if present)
- Accountable for: metrics correctness, instrumentation quality, experiment validity.
- Owns: event taxonomy, dashboards, data quality checks.

### RACI Baseline By Artifact / Decision

R = Responsible (does the work)
A = Accountable (final sign-off)
C = Consulted (must be looped in)
I = Informed (kept aware)

| Item / Decision | PM | EM | TL | IC Eng | Support/CS | SRE/Plat | Sec | Design | Data |
|---|---|---|---|---|---|---|---|---|---|
| Problem statement / success metrics | A/R | C | C | I | C | I | I | C | C |
| Scope / MVP definition | A/R | A/R | C | C | C | I | I | C | C |
| Architecture / tech approach | C | C | A/R | R | I | C | C | I | I |
| Threat model | C | C | R | R | I | C | A/R | I | I |
| Test strategy / quality gates | C | A | R | R | I | C | C | I | I |
| SLOs / error budgets | C | C | C | I | I | A/R | C | I | I |
| Release plan / rollout | C | A | R | R | C | C | C | I | I |
| Customer-facing release notes / known issues | A | C | C | C | R | I | I | C | I |
| Incident communications (customers/stakeholders) | C | C | I | I | A/R | C | C | I | I |
| Incident response (ops) | I | I | C | R | C | A/R | C | I | I |
| Post-incident follow-ups | C | A | R | R | C | C | C | I | I |
| Deprecation / breaking change | A | A | R | R | C | C | C | C | I |

### Interfaces And Expectations

- PM <-> EM: weekly scope/priority/capacity review; explicit tradeoffs; commitments tracked.
- EM <-> TL: risk/capacity alignment; sequencing; quality gate exceptions policy.
- TL <-> SRE: reliability constraints, rollout patterns, SLO ownership, alert thresholds.
- TL/IC <-> Security: threat model early; security gates automated; exceptions documented.
- Support/CS <-> Eng: escalation channel; repro + severity; incident comms cadence; known issues updates.

------------------------------------------------------------------------------

## 2) Lifecycle Overview (From Idea To Iteration)

Use this as a checklist for the minimum set of steps and artifacts.

1) Discovery and framing
2) Planning and scoping
3) Execution (build)
4) Review and validation
5) Release and rollout
6) Operations and incident response
7) Iterate / learn / deprecate

Every stage should produce:
- A decision (go/no-go) that is reversible when possible
- Artifacts that reduce ambiguity and enable handoff
- Measurable acceptance criteria

------------------------------------------------------------------------------

## 3) Discovery And Product Planning

### Problem Framing Template

Copy/paste and fill. Keep it to 1-2 pages.

```
Title:
Owner (PM):
EM:
TL:
Date:

Problem:
  - Who is impacted?
  - What pain / cost occurs today?
  - Evidence (support tickets, revenue, churn, time-to-task, qualitative quotes).

Goal:
  - Outcome-based statement.
  - Non-goals (explicitly out of scope).

Success metrics:
  - Primary metric (one):
  - Guardrails (latency, error rate, cost, abuse):
  - Measurement plan (events, dashboard link, ownership):

Constraints:
  - Timeline / dependencies:
  - Compliance / privacy:
  - Platform / reliability requirements:

Options considered:
  - Option A (MVP):
  - Option B:
  - Why now / why not later:

Risks:
  - Product risks:
  - Technical risks:
  - Operational risks:

Decision:
  - Go / no-go / revisit date:
```

Quality rubric (reviewer checklist):
- Problem is specific, evidenced, and user-impacting (not a solution restatement).
- Success metrics are measurable, have an owner, and include a concrete measurement plan.
- Guardrails cover reliability/cost/abuse/regression risks relevant to the change.
- Non-goals and constraints make tradeoffs explicit (time, privacy, platform, dependencies).
- Options considered show at least one real alternative and why rejected.
- Risks include at least one operational risk with mitigation + detection.
- Decision is explicit: go/no-go with a revisit trigger/date.

### Scoping Rules (Battle-Tested)

- Define a thin vertical slice that delivers value end-to-end.
- Separate MVP from follow-ups; keep the backlog explicit.
- Minimize new surface area: reuse patterns, avoid new infra unless it pays immediately.
- Prefer feature flags to long-lived branches.
- Treat data migrations and integrations as first-class deliverables.

### Estimation And Forecasting (Practical)

- Estimate uncertainty, not just duration.
- Use ranges (P50/P90) and call out unknowns.
- Favor throughput-based planning (small tasks, flow) over big upfront estimates.
- Re-estimate after spikes and prototype results.

------------------------------------------------------------------------------

## 4) Organizing Work: Backlog, Milestones, And Delegation

### Work Intake And Prioritization

- Single prioritized backlog (or clearly defined per-team backlogs with an explicit global priority).
- Every backlog item has: owner, outcome, acceptance criteria, and a clear "why now".
- Kill zombie work: if it cannot be staffed in the next 4-8 weeks, move it out of the active backlog.
- Use a capacity buffer for interrupts (incidents, support, unplanned work).

### Milestones That Predict Delivery

- Prefer milestones as integration checkpoints, not phase gates.
- Milestones should be demo-able slices (end-to-end), not layers.
- Track risk explicitly: unknowns, external dependencies, migrations, performance, security.

### Definition Of Ready (DoR)

Work should not enter a sprint/milestone until:
- Problem statement exists with success metrics and non-goals.
- Acceptance criteria are testable.
- Dependencies identified; owners assigned; external teams aware.
- Risks captured; rollout requirements stated.
- Design/UX artifacts exist if UI changes.

### Definition Of Done (DoD)

Default DoD for a change:
- Code merged with tests, lint, and required checks passing.
- Docs updated (user-facing and/or internal runbook).
- Observability added/updated (logs, metrics, traces) and dashboard exists.
- Rollout plan executed; feature flag state recorded.
- On-call impact assessed; alerts configured; runbook link in service catalog.
- Security considerations addressed; secrets managed correctly.

### Delegation Checklist (For Leads)

- State the outcome and constraints, not implementation steps.
- Provide context: why now, users impacted, success metrics.
- Define interfaces: API contracts, owners, review expectations.
- Break into independent tasks with clear owners and integration points.
- Confirm risks and rollback plan.

### Task Breakdown Template

```
Goal:
Milestone date:
Dependencies:

Work items:
  1) [Owner] Deliverable + acceptance criteria
  2) [Owner] Deliverable + acceptance criteria
  3) [Owner] Deliverable + acceptance criteria

Integration plan:
  - How pieces come together and in what order

Quality gates:
  - Tests / lint / security / perf / migration checks

Rollout:
  - Flag name:
  - Canary cohort:
  - Rollback steps:
```

### Risk Register Template

Use for any non-trivial project.

```
Risk:
Type: product | technical | operational | security | schedule
Likelihood: low | medium | high
Impact: low | medium | high
Owner:
Mitigation:
Trigger (how we know risk is happening):
Contingency (what we do if it happens):
Review cadence:
```

### Weekly Status Update Template (Async)

Keep it short and evidence-based.

```
This week:
  - Shipped:
  - In progress:

Next week:
  - Planned:

Risks / asks:
  - Risk:
  - Ask (owner + decision needed + by when):

Metrics:
  - Success metric movement:
  - Guardrail movement:
```

------------------------------------------------------------------------------

## 5) Technical Planning: Design Docs, ADRs, Threat Models

### Design Doc Template (Short)

```
Title:
Owners:
Status: draft | approved | implemented

Context:
  - Problem and constraints
  - Existing system behavior

Goals / Non-goals:

Proposed approach:
  - High-level architecture
  - Data model / APIs
  - Migration plan

Alternatives considered:

Operational plan:
  - Observability (logs/metrics/traces)
  - SLO impact
  - Rollout and rollback
  - Runbook updates

Security / privacy:
  - Threat model summary
  - Data classification
  - AuthZ/AuthN approach

Testing plan:
  - Unit
  - Integration
  - E2E
  - Load/perf (if needed)

Risks and mitigations:

Open questions:
```

Quality rubric (reviewer checklist):
- Clear goals/non-goals; success criteria and constraints are explicit.
- Proposed approach names boundaries/contracts (APIs, data model) and failure modes.
- Rollout/rollback is actionable (flags, cohorts, revert path, schema compatibility).
- Observability plan includes what signals change (SLIs/metrics/logs/traces) and where.
- Risks are concrete; mitigations include detection and blast-radius controls.
- Alternatives are real (not strawmen) and tradeoffs are documented.
- Security/privacy notes include data classification and authN/authZ decisions.
- Testing plan matches risk (unit/integration/e2e/perf) and includes how to verify.

### ADR Template (Decision Record)

Keep ADRs short and searchable.

```
ADR-YYYYMMDD-<slug>
Status: proposed | accepted | superseded

Decision:
Context:
Options:
Consequences:
Rollout / Migration:
Security / Reliability notes:
```

Quality rubric (reviewer checklist):
- Decision is a single sentence; scope is crisp (what is decided vs not).
- Context includes the forcing function (constraint/incident/scale/latency/cost).
- Options list includes viable alternatives and why they were rejected.
- Consequences include follow-on work, operational impact, and migration/rollback notes.
- Links to supporting artifacts (design doc, incident, metrics) when applicable.
- Revisit triggers exist for non-obvious bets (date/metric/incident).

### Lightweight Threat Model Checklist

- Assets: what are we protecting (data, money, accounts, infrastructure)?
- Actors: legitimate users, admins, attackers, insiders.
- Entry points: UI, APIs, webhooks, queues, cron, internal tools.
- Trust boundaries: where does untrusted input cross into trusted systems?
- Abuse cases: auth bypass, IDOR, injection, replay, privilege escalation.
- Mitigations: validation, authZ checks, rate limits, audit logs, encryption.
- Residual risk: what remains, why acceptable, how monitored.

------------------------------------------------------------------------------

## 6) Execution: Building With Predictable Flow

### Small Batch Discipline

- PRs are small: one logical change; avoid "mega PR" merges.
- Ship behind flags; integrate continuously.
- Keep trunk green: broken main is a Sev-2 incident for dev productivity.

### Branching And Flag Strategy

- Default: trunk-based development.
- Long-running branches only when mandated (and aggressively rebased/merged).
- Feature flags for:
  - Incomplete work
  - Risky rollouts
  - A/B experiments
  - Deprecations (dual-run)

Flag hygiene:
- Every flag has: owner, creation date, removal date, default state, dashboard.
- Remove flags within 30-90 days.

### Validation While Building (Not Just At The End)

- Start with an executable acceptance test for the main workflow when possible.
- Add contract tests for interfaces that cross team/service boundaries.
- For migrations: validate both forward and backward compatibility during rollout.
- For risky logic: add invariant checks (assertions/metrics) and compare old vs new paths (shadowing) before full cutover.

### Interfaces And Contracts

- Write down inputs/outputs and error semantics for every integration point.
- Treat error behavior as part of the API: retries, idempotency, timeouts, rate limits.
- Use versioning policies (semver, date-based, or explicit versioned endpoints) and deprecation windows.

------------------------------------------------------------------------------

## 7) Review: Code, Design, And Operational Readiness

### PR Review Checklist (Reviewer)

- Correctness: meets acceptance criteria; handles edge cases.
- Safety: errors handled; retries/timeouts bounded; idempotency considered.
- Security: authN/authZ correct; input validation; secrets not logged.
- Reliability: backpressure, rate limits, circuit breakers where needed.
- Observability: structured logs; metrics for key outcomes; tracing boundaries.
- Tests: meaningful coverage; negative cases; flaky test risk.
- Maintainability: clear naming; minimal coupling; docs updated.

### PR Template (Author)

```
## What

## Why

## How

## Risk
- Blast radius:
- Failure modes:
- Rollback:

## Validation
- Tests:
- Manual checks:
- Metrics/dashboard:

## Rollout
- Flag:
- Canary cohort:
- Monitoring window:

## Screenshots (if UI)
```

------------------------------------------------------------------------------

## 8) Quality Gates: What To Enforce And How

Treat quality gates as policy. Automation enforces; humans handle exceptions.

### Default Quality Gates (CI)

Required checks on every change to main:
- Build/compile
- Unit tests
- Lint/format
- Type checks (if applicable)
- Dependency vulnerability scan (SCA)
- Static analysis (SAST) where meaningful
- Secret scanning
- License compliance checks (if needed)

Conditional checks (based on changed areas):
- Integration tests
- E2E tests
- Migration checks
- Performance regression checks
- IaC policy checks

### Enforcement Mechanisms

- Protected branches: require checks + review approvals.
- Mandatory CODEOWNERS for critical areas.
- Required status checks: do not allow bypass except break-glass.
- Break-glass policy (concrete):
  - Who can override: on-call Incident Commander (Sev-0/1/2) or EM-on-call for non-incident urgent customer impact; must include a second approver (TL-on-call or SRE-on-call).
  - When allowed: to stop/mitigate active customer harm, restore service, or ship a minimal-risk rollback/hotfix when CI/controls are the bottleneck.
  - Not allowed: convenience, schedule pressure, or to ship new scope.
  - Required logging within 1 hour: incident log entry (or "prod-risk exception" ticket) with: what was bypassed, why, risk assessment, who approved.
  - Required follow-up within 24 hours: backfill skipped checks, open action items for root cause (flake, infra, missing test), and document any permanent exception as an ADR.

### "Definition Of Done" As Enforced Checks

Make these concrete in automation instead of relying on memory:

- PR template required fields (risk, validation, rollout).
- Branch protections: required checks + minimum approvals + CODEOWNERS.
- CI split by speed: fast checks required for every PR; slow checks at merge/nightly.
- Release gates: staging deploy + smoke tests + SLO/burn check before broad rollout.

### Typical Gate Thresholds (Starting Point)

- Unit tests: required; flake budget near zero (treat flakes as bugs).
- Lint/type: required; do not waive except for emergencies.
- Security scanning: required; block on critical/high with known exploit paths.
- Coverage: use as a trend metric; block only when it prevents meaningful testing.
- Performance: for critical endpoints, block on p95 regression beyond an agreed threshold.

### Staging, Canary, And Progressive Delivery

- Staging should be production-like for critical paths (auth, data stores, queues).
- Canary releases:
  - 1-5% traffic or internal users first
  - Automated health checks (error rate, latency, saturation)
  - Hold period with explicit monitor owner
- Progressive rollout:
  - Increase cohorts only when metrics stable
  - Rollback on SLO burn or key metric regression

------------------------------------------------------------------------------

## 9) Release Management

### Release Checklist

- Change log entry and customer-facing notes (if applicable).
- Migration plan verified (forward + backward compatibility).
- Feature flags configured with safe defaults.
- Monitoring dashboards ready; alerts tuned.
- Rollback plan rehearsed (or at least written and plausible).
- Support briefed: known issues, mitigation steps, escalation contact.

### Rollback Strategies

- Code rollback: revert deploy; ensure schema compatible.
- Feature flag rollback: disable cohort; keep telemetry.
- Data rollback: avoid if possible; prefer forward-fix and compensations.
- Dependency rollback: pin versions; keep artifact immutability.

### Launch Readiness Checklist (Detailed)

- Product:
  - Launch criteria and success metrics agreed.
  - Customer comms plan prepared (who, when, what).
- Engineering:
  - Operational dashboards and alerts ready.
  - Runbook updated and linked.
  - Feature flag and rollout plan written.
  - Rollback verified (code/flag/config).
  - Backward compatibility verified (schema/API).
- Security:
  - Threat model reviewed for new entry points or sensitive data.
  - Logging reviewed for PII/secrets.
- Support:
  - Known issues documented; escalation path confirmed.

### Deprecations And Breaking Changes

- Publish timeline: announce, warn, enforce, remove.
- Provide migration guides and tooling.
- Add telemetry to measure remaining usage.
- Enforce removal: delete dead code after the window closes.

------------------------------------------------------------------------------

## 10) Operations: Observability, Runbooks, On-Call

### Golden Signals (Default)

- Latency: p50/p95/p99 per endpoint/operation.
- Traffic: requests/jobs per second.
- Errors: rate and type (4xx vs 5xx; retriable vs fatal).
- Saturation: CPU, memory, queue depth, DB connections, thread pools.

### Alert Design Rules

- Every alert answers: "what is broken" and "what to do first".
- Alert on user-impactful symptoms (SLO burn, error rate), not only on causes.
- Reduce noise:
  - Page only when action is required now.
  - Use tickets for slower issues.
- Include runbook link, dashboard link, and recent deploy context.

### Service Ownership (Minimum Metadata)

Maintain a lightweight service catalog (even if just a table in the repo):

- Service name and purpose
- Owners/on-call rotation
- Dependencies (DB, queues, vendors)
- SLOs and dashboards
- Runbook link
- Deploy/rollback instructions

### Runbook Template

```
Service:
Owner team:
Pager rotation:

Purpose:

Dashboards:
- Primary:
- Dependencies:

Alerts:
- Alert name -> meaning -> first steps

Common failures:
1) Symptom:
   Cause:
   Mitigation:
   Verification:

Safe operations:
- Restart:
- Scale:
- Disable feature flag:
- Drain queue:

Rollback:
- How to rollback deploy:
- How to rollback config:

Escalation:
- Team channel:
- SMEs:
- External vendor contacts:
```

Quality rubric (reviewer checklist):
- First 5 minutes are executable: primary dashboard, top alerts, and safest mitigations.
- Each alert has meaning + first steps + verification (not just symptom text).
- Common failures cover top 2-5 real incidents and include rollback/flag paths.
- Safe operations are bounded (what is safe to restart/scale, and what is not).
- Dependencies and vendor contacts are complete and current.
- Escalation path is explicit (who/where/when) and matches on-call reality.

### Operational Readiness Review (ORR) Checklist

Use for new services or major changes.

- SLO defined and measured; burn alerts configured.
- Dashboards exist and are used.
- Runbook exists and covers top failure modes.
- Access controls: least privilege, audited admin actions.
- Backup/restore validated (if stateful).
- Load/perf validated for expected traffic.
- Capacity plan and scaling policy documented.

------------------------------------------------------------------------------

## 11) Reliability: SLOs, Error Budgets, Capacity

### Common SLIs (Examples)

- Availability: successful requests / total requests (define "success").
- Latency: percentage of requests under a threshold (p95/p99).
- Freshness: data age under a threshold.
- Correctness: validated outputs / total outputs.

### SLO Process

- Define user journeys and what "good" means.
- Instrument SLI at the edge of the service.
- Set SLO based on user tolerance and business needs.
- Create burn-rate alerts (fast and slow).
- Use error budgets to gate risky releases.

### Error Budget Policy Template

```
SLO:
Window:
Error budget:

If budget burn is healthy:
  - Normal release pace

If budget burn is elevated:
  - Slow rollouts; require extra review for risky changes
  - Prioritize reliability work

If budget burn is critical:
  - Freeze risky releases for affected services
  - Run reliability sprint until burn stabilizes
```

### Capacity Planning Checklist

- Identify bottlenecks (CPU, memory, IO, DB, queue).
- Establish load model (peak QPS/jobs, payload sizes, concurrency).
- Load test critical paths; validate autoscaling thresholds.
- Set timeouts and retries deliberately (avoid retry storms).
- Validate behavior under partial dependency failure.
- Track cost per request/job; catch regressions.

------------------------------------------------------------------------------

## 12) Incident Response

### Severity Levels (Example)

- Sev-0: safety/legal breach, massive outage, existential risk.
- Sev-1: major customer impact or revenue loss; urgent response.
- Sev-2: partial degradation; time-sensitive but contained.
- Sev-3: minor impact; handle in business hours.

### Incident Roles

- Incident Commander: directs response, owns timeline and decisions.
- Operations Lead: executes mitigations, coordinates hands-on debugging.
- Comms Lead: updates stakeholders, status page, support.
- Scribe: records timeline, actions, hypotheses.

### Incident Checklist

- Declare incident; assign roles; start a timeline.
- Establish current impact and scope; set severity.
- Stabilize first: rollback, disable, rate limit.
- Communicate regularly.
- Confirm recovery with metrics.
- Open follow-ups before closing.

### Status Update Cadence (Example)

- Sev-0/1: every 15-30 minutes.
- Sev-2: every 30-60 minutes.
- Sev-3: as needed.

### Decision Log During Incidents

Record key decisions and why (rollback, disable, failover). This reduces confusion and improves postmortems.

### Post-Incident Review Template

```
Incident ID:
Date:
Severity:
Duration:

Customer impact:
Detection (how and when):

Timeline:
  - t0 ...

Root cause:
Contributing factors:

What went well:
What went poorly:

Action items:
  - [Owner] Fix + due date + verification
```

Quality rubric (reviewer checklist):
- Customer impact is quantified (who/how many/how long) and tied to an SLI/SLO.
- Timeline includes detection, diagnosis pivots, mitigations, and deploy/flag markers.
- Root cause is a causal chain (not a person/system label) and names the triggering change.
- Contributing factors include detection/alert gaps and process/coordination issues.
- Action items are prioritized, owned, time-bounded, and include verification.
- Includes "prevent recurrence" and "reduce blast radius" items when relevant.

### Follow-Up Hygiene

- Every action item has an owner, a due date, and a verification method.
- Track follow-ups to completion; treat repeat incidents as process failures.

------------------------------------------------------------------------------

## 13) Security: Practical Defaults

### Secure Development Checklist

- Input validation at boundaries; treat everything as untrusted by default.
- AuthN: strong sessions/tokens; short-lived credentials where possible.
- AuthZ: centralized checks; deny-by-default; unit tests for permissions.
- Secrets: never in code; use secret managers; rotate; least privilege.
- Dependencies: pinned versions; automated updates; vulnerability triage SLA.
- Data protection: encrypt in transit; encrypt at rest for sensitive data.
- Admin tooling: gated access; audited; MFA required.

### Data Classification (Minimal)

- Public: safe to disclose.
- Internal: company-confidential.
- Sensitive: PII, secrets, credentials, financial data.

Rules:
- Do not log Sensitive.
- Minimize collection; retain only as long as needed.
- Encrypt Sensitive at rest; strictly control access.

### Supply Chain And Dependency Hygiene

- Lock dependencies; prefer verified sources.
- Automate updates with CI.
- Generate SBOMs where required.
- Block merges on known critical vulnerabilities with realistic exploitability.

### Security Incident Basics

- Treat as incidents with specialized comms and evidence handling.
- Preserve logs, rotate credentials, and scope access.
- Coordinate disclosure and customer comms with legal/compliance.

------------------------------------------------------------------------------

## 14) Decision-Making And Governance

### Decision Types

- Reversible (Type 2): decide quickly; document briefly; iterate.
- Irreversible (Type 1): require design doc + explicit review + migration plan.

### Decision Rights Framework (RAPID)

RAPID roles:
- R (Recommend): drafts the proposal (doc + tradeoffs).
- A (Agree): has veto rights in their domain (must explicitly sign off).
- P (Perform): executes the decision.
- I (Input): consulted; provides feedback/constraints.
- D (Decide): final decision maker; resolves conflicts; accountable for the call.

Default decision rights (override per team, but keep D explicit):
- Product scope/priority: D=PM; A=EM (capacity/commitments); I=TL, Support/CS, Data.
- Architecture/technical direction: D=TL; A=SRE/Platform (reliability) and Security (security) when their domains are materially impacted; I=EM, affected teams.
- Prod-risk exceptions (waiving gates, risky rollout, break-glass outside an active incident): D=EM-on-call; A=SRE-on-call and/or Security-on-call depending on the risk.

Escalation paths + timeboxes:
- Scope/priority conflict (PM vs EM): resolve in 1 business day; if blocked, escalate to PM's manager + EM's manager with a written tradeoff (scope vs date vs quality).
- Technical disagreement (TLs/ICs): timebox to 2 business days after design doc posted; if blocked, escalate to EM for a decision-making meeting; record outcome as ADR.
- Break-glass dispute (can we bypass?): timebox to 15 minutes during incident response; IC decides; post-incident review must validate the choice.

Decision SLAs (starting point):
- PRD/problem framing approval: 2 business days.
- Design doc approval (Type 1): 3 business days (async) after pre-read posted.
- Gate/exception decision (non-incident): 4 business hours.
- Incident-time decisions: 5-15 minutes depending on severity.

Required artifacts/logging:
- Architecture/irreversible changes: ADR required; design doc required if non-trivial.
- Incidents: incident log/timeline required; postmortem required for Sev-0/1 and repeat Sev-2.
- Exceptions/break-glass: exception ticket required (even if incident exists) and must link to the PR/deploy; follow-up actions required.

### Practical Decision Process

- Write the decision (ADR).
- Timebox discussion; name a decider.
- List alternatives and why rejected.
- Record tradeoffs and consequences.
- Define revisit triggers (metrics, dates, incidents).

### Meeting Hygiene

- Written pre-read required for design/architecture decisions.
- Use agendas; end with decisions, owners, and dates.
- Default to async for status; reserve sync time for decisions and unblocking.

------------------------------------------------------------------------------

## 15) Metrics And Engineering Health

### Metrics Definitions (With Calculation Notes)

General rules:
- Define the boundary: what systems/repos/teams/services are included and excluded.
- Prefer event-based instrumentation (immutable deploy markers, incident IDs) over manual tagging.
- Use medians and percentiles (p50/p75/p90) for skewed distributions; keep sample size visible.

Delivery (DORA):
- Lead time for changes: time from "code change started" to "running in production". Practical default: first commit on a PR branch (or PR opened) -> production deploy completion containing that change. Notes: define "in prod" (region, cohort, feature-flag on/off).
- Deploy frequency: count of production deploy events per service (or per repo) per unit time. Notes: define what counts as a deploy (manual, auto, config-only, rollback) and dedupe multi-region fanout.
- Change failure rate (CFR): % of deploys that cause user-impacting incident, rollback, hotfix, or SLO burn beyond threshold within a window (e.g., 24h). Notes: define "failure" and the attribution window; count one failure per deploy.
- MTTR: median time to restore service for incidents (detect -> mitigated OR start -> resolved; pick one and stick to it). Notes: exclude planned maintenance; track separately by severity.

Reliability:
- SLO attainment: % of time (or requests) meeting the SLO over the window (e.g., 28d). Notes: must specify SLI definition (what is "good"), population (which requests/users), and window.
- Burn rate: error budget consumption speed vs allowed rate. Notes: compute as (actual error rate / allowed error rate) over a rolling window; use at least two alerts (fast + slow) and tie to release policy.

Flow (team throughput/latency):
- Cycle time: start -> done for a work item. Practical default: "in progress" timestamp -> merged (or deployed) timestamp. Notes: define work item type; track separately for bugs vs features.
- PR latency: PR opened -> merged (and optionally -> first review response). Notes: split into author time vs review time; set an SLA for first response.

Quality:
- Escaped defects: defects found after release (support tickets, incident-causing bugs, regressions) per unit time or per deploy. Notes: define severity threshold and exclude feature requests/misuse.
- Flake rate: % of CI test runs failing non-deterministically (rerun passes) OR flaky failures per 1k runs. Notes: separate infra flakes from product test flakes; treat sustained flakes as bugs.

Security:
- Time-to-patch by severity: time from "known vulnerability" to "remediated in production" (or to "fixed and deployed") segmented by severity (Critical/High/Medium/Low). Notes: define start event (scanner finding, advisory published, internal report) and end event (deploy + verification).

### Caveats And Anti-Gaming (Read Before Optimizing)

- Goodhart's law: when a metric becomes a target, it stops being a good metric; use a portfolio and watch tradeoffs (speed vs quality vs reliability).
- Instrumentation boundaries: changing tooling/teams/services breaks comparability; document boundary changes on dashboards.
- Seasonality and incident load: compare like-for-like windows; annotate launches, migrations, and on-call anomalies.
- Experiments: report confidence intervals (or Bayesian credible intervals) and sample sizes; avoid declaring wins on tiny deltas.
- Attribution: do not over-attribute failures to a team/service without an explicit window and incident/deploy linkage.
- Incentives: do not use DORA as individual performance metrics; use for system improvement.

### Dashboards That Work

- Each dashboard answers a question and has an owner.
- Keep it small: 5-12 charts per service.
- Include release markers (deploys) to correlate changes with impact.

------------------------------------------------------------------------------

## 16) Documentation (What To Write And How To Keep It True)

- Docs are owned; every doc has an owner and last-reviewed date.
- Keep docs close to code; prefer examples and commands.

### Documentation Types (Minimum Set)

- Getting started: local dev, tests, common pitfalls.
- Architecture: service map, dependencies, data flows.
- Runbooks: operations and incident steps.
- API docs: contracts, examples, error semantics.
- ADRs: decisions and tradeoffs.

### Docs Quality Rules

- Docs change with code (doc updates are part of DoD).
- Prefer runnable snippets and copy/paste commands.
- Put the "how to verify" steps in docs and PR descriptions.

------------------------------------------------------------------------------

## 17) Hiring And Onboarding

### Hiring Scorecard (Example)

- Problem solving: structured reasoning, tradeoff clarity.
- Technical: fundamentals, system design appropriate to level.
- Quality mindset: testing, observability, operations thinking.
- Collaboration: communicates constraints; unblocks others.
- Ownership: follows through; improves systems.

### Interview Loop Guardrails

- Use structured rubrics; calibrate interviewers.
- Require evidence in feedback (observed behaviors, not vibes).
- Reduce bias: consistent questions, clear expectations.

### Onboarding Checklist (First 2 Weeks)

- Accounts: SSO, MFA, least privilege; access requests tracked.
- Local dev: build, test, lint, run app; verify with a small change.
- Architecture walkthrough; key runbooks.
- On-call: shadow rotation; learn incident tooling; read recent postmortems.
- First deliverable: small vertical change with tests and a release.

------------------------------------------------------------------------------

## 18) Culture And Team Operating System

### Defaults That Scale

- Ownership: every area has a DRI (directly responsible individual) and a backup.
- Review SLA: first review response within 1 business day; hotfixes faster.
- Trunk is always green.
- Blameless incidents with accountable follow-ups.
- Make reliability work visible and planned (not only interrupt-driven).

### Delegation And Mentoring

- Delegate outcomes; provide constraints and interfaces.
- Give ownership of rollout and operational readiness (not just coding).
- Pair on reviews; teach how to reason about risk and failure modes.

------------------------------------------------------------------------------

## 19) Anti-Patterns And Warning Signs

Delivery And Planning
- Chronic slip without scope adjustment.
- Priority thrash; everything is urgent.
- No measurable success criteria; decisions based on vibes.
- Projects run without a risk register or rollout plan.

Engineering And Review
- PRs too large to review; review queues with no SLA.
- Tests are flaky; teams stop trusting CI.
- "Works on my machine" becomes normal.
- Repeated hotfixes without follow-up.

Operations And Reliability
- Alerts fire but no one knows what they mean; no runbooks.
- Rollbacks are scary or impossible.
- SLOs exist but do not influence release decisions.
- Repeated incidents with the same root causes.

Security
- Secrets in logs/repos; shared admin accounts.
- New public endpoints without authZ review or rate limits.
- No dependency scanning or patch SLAs.

------------------------------------------------------------------------------

## Recommended Reading

### Accelerate (Forsgren, Humble, Kim)
Links: https://itrevolution.com/product/accelerate/ , https://dora.dev/resources
- Teaches evidence-backed delivery performance drivers; separates capability improvements (CI, trunk-based, WIP limits, test automation) from outcomes.
- Apply by instrumenting the DORA metrics (lead time, deploy frequency, change failure rate, MTTR) and using them as system health signals, not individual KPIs.
- Use metric definitions explicitly (what counts as deploy, what window attributes a failure, how you measure lead time) to prevent Goodharting and dashboard drift.

### The DevOps Handbook (Kim, Debois, Willis, Humble, Forsgren)
Links: https://itrevolution.com/product/the-devops-handbook-second-edition/ , https://www.oreilly.com/library/view/the-devops-handbook/9781098182281/
- Teaches a practical operating model for delivery using the Three Ways (flow, feedback, continuous learning) and continuous delivery patterns.
- Apply by mapping your value stream (idea -> prod), then removing constraints: smaller batches, automated tests, deployment pipelines, and fast rollback.
- Use it as a playbook for aligning product/engineering/ops around shared goals: reduce lead time and incident impact while increasing deployment cadence safely.

### Site Reliability Engineering + The SRE Workbook (Google)
Links: https://sre.google/sre-book/service-level-objectives/ , https://sre.google/workbook/table-of-contents/
- Teaches SLOs as the contract between product and reliability: define user-facing SLIs, set targets, and manage risk with error budgets.
- Apply with concrete mechanics: implement SLOs (https://sre.google/workbook/implementing-slos/) and alert on SLO burn (https://sre.google/workbook/alerting-on-slos/) instead of paging on raw host metrics.
- Use an explicit error budget policy (https://sre.google/workbook/error-budget-policy/) to gate risky releases, prioritize reliability work, and prevent "always ship" vs "never ship" deadlocks.

### Designing Data-Intensive Applications (Kleppmann)
Links: https://martin.kleppmann.com/2017/03/27/designing-data-intensive-applications.html , https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/
- Teaches the core tradeoffs behind modern data systems: correctness vs latency vs availability, and how designs change under scale and failure.
- Apply by using its chapter-level decision framing when you pick primitives: replication (ch5), partitioning (ch6), transactions (ch7), consensus (ch9), streams (ch11).
- Use it to make architecture discussions precise: name failure modes, consistency guarantees, and operational costs before committing to a datastore/queue/design.

### A Philosophy of Software Design (Ousterhout)
Links: https://web.stanford.edu/~ouster/cgi-bin/book.php , https://web.stanford.edu/~ouster/cgi-bin/aposd2ndEdExtract.pdf
- Teaches "complexity is the enemy" with actionable heuristics: deep modules, information hiding, and avoiding leakage across boundaries.
- Apply by reviewing code for complexity hotspots (special cases, unclear ownership, implicit coupling) and refactoring toward fewer, stronger abstractions.
- Use "deep module" thinking to design APIs: smaller surface area with more capability behind it; move policy and edge cases inward.

### Working Backwards (Bryar, Carr)
Links: https://workingbackwards.com/concepts/working-backwards-pr-faq-process/ , https://workingbackwards.com/resources/working-backwards-pr-faq/
- Teaches a customer-backward planning method: write the Press Release + FAQ to force clarity on the customer outcome and the "why now".
- Apply by using PR/FAQ drafts as a pre-implementation gate: if you cannot explain value, constraints, and FAQs crisply, you are not ready to build.
- Use the FAQ to surface risks early (pricing, abuse, ops, security, edge cases) and convert them into explicit acceptance criteria and launch checks.

### RFC 2119 (Requirements Language)
Links: https://www.rfc-editor.org/rfc/rfc2119 , https://datatracker.ietf.org/doc/html/rfc2119
- Teaches standardized normative language (MUST/SHOULD/MAY) and what conditions justify exceptions.
- Apply in specs/ADRs/runbooks to remove ambiguity: write requirements that can be tested and reviewed, and explicitly mark non-requirements.
- Use it to tighten interface contracts (API error semantics, retries, idempotency): reviewers can spot gaps by looking for unqualified "should" statements.

### OWASP Top 10 (Web App Risk Taxonomy)
Links: https://owasp.org/Top10/2021/A00_2021_Introduction/ , https://cheatsheetseries.owasp.org/IndexTopTen.html
- Teaches a shared vocabulary for the most common classes of application security risk; useful for threat modeling and prioritizing security work.
- Apply by mapping your system to categories and adding controls/tests where you are weak; start with common failure points like Broken Access Control (https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/) and Cryptographic Failures (https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/).
- Use the Cheat Sheet Series index to jump from a category to concrete mitigations (secure session management, authZ patterns, password storage, TLS, input validation) and turn them into engineering checklists.

### OWASP ASVS (Application Security Verification Standard)
Links: https://github.com/OWASP/ASVS , https://wiki.owasp.org/images/d/d4/OWASP_Application_Security_Verification_Standard_4.0-en.pdf
- Teaches a testable security requirements baseline organized by assurance level (L1/L2/L3) across auth, access control, crypto, input handling, logging, and more.
- Apply by selecting an assurance level (default: L2 for most apps) and turning ASVS requirements into backlog items and automated checks in CI/CD.
- Use it as a shared contract for security reviews: trace each control to a verification requirement and record exceptions explicitly (with scope and compensating controls).
