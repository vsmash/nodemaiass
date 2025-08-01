#!/bin/bash
# Script to create GitHub release with cross-platform binaries

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git checkout develop
VERSION=${1:-$(node -p "require('./package.json').version")}
REPO="vsmash/maiass"  # Update with your actual repo
# get the current branch name
echo "🚀 Creating GitHub release for version $VERSION"
# ask choice: 1. merge develop into staging, 2. merge staging into main, 3. 1 then two, 4. exit
read -p "Choose an option: 
1. merge develop into staging
2. merge staging into main
3. 1 then two
4. exit
" -r choice

if [ "$choice" = "1" ]; then
    git checkout staging
    git merge develop
    git push
elif [ "$choice" = "2" ]; then
    git checkout main
    git merge staging
    git push
    git checkout $BRANCH
    echo "✅ Merged staging into main"
    echo "back on branch: $BRANCH"
elif [ "$choice" = "3" ]; then
    git checkout staging
    git merge develop
    git push
    git checkout main
    git merge staging
    git push
    git checkout $BRANCH
    echo "✅ Merged develop into staging and staging into main"
    echo "back on branch: $BRANCH"  
elif [ "$choice" = "4" ]; then
    git checkout $BRANCH
    echo "back on branch: $BRANCH"  
    exit 0
else
    git checkout $BRANCH
    echo "back on branch: $BRANCH"  
    echo "Invalid choice"
    exit 1
fi

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

# Copy all the properly named binaries
cp ../build/maiass-macos-x64 maiass-macos-intel
cp ../build/maiass-macos-arm64 maiass-macos-arm64  
cp ../build/maiass-linux-x64 maiass-linux-x64
cp ../build/maiass-linux-arm64 maiass-linux-arm64
cp ../build/maiass-win-x64.exe maiass-windows-x64.exe
cp ../build/maiass-win-arm64.exe maiass-windows-arm64.exe

echo "✅ Copied all release binaries"

# Make binaries executable and create checksums
chmod +x maiass-*

# Create checksums
echo "🔒 Creating checksums..."
shasum -a 256 maiass-* > checksums.txt

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
echo "📝 Sample download instructions for users:"
echo ""

# macOS Intel
echo "macOS Intel (x64):"
echo "curl -L https://github.com/$REPO/releases/download/$VERSION/maiass-macos-intel -o maiass"
echo "chmod +x maiass"
echo "./maiass --version"
echo ""

# macOS ARM64
echo "macOS ARM64 (M1/M2):"
echo "curl -L https://github.com/$REPO/releases/download/$VERSION/maiass-macos-arm64 -o maiass"
echo "chmod +x maiass"
echo "./maiass --version"
echo ""

# Linux x64
echo "Linux x64:"
echo "curl -L https://github.com/$REPO/releases/download/$VERSION/maiass-linux-x64 -o maiass"
echo "chmod +x maiass"
echo "./maiass --version"
echo ""

# Windows x64
echo "Windows x64 (PowerShell):"
echo "Invoke-WebRequest -Uri \"https://github.com/$REPO/releases/download/$VERSION/maiass-windows-x64.exe\" -OutFile \"maiass.exe\""
echo ".\\maiass.exe --version"
echo ""
