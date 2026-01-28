---
name: qa
description: Write and validate tests, run linters and formatters to ensure code quality.
---

## Test-Writing Philosophy

Effective testing follows the **Testing Trophy** model:

```
        /\
       /e2e\
      /------\
     /integ.  \
    /----------\
   /   unit     \
  /--------------\
 /    static      \
/------------------\
```

**Priority order** (most valuable first):
1. **Integration tests** - Test multiple units working together with real dependencies
2. **Unit tests** - Test individual functions/components in isolation
3. **E2E tests** - Critical user flows only (expensive to maintain)
4. **Static analysis** - Types, linters (cheapest, fastest feedback)

**Core principles**:
- **Test behavior, not implementation** - Focus on what the code does, not how it does it
- **Clear assertions** - Each test should verify one logical outcome with descriptive messages
- **Spec-driven coverage** - Test all spec requirements and critical scenarios, not arbitrary coverage %
- **Test during implementation** - Write tests alongside code, not as an afterthought

**What to test**:
- ✓ User-visible behavior and outputs
- ✓ Edge cases and error conditions
- ✓ Integration points between modules
- ✗ Private methods or implementation details
- ✗ Framework internals
- ✗ Trivial getters/setters

## Framework Detection and Standards

Before writing tests, **detect existing frameworks** to respect project conventions:

**TypeScript**:
```bash
# Detection
[ -f vitest.config.ts ] && echo "Vitest detected"
[ -f jest.config.js ] && echo "Jest detected"
grep -q "@testing-library" package.json && echo "Testing Library detected"

# Recommendation for greenfield: Vitest + Testing Library
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Python**:
```bash
# Detection
[ -f pytest.ini ] || grep -q "\[tool.pytest" pyproject.toml && echo "pytest detected"
[ -f setup.py ] && grep -q "unittest" setup.py && echo "unittest detected"

# Recommendation for greenfield: pytest
pip install pytest pytest-cov
```

**Shell**:
```bash
# Detection
[ -d tests ] && ls tests/*.bats >/dev/null 2>&1 && echo "bats-core detected"

# Recommendation for greenfield: bats-core
npm install -D bats  # or: brew install bats-core
```

**Standards**:
- Use detected framework if present
- Recommend modern tools for new projects (Vitest > Jest, pytest > unittest, bats-core for shell)
- Follow existing test file naming: `*.test.ts`, `*_test.py`, `*.bats`
- Place tests near source files or in dedicated `tests/` directory per project convention

## TypeScript Test Patterns

**Vitest + Testing Library** (recommended):

```typescript
// component.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TodoList } from './TodoList'

describe('TodoList', () => {
  it('adds new todo when form is submitted', async () => {
    const user = userEvent.setup()
    render(<TodoList />)
    
    // Find elements by role/label (user-visible identifiers)
    const input = screen.getByLabelText(/new todo/i)
    const button = screen.getByRole('button', { name: /add/i })
    
    // Simulate user interaction
    await user.type(input, 'Buy groceries')
    await user.click(button)
    
    // Assert behavior
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(input).toHaveValue('') // Input cleared after submit
  })

  it('displays error when API call fails', async () => {
    const user = userEvent.setup()
    
    // Mock at network level (prefer MSW for real projects)
    global.fetch = vi.fn(() => 
      Promise.reject(new Error('Network error'))
    )
    
    render(<TodoList />)
    await user.click(screen.getByRole('button', { name: /load/i }))
    
    expect(await screen.findByRole('alert'))
      .toHaveTextContent(/failed to load/i)
  })
})
```

**Testing Library best practices**:
- Query by role/label (accessible queries): `getByRole`, `getByLabelText`
- Avoid querying by test IDs or CSS classes (implementation details)
- Use `userEvent` over `fireEvent` (simulates real user interactions)
- Use `findBy*` for async updates (returns promise)
- Mock at the network boundary (MSW library) rather than implementation details

**Unit tests for utilities**:

```typescript
// utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, parseUserInput } from './utils'

describe('formatCurrency', () => {
  it('formats positive amounts with 2 decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })
  
  it('handles negative amounts', () => {
    expect(formatCurrency(-50)).toBe('-$50.00')
  })
  
  it('throws on invalid input', () => {
    expect(() => formatCurrency(NaN))
      .toThrow('Invalid amount')
  })
})
```

## Python Test Patterns

**pytest** (recommended):

```python
# test_api.py
import pytest
from unittest.mock import Mock, patch
from myapp.api import UserService, DatabaseError

# Fixtures for reusable test data
@pytest.fixture
def mock_db():
    """Provide a mock database connection."""
    db = Mock()
    db.query.return_value = [
        {'id': 1, 'name': 'Alice'},
        {'id': 2, 'name': 'Bob'}
    ]
    return db

@pytest.fixture
def user_service(mock_db):
    """Provide a UserService with mocked dependencies."""
    return UserService(db=mock_db)

def test_get_users_returns_list(user_service, mock_db):
    """Should return list of users from database."""
    users = user_service.get_users()
    
    assert len(users) == 2
    assert users[0]['name'] == 'Alice'
    mock_db.query.assert_called_once_with('SELECT * FROM users')

def test_get_users_handles_db_error(user_service, mock_db):
    """Should raise UserServiceError when database fails."""
    mock_db.query.side_effect = DatabaseError("Connection lost")
    
    with pytest.raises(UserServiceError, match="Failed to fetch users"):
        user_service.get_users()

# Parameterized tests for multiple cases
@pytest.mark.parametrize('input_value,expected', [
    ('admin@example.com', True),
    ('user@test.com', True),
    ('invalid-email', False),
    ('', False),
])
def test_validate_email(input_value, expected):
    """Should validate email format correctly."""
    from myapp.validators import validate_email
    assert validate_email(input_value) == expected
```

**Integration tests with test database**:

```python
# test_integration.py
import pytest
from myapp import create_app, db
from myapp.models import User

@pytest.fixture
def app():
    """Create test application with test database."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Provide test client for HTTP requests."""
    return app.test_client()

def test_create_user_endpoint(client):
    """Should create user and return 201 status."""
    response = client.post('/api/users', json={
        'name': 'Test User',
        'email': 'test@example.com'
    })
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test User'
    assert 'id' in data
    
    # Verify in database
    user = User.query.filter_by(email='test@example.com').first()
    assert user is not None
    assert user.name == 'Test User'
```

**pytest best practices**:
- Use fixtures for setup/teardown and dependency injection
- Parametrize tests to avoid duplication
- Use descriptive docstrings (shown in verbose output)
- Mock external dependencies (databases, HTTP clients, file systems)
- Test integration points with real dependencies when feasible

## Shell Test Patterns

**bats-core** (recommended):

```bash
#!/usr/bin/env bats
# test_deploy.bats

setup() {
  # Runs before each test
  export TEST_DIR="$(mktemp -d)"
  export PATH="$BATS_TEST_DIRNAME/../bin:$PATH"
}

teardown() {
  # Runs after each test
  rm -rf "$TEST_DIR"
}

@test "deploy script exits 0 on success" {
  run deploy.sh --dry-run
  
  [ "$status" -eq 0 ]
  [[ "$output" =~ "Deployment complete" ]]
}

@test "deploy script fails with invalid environment" {
  run deploy.sh --env invalid-env
  
  [ "$status" -eq 1 ]
  [[ "$output" =~ "Invalid environment" ]]
}

@test "deploy creates required files" {
  run deploy.sh --target "$TEST_DIR" --dry-run
  
  [ "$status" -eq 0 ]
  [ -f "$TEST_DIR/config.yml" ]
  [ -f "$TEST_DIR/manifest.json" ]
}

@test "deploy script validates dependencies" {
  # Mock missing dependency
  function docker() {
    echo "docker: command not found" >&2
    return 127
  }
  export -f docker
  
  run deploy.sh --check
  
  [ "$status" -eq 1 ]
  [[ "$output" =~ "docker not found" ]]
}

@test "deploy script handles missing config file" {
  run deploy.sh --config nonexistent.yml
  
  [ "$status" -eq 1 ]
  [[ "$stderr" =~ "Config file not found" ]]
}
```

**bats-core best practices**:
- Test exit codes: `[ "$status" -eq 0 ]`
- Test stdout/stderr: `[[ "$output" =~ "pattern" ]]`, `[[ "$stderr" =~ "error" ]]`
- Use `setup()` and `teardown()` for test isolation
- Mock external commands with shell functions
- Test side effects: file creation, environment changes
- Use descriptive test names prefixed with `@test`

**Helper libraries**:

```bash
# load bats helpers (optional)
load 'test_helper/bats-support/load'
load 'test_helper/bats-assert/load'

@test "uses bats-assert for cleaner assertions" {
  run command_that_should_succeed
  
  assert_success
  assert_output --partial "expected text"
  refute_output --partial "error"
}
```

## Playwright/E2E Testing

### Playwright MCP Integration

Playwright offers **AI-assisted test generation and self-healing** through MCP (Model Context Protocol) servers. Two MCP options are available:

**1. Playwright MCP** (browser automation): General-purpose browser control for any automation task
**2. Playwright Test MCP** (test-specific): Optimized for test generation, assertion creation, and test maintenance

**Quick setup for OpenCode**:
```bash
# Initialize Playwright with OpenCode MCP integration
npx playwright init-agents --loop=opencode

# This configures:
# - Playwright Test fixtures and helpers
# - MCP server connection for AI-assisted test generation
# - Project structure (e2e/tests/, e2e/pages/, playwright.config.ts)
```

**MCP capabilities**:
- **Test generation**: AI generates test code from natural language descriptions
- **Locator optimization**: Suggests accessible locators (role, label) over brittle selectors
- **Self-healing**: Detects flaky locators and proposes more stable alternatives
- **Assertion generation**: Recommends web-first assertions based on test intent

**Example AI-assisted workflow**:
```typescript
// Ask AI: "Generate test for user login flow with email/password"
// AI generates:
import { test, expect } from '@playwright/test'

test('user can log in with valid credentials', async ({ page }) => {
  await page.goto('https://example.com/login')
  
  // AI uses accessible locators
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('secure123')
  await page.getByRole('button', { name: 'Log in' }).click()
  
  // AI uses web-first assertions with auto-waiting
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
```

**When to use MCP**:
- ✓ Generating tests for new features
- ✓ Refactoring tests with better locators
- ✓ Debugging flaky tests (AI suggests stability improvements)
- ✗ Don't rely solely on AI - review and understand generated tests

### E2E Test Architecture

**Page Object Model (POM)** - Recommended pattern for maintainable E2E tests:

**Project structure**:
```
e2e/
├── pages/           # Page Objects (UI abstractions)
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── fixtures/        # Custom fixtures for setup
│   └── authenticatedUser.ts
├── tests/           # Test files
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
└── playwright.config.ts
```

**Page Object example**:
```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // Use accessible locators (role, label)
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.loginButton = page.getByRole('button', { name: 'Log in' })
    this.errorMessage = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async expectErrorMessage(text: string) {
    await expect(this.errorMessage).toHaveText(text)
  }
}
```

**Test using Page Object**:
```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page)
  
  await loginPage.goto()
  await loginPage.login('invalid@example.com', 'wrongpassword')
  
  await loginPage.expectErrorMessage('Invalid email or password')
})
```

**Custom fixtures for reusable setup**:
```typescript
// e2e/fixtures/authenticatedUser.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

type AuthFixtures = {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: log in before each test
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'password123')
    
    // Use the authenticated page in tests
    await use(page)
    
    // Teardown: handled automatically by Playwright
  }
})

// Usage in tests:
test('user can access dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard')
  await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
```

**Benefits of POM**:
- ✓ Single source of truth for locators (update once, fixes all tests)
- ✓ Reusable methods across multiple tests
- ✓ Clear abstraction between UI and test logic
- ✓ Easier maintenance when UI changes

### Playwright Best Practices

**Locator Priority** - Use accessible locators first (resilient to UI changes):

```typescript
// 1. BEST: Role-based (accessible, semantic)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Learn more' })

// 2. GOOD: Label-based (accessible, form-specific)
page.getByLabel('Email address')
page.getByLabel('Password')

// 3. GOOD: Text content (visible to users)
page.getByText('Welcome back')
page.getByText(/signed in as/i)  // Regex for partial match

// 4. ACCEPTABLE: Test IDs (stable, but not user-visible)
page.getByTestId('submit-button')

// 5. AVOID: CSS selectors (brittle, implementation detail)
page.locator('.btn-primary')  // ✗ Breaks if class changes
page.locator('#submit')       // ✗ Breaks if ID changes

// 6. NEVER: XPath (brittle, hard to maintain)
page.locator('//button[@class="submit"]')  // ✗ Avoid
```

**Web-First Assertions** - Auto-wait for conditions (no manual `waitFor` needed):

```typescript
// ✓ GOOD: Web-first assertions auto-wait and retry
await expect(page.getByRole('button')).toBeVisible()      // Waits until visible
await expect(page.getByText('Success')).toHaveText('Success') // Waits for text
await expect(page.getByRole('checkbox')).toBeChecked()    // Waits until checked
await expect(page.getByRole('textbox')).toBeEnabled()     // Waits until enabled

// ✗ BAD: Manual waits are fragile
await page.waitForTimeout(2000)  // ✗ Arbitrary delay
await page.waitForSelector('.loading')  // ✗ Brittle selector

// ✓ GOOD: Wait for specific state changes
await page.waitForLoadState('networkidle')  // Wait for network quiet
await page.waitForURL('**/dashboard')       // Wait for navigation
```

**Authentication Patterns** - Reuse session state to speed up tests:

```typescript
// playwright.config.ts - Global setup
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    // Storage state persists cookies/localStorage
    storageState: 'e2e/.auth/user.json',
  },
  projects: [
    // Setup project runs once before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
})

// e2e/auth.setup.ts - Runs once to create auth state
import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Log in' }).click()
  
  await page.waitForURL('**/dashboard')
  
  // Save signed-in state for all tests
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})

// All tests start authenticated (no login needed)
test('user can view profile', async ({ page }) => {
  await page.goto('/profile')  // Already logged in
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
})
```

**Test Isolation** - Each test gets fresh browser context (no shared state):

```typescript
// ✓ GOOD: Tests are independent
test('test 1 modifies data', async ({ page }) => {
  // This test's changes don't affect other tests
  await page.goto('/settings')
  await page.getByLabel('Theme').selectOption('dark')
})

test('test 2 sees clean state', async ({ page }) => {
  // Fresh context, no dark theme from test 1
  await page.goto('/settings')
  await expect(page.getByLabel('Theme')).toHaveValue('light')
})
```

**Network Interception** - Mock API responses for reliable tests:

```typescript
test('handles API error gracefully', async ({ page }) => {
  // Mock failed API response
  await page.route('**/api/users', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    })
  })
  
  await page.goto('/users')
  await expect(page.getByRole('alert')).toHaveText('Failed to load users')
})

test('displays users from mocked API', async ({ page }) => {
  // Mock successful response
  await page.route('**/api/users', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]),
    })
  })
  
  await page.goto('/users')
  await expect(page.getByText('Alice')).toBeVisible()
  await expect(page.getByText('Bob')).toBeVisible()
})
```

### Visual Testing

**Built-in screenshot comparison** - Detect visual regressions without external services:

```typescript
test('dashboard renders correctly', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Pixel-perfect comparison (fails if any pixel differs)
  await expect(page).toHaveScreenshot('dashboard.png')
})

test('button states match design', async ({ page }) => {
  await page.goto('/components')
  
  const button = page.getByRole('button', { name: 'Submit' })
  
  // Compare specific element
  await expect(button).toHaveScreenshot('button-default.png')
  
  await button.hover()
  await expect(button).toHaveScreenshot('button-hover.png')
  
  await button.click()
  await expect(button).toHaveScreenshot('button-active.png')
})
```

**Screenshot update workflow**:
```bash
# First run: generates baseline screenshots
npx playwright test

# Subsequent runs: compares against baseline
npx playwright test  # Fails if visual changes detected

# Review changes and update baseline if intentional
npx playwright test --update-snapshots

# Screenshots stored in:
# e2e/tests/<test-file>-snapshots/<screenshot-name>-<browser>.png
```

**Snapshot management**:
```typescript
// playwright.config.ts - Configure snapshot behavior
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,        // Allow minor differences
      threshold: 0.2,             // 20% pixel difference tolerance
      animations: 'disabled',     // Disable animations for stability
    },
  },
})
```

**Visual testing best practices**:
- ✓ Use for design-critical components (buttons, layouts, charts)
- ✓ Disable animations and dynamic content (timestamps, random data)
- ✓ Run in CI with consistent browser versions
- ✗ Don't screenshot entire pages (fragile, slow)
- ✗ Don't use for functional testing (use assertions instead)

**External services** (optional):
- **Chromatic**: Visual regression with cloud storage and review UI
- **Percy**: Cross-browser visual testing with approval workflows
- Use when built-in screenshots insufficient (parallel reviews, history tracking)

### Debugging and Troubleshooting

**Trace Viewer** - Time-travel debugging with full test replay:

```bash
# Enable traces (runs slower, but captures everything)
npx playwright test --trace on

# Or configure in playwright.config.ts:
export default defineConfig({
  use: {
    trace: 'on-first-retry',  // Only capture on failure
  },
})

# Open trace viewer after test failure
npx playwright show-trace trace.zip

# Or use HTML report with embedded traces
npx playwright show-report
```

**Trace viewer features**:
- **Timeline**: See every action, assertion, and network request
- **Screenshots**: Visual snapshot at each step
- **DOM snapshots**: Inspect element state at any point
- **Network tab**: View API requests/responses
- **Console logs**: See browser console output
- **Source code**: Jump to test code for each action

**Playwright Inspector** - Step-through debugging:

```bash
# Debug mode: pause before each action
npx playwright test --debug

# Debug specific test
npx playwright test auth.spec.ts --debug

# Debug from specific line (add to test code)
await page.pause()  // Test stops here, opens inspector
```

**Inspector features**:
- **Step over/into**: Execute actions one at a time
- **Pick locator**: Click elements to generate selectors
- **Record actions**: Generate test code from interactions
- **Explore page**: Test locators in live browser

**Headed Mode** - See browser during test execution:

```bash
# Run tests with visible browser
npx playwright test --headed

# Slow down actions for visibility
npx playwright test --headed --slow-mo=1000  # 1 second delay per action
```

**Codegen** - Generate test code by recording interactions:

```bash
# Start recording from URL
npx playwright codegen https://example.com

# Generate code with device emulation
npx playwright codegen --device="iPhone 13" https://example.com

# Output code to file
npx playwright codegen --target=typescript -o e2e/tests/generated.spec.ts https://example.com
```

**Debugging workflow**:
```
1. Test fails → Check HTML report (npx playwright show-report)
2. Review trace → Identify action/assertion that failed
3. Reproduce locally → Run with --headed or --debug
4. Fix locator/assertion → Re-run test
5. Success → Commit fix
```

**Common issues and solutions**:
- **Flaky test**: Use web-first assertions, avoid hard waits
- **Element not found**: Use `page.pause()` to inspect DOM, verify locator
- **Timeout**: Increase timeout in config or specific action
- **Network issues**: Use `page.route()` to mock API responses

### Performance and Reliability

**Parallel Execution** - Run tests faster with multiple workers:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : undefined,  // 2 workers in CI, auto-detect locally
  
  // Or configure per project
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Run tests in this project sequentially
      fullyParallel: false,
    },
  ],
})

// Force parallel execution within a test file
test.describe.configure({ mode: 'parallel' })

test.describe('User flows', () => {
  test('flow 1', async ({ page }) => { /* ... */ })
  test('flow 2', async ({ page }) => { /* ... */ })  // Runs in parallel with flow 1
})
```

**Flaky Test Prevention** - Write stable tests from the start:

```typescript
// ✓ GOOD: Web-first assertions auto-wait
await expect(page.getByRole('button')).toBeVisible()

// ✗ BAD: Hard waits cause flakiness
await page.waitForTimeout(2000)  // ✗ May be too short or too long

// ✓ GOOD: Wait for specific network request
await page.waitForResponse('**/api/users')

// ✗ BAD: Race condition between actions
await page.click('button')
await page.click('a')  // ✗ May click before button action completes

// ✓ GOOD: Wait for state change before next action
await page.click('button')
await page.waitForLoadState('networkidle')
await page.click('a')

// ✓ GOOD: Use stable locators (role, label)
page.getByRole('button', { name: 'Submit' })

// ✗ BAD: Brittle CSS selectors
page.locator('.btn-primary')  // ✗ Breaks if class changes
```

**Retry Strategy** - Automatically retry flaky tests:

```typescript
// playwright.config.ts - Global retry setting
export default defineConfig({
  retries: process.env.CI ? 2 : 0,  // Retry twice in CI, never locally
})

// Per-test retry configuration
test.describe('Flaky suite', () => {
  test.describe.configure({ retries: 2 })
  
  test('potentially flaky test', async ({ page }) => {
    // This test retries up to 2 times on failure
  })
})

// Per-test timeout (for slow operations)
test('slow operation', async ({ page }) => {
  test.setTimeout(60000)  // 60 seconds
  await page.goto('/large-dataset')
})
```

**Test Sharding** - Distribute tests across multiple CI machines:

```bash
# Split tests into 3 shards (run on 3 CI machines)
npx playwright test --shard=1/3  # Machine 1
npx playwright test --shard=2/3  # Machine 2
npx playwright test --shard=3/3  # Machine 3

# Playwright automatically balances tests across shards
```

**Network Interception for Reliability** - Mock unreliable external dependencies:

```typescript
test.beforeEach(async ({ page }) => {
  // Mock slow/unreliable external API
  await page.route('**/external-api/**', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ data: 'mocked' }),
    })
  })
})

test('loads data reliably', async ({ page }) => {
  // Test uses mocked API (fast, no network dependency)
  await page.goto('/data')
  await expect(page.getByText('mocked')).toBeVisible()
})
```

**Performance tips**:
- ✓ Reuse authentication state (storage state) across tests
- ✓ Run independent tests in parallel (`fullyParallel: true`)
- ✓ Mock slow external APIs with `page.route()`
- ✓ Use test sharding for large test suites in CI
- ✗ Don't run E2E tests for every commit (slow feedback)
- ✗ Don't test implementation details (focus on user flows)

**Anti-patterns to avoid**:
- ✗ Hard-coded waits (`page.waitForTimeout`)
- ✗ Brittle selectors (CSS classes, XPath)
- ✗ Shared state between tests (use fresh context)
- ✗ Testing third-party libraries (trust their tests)
- ✗ Over-reliance on retries (fix flaky tests instead)

## Test Generation Workflow

**When to write tests**:
1. **During implementation** - Write tests alongside code, not after
2. **Before fixing bugs** - Add failing test reproducing the bug, then fix
3. **When spec changes** - Update tests to match new requirements

**Builder integration**:
```
User requests feature → Builder reads spec → Builder writes code + tests in parallel → QA skill validates
```

**Identify test cases from spec**:

Given spec requirement:
> "Users can filter todos by status (all, active, completed)"

Generate test cases:
```typescript
describe('Todo filtering', () => {
  it('shows all todos when "all" filter selected')
  it('shows only incomplete todos when "active" filter selected')
  it('shows only completed todos when "completed" filter selected')
  it('maintains filter selection when new todo added')
})
```

**Coverage strategy**:
- ✓ Test all spec requirements (acceptance criteria)
- ✓ Test critical error paths (network failures, validation errors)
- ✓ Test edge cases (empty states, boundary conditions)
- ✗ Don't chase arbitrary coverage % (80% rule is misleading)
- ✗ Don't test code without spec requirements (likely over-engineering)

**Test file organization**:
- **Co-locate tests**: `src/component.tsx` → `src/component.test.tsx`
- **Or separate directory**: `src/component.tsx` → `tests/component.test.tsx`
- Follow existing project convention (check for `__tests__/` or `tests/` directories)

## Assertion Best Practices

**Descriptive test names** - Use behavior, not implementation:

```typescript
// ✗ Bad: describes implementation
it('calls setState with newValue')
it('renders div with class "error"')

// ✓ Good: describes behavior
it('displays validation error when email is invalid')
it('clears form after successful submission')
```

**Informative assertion messages**:

```typescript
// ✗ Bad: generic failure message
expect(result).toBe(true)

// ✓ Good: explains what was expected
expect(result).toBe(true, 'User should be authenticated after login')

// ✓ Even better: descriptive matcher
expect(user.isAuthenticated).toBe(true)
```

**Single logical assertion per test**:

```typescript
// ✗ Bad: multiple unrelated assertions
it('handles user creation', () => {
  const user = createUser({ name: 'Alice' })
  expect(user.name).toBe('Alice')
  expect(user.email).toBe('alice@example.com')  // Assumes email generation
  expect(user.role).toBe('user')  // Assumes default role
  expect(db.users.count()).toBe(1)  // Tests side effect
})

// ✓ Good: focused tests
it('creates user with provided name', () => {
  const user = createUser({ name: 'Alice' })
  expect(user.name).toBe('Alice')
})

it('generates email from name', () => {
  const user = createUser({ name: 'Alice' })
  expect(user.email).toBe('alice@example.com')
})

it('assigns default role to new users', () => {
  const user = createUser({ name: 'Alice' })
  expect(user.role).toBe('user')
})
```

**Avoid testing implementation details**:

```typescript
// ✗ Bad: tests internal state
it('sets loading state to true', () => {
  const component = render(<TodoList />)
  expect(component.state.loading).toBe(true)  // Internal detail
})

// ✓ Good: tests user-visible behavior
it('shows loading spinner while fetching todos', () => {
  render(<TodoList />)
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

**Good vs Bad examples summary**:

| Bad ✗ | Good ✓ |
|-------|--------|
| `it('renders correctly')` | `it('displays user name and email in profile card')` |
| `expect(arr.length).toBe(3)` | `expect(filteredTodos).toHaveLength(3)` |
| Test CSS classes | Test semantic roles and labels |
| Mock implementation functions | Mock external dependencies (API, DB) |
| Multiple unrelated assertions | One logical concept per test |

## What I do
- Write tests proactively during implementation
- Detect existing test frameworks and follow conventions
- Generate tests for TypeScript (Vitest/Jest + Testing Library), Python (pytest), and Shell (bats-core)
- Run linters (eslint, prettier, etc.) per repository standards
- Execute unit and integration tests
- Run Playwright/e2e tests when applicable
- Apply minimal formatting fixes to get clean signals
- Report results with pass/fail status and blockers

## Usage Template
```
# For test writing
Action: write-tests
Target: <file path or component name>
Framework: <auto-detect | vitest | jest | pytest | bats>
Coverage: <spec-requirements | critical-paths | full>

# For validation
Scope: <all | specific files/directories>
Checks: <lint, test, format, e2e, all>
Fix: <true | false - whether to auto-fix issues>
```

**Example test-writing requests**:
- "Write tests for the UserService class covering all spec requirements"
- "Add integration tests for the API endpoints in auth.py"
- "Generate bats tests for the deploy.sh script"
- "Write tests for the TodoList component focusing on user interactions"

## Output Format
Provide results as:
- **Lint**: PASS/FAIL + issue count
- **Tests**: PASS/FAIL + summary (X passed, Y failed)
- **Format**: PASS/FAIL + files changed
- **Blockers**: Issues that must be fixed before proceeding
- **Warnings**: Non-blocking issues to address later

## Commands Reference

**TypeScript/JavaScript**:
```bash
# Run tests
npm run test                    # Use project's test script
npx vitest                      # Run Vitest directly
npx vitest --watch              # Watch mode
npx vitest --coverage           # With coverage report
npx jest                        # Run Jest directly
npx jest --watch                # Jest watch mode

# Linting and formatting
npm run lint
npm run format
npx eslint .
npx prettier --write .

# E2E tests with Playwright
npx playwright test                        # Run all tests
npx playwright test --ui                   # Interactive mode with watch
npx playwright test --headed               # Show browser window
npx playwright test --debug                # Debug mode (step-through)
npx playwright test --trace on             # Enable trace recording
npx playwright test <file>                 # Run specific test file
npx playwright test --grep "login"         # Filter tests by pattern
npx playwright test --project=chromium     # Run specific browser
npx playwright test --shard=1/3            # Run 1/3 of tests (CI sharding)
npx playwright test --update-snapshots     # Update visual snapshots
npx playwright show-report                 # Open HTML report
npx playwright show-trace trace.zip        # View trace file
npx playwright codegen <url>               # Generate test from recording
npx playwright init-agents --loop=opencode # Initialize MCP integration
```

**Python**:
```bash
# Run tests
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest tests/test_api.py        # Specific file
pytest -k "test_user"           # Filter by name
pytest --cov                    # With coverage
pytest --cov=myapp --cov-report=html  # HTML coverage report

# Watch mode (requires pytest-watch)
ptw                             # Auto-rerun on file changes

# Linting and formatting
pylint myapp/
black .
flake8
mypy myapp/
```

**Shell**:
```bash
# Run tests
bats tests/                     # Run all .bats files
bats tests/deploy.bats          # Specific file
bats -t tests/                  # Tap output format
bats --verbose tests/           # Verbose mode

# Shell linting
shellcheck script.sh
shfmt -w script.sh              # Format shell scripts
```

**General**:
```bash
# Common lint/test commands
npm run lint
npm run test
npm run format
npx playwright test
```

## Guidelines
1. Run checks in order: lint → format → test → e2e.
2. Apply only minimal fixes—push larger defects back for review.
3. Record every check with command and outcome.
4. Refuse to pass QA if blockers remain.
