# Configuration Guide

MAIASSNODE uses a flexible configuration system based on `.env.maiass` files and environment variables. This guide covers all configuration options and best practices.

## 🏗️ Configuration System Overview

MAIASSNODE uses `.env.maiass` files for configuration with a clear hierarchy:

- **Project**: `./.env.maiass` (highest priority)
- **Global**: `~/.env.maiass` (user-wide settings)
- **Environment**: System environment variables (lowest priority)

## 📁 Configuration Files

### Project Configuration (`./.env.maiass`)
Project-specific overrides stored in your project root:
```bash
# Project-specific branch names
MAIASS_MASTERBRANCH=main
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
nma config

# View global configuration only
nma config --global

# View project configuration only
nma config --project

# Set global configuration
nma config --global openai_token=your_key_here
nma config --global debug=true

# Set project configuration
nma config --project masterbranch=main
nma config --project version_primary_file=VERSION.txt

# Edit configuration files directly
nma config --edit --global   # Opens ~/.env.maiass
nma config --edit --project   # Opens ./.env.maiass

# List all available variables
nma config --list
```

### Manual Configuration
You can also create/edit `.env.maiass` files directly:

```bash
# Create global config
echo "MAIASS_AI_TOKEN=your_key" >> ~/.env.maiass

# Create project config
echo "MAIASS_MASTERBRANCH=main" >> .env.maiass
```

## 📋 Complete Variable Reference

### 🤖 AI Integration
```bash
# OpenAI Configuration
MAIASS_AI_TOKEN=your_api_key_here          # OpenAI API key (sensitive)
MAIASS_AI_MODE=ask                         # ask, autosuggest, off
MAIASS_AI_MODEL=gpt-4                      # AI model to use
MAIASS_AI_TEMPERATURE=0.7                  # AI creativity (0.0-2.0)
MAIASS_AI_MAX_TOKENS=150                   # Max tokens for responses
MAIASS_AI_MAX_CHARACTERS=8000              # Max characters for requests
MAIASS_AI_COMMIT_MESSAGE_STYLE=bullet      # bullet, conventional, simple
MAIASS_AI_ENDPOINT=https://api.openai.com/v1/chat/completions
```

### 🌿 Branch Configuration
```bash
# Branch Names (only set if different from defaults)
MAIASS_MASTERBRANCH=master                     # Default: master
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

### 🔧 Workflow Settings
```bash
# Core System
MAIASS_DEBUG=false                             # Enable debug output
MAIASS_VERBOSITY=normal                        # brief, normal, verbose
MAIASS_LOGGING=false                           # Enable file logging
MAIASS_BRAND=MAIASS                            # Brand name for display

# Git Workflow
MAIASS_AUTOPUSH_COMMITS=false                  # Auto-push after commit
MAIASS_AUTO_STAGE_ALL=false                    # Auto-stage all changes
MAIASS_COMMIT_SIGN=false                       # Sign commits with GPG

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

## 🔒 Security Best Practices

### Sensitive Variables
Always store sensitive information securely:

```bash
# ✅ Good: Store in global config
nma config --global openai_token=your_key

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
nma config --global openai_token=your_api_key_here
nma config --global openai_mode=ask

# 2. Configure for projects using 'main' branch
nma config --global masterbranch=main

# 3. Enable debug mode for troubleshooting
nma config --global debug=true
```

### Project-Specific Setup
```bash
# For a project with custom version file
nma config --project version_primary_file=VERSION.txt
nma config --project version_primary_type=text

# For a project with different branch names
nma config --project masterbranch=main
nma config --project developbranch=dev
```

### Enterprise Setup
```bash
# Custom OpenAI endpoint
nma config --global openai_endpoint=https://your-proxy.com/v1/chat/completions

# Disable AI for security
nma config --global openai_mode=off

# Enable commit signing
nma config --global commit_sign=true
```

## 🔍 Troubleshooting Configuration

### View Current Configuration
```bash
# See all variables and their sources
nma config

# Show sensitive values (be careful!)
nma config --show-sensitive

# Check environment variables
nma env
```

### Common Issues

**"OpenAI API key not found"**
```bash
# Check if key is set
nma config | grep openai_token

# Set the key
nma config --global openai_token=your_key_here
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
nma config | grep branch

# Override for current project
nma config --project masterbranch=main
```

### Debug Configuration Loading
```bash
# Enable debug mode to see config loading
export MAIASS_DEBUG=true
nma config

# This will show which files are loaded and in what order
```

## 📚 Advanced Configuration

### Multiple Version Files
For projects that maintain version in multiple files:
```bash
# Set primary version file
nma config --project version_primary_file=package.json
nma config --project version_primary_type=json

# Set secondary files (comma-separated)
nma config --project version_secondary_files="src/version.js,docs/VERSION"
nma config --project version_secondary_types="text,text"
```

### Custom Version Patterns
For non-standard version file formats:
```bash
# Custom PHP version pattern
nma config --project version_pattern_php="define\('VERSION', '([^']*)'\)"

# Custom CSS version pattern  
nma config --project version_pattern_css="Version: ([0-9.]+)"
```

### Environment-Specific Configuration
```bash
# Development environment
nma config --project debug=true
nma config --project verbosity=verbose

# Production environment
nma config --project debug=false
nma config --project autopush_commits=true
```

---

**💡 Pro Tip**: Use `nma config --list` to see all available configuration variables and their descriptions.

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
