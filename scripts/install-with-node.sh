#!/bin/bash
# MAIASS Smart Installer - Handles Node.js automatically
# This avoids binary distribution issues while ensuring Node.js compatibility

set -e

MAIASS_VERSION="5.3.18"
NODE_VERSION="20.17.0"  # LTS version
INSTALL_DIR="$HOME/.maiass"

echo "🚀 MAIASS Smart Installer v$MAIASS_VERSION"
echo "=========================================="

# Check if Node.js is available and compatible
check_node() {
    if command -v node >/dev/null 2>&1; then
        NODE_CURRENT=$(node --version | sed 's/v//')
        NODE_MAJOR=$(echo "$NODE_CURRENT" | cut -d. -f1)
        if [[ $NODE_MAJOR -ge 18 ]]; then
            echo "✅ Compatible Node.js found: v$NODE_CURRENT"
            return 0
        else
            echo "⚠️  Node.js v$NODE_CURRENT found, but v18+ required"
            return 1
        fi
    else
        echo "❌ Node.js not found"
        return 1
    fi
}

# Install Node.js using nodeenv (lightweight, user-local)
install_node() {
    echo "📦 Installing Node.js v$NODE_VERSION locally for MAIASS..."
    
    # Create MAIASS directory
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Download and extract Node.js
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ $(uname -m) == "arm64" ]]; then
            NODE_ARCH="darwin-arm64"
        else
            NODE_ARCH="darwin-x64"
        fi
    elif [[ "$OSTYPE" == "linux"* ]]; then
        if [[ $(uname -m) == "aarch64" ]]; then
            NODE_ARCH="linux-arm64"
        else
            NODE_ARCH="linux-x64"
        fi
    else
        echo "❌ Unsupported platform: $OSTYPE"
        exit 1
    fi
    
    NODE_URL="https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-$NODE_ARCH.tar.gz"
    echo "📥 Downloading Node.js from: $NODE_URL"
    
    curl -L "$NODE_URL" | tar -xz --strip-components=1
    
    echo "✅ Node.js v$NODE_VERSION installed to $INSTALL_DIR"
}

# Install MAIASS
install_maiass() {
    echo "📦 Installing MAIASS..."
    
    # Download MAIASS source
    cd "$INSTALL_DIR"
    curl -L "https://github.com/vsmash/maiass/archive/refs/tags/$MAIASS_VERSION.tar.gz" | tar -xz --strip-components=1
    
    # Use local Node.js if we installed it
    if [[ -f "$INSTALL_DIR/bin/node" ]]; then
        export PATH="$INSTALL_DIR/bin:$PATH"
    fi
    
    # Install dependencies and create executable
    npm install --production
    
    # Create wrapper script
    cat > "$INSTALL_DIR/maiass" << 'EOF'
#!/bin/bash
# MAIASS wrapper script
MAIASS_DIR="$HOME/.maiass"
if [[ -f "$MAIASS_DIR/bin/node" ]]; then
    export PATH="$MAIASS_DIR/bin:$PATH"
fi
exec node "$MAIASS_DIR/maiass.js" "$@"
EOF
    
    chmod +x "$INSTALL_DIR/maiass"
    
    echo "✅ MAIASS installed to $INSTALL_DIR"
}

# Add to PATH
setup_path() {
    echo "🔗 Setting up PATH..."
    
    # Add to shell profiles
    for profile in ~/.bashrc ~/.zshrc ~/.profile; do
        if [[ -f "$profile" ]]; then
            if ! grep -q "\.maiass" "$profile"; then
                echo 'export PATH="$HOME/.maiass:$PATH"' >> "$profile"
                echo "✅ Added to $profile"
            fi
        fi
    done
    
    # Create symlink for immediate use
    if [[ -w "/usr/local/bin" ]]; then
        ln -sf "$INSTALL_DIR/maiass" /usr/local/bin/maiass
        echo "✅ Created symlink in /usr/local/bin"
    elif [[ -w "$HOME/.local/bin" ]]; then
        mkdir -p "$HOME/.local/bin"
        ln -sf "$INSTALL_DIR/maiass" "$HOME/.local/bin/maiass"
        echo "✅ Created symlink in ~/.local/bin"
    fi
}

# Main installation process
main() {
    if ! check_node; then
        install_node
    fi
    
    install_maiass
    setup_path
    
    echo ""
    echo "🎉 MAIASS installation complete!"
    echo ""
    echo "📝 To use MAIASS immediately:"
    echo "   export PATH=\"$INSTALL_DIR:\$PATH\""
    echo "   maiass --version"
    echo ""
    echo "🔄 Or restart your terminal for permanent PATH changes"
    echo ""
    echo "📚 Documentation: https://github.com/vsmash/maiass"
}

main
