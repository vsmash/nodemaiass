# Workflow Guide

This guide explains how MAIASS orchestrates your Git workflow from commit to release, providing a complete understanding of the 4-phase pipeline.

## 🔄 MAIASS Pipeline Overview

MAIASS follows a structured 4-phase workflow that automates common Git operations:

1. **Branch Detection & Validation** - Ensures you're on the right branch
2. **Commit Workflow** - AI-augmented commit creation
3. **Merge to Develop** - Consolidates changes for version management
4. **Version Management** - Semantic versioning and tagging

## 🚀 Quick Start Examples

### Complete Workflow
```bash
# Run the full MAIASS pipeline
nma

# This will:
# 1. Validate your current branch
# 2. Help you commit any changes
# 3. Merge to develop branch (if needed)
# 4. Prompt for version bump
# 5. Create git tags (if requested)
```

### Commits Only
```bash
# Just handle commits, skip version management
nma --commits-only

# Perfect for:
# - Feature development
# - Bug fixes
# - Work in progress
```

### Version Management
```bash
# Specific version bumps
nma patch    # 1.0.0 → 1.0.1 (bug fixes)
nma minor    # 1.0.0 → 1.1.0 (new features)
nma major    # 1.0.0 → 2.0.0 (breaking changes)

# With git tagging
nma minor --tag
```

## 📋 Phase-by-Phase Breakdown

### Phase 1: Branch Detection & Validation

**What it does:**
- Detects your current Git branch
- Validates against MAIASS workflow requirements
- Handles branch switching when needed

**Branch Strategy:**
```bash
# Feature branches → Continue on current branch
feature/USER-123-login-fix

# Master/Main → Prompt to switch to develop
master, main

# Staging → Auto-switch to develop
staging

# Develop → Perfect for version management
develop
```

**Example Output:**
```
ℹ️ Branch Detection and Validation

  Current Branch: feature/USER-123-login-fix
  Target Branch: develop

ℹ️ Currently on feature branch: feature/USER-123-login-fix
ℹ️ MAIASS workflow will proceed on current branch
⚠️ Note: Version management typically happens on develop
```

### Phase 2: Commit Workflow

**What it does:**
- Detects staged and unstaged changes
- Offers AI-powered commit message suggestions
- Handles JIRA ticket integration
- Supports multi-line commit messages

**Change Detection:**
```bash
# Staged changes (ready to commit)
✅ Modified: src/auth.js
✅ Added: tests/auth.test.js

# Unstaged changes (need staging)
📝 Modified: README.md
📝 Deleted: old-file.js
```

**AI Commit Messages:**
```bash
# AI analyzes your changes and suggests:
🤖 AI Suggestion:
"USER-123: Implement secure login validation

- Add password strength requirements
- Implement rate limiting for failed attempts
- Add comprehensive test coverage"

Use this message? [Y/n/e/m]:
```

**Options:**
- `Y` - Use AI suggestion
- `n` - Write your own message
- `e` - Edit the AI suggestion
- `m` - Multi-line manual message

### Phase 3: Merge to Develop

**What it does:**
- Merges feature branches to develop for version management
- Pulls latest changes from remote
- Handles merge conflicts gracefully

**Merge Logic:**
```bash
# Already on develop → Skip merge
✅ Already on develop branch, skipping merge

# Feature branch → Merge to develop
ℹ️ Ready to merge changes to develop branch
  Current branch: feature/USER-123-login-fix
  Target branch: develop

Merge to develop for version management? [Y/n]
```

**Remote Synchronization:**
```bash
# Pulls latest changes before merging
ℹ️ Pulling latest changes from remote...
✅ Successfully merged feature/USER-123-login-fix into develop
```

### Phase 4: Version Management

**What it does:**
- Detects version files in your project
- Prompts for semantic version bump
- Updates multiple version files
- Creates git tags for releases

**Version File Detection:**
```bash
# Automatically detects:
✅ package.json (version: 1.2.3)
✅ composer.json (version: 1.2.3)
✅ VERSION.txt (1.2.3)
✅ style.css (Version: 1.2.3)
```

**Version Bump Selection:**
```bash
ℹ️ Current version: 1.2.3

Select version bump type:
  1. patch (1.2.3 → 1.2.4) - Bug fixes
  2. minor (1.2.3 → 1.3.0) - New features  
  3. major (1.2.3 → 2.0.0) - Breaking changes
  4. custom - Enter specific version
  5. skip - Skip version management

Enter choice [1-5]:
```

## 🎯 Workflow Scenarios

### Scenario 1: Feature Development
```bash
# You're on: feature/USER-123-new-dashboard
git status
# → Modified: src/dashboard.js, tests/dashboard.test.js

nma --commits-only

# Result:
# ✅ Commits changes with AI message
# ✅ Stays on feature branch
# ✅ Ready for pull request
```

### Scenario 2: Release Preparation
```bash
# You're on: develop
git status
# → Clean working directory

nma minor --tag

# Result:
# ✅ Skips commit (no changes)
# ✅ Bumps version 1.2.3 → 1.3.0
# ✅ Creates git tag v1.3.0
# ✅ Ready for deployment
```

### Scenario 3: Hotfix Workflow
```bash
# You're on: hotfix/critical-security-fix
git status
# → Modified: src/security.js

nma patch --tag

# Result:
# ✅ Commits security fix
# ✅ Merges to develop
# ✅ Bumps version 1.2.3 → 1.2.4
# ✅ Creates git tag v1.2.4
```

### Scenario 4: Safe Testing
```bash
# Preview what would happen
nma --dry-run minor

# Result:
# ℹ️ Shows all planned actions
# ℹ️ No actual changes made
# ✅ Safe to test workflow
```

## ⚙️ Advanced Workflow Options

### Auto-Staging
```bash
# Automatically stage all changes
nma --auto-stage

# Equivalent to:
git add .
nma
```

### Force Mode
```bash
# Skip all confirmation prompts
nma --force patch

# Perfect for:
# - CI/CD pipelines
# - Automated workflows
# - Batch operations
```

### Custom Workflows
```bash
# Combine options for specific needs
nma minor --tag --force --dry-run

# Version management only
nma version patch --tag

# Commit workflow only  
nma commit --auto-stage
```

## 🌿 Branch Strategy Best Practices

### Git Flow Integration
```bash
# Feature development
feature/USER-123-feature → nma --commits-only

# Release preparation  
develop → nma minor --tag

# Hotfixes
hotfix/critical-fix → nma patch --tag
```

### Branch Configuration
```bash
# For projects using 'main' instead of 'master'
nma config --project masterbranch=main

# Custom develop branch name
nma config --project developbranch=dev
```

## 🔧 Version Management Deep Dive

### Semantic Versioning
```bash
# MAJOR.MINOR.PATCH
1.2.3

# Patch: Bug fixes (1.2.3 → 1.2.4)
nma patch

# Minor: New features (1.2.3 → 1.3.0)  
nma minor

# Major: Breaking changes (1.2.3 → 2.0.0)
nma major
```

### Multiple Version Files
```bash
# MAIASS can update multiple files:
package.json     → "version": "1.3.0"
composer.json    → "version": "1.3.0"
VERSION.txt      → 1.3.0
style.css        → Version: 1.3.0
src/version.php  → define('VERSION', '1.3.0');
```

### Git Tagging
```bash
# Create annotated tags
nma minor --tag

# Result:
git tag -a v1.3.0 -m "Release 1.3.0"
```

## 🔌 WordPress Integration

MAIASS provides enhanced version management for WordPress plugins and themes, automatically updating PHP version constants alongside standard version files.

### Plugin Version Management

#### Setup
```bash
# In your .env.maiass file:
MAIASS_PLUGIN_PATH=wp-content/plugins/my-awesome-plugin
# Optional: Custom constant name (auto-generated if not specified)
MAIASS_VERSION_CONSTANT=MY_AWESOME_PLUGIN_VERSION
```

#### Workflow
```bash
# Run version bump as usual
nma minor

# MAIASS will automatically:
# 1. Update package.json: "version": "1.3.0"
# 2. Find main plugin file (my-awesome-plugin.php)
# 3. Update/create: define('MY_AWESOME_PLUGIN_VERSION', '1.3.0');
```

#### Plugin File Detection
MAIASS intelligently finds your main plugin file:
```bash
# Looks for (in order):
1. {plugin-name}.php     # my-awesome-plugin.php
2. plugin.php            # Generic plugin file
3. index.php             # Fallback option
```

### Theme Version Management

#### Setup
```bash
# In your .env.maiass file:
MAIASS_THEME_PATH=wp-content/themes/my-theme
# Uses same MAIASS_VERSION_CONSTANT if specified
```

#### Workflow
```bash
nma patch

# Updates functions.php with:
define('MY_THEME_VERSION', '1.2.4');
```

### Automatic Constant Generation

If `MAIASS_VERSION_CONSTANT` is not specified, MAIASS generates it from your path:

```bash
# Plugin Examples:
my-awesome-plugin     → MY_AWESOME_PLUGIN_VERSION
wp-seo-optimizer      → WP_SEO_OPTIMIZER_VERSION
simple.contact.form   → SIMPLE_CONTACT_FORM_VERSION

# Theme Examples:
twentythree-child     → TWENTYTHREE_CHILD_VERSION
my-custom-theme       → MY_CUSTOM_THEME_VERSION
```

### WordPress + Standard Files

MAIASS updates both WordPress files AND standard version files:

```bash
# Single command updates:
package.json          → "version": "1.3.0"
VERSION              → 1.3.0
plugin.php           → define('MY_PLUGIN_VERSION', '1.3.0');
functions.php        → define('MY_THEME_VERSION', '1.3.0');
```

### Dry Run Testing

```bash
# Preview WordPress updates
nma minor --dry-run

# Output shows:
# ℹ️ Would update WordPress plugin/theme versions (dry run)
#   Plugin: wp-content/plugins/my-plugin (MY_PLUGIN_VERSION)
#   Theme: wp-content/themes/my-theme (MY_THEME_VERSION)
```

### Path Flexibility

```bash
# Relative paths (from project root)
MAIASS_PLUGIN_PATH=my-plugin
MAIASS_THEME_PATH=themes/my-theme

# Absolute paths
MAIASS_PLUGIN_PATH=/var/www/wp-content/plugins/my-plugin

# Direct file paths
MAIASS_PLUGIN_PATH=wp-content/plugins/my-plugin/my-plugin.php
MAIASS_THEME_PATH=wp-content/themes/my-theme/functions.php
```

## 🤖 AI Integration Features

### Smart Commit Messages
```bash
# AI analyzes your changes:
- File modifications
- Added/removed lines
- Code patterns
- JIRA ticket from branch name

# Generates contextual messages:
"USER-123: Add user authentication system

- Implement JWT token validation
- Add password hashing with bcrypt
- Create user session management
- Add comprehensive error handling"
```

### JIRA Integration
```bash
# Branch: feature/USER-123-login-system
# AI automatically prepends: "USER-123: "

# Branch: bugfix/PROJ-456-fix-memory-leak  
# AI automatically prepends: "PROJ-456: "
```

### AI Modes
```bash
# Ask mode (default) - Prompts for approval
nma config --global openai_mode=ask

# Auto-suggest - Uses AI without asking
nma config --global openai_mode=autosuggest

# Off - Disable AI completely
nma config --global openai_mode=off
```

## 🚨 Error Handling & Recovery

### Common Issues

**Merge Conflicts:**
```bash
# MAIASS detects conflicts
❌ Failed to merge: Merge conflict in src/app.js

# Manual resolution required:
git status
# → Fix conflicts
git add .
nma --commits-only  # Continue workflow
```

**Missing Develop Branch:**
```bash
# Graceful fallback
⚠️ Branch 'develop' does not exist
ℹ️ Using simplified workflow on current branch: main
```

**No Version Files:**
```bash
# Clear guidance
⚠️ No version files detected
ℹ️ Skipping version management

# Configure custom version file:
nma config --project version_primary_file=VERSION.txt
```

### Recovery Commands
```bash
# Check current state
nma git
nma version --current

# Reset if needed
git reset --hard HEAD~1  # Undo last commit
git checkout develop     # Switch branches manually
```

## 📊 Workflow Monitoring

### Debug Mode
```bash
# Enable detailed logging
export MAIASS_DEBUG=true
nma --dry-run

# Shows:
# - Configuration loading
# - Git command execution
# - Decision logic
# - Error details
```

### Verbose Output
```bash
# More detailed information
nma config --global verbosity=verbose
nma minor

# Shows:
# - Step-by-step progress
# - File modifications
# - Git operations
# - Timing information
```

## 🎨 Customization Examples

### Custom Commit Styles
```bash
# Conventional commits
nma config --global openai_commit_message_style=conventional
# Result: "feat(auth): add user login validation"

# Simple style
nma config --global openai_commit_message_style=simple
# Result: "Add user login validation"
```

### Custom Version Patterns
```bash
# For custom version files
nma config --project version_primary_file=src/version.py
nma config --project version_pattern_text="__version__ = '([^']*)'"
```

### Workflow Automation
```bash
# CI/CD friendly
nma patch --tag --force --auto-stage

# Development workflow
alias commit="nma --commits-only --auto-stage"
alias release="nma minor --tag"
```

---

**💡 Pro Tip**: Start with `nma --dry-run` to understand what the workflow will do before making any changes!
