# MAIASS Scripts Directory

This directory contains all build, release, and deployment scripts for MAIASS. Here's what each script does and when to use them.

## 🚀 Main Scripts (Use These)

### `release-and-deploy.sh` ⭐ **MAIN SCRIPT**
**Complete automated release pipeline**
```bash
./scripts/release-and-deploy.sh
```
- Builds all platform binaries (macOS, Linux, Windows)
- Code signs macOS and Windows binaries
- Creates signature-preserving archives
- Uploads to GitHub releases
- Deploys to Cloudflare R2 (preserves signatures!)
- Updates Homebrew formula with R2 URLs
- Commits and pushes Homebrew formula

**Prerequisites:**
- `.dev.vars` file with `GITHUB_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- macOS (for code signing)
- Wrangler CLI authenticated

---

## 🔧 Development Scripts

### `advanced-build.sh`
**Multi-method build system**
```bash
./scripts/advanced-build.sh [all|pkg|bun|nexe|source]
```
- `all` - Build with all methods and compare sizes
- `pkg` - Node.js PKG bundling (most compatible)
- `bun` - Bun bundling (fastest, smallest)
- `nexe` - Alternative bundling (disabled due to issues)
- `source` - Source distribution

**Output:** `dist/pkg/`, `dist/bun/`, `dist/source/`

### `deploy-to-r2.sh`
**Deploy binaries to Cloudflare R2**
```bash
./scripts/deploy-to-r2.sh
```
- Uploads signed archives to R2 bucket
- Creates download manifest
- Preserves code signatures (unlike GitHub downloads)

**Prerequisites:** Must run after `release-and-deploy.sh` creates archives

---

## 🔐 Code Signing Scripts

### `codesign.sh`
**Sign macOS binaries**
```bash
./scripts/codesign.sh
```
- Signs all macOS binaries in `build/` directory
- Uses Apple Developer ID certificate
- Verifies signatures after signing

### `codesign-windows.sh`
**Sign Windows binaries**
```bash
./scripts/codesign-windows.sh
```
- Signs Windows .exe files with self-signed certificate
- Uses osslsigncode for cross-platform signing
- Adds timestamp from Sectigo

### `codesign-single.sh`
**Sign individual binary**
```bash
./scripts/codesign-single.sh <binary-path>
```
- Signs a single binary file
- Used for testing signatures

---

## 🍺 Homebrew Scripts

### `create-homebrew-formula.sh`
**Generate Homebrew formula with R2 URLs**
```bash
./scripts/create-homebrew-formula.sh
```
- Downloads binaries from R2 to calculate SHA256
- Generates formula with R2 URLs (preserves signatures)
- Copies formula to `../homebrew-maiass/`

**Note:** Usually called automatically by `release-and-deploy.sh`

---

## 📦 Legacy Scripts (Don't Use Directly)

### `create-release.sh`
❌ **OBSOLETE** - Use `release-and-deploy.sh` instead
- Old release script with GitHub URLs only
- Doesn't include R2 deployment

### `quick-release.sh`
❌ **OBSOLETE** - Use `release-and-deploy.sh` instead
- Simplified release without code signing

### `build-bundled.sh`
❌ **OBSOLETE** - Use `advanced-build.sh` instead
- Old single-method build script

---

## 🛠️ Utility Scripts

### `create-selfsigned-cert.sh`
**Create self-signed certificate for Windows signing**
```bash
./scripts/create-selfsigned-cert.sh
```
- Creates PKCS#12 certificate for Windows code signing
- Only needed once for setup

### `notarize.sh`
**macOS notarization (not currently used)**
```bash
./scripts/notarize.sh <app-path>
```
- Submits macOS binaries for notarization
- Requires Apple Developer account with notarization access

### `install.sh`
**Install MAIASS system-wide**
```bash
./scripts/install.sh
```
- Installs MAIASS to `/usr/local/bin/`
- Used for local development setup

---

## 📋 Workflow Summary

### For Regular Releases:
1. Use MAIASS itself to bump version: `./maiass.sh patch`
2. Run complete release: `./scripts/release-and-deploy.sh`

### For Development:
1. Build binaries: `./scripts/advanced-build.sh all`
2. Test locally: `./dist/bun/maiass-macos-arm64 --version`

### For Homebrew Updates:
1. Usually automatic via `release-and-deploy.sh`
2. Manual: `./scripts/create-homebrew-formula.sh`

---

## 🔧 Configuration Files

- `.dev.vars` - GitHub token and Cloudflare account ID
- `wrangler.jsonc` - Cloudflare R2 bucket configuration
- `../homebrew-maiass/` - Homebrew tap repository

---

## ❗ Important Notes

- **Always use `release-and-deploy.sh`** for production releases
- **R2 URLs preserve code signatures** (GitHub downloads strip them)
- **Homebrew formula uses R2 URLs** to ensure signed binaries
- **Windows signing uses self-signed certificate** (users see warnings)
- **macOS signing requires Apple Developer ID** certificate
