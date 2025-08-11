# Code Signing Setup for MAIASS

This document describes the complete code signing infrastructure for MAIASS binaries, ensuring they can be distributed without security warnings on macOS and Windows.

## Overview

MAIASS uses a comprehensive code signing approach:
- **macOS**: Both ad-hoc and Developer ID signing with Apple's `codesign`
- **Windows**: Digital signing with `osslsigncode` for cross-platform compatibility
- **Certificates**: Self-signed for testing, production certificates for distribution

## Quick Start

### Automated Signing (Production)
```bash
# Sign all binaries in one command
./scripts/codesign.sh maiass-macos-arm64 maiass-macos-x64
./scripts/codesign-windows.sh maiass-win-arm64.exe maiass-win-x64.exe
```

### Certificate Setup (One-time)
```bash
# Create self-signed certificate for testing
./scripts/create-selfsigned-cert.sh
```

## Certificate Management

### Current Certificates

1. **Testing Certificate**: `certs/maiass-selfsigned.pfx` (password-free)
   - Subject: CN=MAIASS Test Certificate
   - Valid for: 1 year from creation
   - Usage: Windows testing and development builds

2. **Production Certificates** (when Apple Developer renewed):
   - macOS: Apple Developer ID certificate
   - Windows: Code signing certificate from trusted CA

### Certificate Files Structure
```
certs/
├── maiass-selfsigned.pfx          # Password-free certificate
├── maiass-selfsigned-nopass.pfx   # Alternative name (same file)
└── [future production certs]
```

## macOS Code Signing

### Scripts
- `scripts/codesign.sh` - Main macOS signing script

### Signing Methods
1. **Ad-hoc Signing** (Testing):
   ```bash
   codesign --sign - --force --verbose=1 maiass-macos-arm64
   ```

2. **Developer ID Signing** (Distribution):
   ```bash
   codesign --sign "Developer ID Application: Your Name" --force --verbose=1 maiass-macos-arm64
   ```

### Verification
```bash
codesign --verify --verbose=1 maiass-macos-arm64
spctl --assess --verbose=1 maiass-macos-arm64
```

## Windows Code Signing

### Scripts
- `scripts/codesign-windows.sh` - Windows signing with osslsigncode
- `scripts/create-selfsigned-cert.sh` - Certificate creation

### Dependencies
```bash
# Install osslsigncode via Homebrew
brew install osslsigncode
```

### Signing Process
1. **With Self-signed Certificate**:
   ```bash
   osslsigncode sign -certs certs/maiass-selfsigned.pfx \
     -t http://timestamp.sectigo.com \
     -in maiass-win-x64.exe -out maiass-win-x64.exe
   ```

2. **Verification**:
   ```bash
   osslsigncode verify maiass-win-x64.exe
   ```

### Timestamp Servers
- Primary: `http://timestamp.sectigo.com`
- Backup: `http://timestamp.comodoca.com`

## Integration with Build Process

### Manual Integration
```bash
# In build.js after compilation
if (process.platform === 'darwin') {
  execSync('./scripts/codesign.sh maiass-macos-arm64 maiass-macos-x64');
}
execSync('./scripts/codesign-windows.sh maiass-win-arm64.exe maiass-win-x64.exe');
```

### Release Process
```bash
# In create-release.sh after building
echo "🔐 Code signing binaries..."
./scripts/codesign.sh maiass-macos-*
./scripts/codesign-windows.sh maiass-win-*.exe
```

## Production Certificate Setup

### Apple Developer ID (macOS)
1. Renew Apple Developer membership
2. Download Developer ID Application certificate
3. Install in Keychain Access
4. Update `codesign.sh` with certificate name:
   ```bash
   CERT_NAME="Developer ID Application: Your Name (TEAM_ID)"
   ```

### Windows Code Signing Certificate
1. Purchase from trusted CA (DigiCert, Sectigo, etc.)
2. Install certificate
3. Update `codesign-windows.sh`:
   ```bash
   CERT_PATH="/path/to/production-cert.pfx"
   ```

## Testing Signed Binaries

### macOS Testing
```bash
# Test signature
codesign --verify --verbose=1 maiass-macos-arm64

# Test Gatekeeper
spctl --assess --verbose=1 maiass-macos-arm64

# Run binary
./maiass-macos-arm64 --version
```

### Windows Testing
```bash
# Verify signature
osslsigncode verify maiass-win-x64.exe

# Test on Windows (in VM or Windows machine)
# - Should not show "Windows protected your PC" warning
# - Should show certificate details in Properties > Digital Signatures
```

## Troubleshooting

### Common Issues

1. **"No identity found" (macOS)**:
   - Check Keychain Access for Developer ID certificate
   - Use `security find-identity -v -p codesigning` to list certificates

2. **"osslsigncode: command not found"**:
   ```bash
   brew install osslsigncode
   ```

3. **Certificate password errors**:
   - Use password-free certificate: `certs/maiass-selfsigned.pfx`
   - Or export with password: `export CERT_PASSWORD="your_password"`

4. **Timestamp server timeout**:
   - Try alternative timestamp server
   - Sign without timestamp for testing (less secure)

### Debug Commands
```bash
# List macOS signing identities
security find-identity -v -p codesigning

# Verify certificate info
openssl pkcs12 -info -in certs/maiass-selfsigned.pfx -noout

# Check binary signatures
file maiass-macos-arm64
codesign -dv maiass-macos-arm64
```

## Security Considerations

### Certificate Security
- Never commit private keys to version control
- Use environment variables for certificate passwords
- Rotate certificates regularly
- Use different certificates for testing vs. production

### Best Practices
1. Sign all distributed binaries
2. Use timestamping for long-term validity
3. Test signed binaries on target platforms
4. Maintain certificate backup and recovery plan
5. Document certificate expiration dates

## Status and Next Steps

### Current Status
✅ Self-signed certificate created and working  
✅ macOS ad-hoc signing functional  
✅ Windows signing with osslsigncode working  
✅ Password-free certificate for automation  
✅ Integration scripts ready  

### Pending Tasks
🔄 Apple Developer ID renewal (in progress)  
⏳ Production Windows certificate acquisition  
📋 Automated build integration  
🧪 Cross-platform testing validation  

### Future Enhancements
- Automated certificate renewal monitoring
- CI/CD integration for signing
- Notarization for macOS (when Developer ID ready)
- Enhanced certificate validation in scripts
---

*Last updated: $(date)*  
*Certificate status: Self-signed testing certificates active*  
*Production certificates: Pending Apple Developer renewal*
