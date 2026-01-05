## ADDED Requirements

### Requirement: Action Item Management
The OpenCode setup SHALL maintain a synchronized action-item system that spans `todowrite`, beads issues, Slack/Fathom-derived tasks, and knowledge-graph nodes so no commitment is lost.

#### Scenario: Track action items end-to-end
- **WHEN** an action is created (from Planner clarifications, Slack EOD, Fathom transcript, QA gate, or Deploy/CI feedback)
- **THEN** it is inserted into the shared todo system with references to beads/change IDs, assigned owners, and due dates
- **AND** the todo enforcer plus PM workflows ensure the item is either completed or explicitly re-triaged before session completion.

### Requirement: Enforcement and Escalation
The action-item system SHALL provide automated enforcement hooks (todo enforcer, PM checks) and escalation rules for overdue items that ping the responsible agent via Slack and update beads status labels.

#### Scenario: Escalate overdue action
- **WHEN** an action item exceeds its due date without completion
- **THEN** the PM agent is prompted to escalate (Slack mention, beads comment), update the knowledge graph, and renegotiate scope or owners so intent remains aligned with OpenSpec requirements.
