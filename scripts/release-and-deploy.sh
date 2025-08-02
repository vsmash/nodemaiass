#!/bin/bash
# Complete automated release process: build, sign, archive, upload, update Homebrew

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Configuration
REPO="vsmash/maiass"
VERSION=$(node -p "require('./package.json').version")
GITHUB_TOKEN=${GITHUB_TOKEN:-}

echo "🚀 MAIASS Complete Release Automation"
echo "======================================"
echo "Version: $VERSION"
echo "Repo: $REPO"
echo ""

# Check prerequisites
if [[ -z "$GITHUB_TOKEN" ]]; then
    print_error "GITHUB_TOKEN environment variable not set"
    echo "Create a GitHub Personal Access Token with 'repo' scope:"
    echo "https://github.com/settings/tokens"
    echo ""
    echo "Then export it:"
    echo "export GITHUB_TOKEN=your_token_here"
    exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
    print_error "GitHub CLI (gh) not installed"
    echo "Install with: brew install gh"
    exit 1
fi

# Authenticate with GitHub CLI
print_status "Checking GitHub authentication..."
if ! gh auth status >/dev/null 2>&1; then
    if [[ -n "$GITHUB_TOKEN" ]]; then
        echo "$GITHUB_TOKEN" | gh auth login --with-token
    else
        print_error "Not authenticated with GitHub CLI"
        echo "Run: gh auth login"
        exit 1
    fi
else
    print_success "Already authenticated with GitHub CLI"
fi

# Step 1: Build all binaries
print_status "Building all platform binaries..."
npm run build:all

# Step 2: Code sign binaries
print_status "Code signing binaries..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    ./scripts/codesign.sh
    ./scripts/codesign-windows.sh
    print_success "Code signing completed"
else
    print_warning "Not on macOS - skipping code signing"
fi

# Step 3: Create release directory and archives
print_status "Creating release archives..."
rm -rf release-automated
mkdir -p release-automated
cd release-automated

# Copy binaries from the new build system (uses best available method)
if [ -d "../dist/bun" ]; then
    # Prefer Bun builds (faster, smaller)
    cp ../dist/bun/maiass-macos-x64 maiass-macos-x64
    cp ../dist/bun/maiass-macos-arm64 maiass-macos-arm64
    cp ../dist/bun/maiass-linux-x64 maiass-linux-x64
    cp ../dist/bun/maiass-linux-arm64 maiass-linux-arm64
    cp ../dist/bun/maiass-windows-x64.exe maiass-windows-x64.exe
    print_success "Using Bun-built binaries"
elif [ -d "../dist/pkg" ]; then
    # Fallback to PKG builds
    cp ../dist/pkg/maiass-macos-x64 maiass-macos-x64
    cp ../dist/pkg/maiass-macos-arm64 maiass-macos-arm64
    cp ../dist/pkg/maiass-linux-x64 maiass-linux-x64
    cp ../dist/pkg/maiass-linux-arm64 maiass-linux-arm64
    cp ../dist/pkg/maiass-windows-x64.exe maiass-windows-x64.exe
    print_success "Using PKG-built binaries"
else
    print_error "No built binaries found in dist/ directory"
    exit 1
fi

chmod +x maiass-*

# Verify signatures on macOS binaries
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Verifying signatures..."
    for binary in maiass-macos-*; do
        if codesign --verify --deep --strict --verbose=2 "$binary" 2>/dev/null; then
            print_success "$binary signature verified"
        else
            print_error "$binary signature verification failed"
            exit 1
        fi
    done
fi

# Create signature-preserving archives
print_status "Creating archives that preserve signatures..."

# macOS archives with ditto
ditto -c -k --sequesterRsrc --keepParent maiass-macos-x64 maiass-macos-x64.zip
ditto -c -k --sequesterRsrc --keepParent maiass-macos-arm64 maiass-macos-arm64.zip

# Linux archives
tar -czf maiass-linux-x64.tar.gz maiass-linux-x64
tar -czf maiass-linux-arm64.tar.gz maiass-linux-arm64

# Windows archives  
zip -9 maiass-windows-x64.zip maiass-windows-x64.exe
zip -9 maiass-windows-arm64.zip maiass-windows-arm64.exe

# Create checksums
shasum -a 256 *.zip *.tar.gz > checksums.txt

print_success "Created release archives:"
ls -la *.zip *.tar.gz checksums.txt

cd ..

# Step 4: Create or update GitHub release
print_status "Creating GitHub release v$VERSION..."

# Delete existing release if it exists
if gh release view "v$VERSION" >/dev/null 2>&1; then
    print_warning "Release v$VERSION already exists, deleting..."
    gh release delete "v$VERSION" --yes
fi

# Create new release
gh release create "v$VERSION" \
    --title "MAIASS v$VERSION - Code Signed Release" \
    --notes "🔐 **Properly Code Signed Release**

✅ **Fixed Code Signing:**
- All macOS binaries properly signed with Apple Developer ID
- Signatures preserved through archive distribution  
- No more \"killed\" processes on macOS

📦 **Installation:**
\`\`\`bash
# Homebrew (Recommended)
brew install vsmash/maiass/maiass

# Or direct download and extract the appropriate archive for your platform
\`\`\`

🔐 **Verification:**
All archives include SHA256 checksums in checksums.txt

📝 **Important:** Download the .zip/.tar.gz archives, not individual binaries, to preserve code signatures." \
    release-automated/maiass-macos-x64.zip \
    release-automated/maiass-macos-arm64.zip \
    release-automated/maiass-linux-x64.tar.gz \
    release-automated/maiass-linux-arm64.tar.gz \
    release-automated/maiass-windows-x64.zip \
    release-automated/maiass-windows-arm64.zip \
    release-automated/checksums.txt

print_success "GitHub release v$VERSION created successfully!"

# Step 5: Update Homebrew formula
print_status "Updating Homebrew formula..."

# Calculate SHA256s from the archives we just created
INTEL_SHA=$(shasum -a 256 release-automated/maiass-macos-x64.zip | cut -d' ' -f1)
ARM64_SHA=$(shasum -a 256 release-automated/maiass-macos-arm64.zip | cut -d' ' -f1)
LINUX_SHA=$(shasum -a 256 release-automated/maiass-linux-x64.tar.gz | cut -d' ' -f1)

print_status "Archive SHA256 checksums:"
print_status "Intel: $INTEL_SHA"
print_status "ARM64: $ARM64_SHA"
print_status "Linux: $LINUX_SHA"

# Update the Homebrew formula
FORMULA_FILE="../homebrew-maiass/Formula/maiass.rb"

if [[ -f "$FORMULA_FILE" ]]; then
    cat > "$FORMULA_FILE" << EOF
class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/$REPO"
  url "https://github.com/$REPO/archive/refs/tags/#{version}.tar.gz"
  version "$VERSION"

  license "GPL-3.0-only"
  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/$REPO/releases/download/#{version}/maiass-macos-x64.zip"
      sha256 "$INTEL_SHA"
    else
      url "https://github.com/$REPO/releases/download/#{version}/maiass-macos-arm64.zip"
      sha256 "$ARM64_SHA"
    end
  end

  on_linux do
    url "https://github.com/$REPO/releases/download/#{version}/maiass-linux-x64.tar.gz"
    sha256 "$LINUX_SHA"
  end

  def install
    # Extract the binary from the archive and install it
    if OS.mac?
      bin.install Dir["maiass-macos-*"].first => "maiass"
    elsif OS.linux?
      bin.install Dir["maiass-linux-*"].first => "maiass"
    end
    
    # Create convenience symlinks
    bin.install_symlink "maiass" => "myass"
    bin.install_symlink "maiass" => "miass"
  end

  test do
    system "#{bin}/maiass", "--version"
    system "#{bin}/maiass", "--help"
  end
end
EOF

    print_success "Updated Homebrew formula with new checksums"
    
    # Commit and push the Homebrew formula
    print_status "Committing Homebrew formula changes..."
    cd ../homebrew-maiass
    git add Formula/maiass.rb
    git commit -m "Update maiass to v$VERSION with code-signed binaries"
    git push origin main
    print_success "Homebrew formula updated and pushed!"
    cd ../maiass
    
else
    print_warning "Homebrew formula not found at $FORMULA_FILE"
fi

# Step 6: Final summary
echo ""
print_success "🎉 Complete release automation finished!"
echo ""
echo "✅ Built and code-signed binaries"
echo "✅ Created signature-preserving archives" 
echo "✅ Uploaded to GitHub release v$VERSION"
echo "✅ Updated Homebrew formula with correct checksums"
echo "✅ Pushed Homebrew formula to repository"
echo ""
echo "🍺 Users can now install with:"
echo "   brew upgrade maiass"
echo ""
echo "🔗 GitHub Release: https://github.com/$REPO/releases/tag/v$VERSION"
