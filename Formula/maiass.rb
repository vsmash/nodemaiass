class Maiass < Formula
  desc "MAIASS: Modular AI-Assisted Semantic Scribe - CLI tool for AI-assisted development"
  homepage "https://github.com/vsmash/maiass"
  url "https://github.com/vsmash/maiass/archive/refs/tags/v#{version}.tar.gz"
  version "1.2.4"
  sha256 ""
  license "GPL-3.0-only"

  depends_on "node"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-macos-intel"
      sha256 "fc220610f09bd643cb78c593d3bd8c17bfceefd06d37306507534ca4c3364b43"
    else
      url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-macos-arm64"
      sha256 "2a8c3544a40c6164e824b505ec856d16652832bb380674e95b9f8fb969fa44e8"
    end
  end

  on_linux do
    url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-linux-x64"
    sha256 "9c39295c8145f6cc25013d1639826a26d4f6b68888133150faf7e9845a5d9e19"
  end

  def install
    bin.install Dir["maiass-*"].first => "maiass"
  end

  test do
    system "#{bin}/maiass", "--version"
    system "#{bin}/maiass", "--help"
  end
end
