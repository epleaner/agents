## ADDED Requirements

### Requirement: yepe Pull Command
The yepe tool SHALL provide a `pull` command that updates an existing project's blueprint assets without running the onboarding flow.

#### Scenario: Update existing project
- **WHEN** user runs `npx @yepe/pull` in a project with existing `.opencode/openspec/project.md`
- **THEN** yepe downloads latest blueprint, stages files, copies non-conflicting files, and re-applies learnings
- **AND** no prompts are shown for project name, description, or beads prefix

#### Scenario: Pull on uninitialized project
- **WHEN** user runs `npx @yepe/pull` in a project without `.opencode/openspec/project.md`
- **THEN** yepe exits with error code 1
- **AND** error message instructs user to run `npx @yepe/init` first

#### Scenario: Pull with conflicts
- **WHEN** user runs `npx @yepe/pull` and blueprint files conflict with local changes
- **THEN** yepe generates `.yepe-report.json` listing conflicts
- **AND** non-conflicting files are updated
- **AND** user is instructed to resolve conflicts manually

### Requirement: Smart Project Detection
The yepe `init` command SHALL auto-detect project metadata from common project files and offer detected values as defaults during onboarding.

#### Scenario: Detect from package.json
- **WHEN** user runs `npx @yepe/init` in a directory with `package.json`
- **THEN** yepe reads `name` and `description` fields
- **AND** offers them as defaults in interactive prompts
- **AND** uses them automatically in non-interactive mode (if not overridden by config)

#### Scenario: Detect from Cargo.toml
- **WHEN** user runs `npx @yepe/init` in a Rust project with `Cargo.toml`
- **THEN** yepe reads `[package] name` and `[package] description`
- **AND** offers them as defaults in interactive prompts

#### Scenario: Detect from pyproject.toml
- **WHEN** user runs `npx @yepe/init` in a Python project with `pyproject.toml`
- **THEN** yepe reads `[project] name` and `[project] description` (or `[tool.poetry]` equivalents)
- **AND** offers them as defaults in interactive prompts

#### Scenario: Fallback to directory name
- **WHEN** user runs `npx @yepe/init` in a directory without recognized project files
- **THEN** yepe uses directory name as default project name
- **AND** generates description as "{name} project"

#### Scenario: Override detected values
- **WHEN** user is prompted with detected defaults in interactive mode
- **THEN** user can type a different value to override detection
- **AND** pressing Enter accepts the detected default

#### Scenario: Detection in non-interactive mode
- **WHEN** user runs `npx @yepe/init --non-interactive` without `--config`
- **THEN** yepe uses detected values for all fields
- **AND** falls back to directory-based defaults if detection fails

#### Scenario: Config overrides detection
- **WHEN** user runs `npx @yepe/init --non-interactive --config yepe.config.json`
- **THEN** config file values take precedence over detected values
- **AND** detected values are used for fields omitted from config

### Requirement: Tech Stack Detection
The yepe `init` command SHALL detect common frameworks and libraries from project dependencies to enhance project description.

#### Scenario: Detect Node.js frameworks
- **WHEN** user runs `npx @yepe/init` in a project with `package.json` containing React, Express, or Next.js
- **THEN** yepe identifies these frameworks from `dependencies` or `devDependencies`
- **AND** includes them in suggested description or tech stack context

#### Scenario: Detect Rust frameworks
- **WHEN** user runs `npx @yepe/init` in a Rust project with tokio, actix-web, or axum in `Cargo.toml`
- **THEN** yepe identifies these frameworks from `[dependencies]`
- **AND** includes them in suggested tech stack context

#### Scenario: Detect Python frameworks
- **WHEN** user runs `npx @yepe/init` in a Python project with FastAPI, Django, or Flask in `pyproject.toml`
- **THEN** yepe identifies these frameworks from dependencies
- **AND** includes them in suggested tech stack context

## MODIFIED Requirements

### Requirement: Blueprint Scaffolding Command (yepe)
The OpenCode blueprint SHALL provide a command-line tool named **yepe** with two subcommands:
- `init` - Full onboarding flow for new projects (with smart detection)
- `pull` - Update existing projects without onboarding

The tool SHALL support two invocation methods:
- **Primary:** `npx @yepe/init` or `npx @yepe/pull` (requires Node.js/npm)
- **Fallback:** `curl -fsSL https://yepe.dev/install.sh | bash` (POSIX shell script, no Node.js dependency)

Both methods SHALL copy `.opencode/` assets from the blueprint repository into the target repository while preserving existing files and learnings.

#### Scenario: Initialize new project with detection
- **WHEN** a contributor runs `npx @yepe/init` in a new repository with existing project files
- **THEN** yepe detects project metadata from package.json, Cargo.toml, or pyproject.toml
- **AND** prompts for project name, description, and beads prefix with detected defaults
- **AND** copies blueprint assets to `.opencode/`
- **AND** generates customized `project.md` and `AGENTS.md` header

#### Scenario: Update existing project
- **WHEN** a contributor runs `npx @yepe/pull` in a repository with existing `.opencode/` setup
- **THEN** yepe downloads latest blueprint assets
- **AND** copies non-conflicting files without prompting
- **AND** re-applies promoted learnings to preserve customizations
- **AND** generates `.yepe-report.json` listing any conflicts

#### Scenario: Backward compatibility
- **WHEN** a contributor runs `npx @yepe/init` without specifying a subcommand
- **THEN** yepe defaults to `init` behavior (full onboarding)
- **AND** existing scripts and documentation continue to work

#### Scenario: Non-interactive init with detection
- **WHEN** a contributor runs `npx @yepe/init --non-interactive` in a project with package.json
- **THEN** yepe uses detected values from package.json
- **AND** completes setup without prompts
- **AND** generates `.yepe-report.json`

#### Scenario: Shell script invocation
- **WHEN** a contributor runs `curl -fsSL https://yepe.dev/install.sh | bash`
- **THEN** the shell script provides equivalent functionality to npm package
- **AND** supports both `init` and `pull` modes (via script arguments or prompts)
- **AND** it emits a `yepe-report` (stdout + JSON artifact) that enumerates conflicts requiring manual merges.
