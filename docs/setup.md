# Cross-Platform Setup

MAIASS is designed to work seamlessly across Windows, macOS, and Linux with appropriate configuration storage for each platform.

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Install Dependencies

```bash
npm install
```

### Environment Setup

Run the interactive setup:

```bash
node setup-env.js
```

This will:
- Create OS-appropriate config directories
- Set up secure storage for sensitive variables
- Configure general preferences
- Set appropriate file permissions

## Platform-Specific Notes

### Windows
- Uses `%APPDATA%` and `%LOCALAPPDATA%` for configuration
- Automatically handles Windows path separators
- Secure files stored in user's local app data

### macOS
- Uses `~/Library/Application Support` for configuration
- Follows Apple's guidelines for app data storage
- Secure permissions (600) applied to sensitive files

### Linux
- Follows XDG Base Directory specification
- Uses `~/.config` and `~/.local/share`
- Respects `XDG_CONFIG_HOME` and `XDG_DATA_HOME` if set

## Symlink Setup

For easy access, create a symlink:

### macOS/Linux
```bash
ln -s /path/to/maiass/nodemaiass.sh ~/.local/bin/maiass
```

### Windows (PowerShell as Admin)
```powershell
New-Item -ItemType SymbolicLink -Path "C:\Windows\System32\maiass.cmd" -Target "C:\path\to\maiass\nodemaiass.sh"
```

## Verification

Test your installation:

```bash
maiass hello
```

You should see:
- Colored banner with version
- No module warnings
- Environment variables loaded from appropriate locations

## Continuous Integration

To auto-bump your project's version whenever a PR is merged to develop, MAIASS can install a ready-to-run CI workflow for GitHub Actions, GitLab CI, or Bitbucket Pipelines:

```bash
maiass --create-gh-action   # GitHub Actions
maiass --show-gl-excerpt    # GitLab CI (prints excerpt)
maiass --show-bb-excerpt    # Bitbucket Pipelines (prints excerpt)
```

The CI workflow disables AI (`MAIASS_AI_MODE=off`) so version bumps don't consume credits. See [CI Auto-Version-Bump on PR Merge](./workflow.md#-ci-auto-version-bump-on-pr-merge) for the auth setup per platform.

## Troubleshooting

### Module Type Warnings
Ensure `package.json` contains `"type": "module"`

### Permission Errors
Run setup script to fix file permissions:
```bash
node setup-env.js
```

### Path Issues
Verify Node.js and npm are in your PATH:
```bash
node --version
npm --version
```
