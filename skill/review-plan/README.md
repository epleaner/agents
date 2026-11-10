# review-plan Skill

Reviews task plans against LLM planning best practices and provides actionable feedback for improvement.

## Quick Start

```bash
# Review a task plan
skill/review-plan/scripts/review-plan openspec/changes/<change-id>/tasks.md

# Target score: ≥30/40 (75%) before proceeding to implementation
```

## What It Does

The `review-plan` skill analyzes task plans across 8 dimensions based on LLM planning research:

1. **Task Decomposition** - Are tasks atomic and well-structured?
2. **Step-by-Step Reasoning** - Is rationale explicit?
3. **Tree/Graph of Thoughts** - Are alternatives explored?
4. **Reflection** - Are risks and validation considered?
5. **Context & Memory** - Is prior work referenced?
6. **Success Criteria** - Are acceptance criteria measurable?
7. **Specificity & Clarity** - Are tasks concrete with file paths?
8. **Dependency Management** - Are task relationships explicit?

## Output Example

```
=== SCORE BREAKDOWN ===

| Dimension                 | Score | Notes                          |
|---------------------------|-------|--------------------------------|
| Task Decomposition        | 5/5   | 10 tasks found                 |
| Step-by-Step Reasoning    | 5/5   | Rationale: Present             |
| Tree/Graph of Thoughts    | 4/5   | Alternatives: Present          |
| Reflection                | 5/5   | Validation steps: 18           |
| Context & Memory          | 5/5   | References: Present            |
| Success Criteria          | 5/5   | Validation/task ratio: 18/10   |
| Specificity & Clarity     | 4/5   | File paths: 11                 |
| Dependency Management     | 5/5   | Dependency mentions: 12        |

OVERALL SCORE: 38/40 (95%)
Grade: A (Excellent)
```

## Integration with Planner Agent

The planner agent automatically uses this skill in step 5 of the workflow:

1. Assess scope
2. Research
3. Clarify
4. Create proposal
5. **Review plan** ← Uses `review-plan` skill
6. Validate
7. Hand off
8. Reflect

## Examples

See `examples/` directory:
- `before-review.md` - Poor plan (score: 12/40, 30% - Grade F)
- `after-review.md` - Improved plan (score: 38/40, 95% - Grade A)

## Files

- `SKILL.md` - Full skill documentation with best practices checklist
- `scripts/review-plan` - Bash script for automated review
- `examples/` - Before/after examples
- `README.md` - This file

## When to Use

Use this skill whenever you:
- Create a new OpenSpec proposal with tasks
- Modify an existing task plan
- Want to validate task quality before implementation
- Need to improve a low-scoring plan

## Score Interpretation

| Score | Grade | Action |
|-------|-------|--------|
| 36-40 | A | Excellent - ready to proceed |
| 30-35 | B | Good - minor improvements recommended |
| 24-29 | C | Acceptable - address key issues |
| 16-23 | D | Needs work - significant revision |
| 0-15  | F | Major revision required |

**Target:** ≥30/40 (75%) before proceeding to implementation

## Critical Issues Auto-Detection

The script automatically flags critical issues:
- ❌ No validation steps found
- ❌ No file paths specified
- ❌ No dependencies mapped (for multi-task plans)
- ❌ Missing rationale/reasoning
- ❌ Poor task decomposition

## For More Details

See `SKILL.md` for:
- Complete best practices checklist
- Red flags for each dimension
- Integration with propose-new workflow
- Detailed examples
