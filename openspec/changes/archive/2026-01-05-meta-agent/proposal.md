# Change: Add Meta-Agent for Continuous Improvement

## Why
OpenCode currently lacks a dedicated persona for continuously improving the agent stack, workflows, and instructions. Improvements happen opportunistically, which means recurring friction (missing tools, unclear AGENTS guidance, misaligned todo policies) can persist across sessions without a clear owner. A meta-agent gives us an explicit feedback loop that audits sessions, proposes systemic fixes, and keeps the multi-agent suite aligned with evolving needs.

## What Changes
- Define a Meta-Agent persona (model, permissions, skills) that is empowered to analyze transcripts, beads history, and AGENTS/OpenSpec instructions.
- Document when the Orchestrator summons the Meta-Agent (recurring friction, repeated escalations, instrumentation gaps) and how the Meta-Agent feeds changes back into specs and workflows.
- Extend the codex-multi-agent-suite spec with a normative scenario that captures the continuous-improvement loop and todo/approval expectations before the Meta-Agent can sign off.
- Identify skill catalog updates (e.g., `openspec`, `bd`, `slack-notify`) required for the Meta-Agent to coordinate cross-team feedback and file follow-up proposals.

## Impact
- Affected specs: `codex-multi-agent-suite`
- Affected code/process: agent registry (meta-agent definition), Orchestrator workflow chaining, AGENTS/OpenSpec authoring guidelines, instrumentation/reporting hooks.
