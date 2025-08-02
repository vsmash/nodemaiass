#!/bin/bash
# Quick release script - builds, signs, and uploads to GitHub
# Skips git workflow management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

VERSION=$(node -p "require('./package.json').version")
REPO="vsmash/maiass"

echo "🚀 Quick Release for MAIASS v$VERSION"
echo "====================================="

# Check GitHub CLI
if ! command -v gh >/dev/null 2>&1; then
    print_error "Install GitHub CLI: brew install gh"
    exit 1
fi

# Check authentication
if ! gh auth status >/dev/null 2>&1; then
    print_error "Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Build and sign
print_status "Building and signing..."
npm run build:all
./scripts/codesign.sh
./scripts/codesign-windows.sh

# Use our existing release creation
print_status "Creating release assets..."
rm -rf release && ./scripts/create-release.sh <<< "4"

# Upload to GitHub
print_status "Uploading to GitHub..."

# Delete existing release if it exists  
if gh release view "v$VERSION" >/dev/null 2>&1; then
    gh release delete "v$VERSION" --yes
fi

# Create release with archives
gh release create "v$VERSION" \
    --title "MAIASS v$VERSION" \
    --notes "🔐 Code-signed release with properly preserved signatures" \
    release/*.zip \
    release/*.tar.gz \
    release/checksums.txt

print_success "Release v$VERSION uploaded!"
print_status "Updating Homebrew formula..."

# Update Homebrew formula with new checksums
./scripts/create-homebrew-formula.sh

print_success "Done! 🎉"
echo "GitHub Release: https://github.com/$REPO/releases/tag/v$VERSION"
