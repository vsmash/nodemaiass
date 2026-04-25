# Configuration Guide

MAIASS uses a flexible configuration system based on `.env.maiass` files and environment variables. This guide covers all configuration options and best practices.

## 🏗️ Configuration System Overview

MAIASS uses `.env.maiass` files for configuration with a clear hierarchy:
- **Project**: `./.env.maiass` (highest priority)
- **Global**: `~/.env.maiass` (user-wide settings)
- **Environment**: System environment variables (lowest priority)

## 📁 Configuration Files

### Project Configuration (`./.env.maiass`)
Project-specific overrides stored in your project root:
```bash
# Project-specific branch names
MAIASS_MAINBRANCH=main
MAIASS_DEVELOPBRANCH=develop

# Project-specific version settings
MAIASS_VERSION_PRIMARY_FILE=package.json
MAIASS_VERSION_PRIMARY_TYPE=json
```

### Global Configuration (`~/.env.maiass`)
User-wide settings stored in your home directory:
```bash
# AI Integration (sensitive - consider security)
MAIASS_AI_TOKEN=your_api_key_here
MAIASS_AI_MODE=ask
MAIASS_AI_MODEL=gpt-4

# Global preferences
MAIASS_DEBUG=false
MAIASS_VERBOSITY=normal
```

## ⚙️ Configuration Management

### Using the CLI
```bash
# View all configuration
maiass config

# View global configuration only
maiass config --global

# View project configuration only
maiass config --project

# Set global configuration
maiass config --global maiass_token=your_key_here
maiass config --global debug=true

# Set project configuration
maiass config --project mainbranch=main
maiass config --project version_primary_file=VERSION.txt

# Edit configuration files directly
maiass config --edit --global   # Opens ~/.env.maiass
maiass config --edit --project   # Opens ./.env.maiass

# List all available variables
maiass config --list
```

### Manual Configuration
You can also create/edit `.env.maiass` files directly:

```bash
# Create global config
echo "MAIASS_AI_TOKEN=your_key" >> ~/.env.maiass

# Create project config
echo "MAIASS_MAINBRANCH=main" >> .env.maiass
```

## 📋 Complete Variable Reference

### 🤖 AI Integration
```bash
# AI Configuration
MAIASS_AI_TOKEN=your_api_key_here          # AI API key (sensitive)
MAIASS_AI_MODE=ask                         # ask, autosuggest, off
MAIASS_AI_MODEL=gpt-4                      # AI model to use
MAIASS_AI_TEMPERATURE=0.7                  # AI creativity (0.0-2.0)
MAIASS_AI_MAX_TOKENS=150                   # Max tokens for responses
MAIASS_AI_MAX_CHARACTERS=8000              # Max characters for requests
MAIASS_AI_COMMIT_MESSAGE_STYLE=bullet      # bullet, conventional, simple
```

### 🌿 Branch Configuration
```bash
# Branch Names (only set if different from defaults)
MAIASS_MAINBRANCH=main                     # Default: main
MAIASS_DEVELOPBRANCH=develop                   # Default: develop
MAIASS_STAGINGBRANCH=staging                   # Default: staging
```

### 📦 Version Management
```bash
# Version Files
MAIASS_VERSION_PRIMARY_FILE=package.json       # Primary version file
MAIASS_VERSION_PRIMARY_TYPE=json               # json, text, php, css
MAIASS_VERSION_SECONDARY_FILES=                # Comma-separated additional files
MAIASS_VERSION_SECONDARY_TYPES=                # Types for secondary files

# Version Patterns (for custom files)
MAIASS_VERSION_PATTERN_JSON="version"          # JSON key path
MAIASS_VERSION_PATTERN_TEXT=^(.*)$             # Regex pattern
MAIASS_VERSION_PATTERN_PHP=Version.*'([^']*)'  # PHP constant pattern
MAIASS_VERSION_PATTERN_CSS=Version:.*([0-9.]+) # CSS comment pattern
```

### 🔌 WordPress Integration
```bash
# WordPress Plugin Version Management
MAIASS_PLUGIN_PATH=wp-content/plugins/my-plugin    # Path to plugin directory or main file
MAIASS_VERSION_CONSTANT=MY_PLUGIN_VERSION           # Custom PHP version constant (optional)

# WordPress Theme Version Management  
MAIASS_THEME_PATH=wp-content/themes/my-theme        # Path to theme directory
# Note: MAIASS_VERSION_CONSTANT applies to both plugins and themes

# Examples:
# MAIASS_PLUGIN_PATH="my-awesome-plugin"           # Relative path
# MAIASS_PLUGIN_PATH="/var/www/wp-content/plugins/my-plugin"  # Absolute path
# MAIASS_THEME_PATH="wp-content/themes/my-theme"   # Standard WP structure
```

### 🔧 Workflow Settings
```bash
# Core System
MAIASS_DEBUG=false                             # Enable debug output
MAIASS_VERBOSITY=normal                        # brief, normal, verbose
MAIASS_LOGGING=false                           # Enable file logging
MAIASS_BRAND=MAIASS                            # Brand name for display

# Git Workflow — auto-yes flags (also set by -a / -ac CLI flags)
MAIASS_AUTO_STAGE_UNSTAGED=false               # Auto-stage unstaged changes during commit
MAIASS_AUTO_PUSH_COMMITS=false                 # Auto-push commits to origin
MAIASS_AUTO_APPROVE_AI_SUGGESTIONS=false       # Auto-approve AI commit suggestions
MAIASS_AUTO_MERGE_TO_DEVELOP=false             # Auto-merge feature into develop
MAIASS_COMMIT_SIGN=false                       # Sign commits with GPG

# Pull Request Flow
MAIASS_DEVELOP_PULLREQUESTS=off                # 'on' = open PR instead of direct merge to develop

# Version Workflow
MAIASS_VERSION_AUTO_TAG=false                  # Auto-create git tags
MAIASS_VERSION_TAG_PREFIX=v                    # Git tag prefix
MAIASS_VERSION_TAG_MESSAGE=Release %s          # Tag message template
```

### 🎨 Display & Output
```bash
# Console Output
MAIASS_USE_UNICODE=auto                        # auto, true, false
MAIASS_COLOR_OUTPUT=auto                       # auto, true, false
MAIASS_SHOW_TIMESTAMPS=false                   # Show timestamps in output
```

## 🤖 Automation Flags vs Environment Variables

The `-a` and `-ac` CLI flags are convenience switches that set environment variables for the duration of one run. You can achieve the same effect by setting the variables in `.env.maiass` (project) or `~/.env.maiass` (global) for persistent automation.

| CLI Flag | Behaviour | Sets these env vars to `true` |
|---|---|---|
| `-a` / `--auto` | Full auto: commit, push, merge, bump | `MAIASS_AUTO_STAGE_UNSTAGED`, `MAIASS_AUTO_PUSH_COMMITS`, `MAIASS_AUTO_APPROVE_AI_SUGGESTIONS`, `MAIASS_AUTO_MERGE_TO_DEVELOP` |
| `-ac` / `--auto-commit` | Auto commit only — stops after commit phase | First three above (no `MAIASS_AUTO_MERGE_TO_DEVELOP`); also implies `--commits-only` |

**Persisting in `.env.maiass`:**

If you always want the same behaviour without typing the flag, set the env vars directly:

```bash
# Equivalent to running with -ac every time
MAIASS_AUTO_STAGE_UNSTAGED=true
MAIASS_AUTO_PUSH_COMMITS=true
MAIASS_AUTO_APPROVE_AI_SUGGESTIONS=true
```

CLI flags **always** override the env vars — they set them to `true` for that run regardless of what's in your config files.

### Pull Request Flow

`MAIASS_DEVELOP_PULLREQUESTS` controls how merges into the develop branch happen:

| Value | Behaviour |
|---|---|
| `off` (default) | Direct merge into develop. If a direct push is rejected (e.g. branch protection), maiass falls back to PR flow automatically (with prompt in interactive mode). |
| `on` | Always push the source branch and open a PR-creation URL in the browser instead of direct merge. The pipeline ends after opening the PR — re-run maiass on develop after the PR lands to bump the version. |

In `-a` mode with `MAIASS_DEVELOP_PULLREQUESTS=on`, the PR is opened automatically in the browser. In `-ac` mode the pipeline stops after commit, so the PR setting is not consulted.

## 🔒 Security Best Practices

### Sensitive Variables
Always store sensitive information securely:

```bash
# ✅ Good: Store in global config
maiass config --global maiass_token=your_key

# ❌ Avoid: Hardcoding in scripts
export MAIASS_AI_TOKEN=your_key
```

### File Permissions
Ensure your config files have appropriate permissions:
```bash
# Secure global config
chmod 600 ~/.env.maiass

# Project config (can be more open if no sensitive data)
chmod 644 .env.maiass
```

### Git Ignore
Always add `.env.maiass*` to your `.gitignore`:
```bash
echo ".env.maiass*" >> .gitignore
echo "*.backup.*" >> .gitignore
```

## 🚀 Quick Setup Examples

### Basic Setup
```bash
# 1. Set up AI integration
maiass config --global maiass_token=your_api_key_here
maiass config --global ai_mode=ask

# 2. Configure for projects using 'main' branch
maiass config --global mainbranch=main

# 3. Enable debug mode for troubleshooting
maiass config --global debug=true
```

### Project-Specific Setup
```bash
# For a project with custom version file
maiass config --project version_primary_file=VERSION.txt
maiass config --project version_primary_type=text

# For a project with different branch names
maiass config --project mainbranch=main
maiass config --project developbranch=dev
```

### Enterprise Setup
```bash

# Disable AI for security
maiass config --global ai_mode=off

# Enable commit signing
maiass config --global commit_sign=true
```

## 🔍 Troubleshooting Configuration

### View Current Configuration
```bash
# See all variables and their sources
maiass config

# Show sensitive values (be careful!)
maiass config --show-sensitive

# Check environment variables
maiass env
```

### Common Issues

**"MAIASS API key not found"**
```bash
# Check if key is set
maiass config | grep maiass_token  

# Set the key
maiass config --global maiass_token=your_key_here
```

**"Configuration not loading"**
```bash
# Check file exists and permissions
ls -la ~/.env.maiass .env.maiass

# Verify file format (no spaces around =)
cat ~/.env.maiass
```

**"Wrong branch names"**
```bash
# Check current branch configuration
maiass config | grep branch

# Override for current project
maiass config --project mainbranch=main
```

### Debug Configuration Loading
```bash
# Enable debug mode to see config loading
export MAIASS_DEBUG=true
maiass config

# This will show which files are loaded and in what order
```

## 📚 Advanced Configuration

### Multiple Version Files
For projects that maintain version in multiple files:
```bash
# Set primary version file
maiass config --project version_primary_file=package.json
maiass config --project version_primary_type=json

# Set secondary files (comma-separated)
maiass config --project version_secondary_files="src/version.js,docs/VERSION"
maiass config --project version_secondary_types="text,text"
```

### Custom Version Patterns
For non-standard version file formats:
```bash
# Custom PHP version pattern
maiass config --project version_pattern_php="define\('VERSION', '([^']*)'\)"

# Custom CSS version pattern  
maiass config --project version_pattern_css="Version: ([0-9.]+)"
```

### Environment-Specific Configuration
```bash
# Development environment
maiass config --project debug=true
maiass config --project verbosity=verbose

# Production environment
maiass config --project debug=false
maiass config --project autopush_commits=true
```
---

**💡 Pro Tip**: Use `maiass config --list` to see all available configuration variables and their descriptions.

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
MAIASS_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
```

### Example config.env (general)
```bash
# General user preferences
DEFAULT_BRANCH=main
DEVELOP_BRANCH=develop
MAIASS_VERSION=0.2.1
```
