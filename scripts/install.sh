#!/bin/bash
# MAIASS Installer Script
# Downloads and installs the appropriate binary for the current platform

set -e

# Configuration
REPO="vsmash/maiass"
INSTALL_DIR="/usr/local/bin"
BINARY_NAME="maiass"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Detect platform and architecture
detect_platform() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    
    case $os in
        darwin)
            os="macos"
            ;;
        linux)
            os="linux"
            ;;
        mingw*|cygwin*|msys*)
            os="windows"
            ;;
        *)
            print_error "Unsupported operating system: $os"
            exit 1
            ;;
    esac
    
    case $arch in
        x86_64|amd64)
            arch="x64"
            ;;
        arm64|aarch64)
            arch="arm64"
            ;;
        *)
            print_error "Unsupported architecture: $arch"
            exit 1
            ;;
    esac
    
    echo "${os}-${arch}"
}

# Get latest release version from GitHub
get_latest_version() {
    local version
    version=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
    
    if [ -z "$version" ]; then
        print_error "Could not fetch latest version from GitHub"
        exit 1
    fi
    
    echo "$version"
}

# Download and install binary
install_binary() {
    local platform=$1
    local version=$2
    local binary_name="maiass-${platform}"
    
    if [ "$platform" = "windows-x64" ] || [ "$platform" = "windows-arm64" ]; then
        binary_name="${binary_name}.exe"
    fi
    
    local download_url="https://github.com/$REPO/releases/download/$version/$binary_name"
    local temp_file="/tmp/$binary_name"
    
    print_status "Downloading $binary_name..."
    if ! curl -L "$download_url" -o "$temp_file"; then
        print_error "Failed to download binary from $download_url"
        exit 1
    fi
    
    # Make executable
    chmod +x "$temp_file"
    
    # Test the binary
    print_status "Testing downloaded binary..."
    if ! "$temp_file" --version >/dev/null 2>&1; then
        print_warning "Binary test failed, but continuing with installation"
    fi
    
    # Install to system
    local install_path="$INSTALL_DIR/$BINARY_NAME"
    
    print_status "Installing to $install_path..."
    if [ -w "$INSTALL_DIR" ]; then
        mv "$temp_file" "$install_path"
    else
        print_status "Requesting sudo permissions for installation..."
        sudo mv "$temp_file" "$install_path"
    fi
    
    print_success "MAIASS installed successfully!"
    print_status "Testing installation..."
    
    if command -v maiass >/dev/null 2>&1; then
        maiass --version
        print_success "Installation verified!"
    else
        print_warning "Binary installed but not in PATH. You may need to restart your terminal."
        print_status "Or run: export PATH=\"$INSTALL_DIR:\$PATH\""
    fi
}

# Main installation process
main() {
    echo "🔧 MAIASS Universal Installer"
    echo "================================="
    
    # Detect platform
    local platform
    platform=$(detect_platform)
    print_status "Detected platform: $platform"
    
    # Get latest version
    local version
    version=$(get_latest_version)
    print_status "Latest version: $version"
    
    # Check if already installed
    if command -v maiass >/dev/null 2>&1; then
        local current_version
        current_version=$(maiass --version 2>/dev/null | head -1 | awk '{print $2}' || echo "unknown")
        print_warning "MAIASS $current_version is already installed"
        
        echo "Continue with installation? [y/N]"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_status "Installation cancelled"
            exit 0
        fi
    fi
    
    # Install binary
    install_binary "$platform" "$version"
    
    echo ""
    print_success "🎉 Installation complete!"
    echo ""
    echo "Usage:"
    echo "  maiass --help      # Show help"
    echo "  maiass --version   # Show version"
    echo "  maiass commit      # Run commit workflow"
    echo "  maiass env         # Show environment"
    echo ""
    echo "Documentation: https://github.com/$REPO"
}

# Run installer
main "$@"
