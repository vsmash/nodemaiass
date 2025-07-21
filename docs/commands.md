# CLI Commands

MAIASSNODE provides a set of commands for Git workflow automation and project management.

## Available Commands

### `hello`
Test command to verify installation and configuration.

```bash
nma hello
```

**Output:**
- Displays version banner
- Confirms environment loading
- Shows colorful greeting

## Planned Commands

The following commands are planned to replicate functionality from the original MAIASS script:

### Git Workflow
- `nma init` - Initialize Git workflow in current directory
- `nma branch <name>` - Create and switch to new feature branch
- `nma merge` - Interactive merge workflow
- `nma release [type]` - Create release (patch/minor/major)

### Project Management
- `nma version` - Display version information
- `nma config` - Manage configuration
- `nma status` - Show project and Git status

### AI Integration
- `nma commit` - AI-assisted commit message generation
- `nma review` - AI code review suggestions

## Command Structure

All commands follow this pattern:

```bash
nma <command> [options] [arguments]
```

### Global Options
- `--help, -h` - Show help for command
- `--version, -v` - Show version
- `--debug` - Enable debug output
- `--config <path>` - Use specific config file

## Examples

```bash
# Basic usage
nma hello

# Get help
nma --help
nma hello --help

# Debug mode
nma hello --debug
```

## Environment Integration

Commands automatically load environment variables from:
1. Project `.env`
2. User `.maiass.env`
3. System config files

This ensures consistent behavior across different projects and environments.
