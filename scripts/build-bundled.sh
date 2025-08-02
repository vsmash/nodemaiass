#!/bin/bash

# Enhanced Build Script for MAIASS with Node.js Bundling
# This replaces the simple pkg build with multiple bundling options

set -e

# Configuration
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Building MAIASS v${VERSION} with bundled Node.js${NC}"

# Clean and prepare
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Ensure we have a CommonJS version for bundling
if [ ! -f "maiass.cjs" ]; then
    echo -e "${YELLOW}⚡ Converting ES modules to CommonJS for bundling...${NC}"
    
    # Create a simple converter
    cat > convert-to-cjs.js << 'EOF'
const fs = require('fs');

// Read the ESM version
let content = fs.readFileSync('maiass.mjs', 'utf8');

// Convert ES module syntax to CommonJS
content = content
    .replace(/^import\s+(.+?)\s+from\s+['"](.+?)['"];?$/gm, 'const $1 = require(\'$2\');')
    .replace(/^export\s+default\s+(.+);?$/gm, 'module.exports = $1;')
    .replace(/^export\s+\{(.+?)\};?$/gm, 'module.exports = { $1 };')
    .replace(/^export\s+(.+);?$/gm, 'module.exports.$1;');

// Write the CommonJS version
fs.writeFileSync('maiass.cjs', content);
console.log('✅ Converted maiass.mjs to maiass.cjs');
EOF
    
    node convert-to-cjs.js
    rm convert-to-cjs.js
fi

# Choose build method (prioritize Bun if available, fallback to PKG)
BUILD_METHOD="pkg"

if command -v bun &> /dev/null; then
    echo -e "${GREEN}🥖 Using Bun for building (faster, better)${NC}"
    BUILD_METHOD="bun"
    export PATH="$HOME/.bun/bin:$PATH"
else
    echo -e "${YELLOW}📦 Using PKG for building (Bun not available)${NC}"
fi

# Build function for Bun
build_with_bun() {
    echo -e "Building with Bun..."
    
    # Use the standalone version for bundling
    INPUT_FILE="maiass-standalone.cjs"
    if [ ! -f "$INPUT_FILE" ]; then
        echo -e "${RED}❌ $INPUT_FILE not found${NC}"
        exit 1
    fi
    
    # Build for each platform individually
    echo -e "  Building for macos-x64..."
    bun build "$INPUT_FILE" --compile --target="bun-darwin-x64" --outfile="$BUILD_DIR/maiass-macos-x64"
    
    echo -e "  Building for macos-arm64..."
    bun build "$INPUT_FILE" --compile --target="bun-darwin-aarch64" --outfile="$BUILD_DIR/maiass-macos-arm64"
    
    echo -e "  Building for linux-x64..."
    bun build "$INPUT_FILE" --compile --target="bun-linux-x64" --outfile="$BUILD_DIR/maiass-linux-x64"
    
    echo -e "  Building for linux-arm64..."
    bun build "$INPUT_FILE" --compile --target="bun-linux-aarch64" --outfile="$BUILD_DIR/maiass-linux-arm64"
    
    echo -e "  Building for windows-x64..."
    bun build "$INPUT_FILE" --compile --target="bun-windows-x64" --outfile="$BUILD_DIR/maiass-windows-x64.exe"
}

# Build function for PKG
build_with_pkg() {
    echo -e "Building with PKG..."
    
    # Use the standalone version for PKG too
    INPUT_FILE="maiass-standalone.cjs"
    if [ ! -f "$INPUT_FILE" ]; then
        echo -e "${RED}❌ $INPUT_FILE not found${NC}"
        exit 1
    fi
    
    # Create a temporary package.json for PKG
    cat > pkg-temp.json << EOF
{
  "name": "maiass",
  "version": "$VERSION",
  "bin": "$INPUT_FILE",
  "pkg": {
    "targets": [
      "node18-macos-x64",
      "node18-macos-arm64",
      "node18-linux-x64",
      "node18-linux-arm64",
      "node18-win-x64",
      "node18-win-arm64"
    ],
    "outputPath": "$BUILD_DIR"
  }
}
EOF
    
    # Build all platforms
    npx pkg "$INPUT_FILE" \
        --targets node18-macos-x64,node18-macos-arm64,node18-linux-x64,node18-linux-arm64,node18-win-x64,node18-win-arm64 \
        --out-path "$BUILD_DIR" \
        --compress Brotli
    
    # Clean up
    rm -f pkg-temp.json
    
    # Rename files to expected format
    cd "$BUILD_DIR"
    for file in maiass-standalone-*; do
        case "$file" in
            "maiass-standalone-macos-x64") mv "$file" "maiass-macos-x64" ;;
            "maiass-standalone-macos-arm64") mv "$file" "maiass-macos-arm64" ;;
            "maiass-standalone-linux-x64") mv "$file" "maiass-linux-x64" ;;
            "maiass-standalone-linux-arm64") mv "$file" "maiass-linux-arm64" ;;
            "maiass-standalone-win-x64.exe") mv "$file" "maiass-windows-x64.exe" ;;
            "maiass-standalone-win-arm64.exe") mv "$file" "maiass-windows-arm64.exe" ;;
        esac
    done
    cd ..
}

# Execute build
if [ "$BUILD_METHOD" = "bun" ]; then
    build_with_bun
else
    build_with_pkg
fi

# Verify builds
echo -e "\n${BLUE}🔍 Verifying builds...${NC}"
for file in "$BUILD_DIR"/maiass-*; do
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo -e "  ✅ $(basename "$file"): $size"
        
        # Test execution (skip Windows on non-Windows)
        if [[ ! "$file" == *".exe" ]] && [[ -x "$file" ]]; then
            if "$file" --version &>/dev/null; then
                echo -e "    ${GREEN}✅ Executable test passed${NC}"
            else
                echo -e "    ${YELLOW}⚠️  Executable test failed (might need signing)${NC}"
            fi
        fi
    fi
done

echo -e "\n${GREEN}🎉 Build complete!${NC}"
echo -e "Built with: $BUILD_METHOD"
echo -e "Output directory: $BUILD_DIR/"

# Show next steps
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo -e "  1. Sign binaries: ./scripts/codesign.sh"
echo -e "  2. Create archives: ./scripts/create-archives.sh"
echo -e "  3. Upload to GitHub: ./scripts/release-and-deploy.sh"

# Integration with existing automation
if [ -f "scripts/codesign.sh" ]; then
    echo -e "\n${YELLOW}🔐 Code signing integration available${NC}"
    echo -e "Run: ./scripts/codesign.sh $BUILD_DIR/maiass-macos-*"
fi
