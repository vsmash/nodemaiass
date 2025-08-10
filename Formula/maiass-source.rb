class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/vsmash/maiass"
  url "https://github.com/vsmash/maiass/archive/refs/tags/#{version}.tar.gz"
  version "5.3.18"
  sha256 "SOURCE_TARBALL_SHA256"  # You'll need to calculate this

  license "GPL-3.0-only"
  
  depends_on "node" => :build
  
  def install
    # Install dependencies
    system "npm", "install", "--production"
    
    # Install the main script
    libexec.install Dir["*"]
    
    # Create wrapper script that handles Node.js
    (bin/"maiass").write <<~EOS
      #!/bin/bash
      exec "#{Formula["node"].opt_bin}/node" "#{libexec}/maiass.js" "$@"
    EOS
    
    # Create convenience symlinks
    bin.install_symlink "maiass" => "myass"
    bin.install_symlink "maiass" => "miass"
  end

  test do
    system "#{bin}/maiass", "--version"
    system "#{bin}/maiass", "--help"
  end
end
