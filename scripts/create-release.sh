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

# Code sign macOS binaries (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔐 Code signing macOS binaries..."
    if ./scripts/codesign.sh; then
        echo "✅ macOS code signing completed"
    else
        echo "⚠️ macOS code signing failed, continuing with unsigned binaries"
    fi
fi

# Code sign Windows binaries (cross-platform with osslsigncode)
echo "🔐 Code signing Windows binaries..."
if ./scripts/codesign-windows.sh; then
    echo "✅ Windows code signing completed"
else
    echo "⚠️ Windows code signing failed, continuing with unsigned binaries"
fi

# Create release directory
mkdir -p release
cd release

# Copy and rename binaries with proper naming
echo "📋 Preparing release assets..."

# Check what files actually exist
echo "Available build files:"
ls -la ../build/

# Copy all the properly named binaries
cp ../build/maiass-macos-x64 maiass-macos-x64
cp ../build/maiass-macos-arm64 maiass-macos-arm64  
cp ../build/maiass-linux-x64 maiass-linux-x64
cp ../build/maiass-linux-arm64 maiass-linux-arm64
cp ../build/maiass-win-x64.exe maiass-windows-x64.exe
cp ../build/maiass-win-arm64.exe maiass-windows-arm64.exe

echo "✅ Copied all release binaries"

# Verify code signatures on macOS binaries and create archives
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔍 Verifying code signatures on macOS binaries..."
    for binary in maiass-macos-*; do
        if codesign --verify --deep --strict --verbose=2 "$binary" 2>/dev/null; then
            echo "✅ $binary is properly signed"
            
            # Test with Gatekeeper
            if spctl --assess --type exec --verbose=4 "$binary" 2>/dev/null; then
                echo "✅ $binary passes Gatekeeper assessment"
            else
                echo "⚠️ $binary fails Gatekeeper (may need notarization for distribution)"
            fi
            
            # Create archive that preserves extended attributes
            echo "📦 Creating archive for $binary..."
            ditto -c -k --sequesterRsrc --keepParent "$binary" "${binary}.zip"
            echo "✅ Created ${binary}.zip"
        else
            echo "❌ $binary is NOT signed - this will cause issues!"
            exit 1
        fi
    done
else
    echo "⚠️ Not on macOS - skipping signature verification"
fi

# Create archives for Linux and Windows binaries too
echo "📦 Creating archives for all binaries..."
for binary in maiass-linux-* maiass-windows-*; do
    if [[ -f "$binary" ]]; then
        if [[ "$binary" == *.exe ]]; then
            # Windows binary - use zip
            zip -9 "${binary%.exe}.zip" "$binary"
            echo "✅ Created ${binary%.exe}.zip"
        else
            # Linux binary - use tar.gz
            tar -czf "${binary}.tar.gz" "$binary"
            echo "✅ Created ${binary}.tar.gz"
        fi
    fi
done

# Make binaries executable and create checksums for both binaries and archives
chmod +x maiass-*

# Create checksums for all files (binaries and archives)
echo "🔒 Creating checksums..."
shasum -a 256 maiass-* *.zip *.tar.gz > checksums.txt 2>/dev/null || shasum -a 256 maiass-* > checksums.txt

echo "✅ Release assets prepared in ./release/"
echo ""
echo "📋 Upload to GitHub Release:"
echo "For macOS: Upload the .zip files (preserve signatures)"
echo "For Linux: Upload the .tar.gz files" 
echo "For Windows: Upload the .zip files"
echo "Also upload: checksums.txt"
echo ""
echo "📋 Next steps:"
echo "1. Create a GitHub release: https://github.com/$REPO/releases/new"
echo "2. Tag: v$VERSION"
echo "3. Upload ARCHIVE files (.zip, .tar.gz) from ./release/ directory"
echo "4. DO NOT upload raw binaries - use archives to preserve signatures"
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
