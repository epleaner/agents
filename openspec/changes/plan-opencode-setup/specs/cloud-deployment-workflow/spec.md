## ADDED Requirements

### Requirement: Cloud Deployment Workflow
The OpenCode setup SHALL support packaging and deploying the `.opencode/` configuration bundle to managed cloud environments (remote devboxes, containers, or CI runners) with automated validation and rollback guidance.

#### Scenario: Provision and deploy to cloud
- **WHEN** Deploy agent executes the cloud deployment workflow
- **THEN** it packages the bundle, validates configs via CI, applies environment-specific overrides (secrets, auth providers), and confirms the remote instance runs `opencode` with all agents/skills active
- **AND** deployment status plus build logs are posted back to Slack and recorded in beads/OpenSpec for traceability.

### Requirement: Environment Drift Detection
The deployment tooling SHALL detect configuration drift between local and cloud installs (e.g., missing skills, outdated agents) and prompt remediation steps before closing beads issues.

#### Scenario: Detect mismatch
- **WHEN** validation finds that a cloud instance lacks the latest agent definitions
- **THEN** Deploy agent blocks completion, alerts PM/Orchestrator, and provides instructions (or automated fixes) so the environment aligns with the approved OpenSpec change.
