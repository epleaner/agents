## ADDED Requirements

### Requirement: Portable OpenCode Configuration Bundle
The OpenCode setup SHALL include a version-controlled configuration bundle (global config, agents, skills, commands, plugins, AGENTS.md templates) that can be replicated on macOS laptops, remote devboxes, and cloud deployments without manual edits. It SHALL support service- or repo-specific overlays so existing monorepos can adopt the bundle incrementally—either inside a service directory or via a detached config repository—without affecting neighboring services. New projects SHALL scaffold per-project `.opencode/` overlays that inherit from the shared bundle and can safely pull upstream updates while preserving local AGENTS instructions and skills.

#### Scenario: Bootstrap a new environment
- **WHEN** a contributor provisions a fresh workstation or remote devbox
- **THEN** they run the documented bootstrap (dotfiles repo, installer, or `OPENCODE_CONFIG_DIR` override)
- **AND** the process places the shared `.opencode/` assets and `~/.config/opencode/` contents, including AGENTS instructions for beads/OpenSpec usage, without manual tweaks.

#### Scenario: Apply bundle to a new repository
- **WHEN** a contributor clones any project that expects the shared OpenCode configuration
- **THEN** the repo provides an `AGENTS.md` excerpt explaining how to pull the central bundle and merge project-specific overrides
- **AND** the contributor can re-run the bootstrap to sync updates without overwriting local project instructions or breaking beads/OpenSpec workflows.

#### Scenario: Apply bundle within a monorepo service
- **WHEN** a contributor works inside a monorepo where only one service uses OpenCode
- **THEN** the documented workflow supports pointing that service (or a sibling config repo) at the shared bundle with service-specific overrides and AGENTS instructions
- **AND** other services remain unaffected because overlays are scoped to that service’s workspace.

#### Scenario: Bootstrap a greenfield project with shared updates
- **WHEN** a new project is initialized from scratch
- **THEN** the scaffolding creates a project-specific `.opencode/` overlay (or config repo) linked to the shared bundle
- **AND** maintainers can pull future bundle updates, review diffs, and reapply them without losing project-specific agent instructions or workflows.
