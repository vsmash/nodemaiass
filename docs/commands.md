# CLI Commands

MAIASS provides a set of commands for Git workflow automation and project management.

## Available Commands

### `hello`
Test command to verify installation and configuration.

```bash
maiass hello
```

**Output:**
- Displays version banner
- Confirms environment loading
- Shows colorful greeting

## Planned Commands

The following commands are planned to replicate functionality from the original MAIASS script:

### Git Workflow
- `maiass init` - Initialize Git workflow in current directory
- `maiass branch <name>` - Create and switch to new feature branch
- `maiass merge` - Interactive merge workflow
- `maiass release [type]` - Create release (patch/minor/major)

### Project Management
- `maiass version` - Display version information
- `maiass config` - Manage configuration
- `maiass status` - Show project and Git status

### AI Integration
- `maiass commit` - AI-augmented commit message generation
- `maiass review` - AI code review suggestions

## Command Structure

All commands follow this pattern:

```bash
maiass <command> [options] [arguments]
```

### Global Options
- `--help, -h` - Show help for command
- `--version, -v` - Show version
- `--debug` - Enable debug output
- `--config <path>` - Use specific config file

### Workflow Options (main `maiass` command)
- `--auto, -a` - Full auto: stage, commit, push, merge to develop, bump version. Suitable for CI.
- `--auto-commit, -ac` - Auto-yes for commit phase only — stops after commit (no merge, no version bump)
- `--commits-only, -c` - Generate AI commit without entering version management
- `--auto-stage` - Auto-stage all changes (commit phase only)
- `--dry-run, -d` - Preview without making changes
- `--force, -f` - Skip confirmation prompts (still respects auto vars)
- `--silent, -s` - Suppress non-essential output
- `--tag, -t` - Force release tagging for the version bump

See [configuration.md](./configuration.md#-automation-flags-vs-environment-variables) for how these flags relate to `MAIASS_AUTO_*` environment variables.

### CI Setup Commands

One-time flags that install or print a CI workflow that auto-bumps your version on every merge to your develop branch. See [CI Auto-Version-Bump on PR Merge](./workflow.md#-ci-auto-version-bump-on-pr-merge) for the full setup walkthrough.

- `--create-gh-action` — Create `.github/workflows/maiass-version-bump.yml` in the current repo. Requires a `GH_PAT` secret with Contents/Metadata/Workflows scopes.
- `--show-gl-excerpt` — Print a GitLab CI excerpt to stdout for you to merge into `.gitlab-ci.yml`. Requires a `GITLAB_TOKEN` CI variable with write scope.
- `--show-bb-excerpt` — Print a Bitbucket Pipelines excerpt to stdout for you to merge into `bitbucket-pipelines.yml`. Requires either an SSH key with write access, or `BB_USERNAME` + `BB_APP_PASSWORD` variables.

All three flags substitute `MAIASS_DEVELOPBRANCH` (from `.env.maiass`) into the rendered workflow at the moment they run — so the trigger fires on your actual develop branch, not the literal string `develop`. Defaults to `develop` when unset.

## Examples

```bash
# Basic usage
maiass hello

# Get help
maiass --help
maiass hello --help

# Debug mode
maiass hello --debug
```

## Environment Integration

Commands automatically load environment variables from:
1. Project `.env`
2. User `.maiass.env`
3. System config files

This ensures consistent behavior across different projects and environments.
