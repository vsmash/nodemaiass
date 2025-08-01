# MAIASS

**Modular AI-Assisted Semantic Scribe** - A modern Node.js implementation of the intelligent Git workflow automation tool.

[![Node.js](https://img.shields.io/badge/Node.js-23+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.2.7-orange.svg)](package.json)

## 🚀 Quick Start

```bash
# Run the complete MAIASS workflow
maiass

# Commit changes only (skip version management)
maiass --commits-only

# Bump version with git tag
maiass patch --tag

# For development testing (local version)
./devmyass

# Preview changes without applying them
nma --dry-run
```

## ✨ Features

### 🤖 **AI-Powered Workflow**
- **Smart commit messages** with OpenAI integration
- **Intelligent branch detection** and validation
- **Automated version bumping** with semantic versioning
- **JIRA ticket integration** from branch names

### 🔄 **Complete Git Workflow**
- **4-phase pipeline**: Branch validation → Commit → Merge → Version
- **Branch strategy enforcement** (develop/staging/master)
- **Merge conflict handling** and remote synchronization
- **Git tag creation** for releases
- **Automated changelog generation** with clean formatting
- **Dual changelog system**: Main (user-facing) + Internal (developer-facing)

### ⚙️ **Flexible Configuration**
- **Cross-platform config** (`.env.maiass` files)
- **Global and project-level** settings
- **Environment variable** support
- **Sensitive data masking** for security

### 🛠️ **Developer Experience**
- **Interactive prompts** with smart defaults
- **Dry-run mode** for safe testing
- **Comprehensive help** and examples
- **Error handling** with clear messages

## 📦 Installation

### Prerequisites
- **Node.js 23+** (latest stable)
- **Git** command-line tools
- **OpenAI API key** (optional, for AI features)

### Install from Source
```bash
git clone https://github.com/vsmash/nodemaiass.git
cd nodemaiass
npm install
npm link  # Makes 'nma' command available globally
```

## 🎯 Usage

### Main Workflow Commands

```bash
# Complete MAIASS workflow with interactive prompts
nma

# Specific version bumps
maiass patch    # 1.0.0 → 1.0.1
maiass minor    # 1.0.0 → 1.1.0
maiass major    # 1.0.0 → 2.0.0
maiass 2.1.0    # Set specific version

# Workflow options
maiass --commits-only     # Only commit, skip version management
maiass --auto-stage       # Automatically stage all changes
maiass --dry-run          # Preview without making changes
maiass --force            # Skip confirmation prompts
maiass minor --tag        # Bump version and create git tag
```

### Individual Commands

```bash
# Commit changes
maiass commit

# Version management
maiass version [major|minor|patch|version]

# Configuration
maiass config list
maiass config get <key>
maiass config set <key> <value>

# Environment info
maiass env

# Git information
maiass git-info
maiass git              # Show git status and branch info

# Environment variables
maiass env              # Show current environment
maiass env --json       # Show environment as JSON
```

## ⚙️ Configuration

### Quick Setup

1. **Enable AI features** (optional):
   ```bash
   # Set OpenAI API key globally
   nma config --global openai_token=your_api_key_here
   ```

2. **Project-specific settings** (if needed):
   ```bash
   # Override branch names for projects using 'main'
   nma config --project masterbranch=main
   ```

### Configuration Files

MAIASS uses `.env.maiass` files for configuration:

- **Global**: `~/.env.maiass` (user-wide settings)
- **Project**: `./.env.maiass` (project-specific overrides)

### Common Configuration Variables

```bash
# AI Integration
MAIASS_AI_TOKEN=your_api_key_here
MAIASS_AI_MODE=ask                    # ask, autosuggest, off
MAIASS_AI_MODEL=gpt-4                 # AI model to use

# Branch Configuration (only set if different from defaults)
MAIASS_MASTERBRANCH=main                  # Default: master
MAIASS_DEVELOPBRANCH=develop              # Default: develop
MAIASS_STAGINGBRANCH=staging              # Default: staging

# Workflow Settings
MAIASS_DEBUG=true                         # Enable debug output
MAIASS_VERBOSITY=normal                   # brief, normal, verbose
MAIASS_AUTO_TAG_RELEASES=true             # Automatically tag releases (required for changelog)

# Changelog Configuration
MAIASS_CHANGELOG_PATH=CHANGELOG.md        # Main changelog file path
MAIASS_CHANGELOG_NAME=CHANGELOG.md        # Main changelog file name
MAIASS_CHANGELOG_INTERNAL_NAME=CHANGELOG_internal.md  # Internal changelog file name
```

## 🔄 Workflow Phases

MAIASS orchestrates a 4-phase workflow:

### 1. **Branch Detection & Validation**
- Detects current branch and validates against workflow requirements
- Auto-switches from master/staging to develop branch
- Prompts for confirmation on release/master branches
- Handles missing develop branch gracefully

### 2. **Commit Workflow**
- Detects staged and unstaged changes
- Offers AI-powered commit message suggestions
- Supports multi-line commit messages
- Prepends JIRA ticket numbers from branch names

### 3. **Merge to Develop**
- Merges feature branches to develop for version management
- Pulls latest changes from remote
- Handles merge conflicts with clear error messages

### 4. **Version Management**
- Detects version files (package.json, composer.json, etc.)
- Bumps semantic versions (major.minor.patch)
- Updates multiple version files simultaneously
- Creates git tags for releases
- **Generates dual changelogs**:
  - `CHANGELOG.md`: Clean, user-facing format with JIRA tickets stripped
  - `CHANGELOG_internal.md`: Developer format with commit hashes, authors, and JIRA tickets
- **Smart commit range detection**: Only includes commits since the last release tag
- **Version replacement logic**: Replaces same-day patch versions instead of duplicating entries

## 📝 Changelog System

MAIASS automatically generates two types of changelogs during version management:

### Main Changelog (`CHANGELOG.md`)
**User-facing format** with clean, readable entries:
```markdown
## 0.5.6
24 July 2025

- Update Maiass Pipeline functionality
	- feat: imported path package in maiass-pipeline
	- docs: added comment about commit message formatting
- Updated commit message filtering for maiass-pipeline
	- feat: added code to clean up commit messages
	- fix: removed empty lines and trailing newlines from each commit
```

### Internal Changelog (`CHANGELOG_internal.md`)
**Developer-facing format** with commit hashes, authors, and JIRA tickets:
```markdown
## 0.5.6
Thursday, 24 July 2025

- d7ddba9 VEL-405 Update Maiass Pipeline functionality (Developer Name)
- 5ea6d03 VEL-405 Updated commit message filtering for maiass-pipeline (Developer Name)
```

### Changelog Features
- **Smart commit detection**: Only includes commits since the last release tag
- **Automatic filtering**: Excludes merge commits, version bumps, and irrelevant entries
- **JIRA integration**: Strips JIRA tickets from main changelog, preserves in internal
- **Version replacement**: Same-day patch versions replace previous entries instead of duplicating
- **Clean formatting**: No double bullets or unwanted blank lines

## 🎨 Examples

### Complete Feature Development Workflow
```bash
# On feature branch: feature/USER-123-new-login

# 1. Complete workflow with minor version bump
nma minor --tag

# This will:
# - Detect you're on a feature branch
# - Run commit workflow with AI suggestions
# - Merge to develop branch
# - Bump minor version (1.0.0 → 1.1.0)
# - Create git tag v1.1.0
```

### Quick Commit Without Version Management
```bash
# Just commit changes without version bumping
nma --commits-only --auto-stage

# With AI commit message
nma commit
```

### Safe Testing
```bash
# Preview what would happen without making changes
nma --dry-run patch

# Check current version status
nma version --current
```

## 🔧 Advanced Usage

### Custom Version Files
```bash
# Configure custom version file
nma config --project version_primary_file=VERSION.txt
nma config --project version_primary_type=text
```

### Multiple Version Files
```bash
# Update multiple files with same version
nma config --project version_secondary_files="src/version.js,docs/VERSION"
```

### AI Customization
```bash
# Different AI modes
nma config --global openai_mode=autosuggest  # Auto-suggest without asking
nma config --global openai_mode=off          # Disable AI

# Custom commit message style
nma config --global openai_commit_message_style=conventional
```

## 🐛 Troubleshooting

### Common Issues

**"Not in a git repository"**
```bash
# Ensure you're in a git repository
git status
```

**"No version files detected"**
```bash
# Check for supported version files
ls package.json composer.json VERSION

# Or configure custom version file
nma config --project version_primary_file=your-version-file
```

**"Failed to switch to develop branch"**
```bash
# Create develop branch if it doesn't exist
git checkout -b develop
```

### Debug Mode
```bash
# Enable verbose debugging
export MAIASS_DEBUG=true
nma --dry-run
```

## 📚 Documentation

- [Configuration Guide](docs/configuration.md)
- [Workflow Guide](docs/workflow.md)
- [API Reference](docs/api.md)
- [Contributing](docs/contributing.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/contributing.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original MAIASS bash script by [vsmash](https://github.com/vsmash)
- OpenAI for AI-powered commit messages
- Node.js and npm ecosystem

---

**Made with ❤️ by the MAIASS team**
