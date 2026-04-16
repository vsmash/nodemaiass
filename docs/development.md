# Development Guide

Guide for contributing to and extending MAIASS.

## Project Structure

```
nodemaiass/
├── maiass.mjs             # Main CLI entry point
├── lib/                   # Core modules
│   ├── maiass-pipeline.js # Main workflow orchestration
│   ├── maiass-command.js  # CLI argument handling
│   ├── commit.js          # AI commit message generation
│   ├── version-manager.js # Version file detection and bumping
│   ├── bootstrap.js       # --setup wizard
│   ├── config.js          # .env.maiass config loading
│   ├── git-info.js        # Git helpers, ticket extraction
│   └── ...                # Other utilities
├── test/
│   ├── test-runner.js     # e2e tests (subprocess-based)
│   └── unit/              # Vitest unit tests
├── docs/                  # Documentation
├── scripts/
│   └── npm_deploy.sh      # Promote branches and publish to npm
└── package.json
```

## Development Setup

### Prerequisites
- Node.js 20+
- Git
- Text editor with ES module support

### Local Development

```bash
# Clone and install
git clone <repo>
cd maiass
npm install

# Make executable
chmod +x nodemaiass.sh
chmod +x setup-env.js

# Test
./nodemaiass.sh hello
```

### Adding New Commands

1. **Add command to yargs configuration** in `maiass.js`:

```javascript
.command('newcmd', 'Description', (yargs) => {
  return yargs.option('flag', {
    describe: 'Flag description',
    type: 'boolean'
  });
}, (argv) => {
  // Command implementation
  console.log('New command executed');
})
```

2. **Create command module** in `lib/commands/`:

```javascript
// lib/commands/newcmd.js
import colors from '../colors.js';

export default function newCommand(argv) {
  console.log(colors.BGreen('Executing new command'));
  // Implementation here
}
```

3. **Import and use** in main CLI:

```javascript
import newCommand from './lib/commands/newcmd.js';

// In yargs command handler:
(argv) => newCommand(argv)
```

## Code Style

### ES Modules
- Use `import`/`export` syntax
- Include `.js` extensions in imports
- Use `export default` for main exports

### Error Handling
```javascript
try {
  // Operation
} catch (error) {
  console.error(colors.BRed(`Error: ${error.message}`));
  process.exit(1);
}
```

### Cross-Platform Paths
```javascript
import path from 'path';

// Always use path.join() for file paths
const configPath = path.join(configDir, 'config.env');
```

## Testing

### Unit Tests (Vitest)

Unit tests live in `test/unit/` and cover individual library functions.

```bash
npm run test:unit          # single run
npm run test:unit:watch    # watch mode
npm run test:coverage      # with coverage report
```

### e2e Tests

The e2e test runner spawns maiass as a subprocess and tests full CLI flows.

```bash
npm test
```

### CI

GitHub Actions runs both unit and e2e tests on Node.js 20, 22, and 24 for every push and PR. A separate workflow automatically bumps the patch version when a PR is merged to `develop`.

## Porting from MAIASS.sh

When porting functionality from the original Bash script:

1. **Identify the function** in `maiass.sh`
2. **Extract core logic** (remove Bash-specific syntax)
3. **Convert to JavaScript** using Node.js APIs
4. **Add cross-platform support** using `lib/config.js`
5. **Integrate with CLI** using yargs
6. **Add documentation** to relevant docs

### Common Patterns

#### Git Operations
```javascript
import { execSync } from 'child_process';

function gitCommand(cmd) {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error(`Git command failed: ${error.message}`);
  }
}
```

#### User Input
```javascript
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}
```

## Release Process

Version bumps on `develop` happen automatically via GitHub Actions when a PR is merged.

To publish a release to npm:

```bash
./scripts/npm_deploy.sh
```

This promotes develop → staging → main, tags the release, and publishes to npm.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following code style
4. Test on multiple platforms
5. Update documentation
6. Submit pull request

## Debugging

### Enable Debug Output
```bash
DEBUG=true maiass <command>
```

### Check Environment Loading
```bash
node -e "
import { loadEnvironmentConfig } from './lib/config.js';
console.log(loadEnvironmentConfig());
"
```

### Verify Cross-Platform Paths
```bash
node -e "
import { getConfigPaths } from './lib/config.js';
console.log(getConfigPaths());
"
```
