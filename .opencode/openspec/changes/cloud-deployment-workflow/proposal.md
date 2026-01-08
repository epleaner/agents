# Change: Add Cloud Deployment Workflow

## Why
We need a dedicated spec describing how the `.opencode/` bundle is packaged, validated, and deployed to remote environments. Keeping these requirements inside plan-opencode-setup makes it difficult to iterate on deployment tooling or drift detection independently.

## What Changes
- Define the end-to-end cloud deployment workflow, including packaging, validation, environment overrides, and rollback guidance.
- Capture requirements for posting deployment status to Slack and recording outputs in beads/OpenSpec artifacts.
- Introduce drift-detection expectations so remote installs stay aligned with the approved configuration.

## Impact
- Affected specs: `cloud-deployment-workflow`
- Affected code/process: Release automation, CI packaging scripts, Slack notifications, drift detection tooling.
