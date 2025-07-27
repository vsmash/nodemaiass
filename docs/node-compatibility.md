# Node.js Version Compatibility Guide

## Overview

MAIASSNODE has different Node.js version requirements depending on how it's installed and used.

## Compatibility Matrix

| Installation Method | Node.js Requirement | Works on Node 16? | Explanation |
|-------------------|-------------------|------------------|-------------|
| **Built Binaries** | None (self-contained) | ✅ YES | Includes Node.js 18 runtime |
| **NPM Global Install** | Node.js >=18.0.0 | ❌ NO | Uses system Node.js |
| **Shell Wrapper** | Node.js >=18.0.0 | ❌ NO | Uses system Node.js |
| **Direct Node.js** | Node.js >=18.0.0 | ❌ NO | Uses system Node.js |

## Why Node.js 18+ is Required

MAIASSNODE uses modern JavaScript features that require Node.js 18+:

1. **ES Modules with `import.meta.url`** - Available in Node.js 14.14.0+
2. **Top-level await** - Stable in Node.js 14.8.0+
3. **Modern import/export syntax** - Stable in Node.js 14+
4. **Cross-platform path handling** - Uses modern Node.js APIs

## Solutions for Different Scenarios

### For Users with Node.js 16 or Lower

**Recommended: Use Built Binaries**
```bash
# Download the appropriate binary for your platform
./maiassnode-macos-arm64 --version    # macOS Apple Silicon
./maiassnode-macos-x64 --version      # macOS Intel
./maiassnode-linux-arm64 --version    # Linux ARM64
./maiassnode-linux-x64 --version      # Linux x64
./maiassnode-win-x64.exe --version    # Windows x64
./maiassnode-win-arm64.exe --version  # Windows ARM64
```

**Why this works:**
- Binaries include Node.js 18 runtime embedded
- No Node.js installation required on target machine
- Completely self-contained

### For Users with Node.js 18+

**All methods work:**
```bash
# Global installation
npm install -g maiassnode
maiassnode --version

# Shell wrapper
./nodemaiass.sh --version

# Direct Node.js
node maiassnode.cjs --version
```

### For Development Teams with Mixed Node.js Versions

**Strategy 1: Use Built Binaries**
- Distribute the appropriate binary for each platform
- No Node.js version conflicts
- Consistent runtime environment

**Strategy 2: Use Node Version Manager**
```bash
# Install Node.js 18+ for this project only
nvm install 18
nvm use 18
npm install -g maiassnode
```

## Testing Node.js Compatibility

### Check Your Node.js Version
```bash
node --version
```

### Test Compatibility
```bash
# Test if your Node.js version supports MAIASSNODE
node -e "console.log('Node.js version:', process.version); import('./maiassnode.mjs').then(() => console.log('✅ Compatible')).catch(e => console.log('❌ Not compatible:', e.message))"
```

## Binary Distribution Strategy

For maximum compatibility, we recommend distributing built binaries:

### Advantages of Built Binaries
- ✅ **No Node.js required** on target machine
- ✅ **Consistent runtime** (Node.js 18 embedded)
- ✅ **Works on any system** regardless of installed Node.js version
- ✅ **Single file distribution** - easy to deploy
- ✅ **No dependency conflicts**

### Binary Sizes
- macOS ARM64: ~45MB
- macOS x64: ~50MB  
- Linux ARM64: ~45MB
- Linux x64: ~47MB
- Windows x64: ~39MB
- Windows ARM64: ~39MB

## Recommendations by Use Case

### End Users (Non-developers)
**Use built binaries** - No Node.js knowledge required

### Developers with Node.js 18+
**Use npm installation** - Integrates with existing Node.js workflow

### Developers with Node.js 16 or lower
**Options:**
1. **Use built binaries** (easiest)
2. **Upgrade Node.js** to 18+ (recommended for modern development)
3. **Use nvm** to manage multiple Node.js versions

### CI/CD Pipelines
**Use built binaries** - Consistent, predictable runtime environment

## Future Compatibility

MAIASSNODE will maintain compatibility with:
- **Current LTS Node.js versions** (18, 20, 22)
- **Built binaries** will always be self-contained
- **Modern JavaScript features** for better performance and maintainability

## Troubleshooting

### "SyntaxError: Cannot use import statement outside a module"
- Your Node.js version is too old (< 14)
- Solution: Use built binaries or upgrade Node.js

### "ReferenceError: import.meta is not defined"
- Your Node.js version doesn't support import.meta (< 14.14.0)
- Solution: Use built binaries or upgrade Node.js

### "npm ERR! engine node"
- Your Node.js version doesn't meet the engines requirement
- Solution: Use built binaries or upgrade Node.js to 18+
