![MAIASS Banner](https://raw.githubusercontent.com/vsmash/maiass/main/assets/maiassbanner2.png)

# `|))` MAIASS (Node.js)
**Modular AI-Augmented Semantic Scribe** — intelligent Git workflow automation

[![npm](https://img.shields.io/npm/v/maiass.svg)](https://www.npmjs.com/package/maiass)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

---

MAIASS automates the repetitive parts of your Git workflow: staging, AI-powered commit messages, branch merging, version bumping, and changelog generation — all from a single command.

> Looking for the shell/Homebrew version? See [bashmaiass](https://github.com/vsmash/bashmaiass).

---

## Installation

```bash
npm install -g maiass
```

Requires Node.js 20+.

---

## Quick Start

```bash
# First time in a project — run setup
maiass --setup

# Everyday use — commit, merge, bump patch version
maiass

# Specific version bumps
maiass minor    # 1.2.3 → 1.3.0
maiass major    # 1.2.3 → 2.0.0

# Commit only, skip version management
maiass --commits-only

# Preview without making changes
maiass --dry-run patch
```

---

## AI Commit Messages

MAIASS uses its own proxy service for AI-powered commit message suggestions. On first run it creates an anonymous subscription automatically — no sign-up required.

To use a named account (for credit top-ups):

```bash
maiass config set MAIASS_AI_TOKEN your_api_key
```

AI mode is configured per-project in `.env.maiass`:

```bash
MAIASS_AI_MODE=ask        # ask each time (default)
MAIASS_AI_MODE=autosuggest  # always use AI
MAIASS_AI_MODE=off          # disable AI
```

---

## Key Features

- **AI commit messages** — analyses your diff and suggests a structured commit message
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

## 🙏 Acknowledgments

- Git community for workflow inspiration
- All contributors and testers

## License

[GNU General Public License v3.0](LICENSE)

---

**Made with ❤️ for developers who want to automate versioning, changelogs, and commit messages.**

## 💸 Support MAIASS

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=github)](https://github.com/sponsors/vsmash)
[![Ko-fi](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Ko--fi-29abe0?logo=ko-fi)](https://ko-fi.com/myass)
