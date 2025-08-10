# MAIASS Binary Installation - macOS Security Workaround

## Why This Happens
MAIASS binaries are properly code-signed but not notarized by Apple (which requires a paid Apple Developer account). This causes macOS to block execution with "ran out of executable memory" errors.

## Solution 1: Manual Security Override (Recommended)

After installing via Homebrew:

```bash
# Remove quarantine attribute
sudo xattr -dr com.apple.quarantine $(which maiass)

# Try to run - macOS will show a security dialog
maiass --version

# If it still fails:
# 1. Go to System Settings > Privacy & Security
# 2. Look for a message about "maiass was blocked"
# 3. Click "Allow Anyway"
# 4. Try running maiass again
```

## Solution 2: Source Installation (No Security Issues)

Install from source instead of binary:

```bash
# Remove binary version
brew uninstall maiass

# Install our smart installer
curl -sSL https://raw.githubusercontent.com/vsmash/maiass/main/scripts/install-with-node.sh | bash

# Or manual source installation
git clone https://github.com/vsmash/maiass.git
cd maiass
npm install --production
./maiass.js --version
```

## Solution 3: Alternative Binary Installation

If you prefer binaries, download directly and manually allow:

```bash
# Download for your platform
wget https://releases.maiass.net/5.3.18/maiass-macos-arm64.zip  # M1/M2 Macs
wget https://releases.maiass.net/5.3.18/maiass-macos-x64.zip    # Intel Macs

# Extract and install
unzip maiass-macos-*.zip
sudo cp maiass-macos-* /usr/local/bin/maiass
sudo chmod +x /usr/local/bin/maiass

# Remove quarantine and allow in System Settings
sudo xattr -dr com.apple.quarantine /usr/local/bin/maiass
```

## Why We Don't Notarize

Apple notarization requires:
- Paid Apple Developer account ($99/year)
- Complex notarization process
- Potential delays in releases

For an open-source CLI tool, these costs and complexity aren't justified. The code signing ensures integrity - you just need to manually allow execution.

## Verification

All binaries are code-signed. You can verify:

```bash
codesign -dvvv $(which maiass)
# Should show: Authority=Developer ID Application: Mark Pottie
```
