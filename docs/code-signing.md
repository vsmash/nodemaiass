# Code Signing Setup for MAIASS

This guide explains how to set up code signing for MAIASS binaries to avoid macOS security warnings.

## Prerequisites

1. **Apple Developer Account** (for distribution)
2. **macOS development machine**
3. **Xcode Command Line Tools**

## Quick Setup (Ad-hoc Signing - For Testing)

For local testing and development, you can use ad-hoc signing:

```bash
# Set ad-hoc signing (no Apple Developer ID required)
export MAIASS_DEVELOPER_ID="-"

# Build and sign
npm run build:all
```

## Production Setup (Apple Developer ID)

For distribution via Homebrew and GitHub releases:

### 1. Get Apple Developer ID

1. Join the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Create a **Developer ID Application** certificate in Xcode or Apple Developer portal

### 2. Install Certificate

1. Download your Developer ID certificate
2. Double-click to install in Keychain Access
3. Find your certificate name (e.g., "Developer ID Application: Your Name (TEAM_ID)")

### 3. Configure Environment

```bash
# Add to your ~/.zshrc or ~/.bashrc
export MAIASS_DEVELOPER_ID="Developer ID Application: Your Name (TEAM_ID)"

# Optional: Skip code signing entirely
export MAIASS_SKIP_CODESIGN="true"
```

### 4. Build with Signing

```bash
# Build all platforms and auto-sign macOS binaries
npm run build:all

# Or manually sign existing binaries
./scripts/codesign.sh

# Or sign a single binary
./scripts/codesign-single.sh build/maiass-macos-arm64
```

## Verification

Check if a binary is properly signed:

```bash
# Check signature
codesign -v build/maiass-macos-arm64

# Detailed verification
codesign -dv --verbose=4 build/maiass-macos-arm64

# Test the binary
./build/maiass-macos-arm64 --version
```

## Troubleshooting

### "Developer ID not configured" Error

Set your Developer ID environment variable:

```bash
export MAIASS_DEVELOPER_ID="Developer ID Application: Your Name (TEAM_ID)"
```

### "Operation not permitted" Error

The certificate might not be in your keychain or expired:

1. Check Keychain Access for your Developer ID certificate
2. Ensure it's not expired
3. Try signing manually: `codesign --sign "Your Dev ID" binary`

### "Binary is killed" on macOS

This happens with unsigned binaries. Options:

1. **Sign the binary** (recommended)
2. **Remove quarantine**: `xattr -d com.apple.quarantine /path/to/binary`
3. **Allow in System Preferences**: System Preferences → Security → Allow anyway

### Skip Code Signing Temporarily

```bash
export MAIASS_SKIP_CODESIGN="true"
npm run build:all
```

## Integration with Release Process

The code signing is automatically integrated into:

1. **build.js** - Signs macOS binaries during build
2. **create-release.sh** - Signs before creating release assets
3. **create-homebrew-formula.sh** - Generates SHA256 from signed binaries

## Release Workflow

```bash
# 1. Set up signing
export MAIASS_DEVELOPER_ID="Developer ID Application: Your Name (TEAM_ID)"

# 2. Create signed release
./scripts/create-release.sh

# 3. Upload to GitHub (creates release with signed binaries)

# 4. Update Homebrew formula (uses SHA256 from GitHub)
./scripts/create-homebrew-formula.sh

# 5. Update tap
cd ../homebrew-maiass
git add Formula/maiass.rb
git commit -m "Update formula with signed binaries"
git push
```

## Security Notes

- **Never commit certificates** to git
- **Use environment variables** for Developer ID
- **Test signed binaries** before release
- **Keep certificates backed up** securely

## Alternative: Notarization

For enhanced security, you can also notarize your binaries:

```bash
# After signing, notarize (requires Apple Developer account)
xcrun notarytool submit build/maiass-macos-arm64.zip \
  --apple-id your@email.com \
  --password app-specific-password \
  --team-id TEAM_ID \
  --wait

# Staple the notarization
xcrun stapler staple build/maiass-macos-arm64
```

This is optional but provides the highest level of macOS security compliance.
