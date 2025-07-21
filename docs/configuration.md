# Configuration & Environment Variables

MAIASSNODE uses a flexible, cross-platform configuration system that loads environment variables from multiple sources with a clear priority order.

## Environment Loading Priority

Variables are loaded in the following order (highest to lowest priority):

1. **`.env`** - Project-specific configuration in current working directory
2. **`.maiass.env`** - User-global configuration in home directory
3. **`config.env`** - General settings in OS config directory
4. **`secure.env`** - Sensitive variables in OS secure directory

## OS-Specific Locations

### Windows
- Config: `%APPDATA%\maiassnode\config.env`
- Secure: `%LOCALAPPDATA%\maiassnode\secure.env`

### macOS
- Config: `~/Library/Application Support/maiassnode/config.env`
- Secure: `~/Library/Application Support/maiassnode/secure.env`

### Linux
- Config: `~/.config/maiassnode/config.env`
- Secure: `~/.local/share/maiassnode/secure.env`

## Environment Variables

### Sensitive Variables (store in secure.env)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `GITHUB_TOKEN` - GitHub personal access token
- `GITLAB_TOKEN` - GitLab access token

### General Configuration
- `DEFAULT_BRANCH` - Default branch name (default: main)
- `DEVELOP_BRANCH` - Development branch name (default: develop)
- `MAIASS_VERSION` - Version override
- `DEBUG` - Enable debug output (true/false)

## Setup

Use the interactive setup script:

```bash
node setup-env.js
```

This will guide you through setting up both secure and general configuration files.

## Manual Configuration

You can also create configuration files manually:

### Example .env (project-specific)
```bash
# Project-specific settings
DEBUG=true
DEFAULT_BRANCH=main
```

### Example secure.env (sensitive)
```bash
# Sensitive variables - stored securely
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
```

### Example config.env (general)
```bash
# General user preferences
DEFAULT_BRANCH=main
DEVELOP_BRANCH=develop
MAIASS_VERSION=0.2.1
```
