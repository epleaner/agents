# Portable OpenCode Configuration Bundle

This guide explains how to package, install, and apply the shared `.opencode/` assets so contributors can bootstrap consistent environments on laptops, remote devboxes, and CI/cloud runners.

## Directory Layout

| Location | Purpose |
| --- | --- |
| `$REPO/.opencode/shared/` | Read-only sync of the shared bundle for this repo/service. Managed by `bin/portable-config-bundle update`. |
| `$REPO/.opencode/local/` | Service-specific overrides (kept out of the shared bundle). Safe to edit manually. |
| `$HOME/.config/opencode/portable-config-bundle/.opencode/` | Installed copy of the bundle on the workstation/devbox. Used as the source of truth for `update`. |
| `.opencode/templates/AGENTS-portable-config.md` | Drop-in excerpt for repository `AGENTS.md` files explaining how to consume the shared bundle. |

## Packaging & Inventory

The bundle archives everything under `.opencode/` (agents, skills, commands, templates, plugins) except `node_modules`. To inspect the payload locally:

```bash
bin/portable-config-bundle inventory
bin/portable-config-bundle package  # writes dist/portable-config-bundle.tar.gz
```

## Bootstrap Instructions

### macOS laptop (local workstation)
1. Clone this repository (or the shared config repo).
2. Run:
   ```bash
   bin/portable-config-bundle package
   bin/portable-config-bundle install \
     --archive dist/portable-config-bundle.tar.gz \
     --dest "$HOME/.config/opencode/portable-config-bundle"
   ```
3. Apply the bundle to your service/repo:
   ```bash
   bin/portable-config-bundle update --repo "$PWD"
   ```

### Remote devbox (Linux)
1. Copy the repo or `dist/portable-config-bundle.tar.gz` to the devbox.
2. Choose an install directory:
   ```bash
   export OPENCODE_CONFIG_DIR=/workspace/config/opencode
   bin/portable-config-bundle install --archive dist/portable-config-bundle.tar.gz
   ```
3. Sync into the repo (shared files go to `.opencode/shared/`, overrides stay in `.opencode/local/`).

### CI / Cloud runners
1. Check the bundle artifact into build storage or upload `dist/portable-config-bundle.tar.gz` as part of CI caching.
2. During a job:
   ```bash
   bin/portable-config-bundle install --archive dist/portable-config-bundle.tar.gz --dest "$RUNNER_TEMP/opencode"
   bin/portable-config-bundle update --repo "$GITHUB_WORKSPACE" --bundle-dir "$RUNNER_TEMP/opencode/.opencode"
   ```
3. If jobs need repo-specific overrides, place them in `.opencode/local/` before running `update` so rsync preserves them.

## Repo-Level Instructions

Use `.opencode/templates/AGENTS-portable-config.md` as an `AGENTS.md` excerpt to tell contributors how to install/update the bundle. The template covers packaging, install destinations, and how `.opencode/shared/` vs `.opencode/local/` interact.

## Updating & Re-Syncing

- Run `bin/portable-config-bundle package` whenever `.opencode/` changes.
- Commit the updated `dist/portable-config-bundle.tar.gz` artifact if you want deterministic CI installs, or regenerate it in CI via the same command.
- Contributors can re-run `bin/portable-config-bundle update --repo $PWD` at any time; rsync updates `.opencode/shared/` but leaves `.opencode/local/` untouched.

## Verification Workflow

Validation is automated via:

```bash
bin/portable-config-bundle verify --repo examples/sample-service
```

This command executes package → install → update against the sample repo under `examples/sample-service`. A successful run proves:
- The archive can be created without node_modules.
- Installation to a clean directory succeeds.
- Updating a repo writes into `.opencode/shared/` while preserving `.opencode/local/`.

Record the verification timestamp/output in beads when preparing a release.
