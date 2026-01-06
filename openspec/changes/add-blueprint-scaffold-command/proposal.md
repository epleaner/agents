# Change: Add blueprint scaffolding command

## Why
Setting up a fresh repository with the full agentic workflow currently requires copying files and instructions by hand. Contributors consistently miss pieces (AGENTS instructions, `.opencode` overlays, workflow commands), so onboarding drifts from the canonical setup. A dedicated one-shot command lets maintainers treat this repo as a blueprint and apply the same structure to any project without manual spelunking.

## What Changes
- Package this repositorys OpenCode assets as a consumable blueprint that can be invoked from any repo via a single command (e.g., `npx` or `curl | bash`).
- Implement a scaffolding flow that copies `.opencode/`, `AGENTS.md` excerpts, workflows, and starter beads/OpenSpec instructions into the target repo while preserving existing files.
- Add idempotent update handling so teams can re-run the command to pick up upstream blueprint revisions and review diffs before committing.
- Document validation hooks so the command verifies prerequisites (git repo, beads hooks, Node version) and reports actionable errors instead of silently failing.

## Impact
- **Affected specs:** `portable-config-bundle` gains explicit requirements for a turnkey blueprint CLI and update workflow.
- **Related beads:** agents-pzm (this change) and agents-7ok (Proposal agent) should cross-reference so the Proposal agent can rely on the scaffolded OpenSpec assets.
- **Affected tooling:** Publication process for the CLI package, release automation for blueprint assets, onboarding documentation under `AGENTS.md` and README snippets.
