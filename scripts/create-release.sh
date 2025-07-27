#!/bin/bash
# Script to create GitHub release with cross-platform binaries

set -e

VERSION=${1:-$(node -p "require('./package.json').version")}
REPO="vsmash/nodemaiass"  # Update with your actual repo

echo "🚀 Creating GitHub release for version $VERSION"

# Build all binaries
echo "📦 Building binaries for all platforms..."
npm run build:all

# Create release directory
mkdir -p release
cd release

# Copy and rename binaries with proper naming
echo "📋 Preparing release assets..."

# Check what files actually exist
echo "Available build files:"
ls -la ../build/

# macOS (these are created by pkg)
if [ -f ../build/maiassnode-x64 ]; then
    cp ../build/maiassnode-x64 maiassnode-macos-intel
    echo "✅ Copied macOS Intel binary"
fi

if [ -f ../build/maiassnode-arm64 ]; then
    cp ../build/maiassnode-arm64 maiassnode-macos-arm64
    echo "✅ Copied macOS ARM64 binary"
fi

# The generic 'maiassnode' file might be Linux - let's use it for Linux x64
if [ -f ../build/maiassnode ]; then
    cp ../build/maiassnode maiassnode-linux-x64
    echo "✅ Copied Linux x64 binary (from generic maiassnode)"
fi

# Windows
if [ -f ../build/maiassnode.exe ]; then
    cp ../build/maiassnode.exe maiassnode-windows-x64.exe
    echo "✅ Copied Windows x64 binary"
fi

# Note: pkg seems to only build one binary per platform type
# We may need to run separate builds for different architectures
echo "⚠️  Note: pkg may not create separate ARM64 binaries for Linux/Windows"
echo "⚠️  Consider running separate builds or using CI for complete coverage"

# Make binaries executable
chmod +x maiassnode-*

# Create checksums
echo "🔐 Creating checksums..."
shasum -a 256 maiassnode-* > checksums.txt

echo "✅ Release assets prepared in ./release/"
echo ""
echo "📋 Next steps:"
echo "1. Create a GitHub release: https://github.com/$REPO/releases/new"
echo "2. Tag: v$VERSION"
echo "3. Upload files from ./release/ directory"
echo "4. Include installation instructions in release notes"

echo ""
echo "📥 Installation instructions for users:"
echo ""
echo "# Universal Installer (Recommended - Auto-detects platform)"
echo "curl -fsSL https://raw.githubusercontent.com/$REPO/main/scripts/install.sh | bash"
echo ""
echo "# Manual Installation:"
echo ""
echo "# macOS Intel"
echo "curl -L https://github.com/$REPO/releases/download/v$VERSION/maiassnode-macos-intel -o maiassnode"
echo "chmod +x maiassnode"
echo "./maiassnode --version"
echo ""
echo "# macOS Apple Silicon"  
echo "curl -L https://github.com/$REPO/releases/download/v$VERSION/maiassnode-macos-arm64 -o maiassnode"
echo "chmod +x maiassnode"
echo "./maiassnode --version"
echo ""
echo "# Linux x64"
echo "curl -L https://github.com/$REPO/releases/download/v$VERSION/maiassnode-linux-x64 -o maiassnode"
echo "chmod +x maiassnode"
echo "./maiassnode --version"
echo ""
echo "# Windows x64 (PowerShell)"
echo "Invoke-WebRequest -Uri \"https://github.com/$REPO/releases/download/v$VERSION/maiassnode-windows-x64.exe\" -OutFile \"maiassnode.exe\""
echo ".\\maiassnode.exe --version"
