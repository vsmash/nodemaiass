# Setting Up Homebrew Tap

## 1. Create Homebrew Tap Repository

Create a new GitHub repository named: `homebrew-maiass`

## 2. Repository Structure

```
homebrew-maiass/
├── Formula/
│   └── maiass.rb
└── README.md
```

## 3. Copy Formula

Copy the generated formula to your tap repository:

```bash
cp Formula/maiass.rb /path/to/homebrew-maiass/Formula/
```

## 4. Users Install With

```bash
# Add your tap
brew tap vsmash/nodemaiass

# Install maiass
brew install maiass

# Or install directly
brew install vsmash/nodemaiass/maiass
```

## 5. Updating Formula

When you release a new version:

1. Update version in package.json
2. Run ./scripts/create-release.sh
3. Run ./scripts/create-homebrew-formula.sh
4. Copy updated Formula/maiass.rb to homebrew-maiass repo
5. Commit and push

## 6. Formula Validation

Test your formula locally:

```bash
brew install --build-from-source Formula/maiass.rb
brew test maiass
brew audit --strict maiass
```
