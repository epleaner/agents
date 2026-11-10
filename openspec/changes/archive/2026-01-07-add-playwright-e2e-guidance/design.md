# Design: Add Playwright/E2E Testing Guidance to QA Skill

## Overview

This design adds comprehensive Playwright/E2E testing guidance to the qa skill, focusing on MCP integration for AI-assisted workflows, architectural patterns for maintainability, and debugging tools for reliability.

## Key Decisions

### Decision 1: MCP Integration Approach

**Options**:
1. **MCP-Only**: Focus exclusively on Playwright MCP integration
2. **API-Only**: Document direct Playwright API usage
3. **Hybrid**: Document both MCP integration and direct API

**Choice**: Hybrid (Option 3)

**Rationale**:
- MCP integration enables AI agents to interact with browsers for test generation and self-healing
- Direct API knowledge is required for understanding and debugging generated tests
- Builder agents need both: MCP for automation, API for comprehension
- Hybrid approach provides flexibility for different workflows

**Implementation**:
- Lead with MCP integration (`npx playwright init-agents`)
- Show examples of AI-generated tests via MCP
- Follow with direct API patterns for manual test writing
- Cross-reference between MCP and API approaches

**Trade-offs**:
- ✅ Pro: Comprehensive guidance for all workflows
- ✅ Pro: Agents can choose appropriate approach per use case
- ✅ Pro: Future-proof as MCP adoption grows
- ⚠️ Con: More content (~400-500 lines for Playwright section)
- ⚠️ Con: Potential confusion about when to use which approach

**Mitigation**: Clear usage guidance at start of section explaining when to use MCP vs direct API

---

### Decision 2: E2E Architecture Pattern

**Options**:
1. **Flat**: All tests and helpers in single directory
2. **Page Object Model**: Separate page objects from tests
3. **Component-Based**: Organize by UI components
4. **Feature-Based**: Organize by user features

**Choice**: Page Object Model (Option 2)

**Rationale**:
- Industry standard for E2E testing
- Reduces duplication across tests
- Provides clear abstraction layer between tests and UI
- Improves maintainability when UI changes
- Playwright documentation recommends it
- Familiar to developers across ecosystems

**Structure**:
```
e2e/
├── pages/          # Page Object classes
│   ├── login.ts
│   ├── dashboard.ts
│   └── settings.ts
├── tests/          # Test files using page objects
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── settings.spec.ts
├── fixtures/       # Reusable test fixtures
│   ├── authenticated-user.ts
│   └── test-data.ts
└── playwright.config.ts
```

**Trade-offs**:
- ✅ Pro: Maintainable as project grows
- ✅ Pro: Reduces duplication
- ✅ Pro: Clear separation of concerns
- ⚠️ Con: More boilerplate upfront
- ⚠️ Con: Learning curve for simple projects

**Mitigation**: Provide simple examples first, then show how POM scales for larger projects

---

### Decision 3: Locator Strategy Priority

**Options**:
1. **CSS/XPath**: Traditional selector approach
2. **Test IDs**: Data-testid attributes everywhere
3. **Semantic**: Role-based and text-based selectors
4. **Hybrid**: Prioritize semantic, fallback to test IDs

**Choice**: Hybrid (Option 4) with strong semantic preference

**Priority Order**:
1. **Role**: `page.getByRole('button', { name: 'Submit' })` - Most resilient, accessibility-friendly
2. **Text**: `page.getByText('Welcome')` - User-visible, intuitive
3. **Label**: `page.getByLabel('Email address')` - Form fields, accessible
4. **Test ID**: `page.getByTestId('submit-btn')` - When semantic selectors insufficient
5. **CSS**: `page.locator('.submit-button')` - Last resort, avoid when possible

**Rationale**:
- Semantic selectors align with user behavior (how users interact with UI)
- Accessibility-friendly selectors ensure tests validate accessible UI
- More resilient to implementation changes (class names, DOM structure)
- Playwright's web-first assertions work best with semantic selectors
- Test IDs add maintenance burden but provide stability when needed

**Trade-offs**:
- ✅ Pro: Tests validate accessibility
- ✅ Pro: More resilient to refactoring
- ✅ Pro: Easier to read and maintain
- ⚠️ Con: Requires discipline (developers may default to CSS)
- ⚠️ Con: Complex UIs may still need test IDs

---

### Decision 4: Visual Testing Strategy

**Options**:
1. **Built-in Only**: Use Playwright's `toHaveScreenshot()`
2. **External Services**: Chromatic, Percy, Applitools
3. **Hybrid**: Built-in default, mention external options

**Choice**: Hybrid (Option 3)

**Rationale**:
- Built-in visual testing is zero-config and sufficient for most use cases
- External services provide better diff algorithms, cross-browser support, baseline management
- Start simple (built-in), scale up if needed (external)
- Cost consideration: built-in is free, external has pricing

**Implementation**:
- Primary guidance: `toHaveScreenshot()` with examples
- Document update workflow: `npx playwright test --update-snapshots`
- Mention CI considerations (deterministic rendering)
- Reference external services as alternatives for advanced use cases

**Trade-offs**:
- ✅ Pro: Zero-config, immediate value
- ✅ Pro: No external dependencies
- ✅ Pro: Can upgrade to external services later
- ⚠️ Con: Built-in visual testing less sophisticated (pixel-perfect, not smart diffing)
- ⚠️ Con: Snapshot management in git (large binary files)

**Mitigation**: Document `.gitignore` patterns for snapshots, recommend external services for large projects

---

### Decision 5: Debugging Tools Emphasis

**Options**:
1. **Minimal**: Just mention `--debug` flag
2. **Comprehensive**: Cover trace viewer, inspector, headed mode, codegen
3. **External**: Rely on Playwright docs for debugging

**Choice**: Comprehensive (Option 2)

**Rationale**:
- Debugging is where agents get stuck most often
- Trace viewer is Playwright's killer feature (time-travel debugging)
- Agents need guidance on which tool to use when
- Codegen helps agents learn locator strategies
- Self-service debugging reduces friction

**Tools Coverage**:
1. **Trace Viewer**: Time-travel debugging with screenshots, network, DOM snapshots
2. **Inspector**: Step-through debugging with pausing and locator picking
3. **Headed Mode**: Visual debugging (see browser in action)
4. **Codegen**: Generate test code from browser interactions
5. **HTML Report**: Test results with screenshots and videos

**Trade-offs**:
- ✅ Pro: Agents can debug independently
- ✅ Pro: Comprehensive toolkit for different debugging scenarios
- ✅ Pro: Reduces support burden
- ⚠️ Con: More content to document
- ⚠️ Con: Tool selection may be overwhelming

**Mitigation**: Decision tree for which debugging tool to use based on scenario

---

### Decision 6: Performance and Reliability

**Options**:
1. **Default Config**: Rely on Playwright defaults
2. **Opinionated Config**: Recommend specific parallel workers, retries, timeouts
3. **Adaptive**: Show how to configure based on project needs

**Choice**: Adaptive (Option 3)

**Rationale**:
- Different projects have different needs (CI vs local, project size)
- Over-parallelization can cause flaky tests
- Retries mask underlying issues if overused
- Agents need to understand trade-offs, not just copy config

**Guidance Areas**:
1. **Parallel Execution**: `workers: 4` for local, `workers: 2` for CI (or based on available CPUs)
2. **Test Sharding**: `--shard=1/3` for distributing tests across CI workers
3. **Retries**: `retries: 2` for flaky tests, but prioritize fixing root cause
4. **Timeouts**: Default 30s, increase for slow operations
5. **Flaky Test Prevention**: Proper locators, avoid hard waits, use web-first assertions

**Trade-offs**:
- ✅ Pro: Flexible for different project contexts
- ✅ Pro: Educates agents on trade-offs
- ✅ Pro: Encourages proper testing practices
- ⚠️ Con: No one-size-fits-all config
- ⚠️ Con: Requires agents to make decisions

**Mitigation**: Provide default recommendations with explanations for when to adjust

---

## Section Placement

**Location**: After `## Shell Test Patterns`, before `## Test Generation Workflow`

**Rationale**:
- E2E testing is the top of the Testing Trophy (follows natural progression from unit → integration → e2e)
- After Shell because it's another language-specific pattern set (TypeScript-focused)
- Before Workflow because workflow should reference E2E testing as an option

**Section Structure**:
```markdown
## Playwright/E2E Testing

### Playwright MCP Integration
- Setup with init-agents
- MCP server types (Playwright MCP vs Playwright Test MCP)
- AI-assisted test generation

### E2E Test Architecture
- Page Object Model pattern
- Fixtures for reusable setup
- Test organization

### Playwright Best Practices
- Locator strategies
- Web-first assertions
- Authentication patterns
- Test isolation
- Network interception

### Visual Testing
- toHaveScreenshot() usage
- Snapshot management
- CI considerations
- External services

### Debugging and Troubleshooting
- Trace viewer workflows
- Playwright inspector
- Headed mode
- Test replay
- Codegen

### Performance and Reliability
- Parallel execution
- Flaky test prevention
- Network interception
- Retry strategies
- Test sharding
```

---

## Code Example Strategy

**Approach**: Progressive disclosure with real-world examples

**Example Progression**:
1. **Simple test**: Login flow with direct page interaction
2. **Page Object**: Refactor login test to use Page Object
3. **Fixtures**: Add authenticated user fixture
4. **Visual testing**: Add screenshot assertion
5. **Network mocking**: Mock API for reliable test
6. **Debugging**: Show trace viewer output

**Example Characteristics**:
- Real-world scenarios (login, dashboard, settings)
- TypeScript syntax (Playwright's primary language)
- Comments explaining key decisions
- Common pitfalls and how to avoid them

---

## Integration with Existing QA Skill

**Minimal Disruption Strategy**:
- Add new section, don't modify existing content (except Commands Reference)
- Maintain consistent formatting with existing sections
- Cross-reference existing philosophy (Testing Trophy already documented)
- Reuse existing terminology (unit, integration, e2e)

**Updated Sections**:
1. **What I do**: Add "Run Playwright/e2e tests when applicable" (already present, no change needed)
2. **Commands Reference**: Add Playwright commands subsection
3. **Test-Writing Philosophy**: Reference E2E as top of Testing Trophy (no change needed, already covered)

**Unchanged Sections**:
- Test-Writing Philosophy
- Framework Detection and Standards
- TypeScript/Python/Shell Test Patterns
- Test Generation Workflow
- Assertion Best Practices
- Output Format
- Guidelines

---

## Validation Strategy

**Per-Task Validation**:
- Each task has specific validation commands
- Grep checks for content presence
- Section ordering validation
- Code example count validation

**Overall Validation**:
- Read entire Playwright section
- Verify subsection presence and ordering
- Check code example quality
- Ensure no broken references (FIXME, TODO, TBD)

**Integration Validation**:
- Builder agent can set up Playwright with qa skill guidance
- Builder agent can write E2E test using POM pattern
- Builder agent can debug test failure using trace viewer
- Builder agent can update visual snapshots

---

## Future Enhancements (Out of Scope)

- **Cross-browser testing**: Focus on Chromium for simplicity, can add Firefox/Safari later
- **Mobile testing**: Playwright mobile emulation, separate from native mobile frameworks
- **Component testing**: Playwright component testing (experimental feature)
- **API testing**: Playwright can test APIs directly (separate from E2E)
- **CI/CD integration**: GitHub Actions, CircleCI, Jenkins-specific guidance
- **Advanced network interception**: HAR files, service workers, WebSockets
- **Accessibility testing**: Playwright's accessibility features (separate skill or section)

---

## Success Metrics

1. **Builder adoption**: Builder agent uses Playwright guidance in >50% of E2E test tasks
2. **MCP usage**: Builder agent successfully sets up Playwright MCP integration
3. **Test quality**: E2E tests follow POM pattern with semantic locators
4. **Debugging success**: Builder agent resolves test failures using trace viewer without human intervention
5. **Visual testing**: Builder agent uses `toHaveScreenshot()` for visual regression tests when appropriate
