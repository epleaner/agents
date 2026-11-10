## 1. Implementation
- [ ] 1.1 Wire Slack EOD digests that summarize channel activity with bead/change references and owners.
- [ ] 1.2 Connect `todowrite`, beads, and Slack/Fathom inputs into a single schema for my action items.
- [ ] 1.3 Implement creation/update hooks that attach owners, due dates, and governing change IDs when those external workflows emit action items.
- [ ] 1.4 Build enforcement automation (todo enforcer, PM checks) for overdue personal items and Slack escalations.
- [ ] 1.5 Sync Jira/Linear tickets whenever beads or OpenSpec milestones change.
- [ ] 1.6 Broadcast QA and Release outcomes to Slack (and other channels) with PR/CI links.
- [ ] 1.7 Validate by running a mock build cycle and walking one personal action item from capture through escalation and completion while verifying every system stays consistent.

## 2. Spec Detailing
- [ ] Specify the Slack EOD digest workflow (channel scope, extraction logic, action-item insertion into todos/beads, notification format).
- [ ] Describe how my action items sourced from Slack/Fathom/todowrite stay in sync with beads records and change IDs.
- [ ] Outline enforcement hooks (todo enforcer, PM checks) and escalation paths for overdue items, including Slack notifications back to me.
- [ ] Document how Jira and Linear updates remain in sync with beads/OpenSpec status (fields, labels, automation hooks).
- [ ] Define how QA/Release broadcast build/deploy outcomes to Slack/GitHub.
