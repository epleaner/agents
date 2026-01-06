# Changelog

## [0.2.0] - 2026-01-05

### Added
- **Interactive prompts** for project customization
  - Required fields: project name, purpose, beads prefix
  - Optional fields: tech stack, code style, architecture, testing, git workflow, domain, constraints, dependencies
  - Clear labeling of required (*) vs optional fields
  - Graceful re-prompting for missing required fields (no exit)
- **Skill selection** - Choose which external integration skills to include
  - Displays all available skills with descriptions
  - Supports selecting individual skills, all, or none
  - Only copies selected skills to target repository
- **Clean learnings templates** - Copies template-only versions of learnings files
  - No actual entries from blueprint repository
  - Fresh start for each new project
- **Customized configuration files**
  - `openspec/project.md` filled with project details
  - `AGENTS.md` header customized with project name and context

### Changed
- Init flow now downloads blueprint first (needed for skill discovery)
- File staging includes skill filtering logic
- Copy process uses templates for learnings files instead of direct copying
- Simplified welcome message (removed cheesy messaging)
- Improved error handling - validation errors re-prompt instead of exiting

### Technical
- New module: `src/prompts.ts` - Handles all interactive prompts and skill discovery
- New module: `src/learnings-templates.ts` - Template content for learnings files
- Enhanced `stageFiles()` to accept `ProjectInfo` and filter skills
- Enhanced `processDirectory()` to skip unselected skills
- Enhanced `copyFiles()` to use templates for learnings files

## [0.1.0] - 2026-01-05

### Added
- Initial release
- Blueprint scaffolding from agents repository
- Copies AGENTS.md, .opencode/, openspec/, learnings/, bin/
- Conflict detection and reporting
- `.yepe-report.json` output
