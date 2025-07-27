class Maiassnode < Formula
  desc "AI-powered Git workflow automation tool"
  homepage "https://github.com/vsmash/nodemaiass"
  version "0.7.1"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/vsmash/nodemaiass/releases/download/v#{version}/maiassnode-macos-intel"
      sha256 "29926edee4fca8ded1b240aa2ec3ce15c1ea1903aa9bce81f9dd68ac0737f56b"
    else
      url "https://github.com/vsmash/nodemaiass/releases/download/v#{version}/maiassnode-macos-arm64"
      sha256 "d8a7f51dd87921755ea4a4d1afa0abd67b88917bcd1f367238450e8122d76177"
    end
  end

  on_linux do
    url "https://github.com/vsmash/nodemaiass/releases/download/v#{version}/maiassnode-linux-x64"
    sha256 "1530408df3b924a5777b969f76ee2b96f33bc563dcf4afde0e7e9ddc39561228"
  end

  def install
    # The downloaded file is the binary itself
    bin.install Dir["maiassnode*"].first => "maiassnode"
  end

  test do
    system "#{bin}/maiassnode", "--version"
    system "#{bin}/maiassnode", "--help"
  end
end
