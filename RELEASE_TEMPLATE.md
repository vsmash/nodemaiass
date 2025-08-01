# maiass v0.7.1 - Cross-Platform Release

🎉 **First cross-platform release of maiass!** 

AI-powered Git workflow automation tool now available for macOS, Linux, and Windows with self-contained binaries (no Node.js installation required).

## 🚀 Quick Install

### Universal Installer (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/vsmash/maiass/main/scripts/install.sh | bash
```

### Homebrew (macOS/Linux)
```bash
brew tap vsmash/maiass
brew install maiass
```

## 📦 Manual Download

Choose your platform:

### macOS
- **Apple Silicon (M1/M2/M3):** [maiass-macos-arm64](https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-macos-arm64)
- **Intel:** [maiass-macos-intel](https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-macos-intel)

```bash
# Download and install
curl -L https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-macos-arm64 -o maiass
chmod +x maiass
./maiass --version
```

### Linux
- **x64:** [maiass-linux-x64](https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-linux-x64)

```bash
# Download and install
curl -L https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-linux-x64 -o maiass
chmod +x maiass
./maiass --version
```

### Windows
- **x64:** [maiass-windows-x64.exe](https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-windows-x64.exe)

```powershell
# Download and install (PowerShell)
Invoke-WebRequest -Uri "https://github.com/vsmash/maiass/releases/download/v0.7.1/maiass-windows-x64.exe" -OutFile "maiass.exe"
.\maiass.exe --version
```

## ✨ What's New

- ✅ **Cross-platform binaries** for macOS, Linux, Windows
- ✅ **Self-contained** - includes Node.js runtime (no installation required)
- ✅ **Universal installer** with automatic platform detection
- ✅ **Homebrew support** for easy installation
- ✅ **ARM64 support** for Apple Silicon Macs

## 🔐 Verification

All binaries include SHA256 checksums for verification:
- **Checksums:** [checksums.txt](https://github.com/vsmash/maiass/releases/download/v0.7.1/checksums.txt)

## 📋 System Requirements

- **macOS:** 10.15+ (Intel or Apple Silicon)
- **Linux:** Most distributions (x64)
- **Windows:** 10+ (x64)
- **Dependencies:** None (Node.js included in binary)

## 🆘 Support

- **Documentation:** https://github.com/vsmash/maiass
- **Issues:** https://github.com/vsmash/maiass/issues
- **Discussions:** https://github.com/vsmash/maiass/discussions

---

**Full Changelog:** https://github.com/vsmash/maiass/compare/v0.6.0...v0.7.1
