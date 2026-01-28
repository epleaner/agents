# Proposal: Enhance QA Skill with Test-Writing Capabilities

## Rationale

The current `qa` skill only validates existing code through linters, tests, and formatters. It lacks guidance for **writing tests**, which is a critical gap when implementing new features or fixing bugs. The builder agent needs comprehensive test-writing capabilities to:

1. **Generate tests proactively** during feature implementation (not as a separate step)
2. **Detect and respect existing testing frameworks** while recommending standards for greenfield projects
3. **Ensure spec requirements are validated** with appropriate test coverage
4. **Follow modern testing best practices** (Testing Trophy, behavior-driven tests, clear assertions)

This enhancement transforms the qa skill from a validation-only tool into a comprehensive testing guide that supports the full development lifecycle.

## Scope

### Included

1. **Test-writing philosophy section** - Testing Trophy, behavior over implementation, clear assertions
2. **Framework-specific patterns** - TypeScript (Vitest/Jest + Testing Library), Python (pytest), Shell (bats-core)
3. **Test generation workflow** - Integrated builder guidance for writing tests alongside code
4. **Validation commands** - Framework-specific commands for each test type
5. **Assertion best practices** - Descriptive naming, informative messages, avoiding implementation details

### Excluded

- End-to-end test frameworks beyond Playwright (already mentioned)
- Visual regression testing
- Performance/load testing frameworks
- Mobile testing frameworks
- Database migration testing (covered separately by integration test patterns)

## Acceptance Criteria

1. **skill.md updated** with dedicated test-writing section before existing validation content
2. **Framework auto-detection patterns** documented for TypeScript, Python, Shell
3. **Test generation examples** provided for each framework with real code snippets
4. **Validation commands** added for running framework-specific tests
5. **Builder integration guidance** explaining when and how to write tests during implementation
6. **Self-validation** - qa skill.md can be used to write tests for the qa skill itself

## Trade-offs

### Decision: Integrated vs Separate Skill

**Choice**: Integrate test-writing into existing qa skill

**Rationale**:
- Testing is a quality concern - validation and generation belong together
- Avoids skill proliferation and context switching
- Builder can invoke qa skill for both writing and validating tests
- Logical flow: write tests → validate tests → run tests

**Trade-off**: Slightly larger skill.md file, but improved cohesion

### Framework Strategy: Auto-detect + Recommend

**Choice**: Detect existing frameworks first, recommend standards for greenfield

**Rationale**:
- Respects existing project conventions
- Provides opinionated defaults for new projects
- Reduces decision paralysis
- Aligns with modern best practices (Vitest, pytest, bats-core)

**Trade-off**: Requires detection logic, but improves user experience

### Coverage Approach: Spec-driven

**Choice**: Test all spec requirements and critical scenarios, not arbitrary coverage %

**Rationale**:
- Coverage metrics can be gamed
- Spec requirements are the source of truth
- Focuses testing effort on user-visible behavior
- Aligns with behavior-driven testing philosophy

**Trade-off**: Requires spec discipline, but ensures meaningful tests

## Dependencies

- None (skill.md update only)

## Related Work

- Research findings from testing philosophy investigation
- Existing qa skill validation patterns
- Builder agent workflows

## References

- Testing Trophy: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Vitest: https://vitest.dev
- React Testing Library: https://testing-library.com/react
- pytest: https://docs.pytest.org
- bats-core: https://bats-core.readthedocs.io
