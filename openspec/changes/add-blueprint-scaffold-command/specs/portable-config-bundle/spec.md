## ADDED Requirements
### Requirement: Blueprint Scaffolding Command (yepe)
The portable configuration bundle SHALL expose two documented invocation methods that clone the canonical `.opencode/`, `AGENTS.md`, workflow commands, and skill templates from this repo into the callers repository without manual file fishing:
- **Primary:** `npx @yepe/init` (requires Node.js/npm)
- **Fallback:** `curl -fsSL https://yepe.dev/install.sh | bash` (POSIX shell script, no Node.js dependency)

#### Scenario: Fresh repo bootstrap
- **WHEN** a contributor runs the blueprint command inside a git-initialized repo without existing `.opencode/` assets
- **THEN** the command copies the canonical overlay, AGENTS excerpts, and workflow commands into the repo
- **AND** it prints a summary of the files created plus next steps for enabling beads/OpenSpec hooks.

#### Scenario: Prerequisite enforcement
- **WHEN** the command detects missing prerequisites (git repo, clean working tree, required system tools)
- **THEN** it aborts with non-zero exit and actionable remediation instructions instead of leaving the repo half-configured.

#### Scenario: Shell script fallback
- **WHEN** a contributor runs the shell script in an environment without Node.js
- **THEN** the script performs the same scaffolding operations as the npm package using only POSIX-compliant shell commands and standard Unix tools (git, curl/wget)
- **AND** it produces identical output and reports as the npm package version.

### Requirement: Idempotent Blueprint Updates
The blueprint command SHALL support re-running inside a repo to pull upstream blueprint changes without overwriting local modifications by default. It SHALL stage updates in a temp directory, surface conflicts, and record a machine-readable report so maintainers can review diffs before committing.

#### Scenario: Safe re-run
- **WHEN** the command detects existing `.opencode/` or AGENTS files
- **THEN** it writes incoming files to a temp staging area, compares against the working tree, and only copies non-conflicting additions automatically
- **AND** it emits a `yepe-report` (stdout + JSON artifact) that enumerates conflicts requiring manual merges.

#### Scenario: Drift reporting
- **WHEN** upstream blueprint assets change between runs
- **THEN** the command prints which files changed, the blueprint version/tag applied, and how to accept or reject each diff so teams can keep their overlays synchronized.
