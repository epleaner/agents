# Change: Split yepe into init and pull commands with smart project detection

> Note: yepe has moved to `https://github.com/epleaner/yepe`. File paths in this change are relative to that repo.

## Why
Currently, `npx @yepe/init` runs the full onboarding flow every time, prompting for project name, description, and beads prefix even when updating an existing setup. This creates friction for users who just want to pull blueprint updates without re-answering setup questions. Additionally, the onboarding flow requires manual input for project metadata that could be auto-detected from common project files (package.json, Cargo.toml, pyproject.toml, README.md).

## What Changes
- **Split commands:**
  - `init` - Full onboarding flow for new projects (current behavior + smart detection)
  - `pull` - Update existing setup, skip onboarding, apply blueprint updates and learnings
- **Smart project detection for `init`:**
  - Auto-detect project name from package.json, Cargo.toml, pyproject.toml, or directory name
  - Auto-detect description from package.json description, README.md first paragraph, or Cargo.toml description
  - Offer detected values as defaults during interactive prompts
  - Use detected values automatically in non-interactive mode
- **Preserve existing behavior:**
  - `npx @yepe/init` continues to work (runs full init flow)
  - Non-interactive mode (`--non-interactive`) works with both commands
  - Config file support (`--config`) works with both commands

## Impact
- **Affected code:**
  - `src/cli.ts` - Add command routing (init vs pull)
  - `src/init.ts` - Extract onboarding logic, add detection
  - `src/prompts.ts` - Add detection functions, update prompts with defaults
  - `src/detect.ts` - New file for project detection logic
  - `README.md` - Document both commands
- **Breaking changes:** None - `npx @yepe/init` maintains current behavior
- **User experience:** Faster updates for existing projects, less manual input for new projects
