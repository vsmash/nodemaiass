#!/bin/bash
# Development install/uninstall script for MAIASS testing
# This script helps with development and testing of the MAIASS tool

set -e  # Exit on any error

PACKAGE_NAME="maiass"
GLOBAL_BIN_PATH="/usr/local/bin/maiass"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if package is globally installed
is_globally_installed() {
    command -v "$PACKAGE_NAME" >/dev/null 2>&1
}

# Function to install globally
install_global() {
    print_status "Installing $PACKAGE_NAME globally..."
    
    if npm install -g .; then
        print_success "Global installation completed"
        
        # Verify installation
        if command -v "$PACKAGE_NAME" >/dev/null 2>&1; then
            print_success "Command '$PACKAGE_NAME' is available in PATH"
            "$PACKAGE_NAME" --version
        else
            print_warning "Command '$PACKAGE_NAME' not found in PATH, but npm install succeeded"
        fi
    else
        print_error "Global installation failed"
        return 1
    fi
}

# Function to uninstall globally
uninstall_global() {
    print_status "Uninstalling $PACKAGE_NAME globally..."
    
    if is_globally_installed; then
        if npm uninstall -g "$PACKAGE_NAME"; then
            print_success "Global uninstallation completed"
        else
            print_error "Global uninstallation failed"
            return 1
        fi
    else
        print_warning "Package '$PACKAGE_NAME' is not globally installed"
    fi
    
    # Clean up any remaining symlinks or binaries
    if [ -L "$GLOBAL_BIN_PATH" ] || [ -f "$GLOBAL_BIN_PATH" ]; then
        print_status "Removing binary from $GLOBAL_BIN_PATH"
        sudo rm -f "$GLOBAL_BIN_PATH" 2>/dev/null || rm -f "$GLOBAL_BIN_PATH" 2>/dev/null
    fi
}

# Function to check Node.js version compatibility
check_node_version() {
    local node_version=$(node --version 2>/dev/null | sed 's/v//')
    local required_major=18
    
    if [ -z "$node_version" ]; then
        print_error "Node.js not found"
        echo "  Install Node.js 18+ or use built binaries"
        return 1
    fi
    
    local major_version=$(echo $node_version | cut -d. -f1)
    
    if [ "$major_version" -lt "$required_major" ]; then
        print_warning "Node.js $node_version detected (requires 18+)"
        echo "  Current: Node.js $node_version"
        echo "  Required: Node.js 18+"
        echo "  Solutions:"
        echo "    1. Use built binaries (no Node.js required)"
        echo "    2. Upgrade Node.js: nvm install 18 && nvm use 18"
        return 1
    else
        print_success "Node.js $node_version (compatible)"
        return 0
    fi
}

# Function to show current installation status
show_status() {
    echo -e "\n${BLUE}📊 Current Installation Status${NC}"
    echo "================================"
    
    # Check Node.js version first
    echo -e "\n${BLUE}🟢 Node.js Compatibility${NC}"
    echo "========================"
    check_node_version
    
    # Check global npm installation
    if is_globally_installed; then
        print_success "NPM global installation: INSTALLED"
        npm list -g $PACKAGE_NAME 2>/dev/null | grep $PACKAGE_NAME
    else
        print_warning "NPM global installation: NOT INSTALLED"
    fi
    
    # Check command availability
    if command -v "$PACKAGE_NAME" >/dev/null 2>&1; then
        print_success "Command '$PACKAGE_NAME' available in PATH"
        echo "  Location: $(which "$PACKAGE_NAME")"
    else
        print_warning "Command '$PACKAGE_NAME' not available in PATH"
    fi
    
    # Check local files
    echo -e "\n${BLUE}📁 Local Files Status${NC}"
    echo "===================="
    
    # List of files that should exist
    files=("maiass.cjs" "maiass.mjs" "maiass.sh" "package.json")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file missing"
        fi
    done
    
    # Check built binaries
    if [ -d "build" ]; then
        echo -e "\n${BLUE}🔧 Built Binaries${NC}"
        echo "================"
        ls -lh build/ 2>/dev/null || print_warning "No built binaries found"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running installation tests..."
    
    if [ -f "test-install.sh" ]; then
        chmod +x test-install.sh
        ./test-install.sh
    else
        print_warning "test-install.sh not found, running basic tests..."
        
        # Basic test
        if command -v "$PACKAGE_NAME" >/dev/null 2>&1; then
            print_status "Running tests..."
            "$PACKAGE_NAME" --version
        fi
        
        # Local test
        if [ -f "nodemaiass.sh" ]; then
            print_status "Testing local wrapper..."
            ./nodemaiass.sh --version
        fi
    fi
}

# Function to clean everything
clean_all() {
    print_status "Performing complete cleanup..."
    
    uninstall_global
    
    # Clean npm cache
    print_status "Clearing npm cache..."
    npm cache clean --force 2>/dev/null || true
    
    # Remove node_modules and reinstall (for fresh state)
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules for fresh install..."
        rm -rf node_modules
        npm install
    fi
    
    print_success "Complete cleanup finished"
}

# Main script logic
case "$1" in
    "install"|"i")
        show_status
        echo ""
        install_global
        echo ""
        show_status
        ;;
    "uninstall"|"u")
        show_status
        echo ""
        uninstall_global
        echo ""
        show_status
        ;;
    "reinstall"|"r")
        print_status "Performing reinstall (uninstall + install)..."
        uninstall_global
        echo ""
        install_global
        echo ""
        show_status
        ;;
    "test"|"t")
        run_tests
        ;;
    "clean"|"c")
        clean_all
        ;;
    "status"|"s")
        show_status
        ;;
    *)
        echo -e "${BLUE}🔧 MAIASS Development Install/Test Script${NC}"
        echo "============================================="
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  install, i     Install package globally"
        echo "  uninstall, u   Uninstall package globally"
        echo "  reinstall, r   Uninstall then install (clean reinstall)"
        echo "  test, t        Run installation tests"
        echo "  clean, c       Complete cleanup (uninstall + clear cache + fresh deps)"
        echo "  status, s      Show current installation status"
        echo ""
        echo "Examples:"
        echo "  $0 install      # Install globally"
        echo "  $0 uninstall    # Remove global installation"
        echo "  $0 reinstall    # Clean reinstall for testing"
        echo "  $0 test         # Test current installation"
        echo "  $0 status       # Check what's currently installed"
        echo ""
        show_status
        ;;
esac
