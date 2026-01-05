## 1. Foundations
- [x] 1.1 Document AGENTS.md instructions describing how beads and OpenSpec stay in sync.
- [ ] 1.2 Inventory existing OpenCode configs, skills, and plugins to understand current gaps.

## 2. Configuration Architecture
- [ ] 2.1 Define the shared directory layout for global vs project `.opencode/` assets across macOS and remote devboxes.
- [ ] 2.2 Describe the bootstrap/install process (dotfiles, install script, or `OPENCODE_CONFIG_DIR`).

## 3. Agent + Tooling Suite
- [ ] 3.1 Specify the GPT-5.1 Codex–centric lineup (Orchestrator, Planner, PM, Builder, QA) plus subagents (Researcher, Debugger, Writer, Deploy) with model/temp/tool guidance.
- [ ] 3.2 Capture required skills (Exa, Context7, `fathom-notes`, Jira/Linear, Slack, GitHub, Playwright) and usage notes for Node/TS/Python/React work.
- [ ] 3.3 Describe orchestration patterns (async subagents, todo enforcement), escalation triggers, and permission matrices for skill loading per agent.

## 4. Workflow Commands & Integrations
- [ ] 4.1 Define reusable `/commands` and workflow chains (Planner → Builder → QA → Deploy → PM) that orchestrate subagents/async tasks and update beads todos.
- [ ] 4.2 Document how beads issues reference OpenSpec changes and vice versa, including validation expectations.
- [ ] 4.3 Plan MCP/custom tool integrations for Jira, Linear, Slack, Fathom (meeting notes), and GitHub.

## 5. Oh-My Inspiration Catalog
- [ ] 5.1 Catalogue oh-my-opencode patterns (AST helpers, todo enforcement, notifications, auto-update checks) that inform the bespoke setup.
- [ ] 5.2 Document how each referenced pattern is reimplemented or adapted via custom plugins, commands, or AGENTS instructions.

## 6. Knowledge Graph & Slack Automation
- [ ] 6.1 Design the unified knowledge graph schema (sources, entities, relationships) covering beads, OpenSpec, Slack, Fathom, Jira/Linear, GitHub.
- [ ] 6.2 Define ingestion pipelines and scheduling (who triggers updates, how deduplication works, error handling).
- [ ] 6.3 Specify Slack EOD workflow: channel scope, extraction logic, action-item insertion into todos/beads/knowledge graph, notification format.

## 7. Todo & Action Item Management
- [ ] 7.1 Describe how `todowrite`, beads issues, Slack/Fathom actions, and knowledge-graph nodes stay in sync.
- [ ] 7.2 Outline enforcement hooks (todo enforcer, PM checks) and escalation paths for overdue items.

## 8. Cloud Deployment & Distribution
- [ ] 8.1 Outline how to package and sync the configuration bundle across machines and cloud environments (repo, installer, CI checks).
- [ ] 8.2 Define the cloud deployment workflow (environment overrides, auth management, validation steps, Slack reporting).
- [ ] 8.3 Document validation steps (openspec validate, bd sync, git push, CI pass) before closing beads issues.
