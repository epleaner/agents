---
name: sota-research
description: Research state-of-the-art multi-agent LLM architecture best practices and generate improvement proposals.
---

## What I do
- Generate targeted search queries across multi-agent orchestration, tooling, memory, and prompt engineering domains
- Search high-value sources (HackerNews, AI company blogs, GitHub, academic papers, practitioners)
- Aggregate and deduplicate findings into actionable insights
- Analyze current `.opencode/` setup against discovered best practices
- Produce prioritized improvement proposals with effort estimates
- Maintain a persistent source registry for efficient re-research

## Usage Template
```
Focus: <optional: specific area - orchestration, memory, tooling, prompts, all>
Depth: <quick | standard | deep - determines query count and source breadth>
Compare: <true | false - whether to analyze current setup>
Sources: <optional: specific sources to prioritize - hn, blogs, github, papers, practitioners>
```

## Process

### 0. Get Current Date Context
Before any research, establish the temporal context:

1. **Extract today's date** from the environment (available in system context as "Today's date: ...")
2. **Calculate date variables** for use throughout the process:
   - `{current_date}` - Today's date (e.g., "2026-01-11")
   - `{current_year}` - Current year (e.g., "2026")
   - `{previous_year}` - Previous year (e.g., "2025")
   - `{one_week_cutoff}` - Date 7 days ago (e.g., "2026-01-04") - for "breaking" content
   - `{one_month_cutoff}` - Date 30 days ago (e.g., "2025-12-11") - for "fresh" content
   - `{three_month_cutoff}` - Date 90 days ago (e.g., "2025-10-11") - for "recent" content

3. **Store these variables** for use in:
   - Search queries (use `{current_year} {previous_year}` instead of hardcoded years)
   - Recency scoring (compare source dates against cutoffs)
   - Classification: breaking (1 week) > fresh (1 month) > recent (3 months) > older

- Checkpoint: If date cannot be extracted, use fallback of current execution context
- Reasoning: Dynamic dates ensure searches remain relevant as time passes

### 1. Load Source Registry
- Read `skill/sota-research/sources.md` if it exists (or `.opencode/skill/...` when scaffolded)
- Extract tracked sources by category (blogs, repos, practitioners, papers)
- Note last-updated timestamps for freshness checking
- Checkpoint: If sources.md doesn't exist, proceed with default source list

### 2. Generate Search Queries
Generate 8-12 targeted queries based on Focus and Depth.

**IMPORTANT**: Use the date variables from Step 0. Replace hardcoded years with `{current_year} {previous_year}` to ensure queries remain fresh.

**Multi-Agent Orchestration (2-3 queries):**
```
"multi-agent LLM orchestration patterns {previous_year} {current_year}"
"agent handoff coordination state management LLM"
"hierarchical vs flat agent architecture production"
```

**Tool Use and Function Calling (2 queries):**
```
"LLM function calling best practices tool selection"
"agent tool use error handling retry strategies"
```

**Memory and Context Management (2 queries):**
```
"LLM agent memory long-term context RAG hybrid"
"conversation context window management multi-turn"
```

**Prompt Engineering for Agents (2 queries):**
```
"system prompt engineering agents chain-of-thought"
"few-shot prompting agent instructions meta-prompts"
```

**Emergent Tooling (1-2 queries):**
```
"new AI agent frameworks {current_year} LangGraph CrewAI AutoGen"
"LLM orchestration libraries production deployment"
```

**Production Patterns (1-2 queries):**
```
"LLM agent production deployment monitoring observability"
"multi-agent system reliability error recovery"
```

- Reasoning: Cast a wide net first, then drill down on promising areas
- Decision: If Depth=quick, use 4-6 queries; standard=8-10; deep=12+

### 3. Execute Searches
For each query:
- Use `exa_web_search_exa` with `numResults: 8` and `type: "auto"`
- For practitioner-specific searches, add name filters:
  - Simon Willison: `site:simonwillison.net OR "Simon Willison"`
  - Andrej Karpathy: `site:karpathy.github.io OR "Andrej Karpathy"`
  - Lilian Weng: `site:lilianweng.github.io OR "Lilian Weng"`
- For company blogs:
  - `site:openai.com/blog OR site:anthropic.com OR site:deepmind.google`
- For HackerNews discussions:
  - `site:news.ycombinator.com multi-agent LLM`

- Checkpoint: If a search returns < 3 results, reformulate query with broader terms
- Track: Note which sources returned high-quality results for sources.md update

### 4. Aggregate and Deduplicate
- Collect all results into categories:
  - Architecture patterns
  - Tool/function calling
  - Memory/context
  - Prompt engineering
  - New frameworks/libraries
  - Production patterns
- Deduplicate by URL
- Score relevance using date context from Step 0:
  - **Breaking**: Published after `{one_week_cutoff}` (within last 7 days) - highest priority
  - **Fresh**: Published after `{one_month_cutoff}` (within last 30 days) - high priority
  - **Recent**: Published after `{three_month_cutoff}` (within last 90 days) - medium priority
  - **Older**: Published before `{three_month_cutoff}` - lower priority, flag as potentially stale
  - Also prioritize: from tracked sources, with code examples
- Reasoning: Prefer actionable insights over theoretical discussions

### 5. Extract Key Insights
For each category, extract:
- **Pattern name**: e.g., "Hierarchical Agent Orchestration"
- **Source**: URL and author/org
- **Summary**: 2-3 sentences on the approach
- **Implementation notes**: Concrete techniques or code patterns
- **Applicability**: How this relates to our setup

- Decision: If > 20 insights, prioritize top 10 by recency + source authority

### 6. Identify New Sources
Scan results for new reputable sources not in sources.md:
- Blogs with multiple high-quality agent posts
- GitHub repos with > 1000 stars focused on agent architectures
- Academic authors with multiple cited papers
- Practitioners with consistent, technical content

- Add to appropriate category in sources.md with discovery date

### 7. Analyze Current Setup (if Compare=true)
Read and analyze:
```
.opencode/AGENTS.md           # Agent definitions and rules
.opencode/agents/*.md         # Individual agent configurations (when scaffolded)
.opencode/skill/*/SKILL.md    # Skill definitions (when scaffolded)
.opencode/command/*.md        # Command definitions
openspec/                     # Change proposal framework (or `.opencode/openspec/` when scaffolded)
```

For each insight, evaluate:
- **Gap**: Does our setup lack this capability?
- **Alignment**: Are we already doing this? How well?
- **Conflict**: Does this contradict our current approach?

- Reasoning: Compare specific patterns, not general concepts

### 8. Generate Improvement Proposals
For each identified gap or enhancement opportunity:
- **Title**: Verb-noun format (e.g., "Add Agent Memory Layer")
- **Category**: Architecture | Tooling | Prompts | Process
- **Priority**: P0 (critical) | P1 (high) | P2 (medium) | P3 (nice-to-have)
- **Effort**: S (< 1 day) | M (1-3 days) | L (1 week+)
- **Description**: What to change and why
- **Source**: Link to the insight that inspired this

- Decision: Limit to top 10 proposals, sorted by priority then effort

### 9. Update Sources Registry
Write updated sources.md with:
- New sources discovered
- Updated "last checked" timestamps
- Quality ratings based on this session's results
- Removed sources that returned poor results

## Output Format
```markdown
# SOTA Multi-Agent Research Report

**Generated**: {current_date}
**Focus**: <focus area>
**Depth**: <depth level>
**Queries Executed**: <count>

## Date Context
- **Research Date**: {current_date}
- **Year Range for Queries**: {previous_year}-{current_year}
- **Breaking Cutoff**: {one_week_cutoff} (last 7 days - highest priority)
- **Fresh Cutoff**: {one_month_cutoff} (last 30 days - high priority)
- **Recent Cutoff**: {three_month_cutoff} (last 90 days - medium priority)

## Executive Summary
- <Key finding 1>
- <Key finding 2>
- <Key finding 3>
- <Key finding 4>
- <Most impactful recommendation>

## Key Findings by Category

### Multi-Agent Orchestration
#### <Pattern Name>
- **Source**: [Title](URL) by Author/Org
- **Summary**: <2-3 sentences>
- **Key technique**: <specific implementation detail>

### Tool Use & Function Calling
...

### Memory & Context Management
...

### Prompt Engineering
...

### Emergent Tooling
...

### Production Patterns
...

## Current Setup Analysis

### Strengths
- <What we're doing well>
- <Alignment with best practices>

### Gaps
- <Missing capability 1>
- <Missing capability 2>

### Opportunities
- <Enhancement 1>
- <Enhancement 2>

## Improvement Proposals

| # | Title | Category | Priority | Effort | Source |
|---|-------|----------|----------|--------|--------|
| 1 | <title> | <cat> | P0 | M | [link] |
| 2 | <title> | <cat> | P1 | S | [link] |
...

### Proposal Details

#### 1. <Title>
**Priority**: P0 | **Effort**: M | **Category**: Architecture

**Problem**: <What gap this addresses>

**Recommendation**: <Specific changes to make>

**Implementation Notes**:
- <Step 1>
- <Step 2>

**Source**: [Title](URL)

---

## Updated Sources

Added <N> new sources to tracking. See `skill/sota-research/sources.md` (or `.opencode/skill/...` when scaffolded).

### Newly Discovered
- [Source Name](URL) - <category> - <why notable>
```

## Examples

### Good: Targeted Research with Actionable Proposals
```
Focus: orchestration
Depth: standard
Compare: true

Output:
# SOTA Multi-Agent Research Report

**Generated**: 2025-01-11
**Focus**: orchestration
**Depth**: standard
**Queries Executed**: 8

## Executive Summary
- Hierarchical agent architectures outperform flat structures for complex tasks (Anthropic research)
- State machines for agent handoffs reduce errors by 40% vs ad-hoc transitions
- "Mixture of Agents" pattern from Together AI shows promise for specialized skill routing
- OpenAI Swarm provides minimal, production-ready handoff patterns
- Recommendation: Add explicit state machine for agent transitions in AGENTS.md

## Key Findings by Category

### Multi-Agent Orchestration
#### Hierarchical Task Decomposition
- **Source**: [Building Effective Agents](https://anthropic.com/research/building-effective-agents) by Anthropic
- **Summary**: Complex tasks benefit from a planning agent that decomposes work before delegating to specialized workers. The orchestrator maintains high-level state while workers handle atomic operations.
- **Key technique**: Use structured outputs for inter-agent communication with explicit handoff protocols.

...

## Current Setup Analysis

### Strengths
- Clear agent role separation (orchestrator, planner, builder, researcher)
- Skills provide good capability encapsulation

### Gaps
- No explicit state machine for agent transitions
- Missing structured inter-agent message format
- No agent-level error recovery protocol

## Improvement Proposals

| # | Title | Category | Priority | Effort | Source |
|---|-------|----------|----------|--------|--------|
| 1 | Add Agent State Machine | Architecture | P1 | M | [Anthropic] |
| 2 | Standardize Agent Messages | Architecture | P2 | S | [OpenAI Swarm] |

### Proposal Details

#### 1. Add Agent State Machine
**Priority**: P1 | **Effort**: M | **Category**: Architecture

**Problem**: Agent handoffs are implicit, making debugging difficult and error recovery ad-hoc.

**Recommendation**: Define explicit states (idle, planning, executing, reviewing, blocked, complete) and valid transitions in AGENTS.md. Each agent declares which states it can enter/exit.

**Implementation Notes**:
- Add `## State Transitions` section to each agent definition
- Create state validation in orchestrator before handoffs
- Log state changes for observability

**Source**: [Building Effective Agents](https://anthropic.com/research/building-effective-agents)
```

### Bad: Vague Research Without Actionable Output
```
Focus: all
Depth: quick

Output:
# Research Results

I found some articles about multi-agent systems. Here are some links:
- https://example.com/article1
- https://example.com/article2
- https://example.com/article3

These talk about how agents can work together. You should read them.

Recommendations:
- Make agents better
- Add more features
- Improve prompts

Problems:
- No specific findings extracted
- No categorization
- No analysis of current setup
- No prioritization
- No implementation details
- Recommendations are vague and non-actionable
```

### Edge Case: No Relevant Results
```
Focus: memory
Depth: standard
Compare: true

Handling:
If searches return < 5 relevant results:
1. Broaden query terms (remove date filters, use synonyms)
2. Check tracked sources directly for recent posts
3. If still insufficient, report partial findings with note:
   "Limited recent research found on <topic>. Findings based on <N> sources.
    Consider: <alternative search strategies>"
4. Still analyze current setup against available findings
5. Proposals marked as "low confidence" if based on limited sources
```

## Guidelines

1. **Always cite sources** - Every finding must link to the original URL. Unsourced claims are useless.

2. **Establish date context first** - Always complete Step 0 before any searches. Use `{current_year}`, `{previous_year}`, and date cutoffs throughout the process to ensure temporal accuracy.

3. **Prioritize recency using calculated dates** - AI/LLM best practices evolve rapidly. For daily/weekly runs: prioritize breaking (7 days) and fresh (30 days) content. Flag sources older than `{three_month_cutoff}` as potentially stale.

4. **Extract specifics, not generalities** - "Use chain-of-thought" is not useful. "Prefix each step with reasoning tags like `<thinking>`" is actionable.

5. **Compare apples to apples** - When analyzing our setup, compare specific implementations, not abstract concepts. Don't say "we lack memory" if we have session context.

6. **Effort estimates must be realistic** - S (small) means < 1 day of focused work. Don't underestimate integration and testing.

7. **Update sources.md every invocation** - The source registry is only valuable if maintained. Remove low-quality sources, add new discoveries.

8. **Don't overwhelm with proposals** - 10 well-specified proposals > 30 vague ideas. Quality over quantity.

9. **Respect source authority** - OpenAI/Anthropic/DeepMind research > random blog posts. Academic papers > HackerNews comments. Practitioners with track records > anonymous tutorials.

10. **Note conflicting advice** - If sources disagree, report both perspectives with your assessment of which applies to our context.

11. **Make it reproducible** - Include the exact queries used (with resolved date variables) so research can be repeated or refined.
