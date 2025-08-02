#!/bin/bash

# Apple Notarization Script for MAIASS
# Requires: Apple Developer Program membership ($99/year)
# Requires: App Store Connect API key

set -e

BINARY_PATH="$1"
if [ -z "$BINARY_PATH" ]; then
    echo "Usage: $0 <path-to-binary>"
    echo "Example: $0 dist/maiass-macos-x64"
    exit 1
fi

# Configuration - Set these environment variables
APPLE_TEAM_ID="${APPLE_TEAM_ID:-24GDW5WP27}"  # Your team ID
BUNDLE_ID="${BUNDLE_ID:-com.vsmash.maiass}"    # Your app bundle ID
NOTARIZATION_KEYCHAIN_PROFILE="${NOTARIZATION_KEYCHAIN_PROFILE:-maiass-notarization}"

echo "🔐 Step 1: Code signing binary..."
codesign --sign "Developer ID Application: Mark Pottie ($APPLE_TEAM_ID)" \
         --options runtime \
         --timestamp \
         --deep \
         --force \
         "$BINARY_PATH"

echo "✅ Code signing complete"

echo "📦 Step 2: Creating ZIP for notarization..."
NOTARIZATION_ZIP="${BINARY_PATH}-notarization.zip"
/usr/bin/ditto -c -k --keepParent "$BINARY_PATH" "$NOTARIZATION_ZIP"

echo "🚀 Step 3: Submitting to Apple for notarization..."
echo "This can take 1-60 minutes..."

# Submit for notarization
SUBMISSION_ID=$(xcrun notarytool submit "$NOTARIZATION_ZIP" \
                --keychain-profile "$NOTARIZATION_KEYCHAIN_PROFILE" \
                --wait \
                --output-format json | jq -r '.id')

if [ "$SUBMISSION_ID" = "null" ] || [ -z "$SUBMISSION_ID" ]; then
    echo "❌ Notarization submission failed"
    xcrun notarytool submit "$NOTARIZATION_ZIP" \
          --keychain-profile "$NOTARIZATION_KEYCHAIN_PROFILE" \
          --wait
    exit 1
fi

echo "✅ Notarization complete! Submission ID: $SUBMISSION_ID"

echo "🎫 Step 4: Stapling notarization ticket..."
xcrun stapler staple "$BINARY_PATH"

echo "🔍 Step 5: Verification..."
codesign --verify --verbose=2 "$BINARY_PATH"
xcrun stapler validate "$BINARY_PATH"
spctl --assess --type execute --verbose=2 "$BINARY_PATH"

echo "🎉 Binary is now notarized and ready for distribution!"
echo "The notarization ticket is embedded in the binary."
echo "It will work even when distributed through GitHub releases."

# Clean up
rm -f "$NOTARIZATION_ZIP"

echo ""
echo "📋 Next steps:"
echo "1. Create your release archive with this notarized binary"
echo "2. Upload to GitHub releases"
echo "3. The binary will pass Gatekeeper even after download"
