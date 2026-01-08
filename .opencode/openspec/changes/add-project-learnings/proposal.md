# Change: Add Project-Specific Learnings Backpropagation

## Why

Users with multiple downstream projects using this blueprint need a way to capture domain-specific learnings (business logic, integrations, deployment quirks) separately from blueprint-level improvements. Currently all learnings go into a flat structure, making it unclear which insights apply globally vs. to specific projects.

## What Changes

- Add `projects/` subdirectory under `.opencode/learnings/` for project-specific ledgers
- Introduce project-prefixed entry IDs to prevent collisions (e.g., `SAAS-ML-20260107-001`)
- Define promotion workflow for learnings that prove broadly applicable
- Update index.md to include project-specific entries

## Impact

- Affected specs: none (workflow-only change)
- Affected code: `.opencode/learnings/` structure, `self-improve` skill documentation
- Breaking changes: none

## Success Criteria

1. Downstream projects can write learnings to `projects/<project-name>/` folders in the blueprint repo
2. Project-prefixed IDs are documented and enforced by convention
3. Promotion workflow from project → blueprint is clear and documented
4. Existing blueprint-level learnings remain in their current locations

## Out of Scope

- Automated sync tooling (manual git workflow is sufficient)
- Open source contribution workflows (this is local-only)
- CI/CD validation of learnings format
