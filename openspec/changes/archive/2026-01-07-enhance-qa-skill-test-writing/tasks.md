# Tasks: Enhance QA Skill with Test-Writing Capabilities

## Rationale

The qa skill currently only validates code quality but doesn't guide test creation. This gap means builders lack structured guidance when writing tests. This enhancement follows a layered approach:

1. **Philosophy first** - Establish testing principles (Testing Trophy, behavior-driven)
2. **Framework detection** - Respect existing tools before recommending new ones
3. **Language-specific patterns** - Provide concrete examples for TypeScript/Python/Shell
4. **Workflow integration** - Guide builders to write tests during implementation
5. **Quality standards** - Document assertion best practices

This approach balances theoretical foundation with practical application, ensuring builders understand both "why" and "how" to write effective tests.

## Assumptions

- Projects may have existing test frameworks (detect before recommending)
- Spec requirements are available (drive test coverage strategy)
- Builders need examples more than theory (include code snippets)
- Testing alongside implementation is more sustainable than after-the-fact testing

## Tasks

1. Add Test-Writing Philosophy Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add new section after frontmatter: `## Test-Writing Philosophy`
- Document Testing Trophy (focus on integration tests)
- Emphasize behavior over implementation testing
- Explain clear assertion practices
- Position before existing validation sections

**Validation**:
```bash
# Verify section exists and is positioned correctly
grep -A 20 "## Test-Writing Philosophy" .opencode/skill/qa/skill.md

# Ensure it appears before validation content
grep -n "## What I do\|## Test-Writing Philosophy" .opencode/skill/qa/skill.md
```

**Dependencies**: None

---

2. Add Framework Detection and Standards Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add section: `## Framework Detection and Standards`
- TypeScript: Check for vitest.config.ts/jest.config.js → recommend Vitest + Testing Library
- Python: Check for pytest.ini/pyproject.toml → recommend pytest
- Shell: Check for tests/*.bats → recommend bats-core
- Document detection commands and recommended defaults

**Validation**:
```bash
# Verify framework detection patterns are documented
grep -A 10 "Framework Detection" .opencode/skill/qa/skill.md | grep -E "(vitest|pytest|bats)"

# Ensure all three languages covered
grep -E "(TypeScript|Python|Shell)" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 1 (philosophy provides context)

---

3. Add TypeScript Test Generation Patterns

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add section: `## TypeScript Test Patterns`
- Vitest + React/Solid Testing Library examples
- Test component rendering and user interactions
- Mock at network level (MSW patterns)
- Avoid testing implementation details
- Include real code snippets (example component test)

**Validation**:
```bash
# Verify TypeScript patterns exist
grep -A 30 "## TypeScript Test Patterns" .opencode/skill/qa/skill.md

# Check for Testing Library best practices
grep -E "(render|screen|userEvent|waitFor)" .opencode/skill/qa/skill.md

# Ensure mock guidance included
grep -i "mock" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 2 (framework detection determines patterns)

---

4. Add Python Test Generation Patterns

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add section: `## Python Test Patterns`
- pytest fixtures and parameterization examples
- Integration tests with test databases
- HTTP client mocking patterns
- Assertion best practices for Python
- Include real code snippets (example API test)

**Validation**:
```bash
# Verify Python patterns exist
grep -A 30 "## Python Test Patterns" .opencode/skill/qa/skill.md

# Check for pytest-specific patterns
grep -E "(fixture|parametrize|pytest)" .opencode/skill/qa/skill.md

# Ensure integration test guidance included
grep -i "integration" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 2 (framework detection determines patterns)

---

5. Add Shell Test Generation Patterns

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add section: `## Shell Test Patterns`
- bats-core test structure and conventions
- Test exit codes, stdout/stderr, side effects
- Mock external commands and file system
- Include real code snippets (example bash script test)

**Validation**:
```bash
# Verify Shell patterns exist
grep -A 20 "## Shell Test Patterns" .opencode/skill/qa/skill.md

# Check for bats-core patterns
grep -E "(bats|@test)" .opencode/skill/qa/skill.md

# Ensure exit code and output testing covered
grep -E "(exit|status|output)" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 2 (framework detection determines patterns)

---

6. Add Test Generation Workflow for Builder

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add section: `## Test Generation Workflow`
- When to write tests (during implementation, not after)
- How to identify test cases from spec requirements
- Coverage strategy: test all spec requirements and critical scenarios
- Integration with builder agent workflow
- Update usage template to include test-writing scope

**Validation**:
```bash
# Verify workflow section exists
grep -A 15 "## Test Generation Workflow" .opencode/skill/qa/skill.md

# Check for spec-driven testing guidance
grep -i "spec\|requirement" .opencode/skill/qa/skill.md

# Ensure builder integration documented
grep -i "builder" .opencode/skill/qa/skill.md

# Verify usage template updated
grep -A 10 "## Usage Template" .opencode/skill/qa/skill.md | grep -i "test"
```

**Dependencies**: Tasks 3, 4, 5 (patterns inform workflow)

---

7. Add Assertion Best Practices Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add section: `## Assertion Best Practices`
- Descriptive test names (behavior, not implementation)
- Informative assertion messages
- Single logical assertion per test
- Avoid testing framework internals
- Examples of good vs bad assertions

**Validation**:
```bash
# Verify assertions section exists
grep -A 20 "## Assertion Best Practices" .opencode/skill/qa/skill.md

# Check for good/bad examples
grep -E "(Good|Bad|✓|✗)" .opencode/skill/qa/skill.md

# Ensure descriptive naming covered
grep -i "descriptive\|naming" .opencode/skill/qa/skill.md
```

**Dependencies**: Tasks 3, 4, 5 (patterns provide context for assertions)

---

8. Add Framework-Specific Validation Commands

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Update section: `## Commands Reference`
- Add TypeScript test commands: `npm run test`, `npx vitest`, `npx vitest --coverage`
- Add Python test commands: `pytest`, `pytest -v`, `pytest --cov`
- Add Shell test commands: `bats tests/`, `bats tests/*.bats`
- Add watch mode commands for each framework

**Validation**:
```bash
# Verify commands section updated
grep -A 30 "## Commands Reference" .opencode/skill/qa/skill.md

# Check for all framework commands
grep -E "(vitest|pytest|bats)" .opencode/skill/qa/skill.md

# Ensure coverage commands included
grep -i "coverage\|cov" .opencode/skill/qa/skill.md
```

**Dependencies**: Tasks 3, 4, 5 (patterns inform commands)

---

9. Update Skill Description and Usage Template

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Update frontmatter description to include test-writing
- Update `## What I do` section to include test generation
- Update `## Usage Template` with test-writing scope options
- Add examples of test-writing requests

**Validation**:
```bash
# Verify frontmatter updated
head -5 .opencode/skill/qa/skill.md | grep -i "test"

# Check "What I do" includes test-writing
grep -A 10 "## What I do" .opencode/skill/qa/skill.md | grep -i "write\|generat"

# Verify usage template expanded
grep -A 15 "## Usage Template" .opencode/skill/qa/skill.md
```

**Dependencies**: Tasks 1-8 (all content informs description)

---

10. Validate Complete Skill Against Requirements

**File**: N/A (validation only)

**Changes**: None (validation step)

**Validation**:
```bash
# Read entire updated skill.md
cat .opencode/skill/qa/skill.md

# Verify all sections present
grep -E "^## " .opencode/skill/qa/skill.md

# Check file structure (philosophy → frameworks → patterns → workflow → validation)
grep -n "^## " .opencode/skill/qa/skill.md

# Test self-validation: use qa skill.md to write a test for itself
# (manual check - can the skill guide writing a test for the qa skill?)
```

**Dependencies**: Tasks 1-9 (all content must be complete)

---

## Summary

**Total Tasks**: 10
**Estimated Effort**: ~4-6 hours
**Parallelizable**: Tasks 3, 4, 5 can run in parallel after Task 2
**Critical Path**: Task 1 → Task 2 → Tasks 3-5 → Tasks 6-8 → Task 9 → Task 10

**Completion Criteria**:
- All 10 tasks validated successfully
- OpenSpec validation passes (`openspec validate enhance-qa-skill-test-writing --strict`)
- qa skill.md can guide writing tests for all supported frameworks
- Builder agent can use qa skill during implementation workflow
