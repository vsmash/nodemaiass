#!/bin/bash
# Simple code signing for individual binaries
# Usage: ./scripts/codesign-single.sh path/to/binary

set -e

BINARY_PATH="$1"
DEVELOPER_ID="${MAIASS_DEVELOPER_ID:-"-"}"  # Default to ad-hoc signing

if [[ -z "$BINARY_PATH" ]]; then
    echo "Usage: $0 <binary_path>"
    exit 1
fi

if [[ ! -f "$BINARY_PATH" ]]; then
    echo "Error: Binary not found: $BINARY_PATH"
    exit 1
fi

# Check if it's a macOS binary
if ! file "$BINARY_PATH" | grep -q "Mach-O"; then
    echo "Skipping non-macOS binary: $(basename "$BINARY_PATH")"
    exit 0
fi

echo "🔐 Signing: $(basename "$BINARY_PATH")"
echo "Using Developer ID: $DEVELOPER_ID"

# Remove existing signatures
codesign --remove-signature "$BINARY_PATH" 2>/dev/null || true

# Sign the binary
if codesign --sign "$DEVELOPER_ID" --force --verbose "$BINARY_PATH"; then
    echo "✅ Successfully signed: $(basename "$BINARY_PATH")"
    
    # Verify the signature
    if codesign --verify --verbose "$BINARY_PATH" 2>/dev/null; then
        echo "✅ Signature verified"
    else
        echo "⚠️ Signature verification failed"
    fi
else
    echo "❌ Failed to sign binary"
    exit 1
fi
