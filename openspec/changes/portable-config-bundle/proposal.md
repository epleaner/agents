# Change: Add Portable OpenCode Configuration Bundle

## Why
We need a focused specification for distributing the `.opencode/` bundle so contributors can bootstrap consistent environments on laptops, devboxes, and cloud runners. Keeping this material inside plan-opencode-setup makes it difficult to update bootstrap instructions or AGENTS templates without touching other capabilities.

## What Changes
- Define what the portable bundle contains (global config, agents, skills, commands, plugins, AGENTS templates).
- Describe bootstrap workflows for new machines and repository-level adoption.
- Ensure updates can be applied without clobbering project-specific overrides or breaking beads/OpenSpec workflows.

## Impact
- Affected specs: `portable-config-bundle`
- Affected code/process: bootstrap scripts, documentation, AGENTS templates, environment detection logic.
