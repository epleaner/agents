## 1. Implementation
- [ ] 1.1 Package the shared `.opencode/` assets (config, agents, skills, commands, plugins, AGENTS templates).
- [ ] 1.2 Document bootstrap steps for macOS laptops, remote devboxes, and CI/cloud runners.
- [ ] 1.3 Provide repo-level instructions/AGENTS excerpts for pulling the central bundle with overrides.
- [ ] 1.4 Implement update tooling so contributors can re-sync without overwriting local adjustments.
- [ ] 1.5 Verify by bootstrapping a fresh workstation and applying the bundle to a sample repository.

## 2. Spec Detailing
- [ ] Inventory existing OpenCode configs, skills, and plugins to understand current gaps.
- [ ] Define the shared directory layout for global vs project `.opencode/` assets across macOS laptops, remote devboxes, and cloud instances.
- [ ] Document the bootstrap/install process (dotfiles repo, installer, or `OPENCODE_CONFIG_DIR`) including how AGENTS instructions are applied per repo.
