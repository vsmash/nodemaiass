# MAIASS

A powerful Node.js replica of the MAIASS (Modular AI-Augmented Semantic Scribe) intelligent Git workflow automation script with enhanced WordPress integration and cross-platform packaging.

## Quick Start

### Binary Installation (Recommended)
```bash
# macOS/Linux via Homebrew
brew tap vsmash/maiass
brew install maiass

# Universal installer
curl -sSL https://raw.githubusercontent.com/vsmash/maiass/main/scripts/install.sh | bash

# Manual download from GitHub releases
# Download binary for your platform from: https://github.com/vsmash/maiass/releases
```

### Development Installation
```bash
# Install dependencies
npm install

# Run CLI
nma
```

## Features

- 🌍 **Cross-platform binaries**: Self-contained executables for macOS, Linux, Windows (ARM & x64)
- 🔌 **WordPress integration**: Automatic version management for themes and plugins
- 🚀 **Intelligent workflows**: AI-powered commit messages and automated version bumping
- 🔐 **Secure configuration**: OS-appropriate storage with `.env.maiass` support
- 📁 **Flexible environment loading**: Project, user, and system-wide configuration hierarchy
- 🎨 **Rich terminal interface**: Colorful output with comprehensive debugging
- ⚡ **Modern architecture**: Built with latest Node.js ES modules and pkg packaging
- 🤖 **AI-powered**: Integrated AI suggestions for commit messages and workflow optimization

## WordPress Integration

MAIASS provides seamless WordPress theme and plugin version management:

```bash
# Configure WordPress integration in .env.maiass
MAIASS_THEME_PATH='wp-content/themes/my-theme'
MAIASS_VERSION_CONSTANT='MY_THEME_VERSION'
MAIASS_REPO_TYPE='wordpress-site'

# Run version bump - updates both PHP constants and style.css headers
nma minor  # Bumps version and updates WordPress files
```

## CLI Usage

```bash
nma                    # Run full MAIASS workflow (patch version)
nma minor              # Run workflow with minor version bump
nma major              # Run workflow with major version bump
nma patch              # Run workflow with patch version bump
nma version --current  # Show current version information
nma --help            # Show help information
```

## Documentation

- [Installation Guide](./installation-guide.md) - Binary and npm installation methods
- [Configuration & Environment Variables](./configuration.md) - Complete setup guide
- [Workflow Guide](./workflow.md) - WordPress integration and usage examples
- [Cross-Platform Setup](./cross-platform.md) - Platform-specific instructions
- [CLI Commands](./commands.md) - Complete command reference
- [Development Guide](./development.md) - Contributing and development setup
- [Node.js Compatibility](./node-compatibility.md) - Version requirements and compatibility

## Environment Loading Priority

Configuration is loaded from multiple sources with the following priority (highest to lowest):

1. `.env.maiass` in current directory (project-specific)
2. `.env.maiass` in home directory (user global)
3. `config.env` in OS config directory
4. `secure.env` in OS secure directory (sensitive vars)

### Debug Mode Token Validation

When `MAIASS_DEBUG=true` is set, MAIASS will display detailed API token validation during initialization:

```bash
# Enable debug mode to see token validation
MAIASS_DEBUG=true nma hello
```

The debug output shows:
- **File loading status** for each environment file
- **API token validation** for `MAIASS_AI_TOKEN` and `OPENAI_API_KEY`
- **Token status indicators**: ✓ (valid), ⚠ (warning), ✗ (invalid), - (not found)
- **Masked token previews** (first 8 characters) for security
- **Final token resolution** showing which tokens are active after all files are loaded

This helps troubleshoot configuration issues and verify that API tokens are properly loaded from the correct environment files.

## License

MIT - Copyright (c) 2025 Velvary Pty Ltd