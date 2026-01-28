# Spec: QA Skill Test-Writing Capability

## Requirements

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

The qa skill must document commands for running tests in each supported framework, including Playwright.

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

#### Scenario: Run E2E tests with Playwright

**Given** project uses Playwright  
**When** builder needs to run E2E tests  
**Then** builder uses commands:
- `npx playwright test` (run all tests)
- `npx playwright test --ui` (interactive mode)
- `npx playwright test --headed` (show browser)
- `npx playwright test --debug` (debug mode)
- `npx playwright show-report` (HTML report)

---

### Requirement: Playwright MCP Integration Documentation

The qa skill must document Playwright MCP integration for AI-assisted E2E test generation and self-healing.

#### Scenario: Builder agent sets up Playwright MCP

**Given** builder agent needs to write E2E tests for a TypeScript project  
**When** builder consults qa skill.md for Playwright setup  
**Then** builder finds Playwright MCP Integration section with:
- `npx playwright init-agents --loop=<vscode|claude|opencode>` setup command
- Explanation of Playwright MCP (browser automation) vs Playwright Test MCP (test-specific)
- MCP server configuration examples
- AI-assisted test generation workflow

#### Scenario: Builder agent distinguishes MCP server types

**Given** builder agent is configuring Playwright MCP  
**When** builder reads MCP integration documentation  
**Then** builder understands:
- Playwright MCP enables browser automation for test generation
- Playwright Test MCP provides test-specific operations
- When to use each server type

---

### Requirement: E2E Test Architecture Patterns

The qa skill must provide Page Object Model and fixture patterns for maintainable E2E tests.

#### Scenario: Builder agent creates Page Object for login page

**Given** builder agent needs to test login functionality  
**When** builder writes E2E tests using qa skill guidance  
**Then** builder creates Page Object class with:
- Locators for page elements (email input, password input, submit button)
- Methods for user actions (login, logout)
- Assertions for page state (isLoggedIn)
- TypeScript types for type safety

#### Scenario: Builder agent uses fixtures for test setup

**Given** builder agent needs authenticated user state for tests  
**When** builder creates test fixtures following qa skill guidance  
**Then** builder defines fixture with:
- Storage state for authentication persistence
- Reusable setup across multiple tests
- Proper cleanup after tests complete

#### Scenario: Builder agent organizes E2E test files

**Given** builder agent has multiple Page Objects and tests  
**When** builder organizes test structure following qa skill guidance  
**Then** builder creates directory structure:
- `e2e/pages/` for Page Object classes
- `e2e/tests/` for test files
- `e2e/fixtures/` for reusable fixtures
- `playwright.config.ts` in project root

---

### Requirement: Playwright Best Practices Documentation

The qa skill must document locator strategies, web-first assertions, and authentication patterns following Playwright best practices.

#### Scenario: Builder agent selects appropriate locator strategy

**Given** builder agent needs to locate UI element  
**When** builder chooses locator following qa skill guidance  
**Then** builder uses priority order:
1. Role-based: `page.getByRole('button', { name: 'Submit' })`
2. Text-based: `page.getByText('Welcome')`
3. Label-based: `page.getByLabel('Email address')`
4. Test ID: `page.getByTestId('submit-btn')` (when semantic insufficient)
5. CSS selector: `page.locator('.submit-button')` (last resort)

#### Scenario: Builder agent uses web-first assertions

**Given** builder agent writes assertion for UI element  
**When** builder follows qa skill best practices  
**Then** builder uses web-first assertion with auto-waiting:
- `await expect(locator).toBeVisible()` (waits for visibility)
- `await expect(locator).toHaveText('expected')` (waits for text)
- `await expect(locator).toBeEnabled()` (waits for enabled state)
- Avoids manual waits (`page.waitForTimeout()`)

#### Scenario: Builder agent implements authentication pattern

**Given** builder agent needs to test authenticated user flows  
**When** builder implements auth pattern following qa skill guidance  
**Then** builder uses storage state:
- Login once in setup
- Save authentication state to file
- Reuse storage state across tests
- Avoid repeated login in every test

#### Scenario: Builder agent ensures test isolation

**Given** builder agent writes multiple E2E tests  
**When** builder follows qa skill isolation guidance  
**Then** each test:
- Gets fresh browser context
- Does not share state with other tests
- Can run in any order
- Can run in parallel

#### Scenario: Builder agent mocks API responses

**Given** builder agent needs reliable test without external dependencies  
**When** builder intercepts network requests following qa skill guidance  
**Then** builder uses `page.route()` to:
- Mock specific API endpoints
- Return predefined responses
- Simulate slow or failing APIs
- Test error handling without real failures

---

### Requirement: Visual Testing Documentation

The qa skill must document visual regression testing with screenshot comparison.

#### Scenario: Builder agent adds visual regression test

**Given** builder agent needs to detect UI visual changes  
**When** builder writes visual test following qa skill guidance  
**Then** builder uses `toHaveScreenshot()`:
- Take baseline screenshot on first run
- Compare subsequent runs to baseline
- Fail test if visual differences detected
- Store snapshots in version control

#### Scenario: Builder agent updates visual snapshots

**Given** builder agent made intentional UI changes  
**When** builder updates snapshots following qa skill guidance  
**Then** builder runs:
- `npx playwright test --update-snapshots`
- Reviews snapshot diffs before committing
- Commits updated snapshots to version control

#### Scenario: Builder agent considers CI visual testing

**Given** builder agent sets up visual testing in CI  
**When** builder configures snapshots following qa skill guidance  
**Then** builder considers:
- Deterministic rendering (fonts, animations)
- OS/browser-specific snapshots
- `.gitignore` patterns for large snapshot files
- External services (Chromatic, Percy) for advanced use cases

---

### Requirement: Debugging and Troubleshooting Documentation

The qa skill must document Playwright debugging tools for diagnosing test failures.

#### Scenario: Builder agent debugs flaky test with trace viewer

**Given** builder agent has failing E2E test  
**When** builder debugs using qa skill guidance  
**Then** builder:
- Runs test with `npx playwright test --trace on`
- Opens trace with `npx playwright show-trace trace.zip`
- Reviews time-travel debugging with screenshots, network, DOM snapshots
- Identifies root cause from trace timeline

#### Scenario: Builder agent uses inspector for step-through debugging

**Given** builder agent needs to debug test logic  
**When** builder uses inspector following qa skill guidance  
**Then** builder:
- Runs `npx playwright test --debug`
- Steps through test execution
- Picks locators interactively
- Inspects page state at each step

#### Scenario: Builder agent debugs with headed mode

**Given** builder agent wants to see browser behavior  
**When** builder runs test in headed mode following qa skill guidance  
**Then** builder:
- Runs `npx playwright test --headed`
- Observes browser interactions visually
- Identifies timing or interaction issues

#### Scenario: Builder agent generates test code with codegen

**Given** builder agent needs to learn locator strategies  
**When** builder uses codegen following qa skill guidance  
**Then** builder:
- Runs `npx playwright codegen <url>`
- Interacts with browser to generate test code
- Learns proper locator strategies from generated code
- Adapts generated code to Page Object pattern

#### Scenario: Builder agent reviews test results in HTML report

**Given** builder agent completed test run  
**When** builder reviews results following qa skill guidance  
**Then** builder:
- Runs `npx playwright show-report`
- Reviews HTML report with screenshots and videos
- Identifies failed tests and error messages
- Uses report to prioritize fixes

---

### Requirement: Performance and Reliability Documentation

The qa skill must document strategies for fast, reliable E2E tests.

#### Scenario: Builder agent configures parallel execution

**Given** builder agent has slow E2E test suite  
**When** builder optimizes execution following qa skill guidance  
**Then** builder configures:
- `workers: 4` in `playwright.config.ts` for local development
- `workers: 2` for CI (or based on available CPUs)
- `test.describe.configure({ mode: 'parallel' })` for independent tests

#### Scenario: Builder agent prevents flaky tests

**Given** builder agent writes E2E tests  
**When** builder follows qa skill reliability guidance  
**Then** builder:
- Uses proper locator strategies (role-based, text-based)
- Avoids hard waits (`page.waitForTimeout(5000)`)
- Uses web-first assertions with auto-waiting
- Ensures test isolation with fresh browser contexts
- Mocks unreliable external dependencies

#### Scenario: Builder agent configures retry strategy

**Given** builder agent has occasionally flaky tests  
**When** builder configures retries following qa skill guidance  
**Then** builder:
- Uses `test.describe.configure({ retries: 2 })` for flaky tests
- Prioritizes fixing root cause over retries
- Documents why retries are needed
- Monitors retry usage to identify patterns

#### Scenario: Builder agent shards tests for CI

**Given** builder agent needs to parallelize tests across CI workers  
**When** builder configures test sharding following qa skill guidance  
**Then** builder:
- Runs `npx playwright test --shard=1/3` on first worker
- Runs `npx playwright test --shard=2/3` on second worker
- Runs `npx playwright test --shard=3/3` on third worker
- Reduces overall CI time with distributed execution

---

### Requirement: Playwright Commands Documentation

The qa skill must document Playwright CLI commands for test execution and debugging.

#### Scenario: Builder agent runs Playwright tests

**Given** builder agent needs to execute E2E tests  
**When** builder references qa skill commands  
**Then** builder uses:
- `npx playwright test` - Run all tests
- `npx playwright test --ui` - Interactive mode
- `npx playwright test --headed` - Show browser
- `npx playwright test --debug` - Debug mode
- `npx playwright test path/to/test.spec.ts` - Run specific test

#### Scenario: Builder agent uses debugging commands

**Given** builder agent needs to debug test failures  
**When** builder references qa skill debugging commands  
**Then** builder uses:
- `npx playwright test --trace on` - Enable traces
- `npx playwright show-trace trace.zip` - View trace
- `npx playwright show-report` - Open HTML report
- `npx playwright codegen <url>` - Generate test code

#### Scenario: Builder agent manages visual snapshots

**Given** builder agent updates UI and needs to update snapshots  
**When** builder references qa skill snapshot commands  
**Then** builder uses:
- `npx playwright test --update-snapshots` - Update all snapshots
- Reviews snapshot diffs before committing

#### Scenario: Builder agent initializes Playwright MCP

**Given** builder agent needs AI-assisted test generation  
**When** builder references qa skill MCP commands  
**Then** builder uses:
- `npx playwright init-agents --loop=opencode` - Initialize MCP for OpenCode
- Configures MCP server in agent configuration

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
