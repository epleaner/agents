## Context
Teams want to treat this repository as a reusable blueprint. Today they either clone-and-copy or manually reimplement `.opencode/` assets, which is error-prone and hard to keep up to date. We need a deterministic command that can be run from within any target repository to fetch and merge the canonical assets.

## Goals / Non-Goals
- **Goals:**
  - Single command (`npx` preferred) that installs or updates the blueprint overlay.
  - Idempotent runs that respect existing local customizations.
  - Explicit reporting of what changed and which files require manual merging.
- **Non-Goals:**
  - Implementing repository-specific overrides (remain manual for now).
  - Replacing existing CI/CD bootstrap scripts beyond documenting how to call this command.

## Decisions
- **Distribution medium:** Publish a small npm package that bundles the blueprint assets or downloads them from a tagged release. `npx @opencode/blueprint@latest apply` becomes the canonical entry point.
- **Merge strategy:** Use a staging directory (e.g., `.opencode/.blueprint-tmp`) to materialize assets, then copy over only missing files while writing `.blueprint-report.json` summarizing conflicts for humans to resolve.
- **Validation:** Before copying, ensure the working tree is clean, the repo is initialized, and beads hooks are installed; otherwise exit with remediation instructions.

## Risks / Trade-offs
- **File conflicts:** Repeated runs might overwrite local customizations. Mitigation: prompt + report, never overwrite without explicit opt-in flag, require git clean tree.
- **Package drift:** The blueprint repo may evolve faster than released packages. Mitigation: add release checklist + version pinning instructions in docs.

## Open Questions
- Should we also ship a `curl | bash` fallback for environments without Node? (Default: optional follow-up.)
- Do we need to sign releases or verify checksums before applying assets? (Investigate if required by security.)
