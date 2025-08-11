#!/bin/bash
# Generate Homebrew formula with correct SHA256 hashes

set -e

# Configuration
REPO="vsmash/maiass"
VERSION=$(node -p "require('./package.json').version")
FORMULA_DIR="Formula"
FORMULA_FILE="$FORMULA_DIR/maiass.rb"

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

echo "🍺 Creating Homebrew Formula for MAIASS v$VERSION"
echo "=============================================="

# Ensure release directory exists and has binaries
if [ ! -d "release-automated" ]; then
    print_error "Release directory not found. Run ./scripts/release-and-deploy.sh first"
    exit 1
fi

# Create Formula directory
mkdir -p "$FORMULA_DIR"

print_status "Calculating SHA256 hashes from R2 release binaries (preserves signatures)..."

# Use R2 URLs instead of GitHub to preserve code signatures
R2_BASE_URL="https://releases.maiass.net/$VERSION"

# Download and calculate SHA256 from R2 release files
INTEL_SHA=""
ARM64_SHA=""
LINUX_SHA=""

# Download and hash Intel binary archive from R2
print_status "Downloading and hashing Intel binary archive from R2..."
if curl -L -o "temp-intel.zip" "$R2_BASE_URL/maiass-macos-x64.zip" 2>/dev/null; then
    INTEL_SHA=$(shasum -a 256 "temp-intel.zip" | cut -d' ' -f1)
    echo "✅ Intel (x64) SHA256: ${INTEL_SHA:0:8}..."
    rm "temp-intel.zip"
else
    print_error "Failed to download Intel binary from R2"
    print_status "Fallback: trying GitHub release..."
    if curl -L -o "temp-intel.zip" "https://github.com/$REPO/releases/download/v$VERSION/maiass-macos-x64.zip" 2>/dev/null; then
        INTEL_SHA=$(shasum -a 256 "temp-intel.zip" | cut -d' ' -f1)
        echo "⚠️  Intel (GitHub fallback) SHA256: ${INTEL_SHA:0:8}..."
        rm "temp-intel.zip"
    else
        print_error "Failed to download Intel binary from both R2 and GitHub"
    fi
fi

# Download and hash ARM64 binary archive from R2
print_status "Downloading and hashing ARM64 binary archive from R2..."
if curl -L -o "temp-arm64.zip" "$R2_BASE_URL/maiass-macos-arm64.zip" 2>/dev/null; then
    ARM64_SHA=$(shasum -a 256 "temp-arm64.zip" | cut -d' ' -f1)
    echo "✅ ARM64 SHA256: ${ARM64_SHA:0:8}..."
    rm "temp-arm64.zip"
else
    print_error "Failed to download ARM64 binary from R2"
    print_status "Fallback: trying GitHub release..."
    if curl -L -o "temp-arm64.zip" "https://github.com/$REPO/releases/download/v$VERSION/maiass-macos-arm64.zip" 2>/dev/null; then
        ARM64_SHA=$(shasum -a 256 "temp-arm64.zip" | cut -d' ' -f1)
        echo "⚠️  ARM64 (GitHub fallback) SHA256: ${ARM64_SHA:0:8}..."
        rm "temp-arm64.zip"
    else
        print_error "Failed to download ARM64 binary from both R2 and GitHub"
    fi
fi

# Download and hash Linux binary from R2
print_status "Downloading and hashing Linux binary from R2..."
if curl -L -o "temp-linux.tar.gz" "$R2_BASE_URL/maiass-linux-x64.tar.gz" 2>/dev/null; then
    LINUX_SHA=$(shasum -a 256 "temp-linux.tar.gz" | cut -d' ' -f1)
    echo "✅ Linux SHA256: ${LINUX_SHA:0:8}..."
    rm "temp-linux.tar.gz"
else
    print_error "Failed to download Linux binary from R2"
    print_status "Fallback: trying GitHub release..."
    if curl -L -o "temp-linux.tar.gz" "https://github.com/$REPO/releases/download/v$VERSION/maiass-linux-x64.tar.gz" 2>/dev/null; then
        LINUX_SHA=$(shasum -a 256 "temp-linux.tar.gz" | cut -d' ' -f1)
        echo "⚠️  Linux (GitHub fallback) SHA256: ${LINUX_SHA:0:8}..."
        rm "temp-linux.tar.gz"
    else
        print_error "Failed to download Linux binary from both R2 and GitHub"
    fi
fi

if [ -z "$INTEL_SHA" ] || [ -z "$ARM64_SHA" ] || [ -z "$LINUX_SHA" ]; then
    print_error "Could not calculate all required SHA256 hashes from GitHub release"
    print_status "Make sure GitHub release $VERSION exists with all binaries"
    exit 1
fi

print_status "Intel SHA256: $INTEL_SHA"
print_status "ARM64 SHA256: $ARM64_SHA"
print_status "Linux SHA256: $LINUX_SHA"

# Generate Homebrew formula with R2 URLs (preserves signatures)
print_status "Generating Homebrew formula with R2 URLs..."

cat > "$FORMULA_FILE" << EOF
class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/$REPO"
  url "https://github.com/$REPO/archive/refs/tags/v#{version}.tar.gz"
  version "$VERSION"

  license "GPL-3.0-only"
  on_macos do
    if Hardware::CPU.intel?
      url "https://releases.maiass.net/#{version}/maiass-macos-x64.zip"
      sha256 "$INTEL_SHA"
    else
      url "https://releases.maiass.net/#{version}/maiass-macos-arm64.zip"
      sha256 "$ARM64_SHA"
    end
  end

  on_linux do
    url "https://releases.maiass.net/#{version}/maiass-linux-x64.tar.gz"
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

print_success "Homebrew formula created: $FORMULA_FILE"
cp "$FORMULA_FILE" "../homebrew-maiass/$FORMULA_FILE"
# Create tap repository instructions
cat > "HOMEBREW_TAP_SETUP.md" << EOF
# Setting Up Homebrew Tap

## 1. Create Homebrew Tap Repository

Create a new GitHub repository named: \`homebrew-maiass\`

## 2. Repository Structure

\`\`\`
homebrew-maiass/
├── Formula/
│   └── maiass.rb
└── README.md
\`\`\`

## 3. Copy Formula

Copy the generated formula to your tap repository:

\`\`\`bash
cp Formula/maiass.rb /path/to/homebrew-maiass/Formula/
\`\`\`

## 4. Users Install With

\`\`\`bash
# Add your tap
brew tap $REPO

# Install maiass
brew install maiass

# Or install directly
brew install $REPO/maiass
\`\`\`

## 5. Updating Formula

When you release a new version:

1. Update version in package.json
2. Run ./scripts/create-release.sh
3. Run ./scripts/create-homebrew-formula.sh
4. Copy updated Formula/maiass.rb to homebrew-maiass repo
5. Commit and push

## 6. Formula Validation

Test your formula locally:

\`\`\`bash
brew install --build-from-source Formula/maiass.rb
brew test maiass
brew audit --strict maiass
\`\`\`
EOF

print_success "Setup instructions created: HOMEBREW_TAP_SETUP.md"

echo ""
print_success "🎉 Homebrew formula ready!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository: homebrew-maiass"
echo "2. Copy Formula/maiass.rb to the tap repository"
echo "3. Users can install with: brew install $REPO/maiass"
echo ""
echo "See HOMEBREW_TAP_SETUP.md for detailed instructions"
