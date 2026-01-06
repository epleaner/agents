## 1. Blueprint command design
- [ ] 1.1 Inventory which files/directories constitute the reusable blueprint (AGENTS, `.opencode/`, workflow commands, sample beads notes).
- [ ] 1.2 Choose packaging + invocation strategy (prefer `npx` fallback script) and document trade-offs.

## 2. Implementation
- [ ] 2.1 Scaffold the CLI entry point that downloads or clones the blueprint assets.
- [ ] 2.2 Add logic to detect existing files and prompt/record merge strategies so reruns are safe.
- [ ] 2.3 Include verification (git repo check, Node version, beads hooks) and helpful error messages.

## 3. Validation & docs
- [ ] 3.1 Write smoke tests that apply the command to a temp repo and confirm assets exist.
- [ ] 3.2 Document usage in `AGENTS.md` / README (install, update, troubleshooting) and link the beads/change IDs.
- [ ] 3.3 Run `openspec validate add-blueprint-scaffold-command --strict` and attach validation output to beads agents-pzm.
