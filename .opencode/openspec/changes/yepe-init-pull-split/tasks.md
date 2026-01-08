## 1. Project detection implementation
- [ ] 1.1 Create `src/detect.ts` with detection functions for name, description, tech stack
  - **Validation:** `npm test -- detect.test.ts` passes
  - **Effort:** 3 points
  - **Files:** `packages/yepe/src/detect.ts`, `packages/yepe/src/detect.test.ts`

- [ ] 1.2 Implement `detectProjectName()` - check package.json, Cargo.toml, pyproject.toml, fallback to directory
  - **Validation:** Unit tests cover all file types and fallback
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/detect.ts`

- [ ] 1.3 Implement `detectProjectDescription()` - check package.json, Cargo.toml, pyproject.toml, README.md
  - **Validation:** Unit tests cover all sources and empty fallback
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/detect.ts`

- [ ] 1.4 Implement `detectTechStack()` - infer from package.json dependencies, Cargo.toml, pyproject.toml
  - **Validation:** Unit tests verify tech stack detection for common frameworks
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/detect.ts`

## 2. Command separation
- [ ] 2.1 Update `src/cli.ts` to support command routing (init vs pull)
  - **Validation:** `npx yepe init --help` and `npx yepe pull --help` show correct usage
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/cli.ts`
  - **Dependencies:** None (can parallelize with 1.x)

- [ ] 2.2 Extract onboarding logic from `init()` into separate `runOnboarding()` function
  - **Validation:** Existing tests pass, no behavior change
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/init.ts`
  - **Dependencies:** Task 2.1

- [ ] 2.3 Create `pull()` function that skips onboarding but runs blueprint update + learnings
  - **Validation:** `npx yepe pull` in existing repo updates files without prompts
  - **Effort:** 3 points
  - **Files:** `packages/yepe/src/init.ts` or `packages/yepe/src/pull.ts`
  - **Dependencies:** Task 2.2

## 3. Integration of detection with prompts
- [ ] 3.1 Update `promptProjectInfo()` to accept detected defaults
  - **Validation:** Prompts show detected values as defaults
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/prompts.ts`
  - **Dependencies:** Tasks 1.1-1.4

- [ ] 3.2 Update `getDefaultProjectInfo()` to use detection functions
  - **Validation:** Non-interactive mode uses detected values
  - **Effort:** 1 point
  - **Files:** `packages/yepe/src/prompts.ts`
  - **Dependencies:** Task 3.1

- [ ] 3.3 Update interactive prompts to show detected values in prompt text
  - **Validation:** Manual test shows "Project name [detected-name]:" format
  - **Effort:** 1 point
  - **Files:** `packages/yepe/src/prompts.ts`
  - **Dependencies:** Task 3.1

## 4. Testing and validation
- [ ] 4.1 Write integration tests for `init` command with detection
  - **Validation:** `npm test -- init.test.ts` covers detection scenarios
  - **Effort:** 3 points
  - **Files:** `packages/yepe/src/init.test.ts`
  - **Dependencies:** Tasks 1.x, 3.x

- [ ] 4.2 Write integration tests for `pull` command
  - **Validation:** `npm test -- pull.test.ts` covers update-only scenarios
  - **Effort:** 2 points
  - **Files:** `packages/yepe/src/pull.test.ts`
  - **Dependencies:** Task 2.3

- [ ] 4.3 Test both commands in real repos (Node.js, Rust, Python projects)
  - **Validation:** Manual smoke tests in 3 different project types
  - **Effort:** 2 points
  - **Dependencies:** All above tasks

## 5. Documentation
- [ ] 5.1 Update README.md with `init` vs `pull` usage examples
  - **Validation:** README clearly explains when to use each command
  - **Effort:** 1 point
  - **Files:** `packages/yepe/README.md`
  - **Dependencies:** Tasks 2.x

- [ ] 5.2 Add detection behavior documentation
  - **Validation:** README documents which files are checked for detection
  - **Effort:** 1 point
  - **Files:** `packages/yepe/README.md`
  - **Dependencies:** Tasks 1.x

- [ ] 5.3 Update help text in CLI for both commands
  - **Validation:** `--help` output is clear and accurate
  - **Effort:** 1 point
  - **Files:** `packages/yepe/src/cli.ts`
  - **Dependencies:** Task 2.1

## 6. Validation and release
- [ ] 6.1 Run `openspec validate yepe-init-pull-split --strict`
  - **Validation:** No validation errors
  - **Effort:** 1 point
  - **Dependencies:** All spec deltas complete

- [ ] 6.2 Update package version and publish to npm
  - **Validation:** `npx @yepe/init` and `npx @yepe/pull` work from npm
  - **Effort:** 1 point
  - **Dependencies:** All tasks complete

## Task Dependencies Visualization

```
Phase 1: Detection (parallel)
├─ 1.1 Create detect.ts
├─ 1.2 detectProjectName()
├─ 1.3 detectProjectDescription()
└─ 1.4 detectTechStack()

Phase 2: Command separation (parallel with Phase 1)
├─ 2.1 CLI routing
├─ 2.2 Extract onboarding (requires 2.1)
└─ 2.3 Create pull() (requires 2.2)

Phase 3: Integration (requires Phase 1 + 2.2)
├─ 3.1 Update promptProjectInfo()
├─ 3.2 Update getDefaultProjectInfo() (requires 3.1)
└─ 3.3 Update prompt text (requires 3.1)

Phase 4: Testing (requires Phase 3)
├─ 4.1 Init tests
├─ 4.2 Pull tests
└─ 4.3 Manual smoke tests

Phase 5: Documentation (requires Phase 2-3)
├─ 5.1 README commands
├─ 5.2 README detection
└─ 5.3 CLI help text

Phase 6: Release (requires all above)
├─ 6.1 Validate
└─ 6.2 Publish
```

## Effort Summary
- Total: 30 points
- Phase 1 (Detection): 9 points
- Phase 2 (Commands): 7 points
- Phase 3 (Integration): 4 points
- Phase 4 (Testing): 7 points
- Phase 5 (Docs): 3 points
