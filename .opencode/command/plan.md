---
description: Invoke the planner agent to break down work into actionable steps.
agent: planner
---
Plan the following work by breaking it into clear, actionable steps with validation criteria.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Review any existing OpenSpec changes, proposals, or beads issues related to this work.
2. Ask clarifying questions if requirements are ambiguous—label them clearly (`Question:`).
3. Break work into steps sized for a single implementation pass (<~100 LOC when possible).
4. Cite file paths, test commands, and acceptance criteria for each step.
5. Highlight dependencies and what can be parallelized.
6. If no specific work is described, ask what the user wants planned.
