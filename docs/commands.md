# CLI Commands

MAIASS provides a set of commands for Git workflow automation and project management.

## Available Commands

### `hello`
Test command to verify installation and configuration.

```bash
maiass hello
```

**Output:**
- Displays version banner
- Confirms environment loading
- Shows colorful greeting

## Planned Commands

The following commands are planned to replicate functionality from the original MAIASS script:

### Git Workflow
- `maiass init` - Initialize Git workflow in current directory
- `maiass branch <name>` - Create and switch to new feature branch
- `maiass merge` - Interactive merge workflow
- `maiass release [type]` - Create release (patch/minor/major)

### Project Management
- `maiass version` - Display version information
- `maiass config` - Manage configuration
- `maiass status` - Show project and Git status

### AI Integration
- `maiass commit` - AI-augmented commit message generation
- `maiass review` - AI code review suggestions

## Command Structure

All commands follow this pattern:

```bash
maiass <command> [options] [arguments]
```

### Global Options
- `--help, -h` - Show help for command
- `--version, -v` - Show version
- `--debug` - Enable debug output
- `--config <path>` - Use specific config file

## Examples

```bash
# Basic usage
maiass hello

# Get help
maiass --help
maiass hello --help

# Debug mode
maiass hello --debug
```

## Environment Integration

Commands automatically load environment variables from:
1. Project `.env`
2. User `.maiass.env`
3. System config files

This ensures consistent behavior across different projects and environments.
