## 1. Implementation
- [ ] 1.1 Build the packaging pipeline for `.opencode/` bundles with environment overrides and validation.
- [ ] 1.2 Automate remote deployment (devboxes, containers, CI runners) with health checks and rollback steps.
- [ ] 1.3 Emit Slack/beads/OpenSpec updates summarizing deployment status and logs.
- [ ] 1.4 Implement drift detection comparing local vs remote agent definitions and skills.
- [ ] 1.5 Exercise the workflow on a test environment to verify drift detection and rollback behavior.

## 2. Spec Detailing
- [ ] Outline how to package and sync the `.opencode/` configuration bundle across machines and cloud environments (repo, installer, CI checks).
- [ ] Define the cloud deployment workflow (environment overrides, auth management, validation steps, Slack reporting) executed by the Release agent.
- [ ] Document validation gates before closing beads issues (openspec validate, bd sync, git push, CI pass, remote verification).
