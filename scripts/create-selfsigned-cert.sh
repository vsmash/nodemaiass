#!/bin/bash
# Create self-signed certificate for Windows code signing (testing only)

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

echo "🔐 Create Self-Signed Windows Certificate"
echo "========================================"

CERT_DIR="certs"
CERT_NAME="maiass-selfsigned"
CERT_FILE="$CERT_DIR/$CERT_NAME.pfx"
KEY_FILE="$CERT_DIR/$CERT_NAME.key"
CRT_FILE="$CERT_DIR/$CERT_NAME.crt"
PASSWORD="maiass123"  # Default password for testing

# Check if OpenSSL is available
if ! command -v openssl >/dev/null 2>&1; then
    print_error "OpenSSL not found"
    print_status "Install OpenSSL:"
    print_status "  macOS: brew install openssl"
    print_status "  Ubuntu: apt install openssl"
    print_status "  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

# Create certs directory
mkdir -p "$CERT_DIR"

print_warning "This creates a self-signed certificate for TESTING only!"
print_warning "Windows will still show security warnings for self-signed certificates."
print_status "For production, get a certificate from a trusted CA (Sectigo, DigiCert, etc.)"

echo ""
read -p "Enter your name/organization [MAIASS Development]: " ORGANIZATION
ORGANIZATION=${ORGANIZATION:-"MAIASS Development"}

read -p "Enter certificate password [$PASSWORD]: " INPUT_PASSWORD
if [[ -n "$INPUT_PASSWORD" ]]; then
    PASSWORD="$INPUT_PASSWORD"
fi

print_status "Creating self-signed certificate..."
print_status "Organization: $ORGANIZATION"
print_status "Certificate will be saved to: $CERT_FILE"

# Create private key
print_status "Generating private key..."
openssl genrsa -out "$KEY_FILE" 2048

# Create certificate
print_status "Creating certificate..."
openssl req -new -x509 -key "$KEY_FILE" -out "$CRT_FILE" -days 365 \
    -subj "/CN=$ORGANIZATION/O=$ORGANIZATION/C=US" \
    -extensions v3_req \
    -config <(cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = $ORGANIZATION
O = $ORGANIZATION
C = US

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = codeSigning
EOF
)

# Create PFX file
print_status "Creating PFX certificate..."
openssl pkcs12 -export -out "$CERT_FILE" -inkey "$KEY_FILE" -in "$CRT_FILE" \
    -passout pass:"$PASSWORD"

# Clean up intermediate files
rm "$KEY_FILE" "$CRT_FILE"

print_success "Self-signed certificate created: $CERT_FILE"

echo ""
print_status "To use this certificate:"
echo "export MAIASS_WIN_CERT_PATH=\"$(pwd)/$CERT_FILE\""
echo "export MAIASS_WIN_CERT_PASSWORD=\"$PASSWORD\""

echo ""
print_status "Test Windows signing:"
echo "./scripts/codesign-windows.sh"

echo ""
print_warning "IMPORTANT:"
print_warning "1. This is a self-signed certificate - Windows will still show warnings"
print_warning "2. For production, buy a certificate from a trusted CA"
print_warning "3. Never commit certificates to git repositories"
print_warning "4. Keep certificate files secure"

# Create .gitignore entry for certs
if [[ -f ".gitignore" ]]; then
    if ! grep -q "certs/" .gitignore; then
        echo "" >> .gitignore
        echo "# Code signing certificates" >> .gitignore
        echo "certs/" >> .gitignore
        print_status "Added certs/ to .gitignore"
    fi
fi

echo ""
print_success "Certificate setup complete!"
echo ""
print_status "Quick test commands:"
echo "# Set environment variables"
echo "export MAIASS_WIN_CERT_PATH=\"$(pwd)/$CERT_FILE\""
echo "export MAIASS_WIN_CERT_PASSWORD=\"$PASSWORD\""
echo ""
echo "# Build and sign"
echo "npm run build:all"
echo "./scripts/codesign-windows.sh"
