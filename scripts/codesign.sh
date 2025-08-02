#!/bin/bash
# Code signing utility for MAIASS binaries
# This script signs macOS binaries for distribution

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
DEVELOPER_ID="${MAIASS_DEVELOPER_ID:-}"
BUILD_DIR="build"
SIGN_MACOS_ONLY="${MAIASS_SIGN_MACOS_ONLY:-true}"

echo "🔐 MAIASS Code Signing Utility"
echo "=============================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_warning "Code signing is only supported on macOS"
    print_status "Skipping code signing on $OSTYPE"
    exit 0
fi

# Function to auto-detect Developer ID
auto_detect_developer_id() {
    # Look for Developer ID Application certificates
    local developer_ids
    developer_ids=$(security find-identity -v -p codesigning 2>/dev/null | grep "Developer ID Application" | head -1)
    
    if [[ -n "$developer_ids" ]]; then
        # Extract the certificate name between quotes
        echo "$developer_ids" | sed 's/.*"\(.*\)".*/\1/'
    else
        echo ""
    fi
}

# Auto-detect or validate Developer ID
if [[ -z "$DEVELOPER_ID" ]]; then
    print_status "Auto-detecting Developer ID certificate..."
    AUTO_DETECTED_ID=$(auto_detect_developer_id)
    
    if [[ -n "$AUTO_DETECTED_ID" ]]; then
        DEVELOPER_ID="$AUTO_DETECTED_ID"
        print_status "Found Developer ID: $DEVELOPER_ID"
    else
        print_warning "No Developer ID certificate found"
        print_status "Falling back to ad-hoc signing for testing"
        DEVELOPER_ID="-"
    fi
elif [[ "$DEVELOPER_ID" == "Developer ID Application: Your Name (TEAM_ID)" ]]; then
    print_error "Developer ID placeholder not configured"
    echo ""
    echo "To set up code signing:"
    echo "1. Get a Developer ID from Apple Developer Program"
    echo "2. Install the certificate in Keychain"
    echo "3. Set environment variable:"
    echo "   export MAIASS_DEVELOPER_ID=\"Developer ID Application: Your Name (TEAM_ID)\""
    echo ""
    echo "For testing purposes, you can use ad-hoc signing:"
    echo "   export MAIASS_DEVELOPER_ID=\"-\""
    echo ""
    echo "To skip code signing:"
    echo "   export MAIASS_SKIP_CODESIGN=\"true\""
    exit 1
fi

# Check if code signing should be skipped
if [[ "$MAIASS_SKIP_CODESIGN" == "true" ]]; then
    print_warning "Code signing skipped (MAIASS_SKIP_CODESIGN=true)"
    exit 0
fi

# Check if build directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
    print_error "Build directory not found: $BUILD_DIR"
    print_status "Run 'npm run build:all' first"
    exit 1
fi

print_status "Using Developer ID: $DEVELOPER_ID"
print_status "Signing binaries in: $BUILD_DIR"

# Function to sign a binary
sign_binary() {
    local binary_path="$1"
    local binary_name=$(basename "$binary_path")
    
    print_status "Signing: $binary_name"
    
    # Check if binary exists
    if [[ ! -f "$binary_path" ]]; then
        print_warning "Binary not found: $binary_path"
        return 1
    fi
    
    # Check if it's a macOS binary
    if ! file "$binary_path" | grep -q "Mach-O"; then
        print_status "Skipping non-macOS binary: $binary_name"
        return 0
    fi
    
    # Remove existing signatures
    codesign --remove-signature "$binary_path" 2>/dev/null || true
    
    # Sign the binary
    if codesign --sign "$DEVELOPER_ID" --force --verbose "$binary_path"; then
        print_success "Signed: $binary_name"
        
        # Verify the signature
        if codesign --verify --verbose "$binary_path" 2>/dev/null; then
            print_success "Verified: $binary_name"
        else
            print_warning "Signature verification failed: $binary_name"
        fi
    else
        print_error "Failed to sign: $binary_name"
        return 1
    fi
}

# Sign all macOS binaries
signed_count=0
failed_count=0

for binary in "$BUILD_DIR"/maiass-macos-*; do
    if [[ -f "$binary" ]]; then
        if sign_binary "$binary"; then
            ((signed_count++))
        else
            ((failed_count++))
        fi
    fi
done

echo ""
print_status "Code signing summary:"
print_success "Signed: $signed_count binaries"
if [[ $failed_count -gt 0 ]]; then
    print_error "Failed: $failed_count binaries"
    exit 1
else
    print_success "All macOS binaries signed successfully!"
fi

echo ""
print_status "Next steps:"
echo "1. Test signed binaries locally"
echo "2. Upload to GitHub releases"
echo "3. Update Homebrew formula with new SHA256 hashes"
