---
name: new-skill
description: Create a new skill for the agent setup with SOTA prompt engineering.
---

## What I do
- Guide creation of well-structured skills following SOTA prompt engineering principles
- Apply role-definition, chain-of-thought, and few-shot patterns
- Ensure skills have clear input/output specifications and validation criteria
- Generate corresponding commands when needed
- Validate skill definitions against quality checklist

## Usage Template
```
Skill Name: <verb-noun or descriptive name, e.g., "review-code", "sync-jira">
Purpose: <what problem this skill solves>
Capabilities: <what the skill can do - tools, actions, outputs>
Constraints: <optional: what the skill cannot/should not do>
Examples: <optional: example invocations and expected outputs>
```

## Process

### 1. Clarify Purpose and Scope
Before creating any files, establish:
- **Identity**: What is this skill? (e.g., "A code review assistant that...")
- **Trigger**: When should this skill be invoked?
- **Capabilities**: What tools/actions does it need access to?
- **Constraints**: What should it NOT do?
- **Success criteria**: How do we know the skill worked?

Ask clarifying questions if:
- The purpose is vague ("make a helper skill")
- Capabilities overlap significantly with existing skills
- The scope is too broad (could be multiple skills)

### 2. Research Existing Skills
Before creating, check for conflicts and patterns:
```bash
ls .opencode/skill/                    # List existing skills
cat .opencode/skill/<name>/SKILL.md    # Review similar skills
```

Ensure the new skill:
- Doesn't duplicate existing functionality
- Follows naming conventions (verb-noun: `review-plan`, `propose-new`)
- Fills a genuine gap in the agent toolkit

### 3. Define Role and Identity
Apply the **Role Definition Pattern**:

```markdown
## What I do
- <Primary capability - verb phrase>
- <Secondary capability>
- <Tertiary capability>
- <What I produce/output>
```

**Guidelines for role definition:**
- Lead with action verbs (analyze, generate, validate, transform)
- Be specific about outputs (not "help with X" but "generate X")
- List 3-5 capabilities max (focused > comprehensive)
- Omit capabilities the agent already has (file reading, web search)

### 4. Design Input/Output Specification
Create a **Usage Template** that specifies:

```markdown
## Usage Template
\```
<Required field 1>: <description and format>
<Required field 2>: <description>
<Optional field>: <optional: default behavior if omitted>
\```
```

**Good input specs:**
- Use consistent field names across skills
- Indicate required vs optional fields
- Provide format hints (file path, URL, enum values)
- Include defaults for optional fields

### 5. Structure the Process with Chain-of-Thought
Break the skill's workflow into numbered steps with reasoning checkpoints:

```markdown
## Process

### 1. <Phase Name>
- Action to take
- Reasoning checkpoint: "Verify X before proceeding"
- Decision point: "If Y, then Z; otherwise W"

### 2. <Phase Name>
...
```

**Chain-of-thought principles:**
- Make reasoning explicit ("First, analyze... then, compare... finally, synthesize...")
- Include validation at each stage
- Document decision points and branching logic
- Allow for early exit on errors

### 6. Add Few-Shot Examples
Include concrete examples showing:

1. **Good example** - Canonical usage with expected output
2. **Bad example** - Common anti-pattern to avoid
3. **Edge case** - How to handle unusual inputs

```markdown
## Examples

### Good: <Description>
\```
Input: ...
Output: ...
Why: <Explains why this is correct>
\```

### Bad: <Description>
\```
Input: ...
Problem: <What's wrong>
Fix: <How to correct it>
\```
```

### 7. Define Output Format
Specify the exact format of skill outputs:

```markdown
## Output Format
\```markdown
# <Title>

## Section 1
- Point 1
- Point 2

## Section 2
...
\```
```

**Output format guidelines:**
- Use markdown for structured output
- Include section headers for scanability
- Specify required vs optional sections
- Provide templates for common outputs

### 8. Add Guidelines and Constraints
Document what the skill should NOT do:

```markdown
## Guidelines
1. <Positive directive - what to do>
2. <Negative constraint - what NOT to do>
3. <Quality standard - how to evaluate success>
4. <Integration point - how this skill relates to others>
```

### 9. Validate the Skill Definition
Run through the **Quality Checklist** before finalizing:

**Structure (required):**
- [ ] YAML frontmatter with `name` and `description`
- [ ] `## What I do` section with 3-5 capabilities
- [ ] `## Usage Template` with input specification
- [ ] `## Process` with numbered steps
- [ ] `## Output Format` with template
- [ ] `## Guidelines` with constraints

**Content quality:**
- [ ] Role is clearly defined (identity, capabilities, constraints)
- [ ] Steps include reasoning checkpoints
- [ ] At least one good example and one bad example
- [ ] Output format is specific (not just "return results")
- [ ] Guidelines prevent common misuse

**Integration:**
- [ ] Doesn't duplicate existing skills
- [ ] Naming follows verb-noun convention
- [ ] Can be invoked from commands or other skills

### 10. Create Corresponding Command (if needed)
If the skill should be user-invocable, create a command:

```markdown
---
description: <One-line description matching skill>
---
<Brief instruction invoking the skill>

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. <How to use this command>
2. <What input to provide>
3. <When to use vs other commands>
```

Place in `.opencode/command/<skill-name>.md`

## Output Format

### Skill File: `.opencode/skill/<name>/SKILL.md`
```markdown
---
name: <skill-name>
description: <One-line description>
---

## What I do
- <Capability 1>
- <Capability 2>
- <Capability 3>

## Usage Template
\```
<Field 1>: <description>
<Field 2>: <description>
\```

## Process

### 1. <Phase>
- Step
- Validation

### 2. <Phase>
...

## Output Format
\```markdown
<Template>
\```

## Examples

### Good: <Title>
\```
<Example>
\```

### Bad: <Title>
\```
<Anti-example>
\```

## Guidelines
1. <Guideline>
2. <Constraint>
```

### Command File (optional): `.opencode/command/<name>.md`
```markdown
---
description: <One-line description>
---
<Instruction>

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. <Guideline>
```

## Examples

### Good: Well-Structured Skill

```yaml
---
name: review-security
description: Analyze code for security vulnerabilities and suggest fixes.
---

## What I do
- Scan code for OWASP Top 10 vulnerabilities
- Identify insecure dependencies via package audit
- Generate remediation recommendations with code examples
- Produce security report with severity ratings

## Usage Template
\```
Target: <file path, directory, or "all">
Scope: <full | quick - depth of analysis>
Focus: <optional: specific vulnerability types to prioritize>
\```

## Process

### 1. Dependency Audit
- Run `npm audit` or equivalent for the project type
- Flag HIGH and CRITICAL severity issues
- Checkpoint: If critical vulnerabilities found, note for immediate attention

### 2. Static Analysis
- Scan target files for common patterns:
  - SQL injection (string concatenation in queries)
  - XSS (unsanitized user input in HTML)
  - Path traversal (user input in file paths)
- Decision: If > 10 issues found, prioritize by severity

### 3. Generate Report
- List vulnerabilities by severity (CRITICAL > HIGH > MEDIUM > LOW)
- Include file path, line number, and code snippet
- Provide fix recommendation with example code

## Output Format
\```markdown
# Security Review: <target>

## Summary
- Critical: X | High: Y | Medium: Z | Low: W

## Critical Issues
### [CRITICAL] <Issue Title>
- **File**: path/to/file.ts:42
- **Type**: SQL Injection
- **Code**: \`query("SELECT * FROM users WHERE id = " + userId)\`
- **Fix**: Use parameterized queries
  \`query("SELECT * FROM users WHERE id = ?", [userId])\`

## Recommendations
1. <Priority action>
2. <Secondary action>
\```

## Examples

### Good: Specific, Actionable Output
\```
Target: src/api/
Scope: full

Output:
# Security Review: src/api/

## Summary
- Critical: 1 | High: 2 | Medium: 0 | Low: 3

## Critical Issues
### [CRITICAL] SQL Injection in getUserById
- **File**: src/api/users.ts:42
- **Type**: SQL Injection (CWE-89)
- **Code**: \`db.query("SELECT * FROM users WHERE id = " + req.params.id)\`
- **Fix**: Use parameterized queries
  \`db.query("SELECT * FROM users WHERE id = $1", [req.params.id])\`
\```

### Bad: Vague, Non-Actionable Output
\```
Target: src/

Output:
Found some security issues. You should fix them.
- There might be SQL injection somewhere
- Some dependencies are old

Problem: No specific locations, no severity, no fix guidance
Fix: Include file paths, line numbers, code snippets, and remediation steps
\```

## Guidelines
1. Always include file paths and line numbers for findings.
2. Provide working code examples for fixes, not just descriptions.
3. Do not modify code directly—only report and recommend.
4. Prioritize CRITICAL and HIGH issues; note LOW issues but don't block on them.
5. Cross-reference with `qa` skill for test coverage of security-sensitive code.
```

### Bad: Poorly-Structured Skill

```yaml
---
name: helper
description: Helps with stuff
---

## What I do
- Help users
- Do things
- Make stuff better

## Process
1. Look at what the user wants
2. Do it
3. Return results
```

**Problems:**
- ❌ Vague name ("helper" - not verb-noun)
- ❌ Vague description ("helps with stuff")
- ❌ Capabilities are non-specific ("do things")
- ❌ No usage template (what inputs?)
- ❌ Process has no reasoning checkpoints
- ❌ No output format specification
- ❌ No examples
- ❌ No guidelines/constraints

### Transformation: Before → After

**Before (weak skill):**
```yaml
---
name: code-check
description: Check code
---

## What I do
- Check code for problems
- Fix issues

## Process
1. Run checks
2. Report results
```

**After (strong skill):**
```yaml
---
name: lint-code
description: Run language-specific linters and report actionable findings.
---

## What I do
- Detect project type and select appropriate linter (ESLint, Pylint, etc.)
- Execute linter with project's configuration
- Parse output into structured findings with severity levels
- Suggest auto-fixable issues for batch correction

## Usage Template
\```
Target: <file path, directory, or "all">
Fix: <true | false - whether to auto-fix>
Config: <optional: path to custom lint config>
\```

## Process

### 1. Detect Environment
- Check for eslint.config.js, .eslintrc, pylintrc, etc.
- Identify package manager (npm, pip, etc.)
- Checkpoint: If no linter config found, use sensible defaults

### 2. Run Linter
- Execute: `npx eslint <target>` or equivalent
- Capture stdout and stderr
- Decision: If exit code > 0, parse errors; otherwise report clean

### 3. Structure Output
- Group findings by severity (error > warning > info)
- Include file path, line, rule ID, and message
- Flag auto-fixable issues

## Output Format
\```markdown
# Lint Report: <target>

## Summary
- Errors: X | Warnings: Y | Auto-fixable: Z

## Errors
- `path/file.ts:10` [no-unused-vars] 'x' is defined but never used

## Warnings
- `path/file.ts:25` [prefer-const] Use 'const' instead of 'let'

## Auto-fix Available
Run `npx eslint --fix <target>` to fix Z issues automatically.
\```

## Guidelines
1. Use project's lint config if present; don't override without explicit request.
2. Report all findings but highlight errors as blockers.
3. If Fix: true, run auto-fix and report what changed.
4. Do not modify code manually—only via linter's --fix flag.
```

## Guidelines

1. **Start with purpose** - If you can't clearly state what problem the skill solves in one sentence, it's not ready to be a skill.

2. **Be specific over comprehensive** - A skill that does one thing well is better than a skill that does many things poorly.

3. **Include reasoning checkpoints** - Every non-trivial step should have a validation or decision point.

4. **Examples are mandatory** - Abstract instructions fail; concrete examples succeed. Include at least one good and one bad example.

5. **Test the skill mentally** - Walk through the process with a real use case before finalizing.

6. **Consider integration** - How does this skill interact with others? Document handoff points.

7. **Avoid duplication** - If existing skills cover 80% of the need, extend them instead of creating new ones.

8. **Name intentionally** - Use verb-noun format: `review-plan`, `sync-jira`, `generate-tests`. The name should describe the action.
