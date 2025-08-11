# MAIASS Installation Guide

## 🚀 Quick Install (Recommended)

### One-Line Install Script
```bash
curl -fsSL https://raw.githubusercontent.com/vsmash/nodemaiass/main/scripts/install.sh | bash
```

This automatically:
- Detects your platform (macOS/Linux/Windows)
- Downloads the correct binary
- Installs to `/usr/local/bin/maiass`
- Works without Node.js installed

## 📦 Manual Installation Methods

### Method 1: GitHub Releases (Self-Contained Binaries)

**These binaries include Node.js runtime - no Node.js installation required!**

#### macOS
```bash
# Apple Silicon (M1/M2/M3)
curl -L https://github.com/vsmash/nodemaiass/releases/latest/download/maiass-macos-arm64 -o maiass
chmod +x maiass
./maiass --version

# Intel
curl -L https://github.com/vsmash/nodemaiass/releases/latest/download/maiass-macos-intel -o maiass
chmod +x maiass
./maiass --version
```

#### Linux
```bash
# x64
curl -L https://github.com/vsmash/nodemaiass/releases/latest/download/maiass-linux-x64 -o maiass
chmod +x maiass
./maiass --version

# ARM64 (Raspberry Pi, etc.)
curl -L https://github.com/vsmash/nodemaiass/releases/latest/download/maiass-linux-arm64 -o maiass
chmod +x maiass
./maiass --version
```

#### Windows
```powershell
# x64
Invoke-WebRequest -Uri "https://github.com/vsmash/nodemaiass/releases/latest/download/maiass-windows-x64.exe" -OutFile "maiass.exe"
.\maiass.exe --version

# ARM64
Invoke-WebRequest -Uri "https://github.com/vsmash/nodemaiass/releases/latest/download/maiass-windows-arm64.exe" -OutFile "maiass.exe"
.\maiass.exe --version
```

### Method 2: NPM Installation (⚠️ Node.js 18+ Required)

**⚠️ WARNING FOR DEVELOPERS:** If you use `nvm` or work on projects with older Node versions, **avoid npm installation**. It will conflict with your project's Node version requirements.

**Only use npm if:**
- You're in a Node.js 18+ environment permanently
- You don't use `nvm` or version switching
- You understand the version conflict risks

```bash
# Global installation (only if Node.js 18+)
npm install -g maiass
maiass --version

# Local installation (only if Node.js 18+)
npm install maiass
npx maiass --version
```

**Recommended instead:** Use the universal installer or Homebrew to avoid Node version conflicts.

### Method 3: Homebrew (macOS/Linux) - Future

```bash
# Coming soon
brew install maiass
```

### Method 4: Package Managers - Future

```bash
# Ubuntu/Debian (coming soon)
sudo apt install maiass

# CentOS/RHEL (coming soon)  
sudo yum install maiass

# Windows (coming soon)
winget install maiass
```

## 🎯 Which Installation Method Should I Use?

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| **Install Script** | **Developers (Recommended)** | ✅ Works with any Node version<br>✅ No Node.js conflicts<br>✅ One command | ❌ Requires internet |
| **Homebrew** | **macOS/Linux developers** | ✅ Professional package manager<br>✅ No Node.js conflicts<br>✅ Easy updates | ❌ macOS/Linux only |
| **GitHub Releases** | Manual control | ✅ No Node.js required<br>✅ Specific version control<br>✅ Offline capable | ❌ Manual platform selection |
| **NPM Install** | ⚠️ **Node.js 18+ only** | ✅ Familiar workflow<br>✅ Integrates with npm | ❌ **Conflicts with nvm/older Node** |

## 🔍 Verification

After installation, verify it works:

```bash
# Check version
maiass --version

# Show help
maiass --help

# Test basic functionality
maiass env
```

## 🛠️ Installation Locations

| Method | Install Location | Command |
|--------|------------------|---------|
| Install Script | `/usr/local/bin/maiass` | `maiass` |
| Manual Binary | Current directory | `./maiass` |
| NPM Global | npm global bin directory | `maiass` |
| NPM Local | `node_modules/.bin/` | `npx maiass` |

## 🔧 Troubleshooting

### "Command not found"
```bash
# Check if binary is in PATH
which maiass

# Add to PATH if needed (add to ~/.bashrc or ~/.zshrc)
export PATH="/usr/local/bin:$PATH"
```

### "Permission denied"
```bash
# Make binary executable
chmod +x maiass
```

### Node.js Version Issues (NPM install only)
```bash
# Check Node.js version
node --version

# If < 18.0.0, use binary installation instead
curl -fsSL https://raw.githubusercontent.com/vsmash/nodemaiass/main/scripts/install.sh | bash
```

### Binary Won't Run
- **macOS**: Allow in System Preferences > Security & Privacy
- **Windows**: Windows Defender may flag unsigned executable
- **Linux**: Ensure binary has execute permissions

## 🚀 Development Installation

For contributors and developers:

```bash
# Clone repository
git clone https://github.com/vsmash/nodemaiass.git
cd nodemaiass

# Install dependencies
npm install

# Run locally
./nodemaiass.sh --version

# Install globally from source
npm install -g .
```

## 📋 System Requirements

### Binary Installation (Recommended)
- **Operating System**: macOS 10.15+, Linux (most distros), Windows 10+
- **Architecture**: x64 or ARM64
- **Dependencies**: None (Node.js included)
- **Disk Space**: ~50MB

### NPM Installation
- **Node.js**: 18.0.0 or higher
- **NPM**: 8.0.0 or higher
- **Operating System**: Any Node.js supported platform
- **Disk Space**: ~5MB + Node.js

## 🔄 Updating

### Binary Installation
```bash
# Re-run install script
curl -fsSL https://raw.githubusercontent.com/vsmash/nodemaiass/main/scripts/install.sh | bash
```

### NPM Installation
```bash
npm update -g maiass
```

## ❓ Support
- **Documentation**: https://github.com/vsmash/nodemaiass
- **Issues**: https://github.com/vsmash/nodemaiass/issues
- **Discussions**: https://github.com/vsmash/nodemaiass/discussions
