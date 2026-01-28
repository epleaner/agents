# Change: Add External Workflow Integration Capability

## Why
OpenCode’s integrations with Slack, Jira, Linear, Fathom, and GitHub need their own specification so we can evolve automation, mappings, and notifications without touching unrelated capabilities. Today the expectations are buried inside plan-opencode-setup, which makes ownership unclear. My own action items spill out of these same external workflows, so combining the action-item-management change here keeps personal commitments, escalations, and external broadcasts aligned with one backbone.

## What Changes
- Describe how Slack EOD digests, Jira/Linear syncs, and release broadcasts capture action items and decisions with bead/change references.
- Specify how my action items created from Slack/Fathom inputs flow into todowrite/beads, preserve owners and due dates.
- Set expectations for broadcast content (owners, links, due dates) so downstream stakeholders can trace outcomes.

## Impact
- Affected specs: `external-workflow-integration`
- Affected code/process: Slack automations, Jira/Linear mirrors, GitHub notifications.
