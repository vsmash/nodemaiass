#!/bin/bash
# Deploy MAIASS release binaries to Cloudflare R2
# This preserves code signatures by serving directly from R2

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

echo "☁️  MAIASS R2 Deployment"
echo "======================="

# Configuration
VERSION=$(node -p "require('./package.json').version")
R2_BASE_URL="https://releases.maiass.dev"
RELEASE_DIR="release-automated"

print_status "Deploying MAIASS v$VERSION to R2..."

# Check if release directory exists
if [[ ! -d "$RELEASE_DIR" ]]; then
    print_error "Release directory not found: $RELEASE_DIR"
    print_status "Run './scripts/release-and-deploy.sh' first to create release archives"
    exit 1
fi

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found"
    print_status "Install with: npm install -g wrangler"
    exit 1
fi

cd "$RELEASE_DIR"

# Upload all release files to R2 with version prefix
print_status "Uploading signed archives to R2..."

# Create version directory structure in R2: /v5.3.9/
VERSION_PREFIX="v$VERSION"

# Upload each file with proper content types
upload_file() {
    local file="$1"
    local content_type="application/octet-stream"
    
    # Determine content type based on file extension
    if [[ "$file" == *.zip ]]; then
        content_type="application/zip"
    elif [[ "$file" == *.tar.gz ]]; then
        content_type="application/gzip"
    elif [[ "$file" == *.txt ]]; then
        content_type="text/plain"
    elif [[ "$file" == *.json ]]; then
        content_type="application/json"
    fi
    
    local r2_path="$VERSION_PREFIX/$file"
    
    print_status "Uploading $file..."
    wrangler r2 object put "maiass-releases/$r2_path" \
        --file "$file" \
        --content-type "$content_type" \
        --cache-control "public, max-age=31536000" \
        --remote
    
    if [[ $? -eq 0 ]]; then
        print_success "✓ $file → $R2_BASE_URL/$r2_path"
    else
        print_error "✗ Failed to upload $file"
        return 1
    fi
}

# Upload all archives and checksums
for file in *.zip *.tar.gz checksums.txt; do
    if [[ -f "$file" ]]; then
        upload_file "$file"
    fi
done

# Create a latest.json manifest for automated downloads
print_status "Creating download manifest..."
cat > "latest.json" << EOF
{
  "version": "$VERSION",
  "released": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "downloads": {
    "macos": {
      "x64": "$R2_BASE_URL/$VERSION_PREFIX/maiass-macos-x64.zip",
      "arm64": "$R2_BASE_URL/$VERSION_PREFIX/maiass-macos-arm64.zip"
    },
    "linux": {
      "x64": "$R2_BASE_URL/$VERSION_PREFIX/maiass-linux-x64.tar.gz",
      "arm64": "$R2_BASE_URL/$VERSION_PREFIX/maiass-linux-arm64.tar.gz"
    },
    "windows": {
      "x64": "$R2_BASE_URL/$VERSION_PREFIX/maiass-windows-x64.zip",
      "arm64": "$R2_BASE_URL/$VERSION_PREFIX/maiass-windows-arm64.zip"
    },
    "checksums": "$R2_BASE_URL/$VERSION_PREFIX/checksums.txt"
  },
  "install": {
    "homebrew": "brew install vsmash/maiass/maiass",
    "direct": "Download and extract the appropriate archive for your platform"
  }
}
EOF

upload_file "latest.json"

# Also upload to root level for easy access
wrangler r2 object put "maiass-releases/latest.json" \
    --file "latest.json" \
    --content-type "application/json" \
    --cache-control "public, max-age=300" \
    --remote

print_success "✓ latest.json → $R2_BASE_URL/latest.json"

cd ..

print_success "🎉 R2 deployment complete!"
echo ""
echo "📦 Download URLs (preserves code signatures):"
echo "   macOS Intel:  $R2_BASE_URL/$VERSION_PREFIX/maiass-macos-x64.zip"
echo "   macOS Apple:   $R2_BASE_URL/$VERSION_PREFIX/maiass-macos-arm64.zip"
echo "   Linux x64:     $R2_BASE_URL/$VERSION_PREFIX/maiass-linux-x64.tar.gz"
echo "   Linux ARM64:   $R2_BASE_URL/$VERSION_PREFIX/maiass-linux-arm64.tar.gz"
echo "   Windows x64:   $R2_BASE_URL/$VERSION_PREFIX/maiass-windows-x64.zip"
echo "   Windows ARM64: $R2_BASE_URL/$VERSION_PREFIX/maiass-windows-arm64.zip"
echo ""
echo "🔍 Checksums:     $R2_BASE_URL/$VERSION_PREFIX/checksums.txt"
echo "📋 Manifest:      $R2_BASE_URL/latest.json"
echo ""
echo "💡 These URLs serve the actual signed binaries and preserve code signatures!"
