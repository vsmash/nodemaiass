class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/vsmash/maiass"
  version "5.3.6"

  # Architecture-specific URLs and checksums
  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-macos-x64.zip"
      sha256 "09a677ee3baf8a01ba970bf1b6b067c6e77c5d1b0c26b36d5c91b698cd9c1cb1"  # GitHub-verified SHA256
    else
      url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-macos-arm64.zip"  
      sha256 "901feb3554946daf16095fe67b8b55b60b86afb30bdc5d1f94068d74ba10d6cd"  # GitHub-verified SHA256
    end
  end

  on_linux do
    if Hardware::CPU.intel?
      url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-linux-x64.tar.gz"
      sha256 "placeholder_linux_x64_sha256"
    else
      url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-linux-arm64.tar.gz"
      sha256 "placeholder_linux_arm64_sha256"
    end
  end

  license "GPL-3.0-only"

  # Dependencies
  # None required - Node.js is bundled in the executable

  def install
    # Extract and install the bundled executable
    if OS.mac?
      if Hardware::CPU.intel?
        bin.install "maiass-macos-x64" => "maiass"
      else
        bin.install "maiass-macos-arm64" => "maiass"
      end
    elsif OS.linux?
      if Hardware::CPU.intel?
        bin.install "maiass-linux-x64" => "maiass"
      else
        bin.install "maiass-linux-arm64" => "maiass"
      end
    end
    
    # Create convenience symlinks
    bin.install_symlink "maiass" => "myass"
    bin.install_symlink "maiass" => "miass"
  end

  def caveats
    <<~EOS
      🎉 MAIASS has been installed successfully!
      
      ℹ️  This version includes a bundled Node.js runtime, so you don't need
          Node.js installed on your system for MAIASS to work.
      
      🔐 macOS Security Note:
          If you see "maiass cannot be verified" when first running:
          1. Go to System Preferences > Security & Privacy
          2. Click "Allow Anyway" next to the maiass warning
          3. This is normal for unsigned binaries distributed through GitHub
      
      🚀 Get started:
          maiass --help
          maiass --version
          maiass patch  # Create a patch version bump
      
      📖 Documentation: https://github.com/vsmash/maiass
    EOS
  end

  test do
    # Test version output
    version_output = shell_output("#{bin}/maiass --version").strip
    assert_match version.to_s, version_output
    
    # Test help output
    help_output = shell_output("#{bin}/maiass --help")
    assert_match "MAIASS", help_output
    assert_match "Modular AI-Augmented Semantic Scribe", help_output
    
    # Test symlinks work
    assert_predicate bin/"myass", :exist?
    assert_predicate bin/"miass", :exist?
    
    # Test symlinks are functional
    symlink_version = shell_output("#{bin}/myass --version").strip
    assert_equal version_output, symlink_version
  end
end
