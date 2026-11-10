# Proposal: Add Playwright/E2E Testing Guidance to QA Skill

## Rationale

The current qa skill briefly mentions Playwright (`npx playwright test`) but lacks comprehensive guidance for end-to-end testing, MCP integration, and E2E architecture patterns. This creates a gap for builder agents when:

1. **Setting up E2E infrastructure** - Agents need guidance on Playwright MCP integration for AI-assisted test generation and self-healing
2. **Writing maintainable E2E tests** - Agents need Page Object Model patterns, fixtures, and test organization best practices
3. **Debugging test failures** - Agents need access to trace viewer, inspector, and debugging workflows
4. **Ensuring test reliability** - Agents need patterns for flaky test prevention, proper locator strategies, and web-first assertions

This enhancement positions the qa skill as a complete E2E testing companion, bridging the gap between unit/integration tests and full user-flow validation.

## Scope

### Included

1. **Playwright MCP Integration** - Setup instructions for `npx playwright init-agents`, MCP server configuration, AI-assisted test generation
2. **E2E Test Architecture** - Page Object Model patterns, fixtures for reusable setup, test organization strategies
3. **Playwright Best Practices** - Locator priority (role > text > label > test-id > CSS), web-first assertions, authentication patterns (storage state)
4. **Visual Testing** - Screenshot comparison with `toHaveScreenshot()`, visual regression detection
5. **Debugging and Troubleshooting** - Trace viewer workflows, Playwright inspector, test replay
6. **Performance and Reliability** - Parallel execution patterns, flaky test prevention strategies, network interception

### Excluded

- Mobile testing frameworks (Appium, Detox) - out of scope
- Cross-browser testing strategy (focus on Chromium defaults)
- CI/CD integration specifics (focus on local development)
- Load/performance testing - separate concern
- Visual regression services (Chromatic, Percy) - external tools

## Acceptance Criteria

1. **skill.md updated** with Playwright/E2E section after Shell Test Patterns, before Test Generation Workflow
2. **MCP integration documented** with setup commands and configuration examples
3. **E2E architecture patterns** provided with Page Object Model examples
4. **Best practices documented** with locator strategies, assertions, and auth patterns
5. **Visual testing guidance** included with screenshot comparison examples
6. **Debugging section** added with trace viewer and inspector workflows
7. **Commands reference updated** with Playwright-specific commands (test, debug, codegen, show-report)
8. **Validation** - Builder can use qa skill to set up and write Playwright tests

## Trade-offs

### Decision: MCP Integration vs Direct Playwright API

**Choice**: Document both MCP integration (for AI-assisted workflows) and direct Playwright API (for implementation)

**Rationale**:
- MCP integration enables AI agents to interact with browsers for test generation and self-healing
- Direct API knowledge is required for understanding and debugging generated tests
- Hybrid approach provides flexibility for different use cases

**Trade-off**: More content, but comprehensive guidance

### Decision: Page Object Model Emphasis

**Choice**: Recommend Page Object Model (POM) as default architecture pattern

**Rationale**:
- Reduces duplication across tests
- Improves maintainability when UI changes
- Provides clear abstraction boundaries
- Industry standard for E2E testing

**Trade-off**: More boilerplate upfront, but better long-term maintenance

### Decision: Visual Testing Strategy

**Choice**: Include `toHaveScreenshot()` built-in visual testing, mention external services as alternatives

**Rationale**:
- Built-in visual testing is zero-config and sufficient for most use cases
- External services (Chromatic, Percy) add complexity and cost
- Can be added later if needed

**Trade-off**: Built-in visual testing less sophisticated, but simpler

## Dependencies

- None (skill.md update only)
- Assumes projects have or can install Playwright (`npm install -D @playwright/test`)

## Related Work

- Research findings on Playwright MCP integration and best practices
- Existing qa skill test-writing patterns (TypeScript, Python, Shell)
- Testing Trophy philosophy already documented in qa skill

## References

- Playwright Docs: https://playwright.dev
- Playwright MCP: https://github.com/executeautomation/playwright-mcp-server
- Playwright Test MCP: https://github.com/ropaolle/playwright-mcp
- Page Object Model: https://playwright.dev/docs/pom
- Best Practices: https://playwright.dev/docs/best-practices
- Trace Viewer: https://playwright.dev/docs/trace-viewer
