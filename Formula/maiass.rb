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
      sha256 "474e8a1c98e32b4340541d7ec2c92ad377ae2063c87be66a7f50c6fea83d8dfe"
    else
      url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-macos-arm64"
      sha256 "408dd3d2beb7b0c8a5cb0a280e620d9365aa6792314d68a6c8b2e25b0a572f9f"
    end
  end

  on_linux do
    url "https://github.com/vsmash/maiass/releases/download/v#{version}/maiass-linux-x64"
    sha256 "1b786c0c22bc4ef4dcc5e7cf83b00c91cd673f3e7299ab7ae6a56dff97e25802"
  end

  def install
    bin.install Dir["maiass-*"].first => "maiass"
  end

  test do
    system "#{bin}/maiass", "--version"
    system "#{bin}/maiass", "--help"
  end
end
