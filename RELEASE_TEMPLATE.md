# MAIASSNODE v0.7.1 - Cross-Platform Release

🎉 **First cross-platform release of MAIASSNODE!** 

AI-powered Git workflow automation tool now available for macOS, Linux, and Windows with self-contained binaries (no Node.js installation required).

## 🚀 Quick Install

### Universal Installer (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/vsmash/nodemaiass/main/scripts/install.sh | bash
```

### Homebrew (macOS/Linux)
```bash
brew tap vsmash/maiass
brew install maiassnode
```

## 📦 Manual Download

Choose your platform:

### macOS
- **Apple Silicon (M1/M2/M3):** [maiassnode-macos-arm64](https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-macos-arm64)
- **Intel:** [maiassnode-macos-intel](https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-macos-intel)

```bash
# Download and install
curl -L https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-macos-arm64 -o maiassnode
chmod +x maiassnode
./maiassnode --version
```

### Linux
- **x64:** [maiassnode-linux-x64](https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-linux-x64)

```bash
# Download and install
curl -L https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-linux-x64 -o maiassnode
chmod +x maiassnode
./maiassnode --version
```

### Windows
- **x64:** [maiassnode-windows-x64.exe](https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-windows-x64.exe)

```powershell
# Download and install (PowerShell)
Invoke-WebRequest -Uri "https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/maiassnode-windows-x64.exe" -OutFile "maiassnode.exe"
.\maiassnode.exe --version
```

## ✨ What's New

- ✅ **Cross-platform binaries** for macOS, Linux, Windows
- ✅ **Self-contained** - includes Node.js runtime (no installation required)
- ✅ **Universal installer** with automatic platform detection
- ✅ **Homebrew support** for easy installation
- ✅ **ARM64 support** for Apple Silicon Macs

## 🔐 Verification

All binaries include SHA256 checksums for verification:
- **Checksums:** [checksums.txt](https://github.com/vsmash/nodemaiass/releases/download/v0.7.1/checksums.txt)

## 📋 System Requirements

- **macOS:** 10.15+ (Intel or Apple Silicon)
- **Linux:** Most distributions (x64)
- **Windows:** 10+ (x64)
- **Dependencies:** None (Node.js included in binary)

## 🆘 Support

- **Documentation:** https://github.com/vsmash/nodemaiass
- **Issues:** https://github.com/vsmash/nodemaiass/issues
- **Discussions:** https://github.com/vsmash/nodemaiass/discussions

---

**Full Changelog:** https://github.com/vsmash/nodemaiass/compare/v0.6.0...v0.7.1
