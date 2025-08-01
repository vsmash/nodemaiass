class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/vsmash/maiass"
  url "https://github.com/vsmash/maiass/archive/refs/tags/v#{version}.tar.gz"
  version "5.2.5"
  sha256 ""
  license "GPL-3.0-only"

  depends_on "node"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-macos-intel"
      sha256 "8157a14604739c415936008e223a29b4144cf1dfeb482e0a68369e16ce3a4adc"
    else
      url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-macos-arm64"
      sha256 "352ad6cec9faabd35d4f078fda32bfed6bb72fc6a417279e4cf91c04340d2d68"
    end
  end

  on_linux do
    url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-linux-x64"
    sha256 "9c0b8ca74d50f23a2466a7f547673dbec81f22b35b082c5cc9944c4bcd99d9ac"
  end

  def install
    bin.install Dir["maiass-*"].first => "maiass"
  end

  test do
    system "#{bin}/maiass", "--version"
    system "#{bin}/maiass", "--help"
  end
end
