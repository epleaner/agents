---
description: Create a new agent definition following SOTA prompt engineering best practices
---

Create a new agent following state-of-the-art prompt engineering best practices (role definition, chain-of-thought, reflexion, few-shot examples).

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Provide agent name, purpose, and capabilities
2. Specify which tools the agent needs (write, edit, bash, task; and read/glob/grep for review-only agents)
3. Define what the agent should NOT do (boundaries)
4. Include example scenarios if the agent's role is complex
5. The skill will research SOTA patterns and create a well-structured agent definition

**Example Usage**
```
/new-agent Create a "security-auditor" agent that scans code for vulnerabilities, runs security linters, and generates security reports. Should have bash access for running tools but no write/edit permissions.
```

**What You'll Get**
- `.opencode/agent/<name>.md` - Agent definition with SOTA patterns
- Optional: `.opencode/command/<name>.md` - Command to invoke the agent
- Quality validation against SOTA checklist
