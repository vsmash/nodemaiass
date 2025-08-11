# 🫏 MAIASS (Node.js Edition)
**Modular AI-Augmented Semantic Scribe** - Cross-platform Node.js implementation

[![Node.js](https://img.shields.io/badge/Node.js-23+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.2.4-orange.svg)](package.json)---

**MAIASS** is an intelligent Git workflow automation tool that streamlines version management, changelog generation, and deployment processes with AI-powered commit message suggestions. This Node.js implementation provides cross-platform compatibility and self-contained binary distribution.

## 🚀 Quick Start

### Installation

**Cross-Platform Binaries** (Recommended):
```bash
# Download and install for your platform
curl -L https://github.com/vsmash/maiass/releases/latest/download/maiass-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m) -o maiass
chmod +x maiass
./maiass --version
```

**From Source**:
```bash
git clone https://github.com/vsmash/nodemaiass.git
cd nodemaiass && npm install && npm link
```

### Basic Usage

```bash
# Complete workflow with patch version bump
maiass

# Specific version bumps
maiass minor    # 1.2.3 → 1.3.0
maiass major    # 1.2.3 → 2.0.0
maiass 2.1.0    # Set specific version

# Commit only (skip version management)
maiass --commits-only

# Preview changes without applying
maiass --dry-run
```

### AI-Powered Commit Messages

```bash
# Enable AI features
maiass config set openai_token "your_api_key"
maiass config set openai_mode "ask"

# MAIASS will now suggest intelligent commit messages
maiass
```

## ✨ Key Features- **🤖 AI-Powered Commit Messages**: OpenAI integration for intelligent commit suggestions- **📋 Dual Changelog System**: User-facing and developer-facing changelogs- **🔄 Complete Git Workflow**: Branch validation, commits, merges, and versioning- **🏷️ Smart Version Management**: Multiple version file support with semantic versioning- **🌍 Cross-Platform**: Self-contained binaries for macOS, Linux, and Windows- **⚙️ Zero Configuration**: Works out of the box with sensible defaults- **🎯 JIRA Integration**: Automatic ticket detection from branch names

## � Documentation

| Topic | Description |
|-------|-------------|
| **[Installation Guide](docs/installation-guide.md)** | Detailed installation instructions and binaries |
| **[Configuration](docs/configuration.md)** | Environment variables and project setup |
| **[Workflow Guide](docs/workflow.md)** | Complete workflow documentation |
| **[Commands Reference](docs/commands.md)** | All available commands and options |
| **[Cross-Platform Guide](docs/cross-platform.md)** | Platform-specific notes and compatibility |
| **[Development](docs/development.md)** | Contributing and development setup |

## 🔧 Supported Technologies

### Version File Formats- **package.json** (Node.js/npm projects)- **composer.json** (PHP/Composer projects)- **VERSION** files (plain text)- **Git tags only** (for projects without version files)

### Git Platforms- **GitHub** (public and private repositories)- **Bitbucket** (Cloud and Server)- **Any Git host** (core features work universally)

### AI Models- **GPT-4o** (recommended for complex projects)- **GPT-4** (balanced performance and cost)- **GPT-3.5-turbo** (fast and economical)

## 🌍 Platform Support

| Platform | Binary Available | Self-Contained |
|----------|------------------|----------------|
| **macOS Intel** | ✅ `maiass-macos-intel` | ✅ Node.js included |
| **macOS Apple Silicon** | ✅ `maiass-macos-arm64` | ✅ Node.js included |
| **Linux x64** | ✅ `maiass-linux-x64` | ✅ Node.js included |
| **Linux ARM64** | ✅ `maiass-linux-arm64` | ✅ Node.js included |
| **Windows x64** | ✅ `maiass-windows-x64.exe` | ✅ Node.js included |
| **Windows ARM64** | ✅ `maiass-windows-arm64.exe` | ✅ Node.js included |

## 🔄 Workflow Overview

MAIASS orchestrates a 4-phase intelligent workflow:

1. **Branch Detection & Validation** - Validates current branch and workflow requirements
2. **Commit Workflow** - AI-powered commit messages with JIRA integration
3. **Merge Management** - Handles branch merging and conflict resolution
4. **Version & Changelog** - Semantic versioning with dual changelog generation

## ⚙️ Quick Configuration

```bash
# Enable AI features (global)
maiass config set --global openai_token "your_api_key"
maiass config set --global openai_mode "ask"

# Project-specific branch override
maiass config set masterbranch "main"

# View current configuration
maiass config list
```

## 🎯 What Makes This Special?

### Intelligent Automation- **Smart Version Detection**: Automatically finds and updates version files- **Context-Aware AI**: Analyzes code changes for meaningful commit messages- **Dual Changelog System**: Clean user-facing + detailed developer changelogs

### Developer Experience- **Self-Contained Binaries**: No Node.js installation required- **Cross-Platform Compatibility**: Consistent behavior across all platforms- **Zero Configuration**: Works immediately with sensible defaults

### Enterprise Ready- **Security First**: API keys never stored in repositories- **CI/CD Integration**: Perfect for automated deployment pipelines- **GPL-3.0 Licensed**: Free and open source software

## 🔗 Related Projects- **[MAIASS (Bash)](https://github.com/vsmash/maiass)** - Original bash implementation- **[Homebrew Formula](https://github.com/vsmash/homebrew-maiass)** - Homebrew installation

## 🤝 Contributing

We welcome contributions! Whether it's:- 🐛 **Bug reports** and feature requests- 📖 **Documentation** improvements- 🔧 **Code contributions** and enhancements- 💡 **Ideas** for new features

See our [Development Guide](docs/development.md) to get started.

## 📄 License

MAIASS is released under the [GNU General Public License v3.0](LICENSE). Free and open source software.

## 🔗 Links- **[GitHub Repository](https://github.com/vsmash/nodemaiass)**- **[Issue Tracker](https://github.com/vsmash/nodemaiass/issues)**- **[Releases](https://github.com/vsmash/nodemaiass/releases)**- **[Original MAIASS](https://github.com/vsmash/maiass)**---

**Ready to streamline your Git workflow?** Download MAIASS today and experience intelligent version management with AI-powered automation.

```bash
# Get the latest release
curl -L https://github.com/vsmash/maiass/releases/latest/download/maiass-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m) -o maiass && chmod +x maiass
```---

**Made with ❤️ for developers who want better Git workflows**
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

MAIASS uses `.env.maiass` files for configuration:- **Global**: `~/.env.maiass` (user-wide settings)- **Project**: `./.env.maiass` (project-specific overrides)

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
MAIASS_CHANGELOG_INTERNAL_NAME.CHANGELOG_internal.md  # Internal changelog file name
```

## 🔄 Workflow Phases

MAIASS orchestrates a 4-phase workflow:

### 1. **Branch Detection & Validation**- Detects current branch and validates against workflow requirements- Auto-switches from master/staging to develop branch- Prompts for confirmation on release/master branches- Handles missing develop branch gracefully

### 2. **Commit Workflow**- Detects staged and unstaged changes- Offers AI-powered commit message suggestions- Supports multi-line commit messages- Prepends JIRA ticket numbers from branch names

### 3. **Merge to Develop**- Merges feature branches to develop for version management- Pulls latest changes from remote- Handles merge conflicts with clear error messages

### 4. **Version Management**- Detects version files (package.json, composer.json, etc.)- Bumps semantic versions (major.minor.patch)- Updates multiple version files simultaneously- Creates git tags for releases- **Generates dual changelogs**:
  - `CHANGELOG.md`: Clean, user-facing format with JIRA tickets stripped
  - `.CHANGELOG_internal.md`: Developer format with commit hashes, authors, and JIRA tickets- **Smart commit range detection**: Only includes commits since the last release tag- **Version replacement logic**: Replaces same-day patch versions instead of duplicating entries

## 📝 Changelog System

MAIASS automatically generates two types of changelogs during version management:

### Main Changelog (`CHANGELOG.md`)
**User-facing format** with clean, readable entries:
```markdown
## 0.5.6
24 July 2025- Update Maiass Pipeline functionality
	- feat: imported path package in maiass-pipeline
	- docs: added comment about commit message formatting- Updated commit message filtering for maiass-pipeline
	- feat: added code to clean up commit messages
	- fix: removed empty lines and trailing newlines from each commit
```

### Internal Changelog (`CHANGELOG_internal.md`)
**Developer-facing format** with commit hashes, authors, and JIRA tickets:
```markdown
## 0.5.6
Thursday, 24 July 2025- d7ddba9 VEL-405 Update Maiass Pipeline functionality (Developer Name)- 5ea6d03 VEL-405 Updated commit message filtering for maiass-pipeline (Developer Name)
```

### Changelog Features- **Smart commit detection**: Only includes commits since the last release tag- **Automatic filtering**: Excludes merge commits, version bumps, and irrelevant entries- **JIRA integration**: Strips JIRA tickets from main changelog, preserves in internal- **Version replacement**: Same-day patch versions replace previous entries instead of duplicating- **Clean formatting**: No double bullets or unwanted blank lines

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

## 📚 Documentation- [Configuration Guide](docs/configuration.md)- [Workflow Guide](docs/workflow.md)- [API Reference](docs/api.md)- [Contributing](docs/contributing.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/contributing.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments- Original MAIASS bash script by [vsmash](https://github.com/vsmash)- OpenAI for AI-powered commit messages- Node.js and npm ecosystem---

**Made with ❤️ by the MAIASS team**
