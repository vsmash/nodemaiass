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

# Check if GitHub release exists
print_status "Verifying GitHub release $VERSION exists..."
if ! curl -s "https://api.github.com/repos/$REPO/releases/tags/$VERSION" | grep -q "tag_name"; then
    print_error "GitHub release $VERSION not found. Create the release first."
    print_status "Run: ./scripts/create-release.sh"
    exit 1
fi

# Create Formula directory
mkdir -p "$FORMULA_DIR"

print_status "Reading SHA256 hashes from actual GitHub release..."

# Download and calculate SHA256 from actual GitHub release files
INTEL_SHA=""
ARM64_SHA=""
LINUX_SHA=""

# Download and hash Intel binary
print_status "Downloading and hashing Intel binary..."
if curl -L -o "temp-intel" "https://github.com/$REPO/releases/download/$VERSION/maiass-macos-intel" 2>/dev/null; then
    INTEL_SHA=$(shasum -a 256 "temp-intel" | cut -d' ' -f1)
    echo "✅ Intel SHA256: ${INTEL_SHA:0:8}..."
    rm "temp-intel"
else
    print_error "Failed to download Intel binary from GitHub release"
fi

# Download and hash ARM64 binary
print_status "Downloading and hashing ARM64 binary..."
if curl -L -o "temp-arm64" "https://github.com/$REPO/releases/download/$VERSION/maiass-macos-arm64" 2>/dev/null; then
    ARM64_SHA=$(shasum -a 256 "temp-arm64" | cut -d' ' -f1)
    echo "✅ ARM64 SHA256: ${ARM64_SHA:0:8}..."
    rm "temp-arm64"
else
    print_error "Failed to download ARM64 binary from GitHub release"
fi

# Download and hash Linux binary
print_status "Downloading and hashing Linux binary..."
if curl -L -o "temp-linux" "https://github.com/$REPO/releases/download/$VERSION/maiass-linux-x64" 2>/dev/null; then
    LINUX_SHA=$(shasum -a 256 "temp-linux" | cut -d' ' -f1)
    echo "✅ Linux SHA256: ${LINUX_SHA:0:8}..."
    rm "temp-linux"
else
    print_error "Failed to download Linux binary from GitHub release"
fi

if [ -z "$INTEL_SHA" ] || [ -z "$ARM64_SHA" ] || [ -z "$LINUX_SHA" ]; then
    print_error "Could not extract all required SHA256 hashes"
    print_status "Available checksums:"
    cat release/checksums.txt
    exit 1
fi

print_status "Intel SHA256: $INTEL_SHA"
print_status "ARM64 SHA256: $ARM64_SHA"
print_status "Linux SHA256: $LINUX_SHA"

# Generate Homebrew formula
print_status "Generating Homebrew formula..."

cat > "$FORMULA_FILE" << EOF
class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/$REPO"
  url "https://github.com/$REPO/archive/refs/tags/#{version}.tar.gz"
  version "$VERSION"

  license "GPL-3.0-only"
  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/$REPO/releases/download/#{version}/maiass-macos-intel"
      sha256 "$INTEL_SHA"
    else
      url "https://github.com/$REPO/releases/download/#{version}/maiass-macos-arm64"
      sha256 "$ARM64_SHA"
    end
  end

  on_linux do
    url "https://github.com/$REPO/releases/download/#{version}/maiass-linux-x64"
    sha256 "$LINUX_SHA"
  end

  def install
    bin.install Dir["maiass-*"].first => "maiass"
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
