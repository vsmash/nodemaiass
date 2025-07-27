#!/bin/bash
# Generate Homebrew formula with correct SHA256 hashes

set -e

# Configuration
REPO="vsmash/nodemaiass"
VERSION=$(node -p "require('./package.json').version")
FORMULA_DIR="Formula"
FORMULA_FILE="$FORMULA_DIR/maiassnode.rb"

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

echo "🍺 Creating Homebrew Formula for MAIASSNODE v$VERSION"
echo "=================================================="

# Ensure release directory exists and has binaries
if [ ! -d "release" ]; then
    print_error "Release directory not found. Run ./scripts/create-release.sh first"
    exit 1
fi

# Create Formula directory
mkdir -p "$FORMULA_DIR"

# Get SHA256 hashes from checksums.txt
if [ ! -f "release/checksums.txt" ]; then
    print_error "checksums.txt not found. Run ./scripts/create-release.sh first"
    exit 1
fi

print_status "Reading SHA256 hashes from checksums.txt..."

# Extract hashes (format: hash  filename)
INTEL_SHA=$(grep "maiassnode-macos-intel" release/checksums.txt | cut -d' ' -f1)
ARM64_SHA=$(grep "maiassnode-macos-arm64" release/checksums.txt | cut -d' ' -f1)
LINUX_SHA=$(grep "maiassnode-linux-x64" release/checksums.txt | cut -d' ' -f1)

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
class Maiassnode < Formula
  desc "AI-powered Git workflow automation tool"
  homepage "https://github.com/$REPO"
  version "$VERSION"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/$REPO/releases/download/v#{version}/maiassnode-macos-intel"
      sha256 "$INTEL_SHA"
    else
      url "https://github.com/$REPO/releases/download/v#{version}/maiassnode-macos-arm64"
      sha256 "$ARM64_SHA"
    end
  end

  on_linux do
    url "https://github.com/$REPO/releases/download/v#{version}/maiassnode-linux-x64"
    sha256 "$LINUX_SHA"
  end

  def install
    # The downloaded file is the binary itself
    bin.install Dir["maiassnode*"].first => "maiassnode"
  end

  test do
    system "#{bin}/maiassnode", "--version"
    system "#{bin}/maiassnode", "--help"
  end
end
EOF

print_success "Homebrew formula created: $FORMULA_FILE"

# Create tap repository instructions
cat > "HOMEBREW_TAP_SETUP.md" << EOF
# Setting Up Homebrew Tap

## 1. Create Homebrew Tap Repository

Create a new GitHub repository named: \`homebrew-maiass\`

## 2. Repository Structure

\`\`\`
homebrew-maiass/
├── Formula/
│   └── maiassnode.rb
└── README.md
\`\`\`

## 3. Copy Formula

Copy the generated formula to your tap repository:

\`\`\`bash
cp Formula/maiassnode.rb /path/to/homebrew-maiass/Formula/
\`\`\`

## 4. Users Install With

\`\`\`bash
# Add your tap
brew tap $REPO

# Install maiassnode
brew install maiassnode

# Or install directly
brew install $REPO/maiassnode
\`\`\`

## 5. Updating Formula

When you release a new version:

1. Update version in package.json
2. Run ./scripts/create-release.sh
3. Run ./scripts/create-homebrew-formula.sh
4. Copy updated Formula/maiassnode.rb to homebrew-maiass repo
5. Commit and push

## 6. Formula Validation

Test your formula locally:

\`\`\`bash
brew install --build-from-source Formula/maiassnode.rb
brew test maiassnode
brew audit --strict maiassnode
\`\`\`
EOF

print_success "Setup instructions created: HOMEBREW_TAP_SETUP.md"

echo ""
print_success "🎉 Homebrew formula ready!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository: homebrew-maiass"
echo "2. Copy Formula/maiassnode.rb to the tap repository"
echo "3. Users can install with: brew install $REPO/maiassnode"
echo ""
echo "See HOMEBREW_TAP_SETUP.md for detailed instructions"
