# Change: Add blueprint scaffolding command (yepe)

## Why
Setting up a fresh repository with the full agentic workflow currently requires copying files and instructions by hand. Contributors consistently miss pieces (AGENTS instructions, `.opencode` overlays, workflow commands), so onboarding drifts from the canonical setup. A dedicated one-shot command lets maintainers treat this repo as a blueprint and apply the same structure to any project without manual spelunking.

## What Changes
- Package this repositorys OpenCode assets as **yepe**, a consumable blueprint tool with two invocation methods:
  - **Primary:** `npx @yepe/init` (npm package)
  - **Fallback:** `curl -fsSL https://yepe.dev/install.sh | bash` (shell script for Node-free environments)
- Implement a scaffolding flow that copies `.opencode/`, `AGENTS.md` excerpts, workflows, and starter beads/OpenSpec instructions into the target repo while preserving existing files.
- Add idempotent update handling so teams can re-run the command to pick up upstream blueprint revisions and review diffs before committing.
- Document validation hooks so the command verifies prerequisites (git repo, beads hooks) and reports actionable errors instead of silently failing.

## Impact
- **Affected specs:** `portable-config-bundle` gains explicit requirements for a turnkey blueprint CLI and update workflow.
- **Related beads:** agents-pzm (this change) and agents-7ok (Proposal agent) should cross-reference so the Proposal agent can rely on the scaffolded OpenSpec assets.
- **Affected tooling:** 
  - Publication process for the npm package and shell script
  - Hosting infrastructure for shell script (GitHub Pages or dedicated domain)
  - Release automation for blueprint assets
  - Onboarding documentation under `AGENTS.md` and README snippets
