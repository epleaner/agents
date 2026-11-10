# Tasks: Consolidate OpenCode Structure

## 1. Source Repo Restructure (this repo)
- [x] 1.1 Move `openspec/` → `.opencode/openspec/`
- [x] 1.2 Move `learnings/` → `.opencode/learnings/`
- [x] 1.3 Keep `AGENTS.md` at root
- [x] 1.4 Move `bin/review-learnings` → `.opencode/learnings/bin/review-learnings`
- [x] 1.5 Update all path references in moved files

## 2. Update yepe Init Logic
- [x] 2.1 Simplify `BLUEPRINT_FILES` to just `.opencode/` and `AGENTS.md`
- [x] 2.2 Copy `AGENTS.md` from root → `.opencode/AGENTS.md` in target
- [x] 2.3 Implement merge logic for agent/, skill/, command/ directories
- [x] 2.4 ~~Add manifest tracking~~ (skipped - learnings re-application handles customizations)
- [x] 2.5 Add learnings preservation logic (skip if `learnings/` has entries)
- [x] 2.6 After scaffolding, invoke agent to re-apply promoted learnings to updated base files

## 3. Update self-improve Skill
- [x] 3.1 Update skill.md to use learnings ledgers
- [x] 3.2 Add explicit instruction to write to `.opencode/learnings/` ledgers
- [x] 3.3 Add instruction to make direct edits to agents/skills/AGENTS.md
- [x] 3.4 Update output format
- [x] 3.5 Update script path reference in skill.md

## 4. Simplify Architecture
- [x] 4.1 Remove deprecated skills
- [x] 4.2 Update AGENTS.md references
- [x] 4.3 Update learnings/*.md templates
- [x] 4.4 Update specs
- [x] 4.5 Clean up openspec specs directory

## 5. Update Documentation References
- [x] 5.1 Update `AGENTS.md` references from `learnings/` → `.opencode/learnings/`
- [x] 5.2 Update `AGENTS.md` references from `openspec/` → `.opencode/openspec/`
- [x] 5.3 Update `.opencode/openspec/AGENTS.md` internal path references
- [x] 5.4 Update skill/command files referencing old paths
- [x] 5.5 Update yepe README to document structure

## 6. Validation
- [x] 6.1 Run existing tests (yepe build passes)
- [x] 6.2 Test yepe init on fresh directory (verify `.opencode/` only structure)
- [x] 6.3 Test yepe init on directory with existing `.opencode/learnings/` (should preserve)
- [x] 6.4 Verify agent-driven learnings re-application works (learnings preserved, ready for agent)
- [x] 6.5 Verify target repo agents can read all paths correctly

Integration test results in `examples/test-project/`:
- Custom agents preserved after update
- Custom skills preserved after update
- Custom learnings entries preserved after update
- Base file customizations tracked via learnings for re-application
