# Design: Project-Specific Learnings

## Context

User has multiple projects on a personal machine, all using this repo as a blueprint via yepe. Learnings from downstream projects need to flow back to the blueprint repo, but remain organized by project to avoid confusion with framework-level insights.

## Goals / Non-Goals

**Goals:**
- Separate project-specific learnings from blueprint-level learnings
- Prevent ID collisions across projects
- Enable promotion of broadly-applicable learnings to blueprint level

**Non-Goals:**
- Automated sync tooling (git is sufficient)
- Multi-user contribution workflows
- Validation tooling for learnings format

## Directory Structure

```
.opencode/learnings/
├── index.md                        # Global index (includes project entries)
├── meta-learnings.md               # Blueprint-level
├── recurring-tasks.md              # Blueprint-level
├── failures-and-resolutions.md     # Blueprint-level
├── candidate-automations.md        # Blueprint-level
└── projects/
    ├── README.md                   # Explains project learnings workflow
    ├── my-saas-app/
    │   ├── meta-learnings.md
    │   ├── recurring-tasks.md
    │   └── failures-and-resolutions.md
    └── client-website/
        ├── meta-learnings.md
        └── candidate-automations.md
```

## Decisions

### ID Format
Project-prefixed IDs prevent collisions and clarify provenance:
- Blueprint: `ML-20260107-001` (existing format)
- Project: `SAAS-ML-20260107-001` (project prefix + existing format)

Project prefix is uppercase kebab-case derived from folder name:
- `my-saas-app/` → `SAAS-`
- `client-website/` → `CLIENT-`

**Rationale:** Short, memorable prefixes. Full folder names would be verbose.

### Promotion Workflow

When a project learning proves broadly applicable:

1. Copy entry to appropriate blueprint-level ledger
2. Assign new blueprint-level ID (drop project prefix)
3. Add `Promoted from: SAAS-ML-20260107-001` to the new entry
4. Update original project entry status to `promoted`
5. Update index.md for both entries

**Rationale:** Simple copy-and-reference maintains history without complex linking.

### Project Folder Creation

Downstream projects create their folder on first learning:
1. Create `.opencode/learnings/projects/<project-name>/`
2. Copy relevant ledger templates
3. Add entries following project-prefixed ID format

**Rationale:** On-demand creation avoids empty scaffolding.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Stale project folders for abandoned projects | Manual cleanup; low cost |
| Inconsistent prefix conventions | Document in README, rely on convention |
| Index.md becomes unwieldy with many projects | Consider per-project indexes if needed |

## Open Questions

None - keeping this simple for local use.
