# Tasks: Add Playwright/E2E Testing Guidance to QA Skill

## Rationale

The qa skill needs comprehensive Playwright/E2E guidance to support builder agents in writing reliable end-to-end tests. This enhancement follows a layered approach:

1. **MCP integration first** - Enable AI-assisted test generation and self-healing
2. **Architecture patterns** - Provide Page Object Model structure for maintainability
3. **Best practices** - Document locator strategies, assertions, and auth patterns
4. **Visual testing** - Add screenshot comparison and regression detection
5. **Debugging tools** - Guide agents through trace viewer and inspector workflows
6. **Reliability patterns** - Prevent flaky tests with parallel execution and proper waits

This approach balances AI-assisted workflows with manual testing knowledge, ensuring agents can both generate and understand E2E tests.

## Assumptions

- Projects using Playwright are TypeScript/JavaScript-based (not Python or Shell)
- Agents have access to Playwright MCP server or can install it
- E2E tests are co-located with project (not separate repo)
- Browser automation requires Chromium (default Playwright browser)

## Tasks

### 1. Add Playwright MCP Integration Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Add new section after Shell Test Patterns: `## Playwright/E2E Testing`
- Subsection: `### Playwright MCP Integration`
- Document `npx playwright init-agents --loop=<vscode|claude|opencode>`
- Explain Playwright MCP (browser automation) vs Playwright Test MCP (test-specific)
- Show MCP server configuration for AI-assisted test generation
- Include example of AI-generated test with MCP

**Validation**:
```bash
# Verify section exists and is positioned correctly
grep -n "## Playwright/E2E Testing" .opencode/skill/qa/skill.md

# Check MCP integration documented
grep -A 20 "Playwright MCP Integration" .opencode/skill/qa/skill.md | grep "init-agents"

# Ensure MCP server types explained
rg -A 5 "Playwright MCP|Playwright Test MCP" .opencode/skill/qa/skill.md
```

**Dependencies**: None

---

### 2. Add E2E Test Architecture Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Subsection: `### E2E Test Architecture`
- Document Page Object Model pattern with TypeScript example
- Show fixtures for reusable setup (authenticated user, test data)
- Explain test organization: e2e/pages/, e2e/tests/, e2e/fixtures/
- Include example Page Object class with methods and locators
- Show test using Page Object and fixtures

**Validation**:
```bash
# Verify architecture section exists
grep -A 30 "E2E Test Architecture" .opencode/skill/qa/skill.md

# Check for Page Object Model pattern
grep -i "page object" .opencode/skill/qa/skill.md

# Ensure fixtures documented
grep -E "(fixture|@fixture)" .opencode/skill/qa/skill.md | head -5
```

**Dependencies**: Task 1 (MCP integration provides context)

---

### 3. Add Playwright Best Practices Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Subsection: `### Playwright Best Practices`
- **Locator Priority**: role > text > label > test-id > CSS (avoid XPath)
- Show examples: `page.getByRole('button', { name: 'Submit' })`
- **Web-First Assertions**: `await expect(locator).toBeVisible()` (auto-waiting)
- **Authentication Patterns**: Storage state for session reuse across tests
- **Test Isolation**: Each test gets fresh browser context
- **Network Interception**: Mock API responses with `page.route()`
- Include code examples for each pattern

**Validation**:
```bash
# Verify best practices section exists
grep -A 40 "Playwright Best Practices" .opencode/skill/qa/skill.md

# Check locator priority documented
grep -E "(getByRole|getByText|getByLabel|getByTestId)" .opencode/skill/qa/skill.md

# Ensure web-first assertions covered
grep -E "(toBeVisible|toHaveText|toBeEnabled)" .opencode/skill/qa/skill.md

# Verify auth patterns included
grep -i "storage.*state\|storageState" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 2 (architecture provides context for patterns)

---

### 4. Add Visual Testing Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Subsection: `### Visual Testing`
- Document `toHaveScreenshot()` for pixel-perfect visual regression
- Show screenshot update workflow: `npx playwright test --update-snapshots`
- Explain snapshot storage and CI considerations
- Include example test with screenshot assertion
- Mention external services (Chromatic, Percy) as alternatives

**Validation**:
```bash
# Verify visual testing section exists
grep -A 15 "Visual Testing" .opencode/skill/qa/skill.md

# Check screenshot assertion documented
grep "toHaveScreenshot" .opencode/skill/qa/skill.md

# Ensure update workflow covered
grep -E "(update-snapshots|--update)" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 3 (best practices provide foundation)

---

### 5. Add Debugging and Troubleshooting Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Subsection: `### Debugging and Troubleshooting`
- **Trace Viewer**: `npx playwright test --trace on` and `npx playwright show-trace`
- **Playwright Inspector**: `npx playwright test --debug` for step-through debugging
- **Headed Mode**: `npx playwright test --headed` to see browser
- **Test Replay**: Explain how traces capture screenshots, network, DOM snapshots
- **Codegen**: `npx playwright codegen <url>` for generating test scripts
- Include debugging workflow diagram (text-based)

**Validation**:
```bash
# Verify debugging section exists
grep -A 25 "Debugging and Troubleshooting" .opencode/skill/qa/skill.md

# Check trace viewer documented
grep -E "(trace|show-trace)" .opencode/skill/qa/skill.md

# Ensure inspector covered
grep -E "(--debug|inspector)" .opencode/skill/qa/skill.md

# Verify codegen mentioned
grep "codegen" .opencode/skill/qa/skill.md
```

**Dependencies**: Task 3 (best practices provide context for debugging)

---

### 6. Add Performance and Reliability Section

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Subsection: `### Performance and Reliability`
- **Parallel Execution**: `playwright.config.ts` workers setting, `test.describe.configure({ mode: 'parallel' })`
- **Flaky Test Prevention**: Proper locators, avoid hard waits, use web-first assertions
- **Network Interception**: Mock slow/failing APIs for reliable tests
- **Retry Strategy**: `test.describe.configure({ retries: 2 })` for flaky tests
- **Test Sharding**: `--shard=1/3` for CI parallelization
- Include performance tips and anti-patterns

**Validation**:
```bash
# Verify performance section exists
grep -A 30 "Performance and Reliability" .opencode/skill/qa/skill.md

# Check parallel execution documented
grep -E "(parallel|workers|shard)" .opencode/skill/qa/skill.md

# Ensure flaky test prevention covered
grep -i "flaky" .opencode/skill/qa/skill.md

# Verify retry strategy included
grep -E "(retries|retry)" .opencode/skill/qa/skill.md
```

**Dependencies**: Tasks 3, 5 (best practices and debugging provide context)

---

### 7. Update Commands Reference with Playwright Commands

**File**: `.opencode/skill/qa/skill.md`

**Changes**:
- Update section: `## Commands Reference`
- Add Playwright commands subsection:
  - `npx playwright test` - Run all tests
  - `npx playwright test --ui` - Interactive mode
  - `npx playwright test --headed` - Show browser
  - `npx playwright test --debug` - Debug mode
  - `npx playwright test --trace on` - Enable traces
  - `npx playwright show-report` - Open HTML report
  - `npx playwright show-trace <trace.zip>` - View trace
  - `npx playwright codegen <url>` - Generate test code
  - `npx playwright test --update-snapshots` - Update screenshots
  - `npx playwright init-agents` - Initialize MCP integration

**Validation**:
```bash
# Verify commands updated
grep -A 40 "## Commands Reference" .opencode/skill/qa/skill.md | grep playwright

# Check all key commands present
grep -E "(playwright test|show-report|codegen|init-agents)" .opencode/skill/qa/skill.md

# Ensure trace commands included
grep -E "(show-trace|--trace)" .opencode/skill/qa/skill.md
```

**Dependencies**: Tasks 1-6 (all sections inform commands)

---

### 8. Validate Complete Playwright Section Against Requirements

**File**: N/A (validation only)

**Changes**: None (validation step)

**Validation**:
```bash
# Read entire Playwright section
sed -n '/## Playwright\/E2E Testing/,/## Test Generation Workflow/p' .opencode/skill/qa/skill.md

# Verify all subsections present
grep -E "^### " .opencode/skill/qa/skill.md | grep -A 7 "Playwright"

# Check section ordering (after Shell, before Workflow)
grep -n "^## " .opencode/skill/qa/skill.md | grep -E "(Shell Test|Playwright|Test Generation)"

# Ensure code examples included (at least 5)
grep -c "^\`\`\`" .opencode/skill/qa/skill.md

# Validate no broken references
rg "FIXME|TODO|TBD" .opencode/skill/qa/skill.md
```

**Dependencies**: Tasks 1-7 (all content must be complete)

---

## Summary

**Total Tasks**: 8
**Estimated Effort**: ~6-8 hours
**Parallelizable**: Tasks 3, 4, 5, 6 can run in parallel after Task 2
**Critical Path**: Task 1 → Task 2 → Tasks 3-6 → Task 7 → Task 8

**Completion Criteria**:
- All 8 tasks validated successfully
- Playwright/E2E section positioned correctly in skill.md
- MCP integration, architecture, best practices, visual testing, debugging, and reliability all documented
- Commands reference updated with Playwright-specific commands
- Builder agent can use qa skill to set up and write Playwright tests
