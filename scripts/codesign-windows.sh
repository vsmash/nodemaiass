#!/bin/bash
# Windows code signing utility for MAIASS binaries
# Supports both self-signed and CA-issued certificates

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

echo "🔐 MAIASS Windows Code Signing Utility"
echo "======================================"

# Configuration
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEFAULT_CERT_PATH="$PROJECT_ROOT/certs/maiass-selfsigned.pfx"

CERT_PATH="${MAIASS_WIN_CERT_PATH:-}"
CERT_PASSWORD="${MAIASS_WIN_CERT_PASSWORD:-}"
CERT_THUMBPRINT="${MAIASS_WIN_CERT_THUMBPRINT:-}"
TIMESTAMP_URL="${MAIASS_WIN_TIMESTAMP_URL:-http://timestamp.sectigo.com}"
BUILD_DIR="build"

# Use default certificate if none specified and it exists
if [[ -z "$CERT_PATH" ]] && [[ -z "$CERT_THUMBPRINT" ]] && [[ -f "$DEFAULT_CERT_PATH" ]]; then
    CERT_PATH="$DEFAULT_CERT_PATH"
    print_status "Using default self-signed certificate: $CERT_PATH"
fi

# Check if we should skip Windows signing
if [[ "$MAIASS_SKIP_WIN_CODESIGN" == "true" ]]; then
    print_warning "Windows code signing skipped (MAIASS_SKIP_WIN_CODESIGN=true)"
    exit 0
fi

# Check if build directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
    print_error "Build directory not found: $BUILD_DIR"
    print_status "Run 'npm run build:all' first"
    exit 1
fi

# Function to check if signtool is available
check_signtool() {
    if command -v signtool.exe >/dev/null 2>&1; then
        return 0
    elif [[ -f "/c/Program Files (x86)/Windows Kits/10/bin/10.0.*/x64/signtool.exe" ]]; then
        return 0
    elif [[ -f "/c/Program Files/Microsoft SDKs/Windows/*/bin/signtool.exe" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to find signtool path
find_signtool() {
    if command -v signtool.exe >/dev/null 2>&1; then
        echo "signtool.exe"
    elif [[ -f "/c/Program Files (x86)/Windows Kits/10/bin/10.0.*/x64/signtool.exe" ]]; then
        find "/c/Program Files (x86)/Windows Kits/10/bin/" -name "signtool.exe" | head -1
    elif [[ -f "/c/Program Files/Microsoft SDKs/Windows/*/bin/signtool.exe" ]]; then
        find "/c/Program Files/Microsoft SDKs/Windows/" -name "signtool.exe" | head -1
    else
        echo ""
    fi
}

# Check platform and tools
if [[ "$OSTYPE" != "msys" ]] && [[ "$OSTYPE" != "win32" ]] && [[ "$OSTYPE" != "cygwin" ]]; then
    # Not on Windows - check if we can cross-sign
    if command -v osslsigncode >/dev/null 2>&1; then
        print_status "Using osslsigncode for cross-platform Windows signing"
        SIGNING_METHOD="osslsigncode"
    else
        print_warning "Windows code signing is only supported on Windows or with osslsigncode"
        print_status "Install osslsigncode: brew install osslsigncode (macOS) or apt install osslsigncode (Linux)"
        print_status "Or run this script on Windows with Windows SDK installed"
        exit 0
    fi
else
    # On Windows - check for signtool
    if check_signtool; then
        SIGNTOOL_PATH=$(find_signtool)
        print_status "Using Windows SDK signtool: $SIGNTOOL_PATH"
        SIGNING_METHOD="signtool"
    else
        print_error "Windows SDK not found"
        print_status "Install Windows SDK from: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/"
        exit 1
    fi
fi

# Check certificate configuration
if [[ -z "$CERT_PATH" ]] && [[ -z "$CERT_THUMBPRINT" ]]; then
    print_error "Windows certificate not configured"
    echo ""
    echo "To set up Windows code signing:"
    echo ""
    echo "Option 1: Use .pfx/.p12 certificate file:"
    echo "  export MAIASS_WIN_CERT_PATH=\"/path/to/certificate.pfx\""
    echo "  export MAIASS_WIN_CERT_PASSWORD=\"your_password\""
    echo ""
    echo "Option 2: Use certificate from Windows store (Windows only):"
    echo "  export MAIASS_WIN_CERT_THUMBPRINT=\"certificate_thumbprint\""
    echo ""
    echo "Option 3: Create self-signed certificate for testing:"
    echo "  ./scripts/create-selfsigned-cert.sh"
    echo ""
    echo "To skip Windows code signing:"
    echo "  export MAIASS_SKIP_WIN_CODESIGN=\"true\""
    exit 1
fi

print_status "Windows signing method: $SIGNING_METHOD"
if [[ -n "$CERT_PATH" ]]; then
    print_status "Using certificate file: $CERT_PATH"
elif [[ -n "$CERT_THUMBPRINT" ]]; then
    print_status "Using certificate thumbprint: $CERT_THUMBPRINT"
fi

# Function to sign a Windows binary with signtool
sign_with_signtool() {
    local binary_path="$1"
    local binary_name=$(basename "$binary_path")
    
    print_status "Signing with signtool: $binary_name"
    
    local sign_cmd=""
    if [[ -n "$CERT_PATH" ]]; then
        # Sign with .pfx file
        sign_cmd="\"$SIGNTOOL_PATH\" sign /f \"$CERT_PATH\""
        if [[ -n "$CERT_PASSWORD" ]]; then
            sign_cmd="$sign_cmd /p \"$CERT_PASSWORD\""
        fi
        sign_cmd="$sign_cmd /t \"$TIMESTAMP_URL\" /v \"$binary_path\""
    elif [[ -n "$CERT_THUMBPRINT" ]]; then
        # Sign with certificate from store
        sign_cmd="\"$SIGNTOOL_PATH\" sign /sha1 \"$CERT_THUMBPRINT\" /t \"$TIMESTAMP_URL\" /v \"$binary_path\""
    fi
    
    if eval "$sign_cmd"; then
        print_success "Signed: $binary_name"
        return 0
    else
        print_error "Failed to sign: $binary_name"
        return 1
    fi
}

# Function to sign a Windows binary with osslsigncode
sign_with_osslsigncode() {
    local binary_path="$1"
    local binary_name
    binary_name=$(basename "$binary_path")
    
    print_status "Signing with osslsigncode: $binary_name"
    
    if [[ -z "$CERT_PATH" ]]; then
        print_error "Certificate file required for osslsigncode"
        return 1
    fi
    
    local sign_cmd="osslsigncode sign -pkcs12 \"$CERT_PATH\""
    if [[ -n "$CERT_PASSWORD" ]]; then
        sign_cmd="$sign_cmd -pass \"$CERT_PASSWORD\""
    fi
    sign_cmd="$sign_cmd -t \"$TIMESTAMP_URL\" -in \"$binary_path\" -out \"${binary_path}.signed\""
    
    if eval "$sign_cmd"; then
        mv "${binary_path}.signed" "$binary_path"
        print_success "Signed: $binary_name"
        return 0
    else
        print_error "Failed to sign: $binary_name"
        return 1
    fi
}

# Function to sign a binary
sign_binary() {
    local binary_path="$1"
    local binary_name
    binary_name=$(basename "$binary_path")
    
    # Check if binary exists
    if [[ ! -f "$binary_path" ]]; then
        print_warning "Binary not found: $binary_path"
        return 1
    fi
    
    # Check if it's a Windows binary
    if ! file "$binary_path" | grep -q -E "(PE32|MS-DOS|Windows)"; then
        print_status "Skipping non-Windows binary: $binary_name"
        return 0
    fi
    
    # Sign based on method
    if [[ "$SIGNING_METHOD" == "signtool" ]]; then
        sign_with_signtool "$binary_path"
    elif [[ "$SIGNING_METHOD" == "osslsigncode" ]]; then
        sign_with_osslsigncode "$binary_path"
    else
        print_error "Unknown signing method: $SIGNING_METHOD"
        return 1
    fi
}

# Sign all Windows binaries
signed_count=0
failed_count=0

for binary in "$BUILD_DIR"/maiass-win-*.exe; do
    if [[ -f "$binary" ]]; then
        if sign_binary "$binary"; then
            ((signed_count++))
        else
            ((failed_count++))
        fi
    fi
done

echo ""
print_status "Windows code signing summary:"
print_success "Signed: $signed_count binaries"
if [[ $failed_count -gt 0 ]]; then
    print_error "Failed: $failed_count binaries"
    exit 1
else
    if [[ $signed_count -gt 0 ]]; then
        print_success "All Windows binaries signed successfully!"
    else
        print_warning "No Windows binaries found to sign"
    fi
fi

echo ""
print_status "Next steps:"
echo "1. Test signed binaries on Windows"
echo "2. Upload to GitHub releases"
echo "3. Users will no longer see 'Windows protected your PC' warnings"
