# Spec: QA Skill Playwright/E2E Testing Capability

## ADDED Requirements

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

## MODIFIED Requirements

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

## Validation

### Self-Validation Test

The qa skill.md must provide comprehensive Playwright/E2E testing guidance.

**Test**: Ask builder to set up Playwright MCP integration and write E2E test using Page Object Model.

**Expected**:
- Builder can initialize Playwright MCP with `npx playwright init-agents`
- Builder can create Page Object class following documented patterns
- Builder can write test using Page Object and fixtures
- Builder can use web-first assertions and semantic locators
- Builder can debug test failures with trace viewer
- Builder can update visual snapshots when UI changes

### Integration Test

Builder agent uses qa skill for E2E testing during feature implementation.

**Test**: Assign builder a feature task requiring E2E test coverage.

**Expected**:
- Builder consults qa skill for Playwright guidance
- Builder organizes tests in `e2e/` directory with proper structure
- Builder creates Page Objects for reusable page interactions
- Builder uses fixtures for test setup (authenticated user)
- Builder follows locator priority (role > text > label > test-id > CSS)
- Builder uses web-first assertions with auto-waiting
- Builder debugs failures with trace viewer or inspector
- Tests are reliable and can run in parallel
