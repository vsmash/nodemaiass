#!/bin/bash

# MAIASS Advanced Build System
# Handles Node.js bundling for independent distribution

set -e

# Configuration
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
PLATFORMS=("macos-x64" "macos-arm64" "linux-x64" "linux-arm64" "windows-x64" "windows-arm64")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MAIASS Advanced Build System v${VERSION}${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Function to build with PKG (current method)
build_with_pkg() {
    echo -e "
${YELLOW}📦 Building with PKG (Node.js bundling)...${NC}"
    
    # Ensure standalone version exists
    if [ ! -f "maiass-standalone.cjs" ]; then
        echo -e "${RED}❌ maiass-standalone.cjs not found.${NC}"
        exit 1
    fi
    
    # Build for all platforms using the standalone version directly
    npx pkg maiass-standalone.cjs --targets node18-macos-x64,node18-macos-arm64,node18-linux-x64,node18-linux-arm64,node18-win-x64,node18-win-arm64 --out-path "$BUILD_DIR/pkg"
    
    # Rename files to match expected format
    cd "$BUILD_DIR/pkg"
    for file in maiass-standalone-*; do
        platform=$(echo "$file" | sed 's/maiass-standalone-//')
        case "$platform" in
            "macos-x64") mv "$file" "maiass-macos-x64" ;;
            "macos-arm64") mv "$file" "maiass-macos-arm64" ;;
            "linux-x64") mv "$file" "maiass-linux-x64" ;;
            "linux-arm64") mv "$file" "maiass-linux-arm64" ;;
            "win-x64.exe") mv "$file" "maiass-windows-x64.exe" ;;
            "win-arm64.exe") mv "$file" "maiass-windows-arm64.exe" ;;
        esac
    done
    cd ../..
    
    echo -e "${GREEN}✅ PKG build complete${NC}"
}

# Function to build with Nexe
build_with_nexe() {
    echo -e "\n${YELLOW}🔧 Building with Nexe (Alternative Node.js bundling)...${NC}"
    
    mkdir -p "$BUILD_DIR/nexe"
    
    # Build for each platform individually (macOS compatible)
    echo -e "Building for macos-x64..."
    npx nexe maiass-standalone.cjs --target "mac-x64-18.16.0" --output "$BUILD_DIR/nexe/maiass-macos-x64" --verbose
    
    echo -e "Building for macos-arm64..."
    npx nexe maiass-standalone.cjs --target "mac-arm64-18.16.0" --output "$BUILD_DIR/nexe/maiass-macos-arm64" --verbose
    
    echo -e "Building for linux-x64..."
    npx nexe maiass-standalone.cjs --target "linux-x64-18.16.0" --output "$BUILD_DIR/nexe/maiass-linux-x64" --verbose
    
    echo -e "Building for linux-arm64..."
    npx nexe maiass-standalone.cjs --target "linux-arm64-18.16.0" --output "$BUILD_DIR/nexe/maiass-linux-arm64" --verbose
    
    echo -e "Building for windows-x64..."
    npx nexe maiass-standalone.cjs --target "windows-x64-18.16.0" --output "$BUILD_DIR/nexe/maiass-windows-x64.exe" --verbose
    
    echo -e "Building for windows-arm64..."
    npx nexe maiass-standalone.cjs --target "windows-arm64-18.16.0" --output "$BUILD_DIR/nexe/maiass-windows-arm64.exe" --verbose
    npx nexe maiass.cjs --target "windows-arm64-18.16.0" --output "$BUILD_DIR/nexe/maiass-windows-arm64.exe" --verbose
    
    echo -e "${GREEN}✅ Nexe build complete${NC}"
}

# Function to build with Bun
build_with_bun() {
    echo -e "\n${YELLOW}🥖 Building with Bun (Modern, fastest)...${NC}"
    
    # Add bun to PATH
    export PATH="$HOME/.bun/bin:$PATH"
    
    mkdir -p "$BUILD_DIR/bun"
    
    # Convert to Bun-compatible format if needed
    if [ -f "maiass-standalone.cjs" ]; then
        echo -e "Using standalone version for Bun..."
        INPUT_FILE="maiass-standalone.cjs"
    elif [ -f "maiass.mjs" ]; then
        echo -e "Using ESM version for Bun..."
        INPUT_FILE="maiass.mjs"
    elif [ -f "maiass.cjs" ]; then
        echo -e "Using CommonJS version for Bun..."
        INPUT_FILE="maiass.cjs"
    else
        echo -e "${RED}❌ No compatible input file found${NC}"
        exit 1
    fi
    
    # Build for each platform individually (macOS compatible)
    echo -e "Building for macos-x64..."
    bun build "$INPUT_FILE" --compile --target="bun-darwin-x64" --outfile="$BUILD_DIR/bun/maiass-macos-x64"
    
    echo -e "Building for macos-arm64..."
    bun build "$INPUT_FILE" --compile --target="bun-darwin-aarch64" --outfile="$BUILD_DIR/bun/maiass-macos-arm64"
    
    echo -e "Building for linux-x64..."
    bun build "$INPUT_FILE" --compile --target="bun-linux-x64" --outfile="$BUILD_DIR/bun/maiass-linux-x64"
    
    echo -e "Building for linux-arm64..."
    bun build "$INPUT_FILE" --compile --target="bun-linux-aarch64" --outfile="$BUILD_DIR/bun/maiass-linux-arm64"
    
    echo -e "Building for windows-x64..."
    bun build "$INPUT_FILE" --compile --target="bun-windows-x64" --outfile="$BUILD_DIR/bun/maiass-windows-x64.exe"
    
    echo -e "${GREEN}✅ Bun build complete${NC}"
}

# Function to create source distribution (fallback)
build_source_distribution() {
    echo -e "\n${YELLOW}📝 Creating source distribution...${NC}"
    
    mkdir -p "$BUILD_DIR/source"
    
    # Create a Node.js wrapper script
    cat > "$BUILD_DIR/source/maiass" << 'EOF'
#!/usr/bin/env node

// MAIASS Source Distribution
// This version requires Node.js 18+ to be installed on the system

const fs = require('fs');
const path = require('path');

// Check Node.js version
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);

if (major < 18) {
    console.error('❌ MAIASS requires Node.js 18 or later. Current version:', nodeVersion);
    console.error('Please update Node.js: https://nodejs.org/');
    process.exit(1);
}

// Load the main script
const scriptPath = path.join(__dirname, 'maiass.cjs');
if (!fs.existsSync(scriptPath)) {
    console.error('❌ MAIASS script not found:', scriptPath);
    process.exit(1);
}

require(scriptPath);
EOF
    
    # Copy the main script and dependencies
    cp maiass.cjs "$BUILD_DIR/source/"
    cp package.json "$BUILD_DIR/source/"
    cp -r lib/ "$BUILD_DIR/source/" 2>/dev/null || true
    cp -r node_modules/ "$BUILD_DIR/source/" 2>/dev/null || true
    
    chmod +x "$BUILD_DIR/source/maiass"
    
    echo -e "${GREEN}✅ Source distribution created${NC}"
}

# Function to show size comparison
show_build_sizes() {
    echo -e "\n${BLUE}📊 Build Size Comparison${NC}"
    echo -e "${BLUE}═══════════════════════${NC}"
    
    for method in pkg nexe bun source; do
        if [ -d "$BUILD_DIR/$method" ]; then
            size=$(du -sh "$BUILD_DIR/$method" | cut -f1)
            echo -e "  $method: $size"
        fi
    done
}

# Function to test builds
test_builds() {
    echo -e "\n${BLUE}🧪 Testing builds...${NC}"
    
    for method in pkg nexe bun; do
        if [ -d "$BUILD_DIR/$method" ]; then
            echo -e "\n Testing $method builds:"
            for file in "$BUILD_DIR/$method"/maiass-*; do
                if [ -f "$file" ] && [[ "$file" != *".exe" ]]; then
                    echo -e "  Testing $(basename "$file")..."
                    if "$file" --version &>/dev/null; then
                        echo -e "    ${GREEN}✅ Working${NC}"
                    else
                        echo -e "    ${RED}❌ Failed${NC}"
                    fi
                fi
            done
        fi
    done
}

# Main execution
case "${1:-all}" in
    "pkg")
        build_with_pkg
        ;;
    "nexe")
        build_with_nexe
        ;;
    "bun")
        build_with_bun
        ;;
    "source")
        build_source_distribution
        ;;
    "all")
        build_with_pkg
        build_with_nexe
        build_with_bun
        build_source_distribution
        show_build_sizes
        test_builds
        ;;
    *)
        echo -e "${RED}Usage: $0 [pkg|nexe|bun|source|all]${NC}"
        echo -e "  pkg    - Build with PKG (current method)"
        echo -e "  nexe   - Build with Nexe (alternative)"
        echo -e "  bun    - Build with Bun (modern, fastest)"
        echo -e "  source - Create source distribution"
        echo -e "  all    - Build with all methods"
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎉 Build complete! Check the '$BUILD_DIR' directory.${NC}"
echo -e "\n${BLUE}💡 Recommendation:${NC}"
echo -e "  • ${GREEN}Bun${NC}: Fastest, smallest, most modern"
echo -e "  • ${YELLOW}PKG${NC}: Most compatible, tested"
echo -e "  • ${BLUE}Nexe${NC}: Alternative if PKG has issues"
echo -e "  • ${WHITE}Source${NC}: Fallback for maximum compatibility"
