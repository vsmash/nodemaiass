# MAIASSNODE

A Node.js replica of the MAIASS (Modular AI-Assisted Semantic Savant) intelligent Git workflow automation script.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (optional)
node setup-env.js

# Run CLI
nma hello
```

## Features

- 🌍 **Cross-platform**: Works on Windows, macOS, and Linux
- 🔐 **Secure config**: OS-appropriate storage for sensitive variables
- 📁 **Flexible env loading**: Project, user, and system-wide configuration
- 🎨 **Colorful output**: Rich terminal interface
- ⚡ **Modern ES modules**: Built with latest Node.js standards

## Documentation

- [Configuration & Environment Variables](./configuration.md)
- [Cross-Platform Setup](./setup.md)
- [CLI Commands](./commands.md)
- [Development Guide](./development.md)

## Environment Loading Priority

1. `.env` in current directory (project-specific)
2. `.maiass.env` in home directory (user global)
3. `config.env` in OS config directory
4. `secure.env` in OS secure directory (sensitive vars)

## License

MIT - Copyright (c) 2025 Velvary Pty Ltd