# Spec: QA Skill Test-Writing Capability

## ADDED Requirements

### Requirement: Test-Writing Philosophy Documentation

The qa skill must document testing philosophy to guide test generation decisions.

#### Scenario: Builder agent learns testing priorities

**Given** builder agent needs to write tests for a new feature  
**When** builder consults qa skill.md  
**Then** builder finds Test-Writing Philosophy section explaining:
- Testing Trophy (focus on integration tests)
- Behavior over implementation testing
- Clear assertion practices
- When to write unit vs integration vs e2e tests

---

### Requirement: Framework Auto-Detection

The qa skill must detect existing test frameworks before recommending alternatives.

#### Scenario: TypeScript project with existing Jest

**Given** project has `jest.config.js` in root  
**When** builder checks for testing framework  
**Then** builder detects Jest and uses Jest patterns for new tests  
**And** builder does not recommend switching to Vitest

#### Scenario: Python project with existing pytest

**Given** project has `pytest.ini` or pytest in `pyproject.toml`  
**When** builder checks for testing framework  
**Then** builder detects pytest and uses pytest patterns for new tests

#### Scenario: Shell project with no existing tests

**Given** project has bash scripts but no test files  
**When** builder checks for testing framework  
**Then** builder recommends bats-core and creates `tests/` directory structure

---

### Requirement: Framework Recommendations for Greenfield Projects

The qa skill must recommend modern, well-supported frameworks for new projects.

#### Scenario: New TypeScript project

**Given** no test framework detected in TypeScript project  
**When** builder needs to write first test  
**Then** builder recommends Vitest + Testing Library  
**And** builder provides setup instructions

#### Scenario: New Python project

**Given** no test framework detected in Python project  
**When** builder needs to write first test  
**Then** builder recommends pytest  
**And** builder provides setup instructions

#### Scenario: New Shell project

**Given** no test framework detected in Shell project  
**When** builder needs to write first bash script test  
**Then** builder recommends bats-core  
**And** builder provides installation and setup instructions

---

### Requirement: TypeScript Test Generation Patterns

The qa skill must provide TypeScript-specific test patterns following modern best practices.

#### Scenario: React component test with user interaction

**Given** builder implements a React form component  
**When** builder writes tests using qa skill guidance  
**Then** test uses React Testing Library to:
- Render component
- Simulate user interactions (typing, clicking)
- Assert on user-visible behavior (text content, DOM state)
- Avoid testing implementation details (state, props)

#### Scenario: TypeScript API client test with mocked network

**Given** builder implements an API client function  
**When** builder writes tests using qa skill guidance  
**Then** test uses MSW or similar to:
- Mock HTTP responses at network level
- Avoid mocking internal functions
- Test success and error scenarios
- Assert on returned data structure

#### Scenario: TypeScript utility function test

**Given** builder implements a pure utility function  
**When** builder writes unit tests using qa skill guidance  
**Then** test covers:
- Happy path with valid inputs
- Edge cases (empty, null, boundary values)
- Error conditions
- Type safety (TypeScript compile-time checks)

---

### Requirement: Python Test Generation Patterns

The qa skill must provide Python-specific test patterns following pytest conventions.

#### Scenario: Python API endpoint test with test database

**Given** builder implements a Flask/FastAPI endpoint  
**When** builder writes integration tests using qa skill guidance  
**Then** test uses pytest fixtures to:
- Set up isolated test database
- Make HTTP requests to endpoint
- Assert on response status and data
- Clean up database after test

#### Scenario: Python function test with parameterization

**Given** builder implements a data transformation function  
**When** builder writes tests using qa skill guidance  
**Then** test uses `@pytest.mark.parametrize` to:
- Test multiple input/output combinations
- Cover edge cases efficiently
- Assert on expected transformations

#### Scenario: Python async function test

**Given** builder implements an async function  
**When** builder writes tests using qa skill guidance  
**Then** test uses `pytest-asyncio` to:
- Mark test as async with `@pytest.mark.asyncio`
- Await function calls
- Assert on async behavior

---

### Requirement: Shell Test Generation Patterns

The qa skill must provide Shell-specific test patterns following bats-core conventions.

#### Scenario: Bash script test with exit code validation

**Given** builder implements a bash deployment script  
**When** builder writes tests using qa skill guidance  
**Then** test uses bats-core to:
- Execute script with test inputs
- Assert on exit code (0 for success, non-zero for failure)
- Verify stdout/stderr output

#### Scenario: Bash script test with file side effects

**Given** builder implements a script that creates files  
**When** builder writes tests using qa skill guidance  
**Then** test uses bats-core to:
- Set up temporary test directory
- Execute script
- Assert file exists and has expected content
- Clean up temporary directory in teardown

#### Scenario: Bash script test with mocked external command

**Given** builder implements a script calling external commands  
**When** builder writes tests using qa skill guidance  
**Then** test uses bats-core to:
- Create mock command in test PATH
- Execute script
- Verify mock was called with expected arguments

---

### Requirement: Test Generation Workflow Integration

The qa skill must guide builder agent to write tests during implementation, not after.

#### Scenario: Feature implementation with integrated testing

**Given** builder receives task to implement new feature  
**When** builder consults qa skill workflow guidance  
**Then** builder follows process:
1. Implement feature function/component
2. Immediately write tests for that function/component
3. Validate tests pass
4. Move to next requirement

#### Scenario: Identify test cases from spec requirements

**Given** builder has spec requirement with scenarios  
**When** builder plans test cases  
**Then** builder creates one test per scenario  
**And** builder adds tests for error conditions not in spec

---

### Requirement: Spec-Driven Test Coverage

The qa skill must define coverage strategy based on spec requirements, not arbitrary metrics.

#### Scenario: Feature with 3 spec requirements

**Given** spec defines 3 requirements with 2 scenarios each  
**When** builder writes tests following qa skill guidance  
**Then** builder creates minimum 6 tests (1 per scenario)  
**And** builder adds tests for critical error paths  
**And** builder does NOT aim for % coverage target

#### Scenario: Coverage report interpretation

**Given** tests achieve 60% line coverage but cover all spec requirements  
**When** builder evaluates test quality  
**Then** builder considers tests sufficient  
**Because** all user-visible behavior is validated

---

### Requirement: Assertion Best Practices

The qa skill must document assertion patterns that create maintainable, readable tests.

#### Scenario: Descriptive test names

**Given** builder writes a test  
**When** builder names the test  
**Then** test name describes user behavior (e.g., "user can submit form with valid data")  
**Not** implementation detail (e.g., "form handleSubmit test")

#### Scenario: Informative assertion messages

**Given** builder writes an assertion  
**When** assertion includes optional message parameter  
**Then** message explains what was expected (e.g., "Login button should be disabled while loading")  
**So that** test failure immediately communicates the issue

#### Scenario: Single logical assertion per test

**Given** builder writes a test  
**When** test validates behavior  
**Then** test focuses on one logical assertion  
**And** test does not mix unrelated assertions  
**Because** mixed assertions obscure failure root cause

#### Scenario: Avoid testing framework internals

**Given** builder writes component test  
**When** builder chooses what to assert on  
**Then** builder asserts on user-visible DOM (text, attributes, roles)  
**Not** framework internals (component state, props, lifecycle)

---

### Requirement: Framework-Specific Test Commands

The qa skill must document commands for running tests in each supported framework.

#### Scenario: Run TypeScript tests with Vitest

**Given** project uses Vitest  
**When** builder needs to run tests  
**Then** builder uses commands:
- `npx vitest` (watch mode)
- `npx vitest run` (CI mode)
- `npx vitest --coverage` (with coverage)

#### Scenario: Run Python tests with pytest

**Given** project uses pytest  
**When** builder needs to run tests  
**Then** builder uses commands:
- `pytest` (run all tests)
- `pytest -v` (verbose output)
- `pytest --cov` (with coverage)
- `pytest -k test_name` (run specific test)

#### Scenario: Run Shell tests with bats

**Given** project uses bats-core  
**When** builder needs to run tests  
**Then** builder uses commands:
- `bats tests/` (run all tests)
- `bats tests/deploy.bats` (run specific file)
- `bats --tap tests/` (TAP output for CI)

---

### Requirement: Skill Description Update

The qa skill frontmatter and introduction must reflect test-writing capabilities.

#### Scenario: Builder discovers qa skill capabilities

**Given** builder searches for test-writing guidance  
**When** builder reads qa skill.md frontmatter  
**Then** description mentions "write and validate tests"  
**And** "What I do" section includes test generation  
**And** usage template includes test-writing scope options

---

## Validation

### Self-Validation Test

The qa skill.md must be capable of guiding the writing of tests for itself.

**Test**: Ask builder to write tests validating qa skill.md sections exist and are properly formatted.

**Expected**:
- Builder can determine appropriate test framework (Shell/bats for markdown validation)
- Builder can write tests checking for required sections
- Builder can validate section ordering
- Tests pass when run against completed qa skill.md

### Integration Test

Builder agent uses qa skill during feature implementation.

**Test**: Assign builder a feature task with spec requirements.

**Expected**:
- Builder consults qa skill for test-writing guidance
- Builder writes tests alongside implementation
- Tests follow framework patterns documented in qa skill
- All spec requirements have corresponding tests
- Tests use descriptive names and clear assertions
