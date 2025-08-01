# Development Guide

Guide for contributing to and extending MAIASS.

## Project Structure

```
maiass/
├── maiass.js          # Main CLI entry point
├── nodemaiass.sh          # Shell wrapper script
├── setup-env.js           # Environment setup utility
├── lib/
│   ├── colors.js          # Color output utilities
│   └── config.js          # Cross-platform configuration
├── docs/
│   ├── README.maiass.md   # Main documentation
│   ├── configuration.md   # Config documentation
│   ├── setup.md          # Setup instructions
│   ├── commands.md       # Command reference
│   └── development.md    # This file
└── package.json          # Project metadata
```

## Development Setup

### Prerequisites
- Node.js 23+
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

### Manual Testing
```bash
# Test different environments
nma hello
DEBUG=true nma hello

# Test cross-platform config
node setup-env.js
```

### Environment Testing
Create test `.env` files:

```bash
# Test project-specific config
echo "TEST_VAR=project" > .env
nma hello

# Test user config
echo "TEST_VAR=user" > ~/.maiass.env
nma hello
```

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

1. **Update version** in `package.json`
2. **Update CHANGELOG.md**
3. **Test on all platforms**
4. **Create release branch**
5. **Tag release**
6. **Merge to main**

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
DEBUG=true nma <command>
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
