## Context
Teams want to treat this repository as a reusable blueprint. Today they either clone-and-copy or manually reimplement `.opencode/` assets, which is error-prone and hard to keep up to date. We need a deterministic command that can be run from within any target repository to fetch and merge the canonical assets.

## Goals / Non-Goals
- **Goals:**
  - Two invocation methods: `npx @yepe/init` (primary) and `curl | bash` (fallback for Node-free environments).
  - Idempotent runs that respect existing local customizations.
  - Explicit reporting of what changed and which files require manual merging.
- **Non-Goals:**
  - Implementing repository-specific overrides (remain manual for now).
  - Replacing existing CI/CD bootstrap scripts beyond documenting how to call this command.

## Decisions
- **Tool name:** The blueprint scaffolding tool is named **yepe**.
- **Distribution medium:** 
  - **Primary:** npm package `@yepe/init` invoked via `npx @yepe/init`
  - **Fallback:** Shell script hosted at a stable URL (e.g., `https://yepe.dev/install.sh`) invoked via `curl -fsSL https://yepe.dev/install.sh | bash`
  - Both methods implement identical logic: download blueprint assets, detect conflicts, stage changes, generate report
- **Script implementation:** The shell script will be a standalone POSIX-compliant script that uses `git`, `curl`/`wget`, and standard Unix tools (no Node.js dependency)
- **Merge strategy:** Use a staging directory (e.g., `.opencode/.yepe-tmp`) to materialize assets, then copy over only missing files while writing `.yepe-report.json` summarizing conflicts for humans to resolve.
- **Validation:** Before copying, ensure the working tree is clean, the repo is initialized, and beads hooks are installed; otherwise exit with remediation instructions.

## Risks / Trade-offs
- **File conflicts:** Repeated runs might overwrite local customizations. Mitigation: prompt + report, never overwrite without explicit opt-in flag, require git clean tree.
- **Package drift:** The blueprint repo may evolve faster than released packages. Mitigation: add release checklist + version pinning instructions in docs.

## Naming Rationale
- **Tool name "yepe":** Short, memorable, and distinct from generic terms like "blueprint" or "scaffold". Easy to type and pronounce.
- **Package name `@yepe/init`:** Follows npm scoped package conventions, clearly indicates initialization purpose, allows for future expansion (e.g., `@yepe/update`, `@yepe/validate`).

## Open Questions
- Do we need to sign releases or verify checksums before applying assets? (Default: yes for shell script, investigate npm package signing.)
- Should the package support multiple blueprint sources or remain tightly coupled to this repository? (Default: single source for now.)
- Where should we host the shell script? (Options: GitHub Pages, dedicated domain `yepe.dev`, GitHub raw URL with version pinning.)
