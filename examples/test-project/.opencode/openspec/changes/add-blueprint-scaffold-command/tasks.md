## 1. yepe command design
- [x] 1.1 Inventory which files/directories constitute the reusable blueprint (AGENTS, `.opencode/`, workflow commands, sample beads notes).
- [x] 1.2 Choose packaging + invocation strategy: npm package `@yepe/init` + shell script fallback.

## 2. Implementation - npm package
- [x] 2.1 Create npm package structure for `@yepe/init` with CLI entry point.
- [x] 2.2 Implement asset download/clone logic from blueprint source repository.
- [x] 2.3 Add file conflict detection and staging to `.opencode/.yepe-tmp`.
- [x] 2.4 Implement merge logic that copies non-conflicting files automatically.
- [x] 2.5 Generate `.yepe-report.json` summarizing conflicts and changes.
- [x] 2.6 Add prerequisite validation (git repo, clean working tree).
- [x] 2.7 Implement helpful error messages with remediation instructions.

## 2b. Implementation - shell script
- [x] 2b.1 Create POSIX-compliant shell script `install.sh` with identical logic to npm package.
- [x] 2b.2 Implement asset download using curl/wget with fallback detection.
- [x] 2b.3 Add same conflict detection and staging logic using shell commands.
- [x] 2b.4 Generate identical `.yepe-report.json` output.
- [x] 2b.5 Add prerequisite validation (git, curl/wget, standard Unix tools).
- [x] 2b.6 Test on multiple shells (bash, zsh, sh) and platforms (Linux, macOS).

## 3. Validation & docs
- [x] 3.1 Write smoke tests for both `npx @yepe/init` and shell script in temp repos.
- [x] 3.2 Test idempotent re-runs and verify conflict detection works correctly for both methods.
- [x] 3.3 Verify both methods produce identical results and reports.
- [x] 3.4 Document usage in `AGENTS.md` / README (both invocation methods, troubleshooting) and link the beads/change IDs.
- [x] 3.5 Run `openspec validate add-blueprint-scaffold-command --strict` and attach validation output to beads agents-pzm.

## 4. Publishing & release
- [ ] 4.1 Set up npm package publishing workflow (CI/CD or manual).
- [ ] 4.2 Set up hosting for shell script (GitHub Pages, yepe.dev domain, or versioned GitHub raw URLs).
- [ ] 4.3 Implement checksum/signature verification for shell script downloads.
- [ ] 4.4 Create release checklist for versioning blueprint assets and keeping both methods in sync.
- [ ] 4.5 Document version pinning strategy for consumers (npm versions and script URLs).
