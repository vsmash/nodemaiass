![MAIASS Banner](https://raw.githubusercontent.com/vsmash/maiass/main/assets/maiassbanner2.png)

# MAIASS

**AI commit messages, version bumps, and changelogs from one command.**

[![npm](https://img.shields.io/npm/v/maiass.svg)](https://www.npmjs.com/package/maiass)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

---

Run `maiass` in any git repo and it commits your staged changes, writes the commit message, bumps the version, updates the changelog, and merges the branch. It's for developers who do this routine every day and want the keystrokes back. Anonymous on first run — no email, no card, no sign-up.

By default MAIASS only ever commits changes you have already staged — it leaves unstaged and untracked files alone. To have it stage everything for you, either answer the interactive prompt, pass `--auto-stage` for a single run, or set `MAIASS_AUTO_STAGE_UNSTAGED=true` to make it the default.

> Site: [maiass.net](https://maiass.net) · Bash/Homebrew source: [bashmaiass](https://github.com/vsmash/bashmaiass)

---

## Install

**npm — all platforms (primary):**

```bash
npm install -g maiass
```

**Homebrew — macOS:**

```bash
brew tap vsmash/maiass && brew install maiass
```

Requires Node.js 20+ for the npm install. Linux script install and other options are in the [docs](docs/setup.md).

---

## Quick start

```bash
# First time in a project — run setup
maiass --setup

# Everyday use — commit, merge, bump patch version
maiass

# Specific version bumps
maiass minor    # 1.2.3 → 1.3.0
maiass major    # 1.2.3 → 2.0.0

# Interactive commit-only, skip version management
maiass --commits-only        # short: -c or -co

# Unattended commit-only — commit STAGED changes, push, then stop (no merge, no bump)
maiass --unattended-commit   # short: -uc (interactive sibling: -co / --commits-only)

# Preview without making changes
maiass --dry-run patch
```

---

## CI auto-version-bump

One flag installs a CI workflow that runs `maiass -a patch` every time a PR merges into your develop branch — so version bumps and changelog entries never get forgotten.

```bash
# GitHub Actions — writes .github/workflows/maiass-version-bump.yml
maiass --create-gh-action

# GitLab CI — prints a job stage to paste into .gitlab-ci.yml
maiass --show-gl-excerpt

# Bitbucket Pipelines — prints a step to paste into bitbucket-pipelines.yml
maiass --show-bb-excerpt
```

The installed workflow sets `MAIASS_AI_MODE=off`, so the bump runs at zero AI credit cost. Your configured `MAIASS_DEVELOPBRANCH` is baked into the trigger filter at install time. Full setup (PAT scopes for GitHub, double-bump guard for GitLab/Bitbucket) in [the workflow docs](docs/workflow.md#-ci-auto-version-bump-on-pr-merge).

---

## Anonymous by default

First run creates a subscription tied to a machine fingerprint — no email, no account, no card. When you need credits, top up at [maiass.net](https://maiass.net) or run `maiass --setup` to add an API key for a named account.

API keys live in OS-level secure storage (Keychain on macOS, Secret Service on Linux, encrypted local store on Windows), never in your repo. Commit diffs are sent to the proxy to generate the message and aren't stored — token counts, model, timestamp, and source IP are kept for billing and abuse prevention.

AI mode per project in `.env.maiass`: `ask` / `autosuggest` / `off`.

Run `maiass account-info` to see your subscription ID, credit balance, and top-up link.

---

## Key features

- **AI commit messages** — analyses your diff and suggests a structured commit message
- **CI auto-version-bump** — one flag installs a GitHub Actions, GitLab CI, or Bitbucket Pipelines workflow that bumps the version on every merge to your develop branch, at zero AI credit cost
- **Version management** — detects and bumps `package.json`, `composer.json`, `VERSION`, `.pbxproj` (Swift/Xcode), and more
- **Changelog generation** — user-facing `CHANGELOG.md` and internal developer changelog
- **Branch workflow** — feature → develop → staging → main with merge handling
- **Ticket integration** — ticket numbers auto-detected from branch names (Jira `ABC-123`, GitHub/Trello `#123` or `123`)
- **First-run friendly** — works immediately with sensible defaults, no blocking setup

---

## Configuration

MAIASS uses `.env.maiass` files for configuration:

| File | Purpose |
|------|---------|
| `.env.maiass` | Project settings, committed to git |
| `.env.maiass.local` | Personal overrides, gitignored |

Run `maiass --setup` to configure a project interactively, or edit `.env.maiass` directly.

Common variables:

```bash
MAIASS_AI_MODE=ask
MAIASS_MAINBRANCH=main
MAIASS_DEVELOPBRANCH=develop
MAIASS_STAGINGBRANCH=staging
MAIASS_VERSION_PRIMARY_FILE=package.json
MAIASS_DEBUG=true                 # verbose output
```

---

## Supported Version File Formats

| Format | Example |
|--------|---------|
| npm | `package.json` |
| PHP/Composer | `composer.json` |
| WordPress | `style.css`, `plugin.php` |
| Plain text | `VERSION` |
| Swift/Xcode | `*.xcodeproj/project.pbxproj` |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [Configuration](docs/configuration.md) | All config variables and `.env.maiass` options |
| [Commands](docs/commands.md) | Full command reference |
| [Workflow](docs/workflow.md) | How the 4-phase pipeline works |
| [Setup](docs/setup.md) | Platform-specific setup notes |
| [API Reference](docs/api.md) | Internal module API |
| [Development](docs/development.md) | Contributing and dev setup |

---

## Contributing

Issues and PRs welcome. See [docs/development.md](docs/development.md) to get started.

## Acknowledgments

- Git community for workflow inspiration
- All contributors and testers

## License

[GNU General Public License v3.0](LICENSE)

## Support MAIASS

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=github)](https://github.com/sponsors/vsmash)
[![Ko-fi](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Ko--fi-29abe0?logo=ko-fi)](https://ko-fi.com/myass)

---

<sub>MAIASS is a backronym for *Modular AI-Assisted Semantic Scribe*. It's also pronounced however you like.</sub>
