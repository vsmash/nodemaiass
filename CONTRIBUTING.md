# Contributing to MAIASS

Thanks for your interest in contributing!

## Reporting Issues

- Search [existing issues](https://github.com/vsmash/nodemaiass/issues) before opening a new one
- Include your OS, Node.js version, and `maiass --version` output
- For bugs, include the full error output and the command you ran

## Pull Requests

1. Fork the repo and create a branch from `develop`
2. Make your changes following the code style below
3. Add or update tests if relevant (`npm run test:unit`)
4. Ensure all tests pass (`npm run test:unit && npm test`)
5. Submit a PR against `develop` — not `main`

## Code Style

- ES modules (`import`/`export`, `.js` extensions)
- No comments unless the *why* is non-obvious
- No new dependencies without discussion

## Development Setup

```bash
git clone https://github.com/vsmash/nodemaiass.git
cd nodemaiass
npm install
node maiass.mjs --help
```

See [docs/development.md](docs/development.md) for full details.

## Questions

Open a [GitHub Discussion](https://github.com/vsmash/nodemaiass/discussions) or file an issue.
