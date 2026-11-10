---
description: Create a new skill for the agent setup with SOTA prompt engineering.
agent: builder
---
Create a new skill following SOTA prompt engineering best practices (role definition, chain-of-thought, few-shot examples).

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Gather requirements: skill name, purpose, capabilities, constraints.
2. Check existing skills in `.opencode/skill/` to avoid duplication.
3. Follow the `new-skill` skill process to create a well-structured SKILL.md.
4. Validate against the quality checklist before finalizing.
5. Create a corresponding command in `.opencode/command/` if the skill should be user-invocable.
6. If no skill description is provided, ask what capability the user wants to add.

**Output**
- `.opencode/skill/<name>/SKILL.md` - The skill definition
- `.opencode/command/<name>.md` - Optional command file (if user-invocable)
