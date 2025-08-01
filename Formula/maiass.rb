class Maiass < Formula
  desc "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development"
  homepage "https://github.com/vsmash/maiass"
  url "https://github.com/vsmash/maiass/archive/refs/tags/#{version}.tar.gz"
  version "5.2.7"
  sha256 ""
  license "GPL-3.0-only"

  depends_on "node"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-macos-intel"
      sha256 "1be4b162d500a30c31e1dfc53ad857c494f4fea0d2ba155f650339948fad9402"
    else
      url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-macos-arm64"
      sha256 "c7673b9c5bbd7a50438e1ca823c5c9fcfc22c984f25d88a47dc745ad999bacf0"
    end
  end

  on_linux do
    url "https://github.com/vsmash/maiass/releases/download/#{version}/maiass-linux-x64"
    sha256 "ec7bc7ec0b057a0f38a317f5a3ae88f944e7e47ff8dc5b89d3df6ee927f167c1"
  end

  def install
    bin.install Dir["maiass-*"].first => "maiass"
  end

  test do
    system "#{bin}/maiass", "--version"
    system "#{bin}/maiass", "--help"
  end
end
