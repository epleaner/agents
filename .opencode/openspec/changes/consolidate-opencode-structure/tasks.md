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
- [x] 3.1 Remove all knowledge graph references from skill.md
- [x] 3.2 Add explicit instruction to write to `.opencode/learnings/` ledgers
- [x] 3.3 Add instruction to make direct edits to agents/skills/AGENTS.md
- [x] 3.4 Update output format to remove knowledge graph section
- [x] 3.5 Update script path reference in skill.md

## 4. Remove Knowledge Graph
- [x] 4.1 Remove `knowledge-graph` skill from `.opencode/skill/`
- [x] 4.2 Remove knowledge-graph references from AGENTS.md
- [x] 4.3 Remove knowledge-graph references from learnings/*.md templates
- [ ] 4.4 Update specs to remove knowledge-graph separation language
- [ ] 4.5 Remove `openspec/specs/knowledge-graph-platform/` spec

## 5. Update Documentation References
- [x] 5.1 Update `AGENTS.md` references from `learnings/` → `.opencode/learnings/`
- [x] 5.2 Update `AGENTS.md` references from `openspec/` → `.opencode/openspec/`
- [x] 5.3 Update `.opencode/openspec/AGENTS.md` internal path references
- [x] 5.4 Update skill/command files referencing old paths
- [ ] 5.5 Update yepe README to document structure

## 6. Validation
- [x] 6.1 Run existing tests (yepe build passes)
- [ ] 6.2 Test yepe init on fresh directory (verify `.opencode/` only structure)
- [ ] 6.3 Test yepe init on directory with existing `.opencode/learnings/` (should preserve)
- [ ] 6.4 Verify agent-driven learnings re-application works
- [ ] 6.5 Verify target repo agents can read all paths correctly
