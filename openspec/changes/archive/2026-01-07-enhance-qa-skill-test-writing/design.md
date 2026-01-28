# Design: Enhance QA Skill with Test-Writing Capabilities

## Overview

This design enhances the existing `qa` skill with comprehensive test-writing guidance, transforming it from a validation-only tool into a full-lifecycle testing companion for the builder agent.

## Key Decisions

### Decision 1: Integrated vs Separate Test-Writing Skill

**Options**:
1. **Integrated**: Add test-writing to existing qa skill
2. **Separate**: Create new `test-writer` skill

**Choice**: Integrated (Option 1)

**Rationale**:
- Testing is fundamentally a quality concern - generation and validation are two sides of the same coin
- Reduces skill proliferation and cognitive overhead for agents
- Natural workflow: write tests → validate tests → run tests (all in one skill)
- Existing qa skill already has validation infrastructure
- Avoids context switching between skills during implementation

**Trade-offs**:
- ✅ Pro: Single source of truth for testing guidance
- ✅ Pro: Simpler mental model for builder agent
- ✅ Pro: Easier to maintain consistency
- ⚠️ Con: Larger skill.md file (~300-400 lines vs ~40 lines)
- ⚠️ Con: Mixed concerns (generation + validation), but they're related

**Mitigation**: Clear section structure with test-writing content before validation content

---

### Decision 2: Framework Strategy

**Options**:
1. **Prescriptive**: Force specific frameworks
2. **Permissive**: Support any framework equally
3. **Auto-detect + Recommend**: Detect existing, recommend for greenfield

**Choice**: Auto-detect + Recommend (Option 3)

**Rationale**:
- Respects existing project conventions (critical for adoption)
- Provides opinionated guidance for new projects (reduces decision paralysis)
- Balances flexibility with best practices
- Aligns with modern testing ecosystem standards

**Recommendations**:
- **TypeScript**: Vitest + React/Solid Testing Library (fast, ESM-native, modern)
- **Python**: pytest (industry standard, powerful fixtures)
- **Shell**: bats-core (simple, readable, community-supported)

**Detection Strategy**:
```bash
# TypeScript
[ -f "vitest.config.ts" ] || [ -f "jest.config.js" ]

# Python  
[ -f "pytest.ini" ] || grep -q "pytest" pyproject.toml

# Shell
[ -d "tests" ] && ls tests/*.bats 2>/dev/null
```

**Trade-offs**:
- ✅ Pro: Works with existing projects
- ✅ Pro: Guides greenfield projects
- ✅ Pro: Reduces framework proliferation
- ⚠️ Con: Opinionated (but that's desired)
- ⚠️ Con: Requires detection logic (but simple)

---

### Decision 3: Coverage Approach

**Options**:
1. **Metric-driven**: Target % coverage (e.g., 80%)
2. **Spec-driven**: Test all requirements and critical scenarios
3. **Hybrid**: Spec-driven + minimum % threshold

**Choice**: Spec-driven (Option 2)

**Rationale**:
- Coverage metrics can be gamed (test trivial code, ignore critical paths)
- Spec requirements represent user-visible behavior (highest value)
- Aligns with behavior-driven testing philosophy
- Focuses effort where it matters most
- Reduces meaningless tests

**Strategy**:
1. **Map spec requirements to test cases** (1+ test per requirement)
2. **Test critical scenarios** explicitly listed in spec
3. **Test error conditions** (failure modes, edge cases)
4. **Avoid testing implementation details** (internal methods, private functions)

**Example**:
```
Spec Requirement: User login with valid credentials
→ Test: test_user_login_with_valid_credentials()
→ Test: test_user_login_with_invalid_password()
→ Test: test_user_login_with_nonexistent_user()
```

**Trade-offs**:
- ✅ Pro: Meaningful test coverage
- ✅ Pro: Enforces spec discipline
- ✅ Pro: Avoids test bloat
- ⚠️ Con: Requires well-defined specs (but that's a feature)
- ⚠️ Con: No hard coverage number (but % is misleading anyway)

---

### Decision 4: Test Structure and Organization

**Options**:
1. **Co-located**: Tests next to source files (`src/foo.ts` + `src/foo.test.ts`)
2. **Separate**: Tests in parallel directory (`src/foo.ts` + `tests/foo.test.ts`)
3. **Framework-default**: Let framework conventions decide

**Choice**: Framework-default (Option 3)

**Rationale**:
- Different ecosystems have different norms
- TypeScript/JavaScript: Co-located is common (Vitest, Jest)
- Python: Separate `tests/` directory is standard
- Shell: Separate `tests/` directory (bats convention)
- Respecting conventions reduces friction

**Guidance**:
```
TypeScript: src/components/Button.tsx → src/components/Button.test.tsx
Python:     src/api/client.py → tests/test_client.py
Shell:      scripts/deploy.sh → tests/deploy.bats
```

**Trade-offs**:
- ✅ Pro: Familiar to developers in each ecosystem
- ✅ Pro: Works with framework expectations
- ⚠️ Con: Inconsistent across languages (but that's reality)

---

### Decision 5: Test-Writing Workflow Integration

**Options**:
1. **Reactive**: Write tests after implementation
2. **Proactive**: Write tests during implementation
3. **TDD**: Write tests before implementation

**Choice**: Proactive (Option 2)

**Rationale**:
- TDD is ideal but adds complexity for AI agents
- Reactive testing is often skipped or rushed
- Proactive integrates testing into implementation flow
- Builder can write tests alongside code naturally
- Spec requirements guide both code and tests

**Workflow**:
```
1. Implement feature function/component
2. Immediately write tests for that function/component
3. Validate tests pass
4. Move to next requirement
```

**Trade-offs**:
- ✅ Pro: Tests written while context is fresh
- ✅ Pro: Catches issues early
- ✅ Pro: More sustainable than reactive
- ⚠️ Con: Not pure TDD (but more practical for agents)
- ⚠️ Con: Requires discipline (but skill guides it)

---

### Decision 6: Assertion Guidance

**Principle**: Clear, behavior-focused, informative

**Patterns**:

**Good**:
```typescript
// ✓ Descriptive name, behavior-focused
test('user can submit form with valid data', async () => {
  render(<ContactForm />);
  
  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  
  // ✓ Clear assertion with context
  expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
});
```

**Bad**:
```typescript
// ✗ Implementation-focused, vague assertion
test('form test', () => {
  const wrapper = mount(ContactForm);
  wrapper.find('input').simulate('change', { target: { value: 'test@example.com' }});
  wrapper.find('button').simulate('click');
  
  // ✗ Testing implementation detail
  expect(wrapper.state('submitted')).toBe(true);
});
```

**Trade-offs**:
- ✅ Pro: Tests are readable documentation
- ✅ Pro: Failures are immediately understandable
- ✅ Pro: Resilient to refactoring
- ⚠️ Con: Slightly more verbose (but worth it)

---

## Architecture

### File Structure
```
.opencode/skill/qa/skill.md (MODIFIED)
├── Frontmatter (description updated)
├── Test-Writing Philosophy (NEW)
├── Framework Detection and Standards (NEW)
├── TypeScript Test Patterns (NEW)
├── Python Test Patterns (NEW)
├── Shell Test Patterns (NEW)
├── Test Generation Workflow (NEW)
├── Assertion Best Practices (NEW)
├── What I do (UPDATED)
├── Usage Template (UPDATED)
├── Output Format (EXISTING)
└── Commands Reference (UPDATED)
```

### Section Ordering Rationale
1. **Philosophy first**: Establishes mental model
2. **Framework detection**: Technical foundation
3. **Language patterns**: Concrete examples
4. **Workflow**: How to apply patterns
5. **Assertions**: Quality guidance
6. **Validation**: Existing QA content

### Information Architecture
- **Progressive disclosure**: Philosophy → Patterns → Application
- **Reference format**: Scannable sections, code snippets
- **Example-driven**: Every pattern has concrete code
- **Context-appropriate**: Framework-specific guidance

---

## Success Metrics

1. **Builder adoption**: Builder agent uses qa skill for test-writing in >80% of feature implementations
2. **Test quality**: Tests follow documented best practices (behavior-focused, clear assertions)
3. **Framework alignment**: Tests match detected/recommended framework patterns
4. **Coverage**: All spec requirements have corresponding tests
5. **Self-validation**: qa skill.md can guide writing tests for itself

---

## Future Enhancements (Out of Scope)

- Visual regression testing (Chromatic, Percy)
- Performance testing (k6, Lighthouse)
- Mobile testing (Appium, Detox)
- Database migration testing
- Contract testing (Pact)
- Mutation testing
- Property-based testing

These remain available for future proposals if needed.
