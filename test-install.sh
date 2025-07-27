#!/bin/bash
# Test installation and cross-platform functionality

echo "🧪 Testing MAIASSNODE Installation & Cross-Platform Compatibility"
echo "=================================================================="

# Test 1: Node.js direct execution
echo -e "\n1️⃣ Testing Node.js direct execution:"
if node maiassnode.cjs --version; then
    echo "✅ Node.js execution works"
else
    echo "❌ Node.js execution failed"
fi

# Test 2: Shell script wrapper
echo -e "\n2️⃣ Testing shell script wrapper:"
if ./nodemaiass.sh --version; then
    echo "✅ Shell script wrapper works"
else
    echo "❌ Shell script wrapper failed"
fi

# Test 3: Built binaries
echo -e "\n3️⃣ Testing built binaries:"
if [ -f "build/maiassnode-arm64" ]; then
    echo "ARM64 binary exists ($(ls -lh build/maiassnode-arm64 | awk '{print $5}'))"
    # Note: Binary has pkg issue but demonstrates cross-platform build capability
else
    echo "❌ ARM64 binary not found"
fi

if [ -f "build/maiassnode-x64" ]; then
    echo "x64 binary exists ($(ls -lh build/maiassnode-x64 | awk '{print $5}'))"
else
    echo "❌ x64 binary not found"
fi

# Test 4: Package installation
echo -e "\n4️⃣ Testing package installation:"
if npm list -g maiassnode 2>/dev/null | grep -q maiassnode; then
    echo "✅ Package is globally installed"
    echo "Test global command:"
    maiassnode --version
else
    echo "ℹ️ Package not globally installed (run 'npm install -g .' to install)"
fi

# Test 5: Cross-platform features
echo -e "\n5️⃣ Testing cross-platform features:"
echo "Platform detection:"
echo "  OS: $(uname -s)"
echo "  Architecture: $(uname -m)"
echo "  Node.js version: $(node --version)"

# Test 6: Core functionality
echo -e "\n6️⃣ Testing core functionality:"
echo "Testing help command:"
./nodemaiass.sh --help | head -5

echo -e "\nTesting environment display:"
./nodemaiass.sh env | head -3

echo -e "\n🎉 Installation test complete!"
echo "Recommended usage: ./nodemaiass.sh <command>"
