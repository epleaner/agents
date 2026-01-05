## ADDED Requirements

### Requirement: Portable OpenCode Configuration Bundle
The OpenCode setup SHALL include a version-controlled configuration bundle (global config, agents, skills, commands, plugins, AGENTS.md templates) that can be replicated on macOS laptops, remote devboxes, and cloud deployments without manual edits.

#### Scenario: Bootstrap a new environment
- **WHEN** a contributor provisions a fresh workstation or remote devbox
- **THEN** they run the documented bootstrap (dotfiles repo, installer, or `OPENCODE_CONFIG_DIR` override)
- **AND** the process places the shared `.opencode/` assets and `~/.config/opencode/` contents, including AGENTS instructions for beads/OpenSpec usage, without manual tweaks.

#### Scenario: Apply bundle to a new repository
- **WHEN** a contributor clones any project that expects the shared OpenCode configuration
- **THEN** the repo provides an `AGENTS.md` excerpt explaining how to pull the central bundle and merge project-specific overrides
- **AND** the contributor can re-run the bootstrap to sync updates without overwriting local project instructions or breaking beads/OpenSpec workflows.
