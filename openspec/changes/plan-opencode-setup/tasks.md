## 1. Foundations
- [x] 1.1 Document AGENTS.md instructions describing how beads and OpenSpec stay in sync.
- [ ] 1.2 Inventory existing OpenCode configs, skills, and plugins to understand current gaps.

## 2. Configuration Architecture
- [ ] 2.1 Define the shared directory layout for global vs project `.opencode/` assets across macOS and remote devboxes.
- [ ] 2.2 Describe the bootstrap/install process (dotfiles, install script, or `OPENCODE_CONFIG_DIR`).

## 3. Agent + Tooling Suite
- [ ] 3.1 Specify the Claude-based agent lineup (build, plan, researcher, debugger, task-manager, docs) with temperature/tool access guidance.
- [ ] 3.2 Capture required skills, commands, and Playwright/Exa usage notes for Node/TS/Python/React work.

## 4. Integrations
- [ ] 4.1 Document how beads issues reference OpenSpec changes and vice versa, including validation expectations.
- [ ] 4.2 Plan MCP/custom tool integrations for Jira, Linear, Slack, Fathom, and GitHub.

## 5. Distribution & Maintenance
- [ ] 5.1 Outline how to package and sync the configuration bundle across machines (repo, installer, CI checks).
- [ ] 5.2 Define validation steps (openspec validate, bd sync, git push) before closing beads issues.
