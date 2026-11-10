---
description: Research SOTA multi-agent LLM architecture best practices and generate improvement proposals.
agent: researcher
---
Research state-of-the-art best practices for multi-agent LLM architectures using the `sota-research` skill. Load the skill definition from `.opencode/skill/sota-research/SKILL.md` and follow its process.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Load tracked sources from `.opencode/skill/sota-research/sources.md` before searching.
2. Use `exa_web_search_exa` for all web searches with the query patterns specified in the skill.
3. Default to `Depth: standard` and `Compare: true` if not specified.
4. Always update `sources.md` with newly discovered high-quality sources.
5. If no focus area specified, cover all categories (orchestration, tooling, memory, prompts, production).
6. Prioritize actionable findings with specific implementation details over general advice.
7. Produce improvement proposals sorted by priority, then effort.

**Example Invocations**
```
/sota-research                           # Full research, all areas, compare to current setup
/sota-research Focus: orchestration      # Focus on multi-agent orchestration patterns
/sota-research Depth: quick              # Fast scan, fewer queries
/sota-research Depth: deep Focus: memory # Deep dive on memory/context management
/sota-research Compare: false            # Research only, skip setup analysis
```
