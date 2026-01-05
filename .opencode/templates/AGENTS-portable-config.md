# Portable OpenCode Bundle Instructions

To keep this repository aligned with the shared OpenCode configuration bundle:

1. Ensure you have the bundle installed locally:
   ```bash
   bin/portable-config-bundle package
   bin/portable-config-bundle install --archive dist/portable-config-bundle.tar.gz \
     --dest "$HOME/.config/opencode/portable-config-bundle"
   ```
   > On fresh machines or remote devboxes, set `OPENCODE_CONFIG_DIR` before running install if you prefer a different destination.

2. Pull the shared assets into this repository while preserving overrides:
   ```bash
   bin/portable-config-bundle update --repo "$PWD"
   ```
   - Shared files land in `.opencode/shared/`
   - Project overrides belong in `.opencode/local/`

3. When updates ship:
   ```bash
   bin/portable-config-bundle package
   bin/portable-config-bundle update --repo "$PWD"
   ```
   Review the rsync output and commit any `.opencode/shared/` changes that should live in version control (leave `.opencode/local/` untracked for service-specific notes).

4. Add onboarding pointers in `AGENTS.md` referencing this excerpt so contributors know how to re-sync the bundle safely.
