## MODIFIED Requirements

### Requirement: Blueprint Structure
The portable config bundle SHALL be contained entirely within a single `.opencode/` directory at the repository root.

#### Scenario: Single directory footprint
- **WHEN** yepe scaffolds a target repository
- **THEN** all files are created under `.opencode/`
- **AND** no files are created outside `.opencode/`

#### Scenario: Consolidated directories
- **WHEN** the bundle includes openspec and learnings
- **THEN** they are placed at `.opencode/openspec/` and `.opencode/learnings/`
- **AND** the main `AGENTS.md` is placed at `.opencode/AGENTS.md`

### Requirement: Learnings Preservation
The blueprint installer SHALL preserve existing learnings entries when re-scaffolding a repository.

#### Scenario: Existing learnings preserved
- **WHEN** yepe init runs on a repo with populated `.opencode/learnings/`
- **THEN** the existing learnings files are not overwritten
- **AND** only missing template files are created

#### Scenario: Empty learnings replaced
- **WHEN** yepe init runs on a repo with empty learnings (template only)
- **THEN** the learnings files may be replaced with updated templates

### Requirement: Agent-Driven Learnings Re-Application
The blueprint installer SHALL invoke an agent to re-apply promoted learnings after updating base config.

#### Scenario: Learnings re-applied after scaffold
- **WHEN** yepe init completes scaffolding
- **AND** `.opencode/learnings/` contains entries with `Status: promoted`
- **THEN** yepe invokes an agent to read the promoted entries
- **AND** the agent re-applies each entry's `Recommended Action` to the file(s) in `Follow-up Links`

#### Scenario: No promoted entries
- **WHEN** yepe init completes
- **AND** no learnings have `Status: promoted`
- **THEN** no agent is invoked for re-application

#### Scenario: Learnings preserved during update
- **WHEN** yepe init runs on a repo with existing learnings
- **THEN** `.opencode/learnings/` is not overwritten
- **AND** all entries remain intact for re-application

### Requirement: Custom Config Preservation
The blueprint installer SHALL preserve custom agents, skills, and commands when updating base config.

#### Scenario: Custom agent preserved
- **WHEN** yepe init runs on a repo with custom agents in `.opencode/agent/`
- **THEN** custom agent files are not overwritten or removed
- **AND** base agent files are updated to latest versions

#### Scenario: Custom skill preserved
- **WHEN** yepe init runs on a repo with custom skills in `.opencode/skill/`
- **THEN** custom skill directories are not overwritten or removed
- **AND** base skill directories are updated to latest versions

#### Scenario: Base file identification
- **WHEN** yepe init runs
- **THEN** base files are identified via `.opencode/.yepe-manifest.json`
- **AND** files not in manifest are treated as custom

## ADDED Requirements

### Requirement: Self-Improve Writes to Learnings
The self-improve skill SHALL write session insights to `.opencode/learnings/` ledgers and make direct edits.

#### Scenario: Meta-learning captured
- **WHEN** self-improve identifies a workflow improvement
- **THEN** an entry is created in `.opencode/learnings/meta-learnings.md`
- **AND** the entry follows the ledger template format
- **AND** the entry is indexed in `.opencode/learnings/index.md`
- **AND** direct edits are made to relevant agents/skills/AGENTS.md

#### Scenario: Failure captured
- **WHEN** self-improve identifies a significant failure and resolution
- **THEN** an entry is created in `.opencode/learnings/failures-and-resolutions.md`
- **AND** direct edits are made to prevent recurrence

#### Scenario: Learnings as source of truth
- **WHEN** self-improve runs
- **THEN** learnings are the single source of truth for meta-insights
