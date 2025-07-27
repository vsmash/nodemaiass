# Cross-Platform Support

MAIASSNODE is designed to work seamlessly across macOS, Linux, and Windows on both Intel and ARM architectures.

## Supported Platforms

### macOS
- **Intel (x64)**: macOS 10.15+ 
- **Apple Silicon (ARM64)**: macOS 11.0+

### Linux
- **x64**: Most modern Linux distributions
- **ARM64**: Ubuntu 18.04+, Debian 10+, and other ARM64-compatible distributions

### Windows
- **x64**: Windows 10/11
- **ARM64**: Windows 10/11 on ARM

## Building Binaries

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Install Dependencies
```bash
npm install
```

### Build Commands

#### Build for All Platforms
```bash
npm run build
# or
npm run build:all
```

#### Build for Specific Platforms
```bash
# macOS only (Intel + Apple Silicon)
npm run build:macos

# Linux only (x64 + ARM64)
npm run build:linux

# Windows only (x64 + ARM64)
npm run build:windows
```

### Output
Built binaries will be placed in the `build/` directory with platform-specific names:
- `maiassnode-macos` (Intel)
- `maiassnode-macos-arm64` (Apple Silicon)
- `maiassnode-linux` (x64)
- `maiassnode-linux-arm64` (ARM64)
- `maiassnode-win.exe` (x64)
- `maiassnode-win-arm64.exe` (ARM64)

## Platform-Specific Notes

### Windows
- Ensure Git is installed and available in PATH
- PowerShell or Command Prompt both work
- Windows Defender may flag the executable initially (this is normal for unsigned binaries)

### Linux
- Requires Git to be installed
- May need to make the binary executable: `chmod +x maiassnode-linux`
- ARM64 builds work on Raspberry Pi 4+ and other ARM64 systems

### macOS
- Both Intel and Apple Silicon Macs are supported
- Gatekeeper may require you to allow the app in System Preferences > Security & Privacy
- Git comes pre-installed on macOS

## Configuration

MAIASSNODE uses `.env.maiass` files for configuration, which work identically across all platforms. The configuration system automatically handles platform-specific paths and environment variables.

## Troubleshooting

### Binary Won't Run
1. **Linux/macOS**: Ensure the binary is executable (`chmod +x maiassnode-*`)
2. **Windows**: Run as Administrator if needed
3. **All platforms**: Verify Git is installed and accessible

### Path Issues
- Ensure Git is in your system PATH
- On Windows, restart your terminal after installing Git
- Use absolute paths if relative paths cause issues

### Permission Errors
- **Linux/macOS**: Use `sudo` if needed for system-wide installation
- **Windows**: Run Command Prompt or PowerShell as Administrator

## Development

For development across platforms:

```bash
# Run directly with Node.js (cross-platform)
node maiassnode.mjs

# Run tests
npm test

# Start development mode
npm start
```

## Distribution

When distributing MAIASSNODE:
1. Build for all target platforms using `npm run build`
2. Test each binary on its target platform
3. Include platform-specific installation instructions
4. Consider code signing for production releases (especially Windows/macOS)
