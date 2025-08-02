## 5.3.8
2 August 2025

- (vsmsh) Refactored build scripts for standalone file usage
	- refactor: updated package.json to use  for , , and  input
	- refactor: removed unused > pkg@5.8.1 > Error! Entry file/directory is expected   Pass --help to see usage information scripts and assets configuration in package.json
	- refactor: altered  to require  for PKG and Nexe builds
	- refactor: removed platform loop in  and built for each specific platform with updated standalone references
	- refactor: adjusted Bun build process in  to handle standalone file and renamed platform outputs
- (vsmsh) Bumped version to 5.3.7
- (vsmsh) Update dependencies and configurations
	- chore: upgraded package version from 0.7.1 to 5.3.6
	- chore: switched maiass bin from .mjs to .cjs
	- chore: added nexe as a devDependency
	- chore: added several new devDependencies including webpack and ajv packages

- (vsmsh) Update dependencies and configurations
	- chore: upgraded package version from 0.7.1 to 5.3.6
	- chore: switched maiass bin from .mjs to .cjs
	- chore: added nexe as a devDependency
	- chore: added several new devDependencies including webpack and ajv packages

- (vsmsh) Updated release process and scripts
	- feat: added code signing for macOS binaries in release.yml
	- refactor: modified release asset creation to include signature-preserving archives
	- refactor: updated instructions and details in release descriptors
	- feat: added quick-release.sh for building, signing, and uploading
	- feat: added release-and-deploy.sh for complete automated release process, including Homebrew update.
- (vsmsh) Bumped version to 5.3.5
- (vsmsh) Improved code signing and binary hashing
	- feat(scripts): added advanced options to code signing in codesign.sh
	- feat(scripts): added Gatekeeper assessment to code signing in codesign.sh
	- refactor(scripts): changed binary hashing to archive hashing in create-homebrew-formula.sh
	- refactor(scripts): changed binary links to archive links in create-homebrew-formula.sh
	- feat(scripts): added binary archiving in create-release.sh
	- feat(scripts): added Gatekeeper assessment in create-release.sh
	- refactor(scripts): added archive hashing in create-release.sh
	- docs(scripts): updated next steps instructions in create-release.sh
- (vsmsh) Bumped version to 5.3.4
- (vsmsh) Upgrade to release process and checksum generation
	- feat: added new checksums for various platforms in checksums.txt
	- fix(scripts): revised create-homebrew-formula.sh to prefer x64 over intel
	- fix(scripts): amended copy command in create-release.sh from "maiass-macos-intel" to "maiass-macos-x64"
	- feat(scripts): incorporated code signature verification in create-release.sh for macOS binaries
- (vsmsh) Bumped version to 5.3.3
- (vsmsh) Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages

- (vsmsh) Improved code signing and binary hashing
	- feat(scripts): added advanced options to code signing in codesign.sh
	- feat(scripts): added Gatekeeper assessment to code signing in codesign.sh
	- refactor(scripts): changed binary hashing to archive hashing in create-homebrew-formula.sh
	- refactor(scripts): changed binary links to archive links in create-homebrew-formula.sh
	- feat(scripts): added binary archiving in create-release.sh
	- feat(scripts): added Gatekeeper assessment in create-release.sh
	- refactor(scripts): added archive hashing in create-release.sh
	- docs(scripts): updated next steps instructions in create-release.sh
- (vsmsh) Bumped version to 5.3.4
- (vsmsh) Upgrade to release process and checksum generation
	- feat: added new checksums for various platforms in checksums.txt
	- fix(scripts): revised create-homebrew-formula.sh to prefer x64 over intel
	- fix(scripts): amended copy command in create-release.sh from "maiass-macos-intel" to "maiass-macos-x64"
	- feat(scripts): incorporated code signature verification in create-release.sh for macOS binaries
- (vsmsh) Bumped version to 5.3.3
- (vsmsh) Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages

- (vsmsh) Upgrade to release process and checksum generation
	- feat: added new checksums for various platforms in checksums.txt
	- fix(scripts): revised create-homebrew-formula.sh to prefer x64 over intel
	- fix(scripts): amended copy command in create-release.sh from "maiass-macos-intel" to "maiass-macos-x64"
	- feat(scripts): incorporated code signature verification in create-release.sh for macOS binaries
- (vsmsh) Bumped version to 5.3.3
- (vsmsh) Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages

- (vsmsh) Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages

- (vsmsh) MAI-8 Updated maiass.sh and nodemaiass.sh scripts
	- fix: updated node command to use .cjs modules in maiass.sh and nodemaiass.sh scripts
- (vsmsh) Updated script for Homebrew formula creation and added binary file for testing
	- refactor(scripts): change process for retrieving SHA256 hashes in Homebrew script
	- feat: added new test binary file
- (vsmsh) Bumped version to 5.3.0
- (vsmsh) Updated code signing for macOS and Windows binaries
	- feat: added certificate files to .gitignore
	- feat: added code signing for .exe files in build.js
	- docs: created new detailed documents on code signing for both platforms
	- feat: added new scripts for code signing and signature verification for individual binaries
- (vsmsh) Bumped version to 5.2.9
- (vsmsh) Updated .gitignore and removed unused Formula file
	- feat: added 'Formula/maiass.rb' to .gitignore
	- fix: deleted unused 'Formula/maiass.rb' file
- (vsmsh) Bumped version to 5.2.8
- (vsmsh) Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag

- (vsmsh) Updated code signing for macOS and Windows binaries
	- feat: added certificate files to .gitignore
	- feat: added code signing for .exe files in build.js
	- docs: created new detailed documents on code signing for both platforms
	- feat: added new scripts for code signing and signature verification for individual binaries
- (vsmsh) Bumped version to 5.2.9
- (vsmsh) Updated .gitignore and removed unused Formula file
	- feat: added 'Formula/maiass.rb' to .gitignore
	- fix: deleted unused 'Formula/maiass.rb' file
- (vsmsh) Bumped version to 5.2.8
- (vsmsh) Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag

## 5.2.9
2 August 2025

- (vsmsh) Updated .gitignore and removed unused Formula file
	- feat: added 'Formula/maiass.rb' to .gitignore
	- fix: deleted unused 'Formula/maiass.rb' file
- (vsmsh) Bumped version to 5.2.8
- (vsmsh) Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag

- (vsmsh) Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag

- (vsmsh) MAI-7 Update MAIASS homebrew formula and script
	- fix: update maiass sha256 checksum in homebrew formula
	- refactor: remove superfluous 'v' from download URLs in homebrew formula and shells script
- (vsmsh) Bumped version to 5.2.6
- (vsmsh) MAI-7 Updated feature name and implemented version update checker
	- refactor: Changed feature name from 'AI-Assisted Semantic Savant' to 'AI-Augmented Semantic Scribe'
	- fix: Adjusted associated references in documentation and code for the new feature name
	- feat: Added functionality to check for version updates from the GitHub releases
	- fix: Updated brew configuration to correctly define augmented semantic scribe
	- feat: Updated package.json with new version and adjusted description.
- (vsmsh) Bumped version to 5.2.5
- (vsmsh) MAI-7 Project Maintenance and Improvement
	- feat: Added GPL-3.0-only license
	- fix: Adjusted package version according to recent changes
	- feat: Added new Modular AI-Assisted Semantic Savant feature to the project
	- doc: Overhauled README with updated descriptions and examples
	- fix: Updated brew configuration to correctly tap into maiass instead of nodemaiass
	- refactor: Deleted old maiassnode.rb file
	- feat: Modified Homebrew setup script to accommodate updates
	- doc: Ignored additional files (HOMEBREW_TAP_SETUP.md, script creations) on .pkgignore
	- doc: Copied updated maiass.rb Homebrew formula to homebrew
- (vsmsh) Bumped version to 1.2.12
- (vsmsh) MAI-7 Set release ignore rules, enhance release and pkgignore files
	- feat: created .gitattributes to manage release ignoring rules
	- docs(release.yml): added note for using binary downloads not source code archives
	- feat(.pkgignore): added more rules to pkgignore
	- docs(RELEASE_TEMPLATE.md): updated version numbers, added Linux ARM64 support and repeated note about binary downloads
- (vsmsh) MAI-7 Updated script and test files to reflect name change of main script
	- refactor: Updated name of CLI script from "maiassnode" to "maiass"
	- refactor: Revised file directories in scripts and tests to reflect new script name
	- docs: Updated documentation for script usage and module interactions based on new name
- (vsmsh) Bumped version to 1.2.11
- (vsmsh) MAI-7 Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files
- (vsmsh) Bumped version to 1.2.10
- (vsmsh) MAI-7 Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script
- (vsmsh) Bumped version to 1.2.9
- (vsmsh) MAI-7 Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh
- (vsmsh) Bumped version to 1.2.8
- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md
- (vsmsh) Bumped version to 1.2.0
- (vsmsh) Bumped version to 1.1.10
- (vsmsh) Bumped version to 1.1.9
- (vsmsh) MAI-7 Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection
- (vsmsh) MAI-7 Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line
- (vsmsh) Bumped version to 1.1.8
- (vsmsh) Bumped version to 1.1.7
- (vsmsh) MAI-7 Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag
- (vsmsh) Bumped version to 1.1.6
- (vsmsh) MAI-7 Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits
- (vsmsh) Bumped version to 1.1.5
- (vsmsh) MAI-7 Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well
- (vsmsh) Bumped version to 1.1.4
- (vsmsh) MAI-7 Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits
- (vsmsh) Bumped version to 1.1.3
- (vsmsh) MAI-7 Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs
- (vsmsh) Bumped version to 1.1.2
- (vsmsh) MAI-7 Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion
- (vsmsh) Bumped version to 1.1.1
- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- (vsmsh) MAI-7 Updated feature name and implemented version update checker
	- refactor: Changed feature name from 'AI-Assisted Semantic Savant' to 'AI-Augmented Semantic Scribe'
	- fix: Adjusted associated references in documentation and code for the new feature name
	- feat: Added functionality to check for version updates from the GitHub releases
	- fix: Updated brew configuration to correctly define augmented semantic scribe
	- feat: Updated package.json with new version and adjusted description.

- (vsmsh) MAI-7 Project Maintenance and Improvement
	- feat: Added GPL-3.0-only license
	- fix: Adjusted package version according to recent changes
	- feat: Added new Modular AI-Augmented Semantic Scribe feature to the project
	- doc: Overhauled README with updated descriptions and examples
	- fix: Updated brew configuration to correctly tap into maiass instead of nodemaiass
	- refactor: Deleted old maiassnode.rb file
	- feat: Modified Homebrew setup script to accommodate updates
	- doc: Ignored additional files (HOMEBREW_TAP_SETUP.md, script creations) on .pkgignore
	- doc: Copied updated maiass.rb Homebrew formula to homebrew
- (vsmsh) Bumped version to 1.2.12
- (vsmsh) MAI-7 Set release ignore rules, enhance release and pkgignore files
	- feat: created .gitattributes to manage release ignoring rules
	- docs(release.yml): added note for using binary downloads not source code archives
	- feat(.pkgignore): added more rules to pkgignore
	- docs(RELEASE_TEMPLATE.md): updated version numbers, added Linux ARM64 support and repeated note about binary downloads
- (vsmsh) MAI-7 Updated script and test files to reflect name change of main script
	- refactor: Updated name of CLI script from "maiassnode" to "maiass"
	- refactor: Revised file directories in scripts and tests to reflect new script name
	- docs: Updated documentation for script usage and module interactions based on new name
- (vsmsh) Bumped version to 1.2.11
- (vsmsh) MAI-7 Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files
- (vsmsh) Bumped version to 1.2.10
- (vsmsh) MAI-7 Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script
- (vsmsh) Bumped version to 1.2.9
- (vsmsh) MAI-7 Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh
- (vsmsh) Bumped version to 1.2.8
- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

## 1.2.12
2 August 2025

- (vsmsh) MAI-7 Set release ignore rules, enhance release and pkgignore files
	- feat: created .gitattributes to manage release ignoring rules
	- docs(release.yml): added note for using binary downloads not source code archives
	- feat(.pkgignore): added more rules to pkgignore
	- docs(RELEASE_TEMPLATE.md): updated version numbers, added Linux ARM64 support and repeated note about binary downloads
- (vsmsh) MAI-7 Updated script and test files to reflect name change of main script
	- refactor: Updated name of CLI script from "maiassnode" to "maiass"
	- refactor: Revised file directories in scripts and tests to reflect new script name
	- docs: Updated documentation for script usage and module interactions based on new name
- (vsmsh) Bumped version to 1.2.11
- (vsmsh) MAI-7 Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files
- (vsmsh) Bumped version to 1.2.10
- (vsmsh) MAI-7 Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script
- (vsmsh) Bumped version to 1.2.9
- (vsmsh) MAI-7 Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh
- (vsmsh) Bumped version to 1.2.8
- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

## 1.2.11
1 August 2025

- (vsmsh) MAI-7 Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files
- (vsmsh) Bumped version to 1.2.10
- (vsmsh) MAI-7 Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script
- (vsmsh) Bumped version to 1.2.9
- (vsmsh) MAI-7 Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh
- (vsmsh) Bumped version to 1.2.8
- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script
- (vsmsh) Bumped version to 1.2.9
- (vsmsh) MAI-7 Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh
- (vsmsh) Bumped version to 1.2.8
- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh
- (vsmsh) Bumped version to 1.2.8
- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions
- (vsmsh) Bumped version to 1.2.7
- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Updated script files - fix(build.js): corrected project name in build script - feat(.pkgignore): added scripts/ path to package ignore list
- (vsmsh) Bumped version to 1.2.6
- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging
- (vsmsh) Bumped version to 1.2.5
- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh
- (vsmsh) Bumped version to 1.2.4
- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env
- (vsmsh) Bumped version to 1.2.3
- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) MAI-7 Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md
- (vsmsh) Bumped version to 1.2.2
- (vsmsh) MAI-7 Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist
- (vsmsh) Bumped version to 1.2.1
- (vsmsh) MAI-7 Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- (vsmsh) Bumped version to 1.1.10
- (vsmsh) Bumped version to 1.1.9
- (vsmsh) MAI-7 Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection
- (vsmsh) MAI-7 Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line
- (vsmsh) Bumped version to 1.1.8
- (vsmsh) Bumped version to 1.1.7
- (vsmsh) MAI-7 Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag
- (vsmsh) Bumped version to 1.1.6
- (vsmsh) MAI-7 Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits
- (vsmsh) Bumped version to 1.1.5
- (vsmsh) MAI-7 Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well
- (vsmsh) Bumped version to 1.1.4
- (vsmsh) MAI-7 Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits
- (vsmsh) Bumped version to 1.1.3
- (vsmsh) MAI-7 Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs
- (vsmsh) Bumped version to 1.1.2
- (vsmsh) MAI-7 Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion
- (vsmsh) Bumped version to 1.1.1
- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

## 1.1.10
1 August 2025

- (vsmsh) Bumped version to 1.1.9
- (vsmsh) MAI-7 Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection
- (vsmsh) MAI-7 Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line
- (vsmsh) Bumped version to 1.1.8
- (vsmsh) Bumped version to 1.1.7
- (vsmsh) MAI-7 Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag
- (vsmsh) Bumped version to 1.1.6
- (vsmsh) MAI-7 Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits
- (vsmsh) Bumped version to 1.1.5
- (vsmsh) MAI-7 Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well
- (vsmsh) Bumped version to 1.1.4
- (vsmsh) MAI-7 Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits
- (vsmsh) Bumped version to 1.1.3
- (vsmsh) MAI-7 Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs
- (vsmsh) Bumped version to 1.1.2
- (vsmsh) MAI-7 Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion
- (vsmsh) Bumped version to 1.1.1
- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- (vsmsh) MAI-7 Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection
- (vsmsh) MAI-7 Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line
- (vsmsh) Bumped version to 1.1.8
- (vsmsh) Bumped version to 1.1.7
- (vsmsh) MAI-7 Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag
- (vsmsh) Bumped version to 1.1.6
- (vsmsh) MAI-7 Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits
- (vsmsh) Bumped version to 1.1.5
- (vsmsh) MAI-7 Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well
- (vsmsh) Bumped version to 1.1.4
- (vsmsh) MAI-7 Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits
- (vsmsh) Bumped version to 1.1.3
- (vsmsh) MAI-7 Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs
- (vsmsh) Bumped version to 1.1.2
- (vsmsh) MAI-7 Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion
- (vsmsh) Bumped version to 1.1.1
- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- (vsmsh) Bumped version to 1.1.7
- (vsmsh) MAI-7 Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag
- (vsmsh) Bumped version to 1.1.6
- (vsmsh) MAI-7 Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits
- (vsmsh) Bumped version to 1.1.5
- (vsmsh) MAI-7 Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well
- (vsmsh) Bumped version to 1.1.4
- (vsmsh) MAI-7 Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits
- (vsmsh) Bumped version to 1.1.3
- (vsmsh) MAI-7 Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs
- (vsmsh) Bumped version to 1.1.2
- (vsmsh) MAI-7 Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion
- (vsmsh) Bumped version to 1.1.1
- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- (vsmsh) MAI-7 Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag
- (vsmsh) Bumped version to 1.1.6
- (vsmsh) MAI-7 Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits
- (vsmsh) Bumped version to 1.1.5
- (vsmsh) MAI-7 Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well
- (vsmsh) Bumped version to 1.1.4
- (vsmsh) MAI-7 Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits
- (vsmsh) Bumped version to 1.1.3
- (vsmsh) MAI-7 Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs
- (vsmsh) Bumped version to 1.1.2
- (vsmsh) MAI-7 Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion
- (vsmsh) Bumped version to 1.1.1
- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- Version bump

- Version bump

- (vsmsh) MAI-7 Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- Version bump

## 1.0.34
1 August 2025

- Version bump

- (vsmsh) MAI-7 Improved handling of commit logs
	- refactor: updated condition for executing changelog commits processing
	- feat: added proceed action when no commits are found
	- refactor: modified commit processing only to execute if commits exist
	- feat: added version bump fallback for change logs with no commits
	- refactor: unified fallback to version bump when no changelogs are found
	- feat: added tool's capability to create version bump entry for internal changelog

- (vsmsh) MAI-7 Updated version tagging workflow
	- feat: added options for version bump and tagcreation in handleMergeToDevelop
	- feat: added functionality to decide tagging strategy
	- feat: Split release handling into simple bump and full release branch workflow
	- feat: Simple bump updates version and skips release branch and tagging
	- feat: Full release workflow includes release branch creation and tagging
	- feat: Updated return message with workflow used
	- fix: Made failure messages in git operations more consistent
	- chore: Removed redundant and commented out code sections.
	- style: Cleaned up logging and commenting for readability improvement

- (vsmsh) MAI-7 Refactor commit handler
	- refactor(lib): removed verbosity check in handleStagedCommit function
- (vsmsh) MAI-7 Simplified debug check in handleStagedCommit function
	- fix(lib): remove unnecessary condition from debug check
- (vsmsh) MAI-7 Improved git command handling and added debug verbosity
	- fix: changed default silent parameter value in executeGitCommand function
	- feat: added function to display git push command under debug verbosity
	- refactor: adjusted conditional check within handleStagedCommit function

- (vsmsh) MAI-7 Updated default parameter in executeGitCommand function
	- refactor: changed silent's default value from false to 'pipe' in executeGitCommand
- (vsmsh) MAI-7 Enhancements to Logging and Error Management in the MAIASS system
	- feat: implemented a debug buffer system for logging sessions in logger.js
	- feat: added methods to initialize a debugging session, add entries to the buffer and retrieve it
	- feat: ability to write debug content to a temporary file
	- feat: ability to retrieve current debug session info in logger.js
	- refactor: enhanced error logging in logger.js to include debug buffer
	- feat: added logging side-effect to executeGitCommand() in maiass-pipeline.js for better output tracking
	- feat: improved error management in executeGitCommand() function
	- feat: debug information are now written to a file when there's an error
- (vsmsh) MAI-7 Refactor log handling in version-manager
	- refactor: replaced console.log with logger.debug for .env.maiass content display

- (vsmsh) MAI-7 Refactor configuration handling
	- refactor: revised parameter order in  in  to include global option
	- feat: added  option in  in  to allow global key value setting
	- feat: updated  in  to use  method for determining the config path based on  option

- (vsmsh) MAI-7 Refactored pipeline.js logic and improved debugging
	- feat: added condition to handle user-cancelled merges gracefully in runMaiassPipeline function
	- refactor: replaced console.debug with logger.debug for better logging in branchExists function
- (vsmsh) MAI-7 Improved commit and pipeline handling
	- feat: display git status in detailed format
	- feat: enhanced handling for unstaged/untracked changes
	- fix(lib): improved messaging and error handling for different commit states
	- feat: added conditionals to handle commit workflow cancellation and uncommitted changes in pipeline mode
	- feat: included additional exit points in various commit/pipeline stages
	- feat: handle clean working directory state check after commit workflow
- (vsmsh) MAI-7 Refactor input utility methods
	- refactor: moved getSingleCharInput and getMultiLineInput to input-utils.js
	- fix: autoformatted user prompts for increased visibility
	- refactor: cleaned up manage input methods in commit.js
	- refactor: removed color formatting from prompt calling methods in maiass-pipeline.js
- (vsmsh) MAI-7 Updated Maiass pipeline logic
	- feat: Added line to pause execution in handleMergeToDevelop function

- (vsmsh) MAI-7 Updated logger functionality and streamlined pipeline code
	- feat: added BWhite logging method in logger.js
	- refactor: simplified logger usage in maiass-pipeline.js
- (vsmsh) MAI-7 Updated logging methods in maiass-pipeline.js
	- fix(code): replaced logger.White with logger.log.BWhite for currentBranch output
- (vsmsh) MAI-7 Updated color configurations and trimming functions
	- feat(lib/colors.js): add BSoftPink and SoftPink color definitions
	- fix(lib/commit.js): trim whitespace from edited and AI suggested commit messages
	- refactor(lib/logger.js): changed MAIASS branding color to BSoftPink and modified log settings
- (vsmsh) MAI-7 Refined logging and prompting capabilities, added new config options
	- feat(lib): introduced 'critical' and 'prompt' log levels
	- feat(lib): added shouldLog function based on verbosity in logger.js
	- refactor(lib): replaced certain log.info calls with log.critical in commit.js
	- refactor(lib): changed MAIASS_PREFIX icon in logger.js
	- feat(lib): added 'autoSwitch' variable to control version mgmt in maiass-pipeline.js
	- feat(lib): introduced new symbol 'maiassass' in symbols.js
	- feat: added new command line options '--commits-only, -c' and '--auto-stage, -a' in maiass.mjs
	-

- (vsmsh) MAI-7 Improved application naming and documentation
	- refactor: renamed maiass.mjs to maiass.mjs
	- docs: updated command references in cross-platform documentation
	- docs: updated command references in node compatibility documentation
	- build: modified references in package.json script section and pkg property
	- refactor: removed maiass.mjs file from the project

- (vsmsh) MAI-7 Updated install script
	- fix: corrected repository path in install.sh
	- feat: updated binary name in install.sh

- (vsmsh) MAI-7 Enhanced AI key management and added machine fingerprinting
	- feat: Added functionality to auto-create anonymous subscriptions if no API key exists
	- feat: Added new module for generating a unique machine fingerprint for abuse prevention
	- refactor: Updated API requests to include the machine fingerprint
	- test: Created test file for credit display functionality

## 1.0.22
31 July 2025

- (vsmsh) MAI-7 Improved MAIASS functionalities and user experience
	- feat: added new color functions  and  in colors.js
	- refact: removed redundant logic and enhanced error messages related to AI API request in commit.js
	- feat: added credit usage breakdown with details in commit.js
	- chore: updated project context title in .windsurf
	- docs: added 'Debug Mode Token Validation' section in README.maiass.md
	- feat: created new file CREDIT_IMPROVEMENTS.md outlining credit display enhancements and other safety features
- (vsmsh) MAI-7 Updated pertinently the logger, refined API interaction, and more
	- feat: Revamped logger for better debugging
	- feat: Altered handling of requests to API with enhanced timeouts, error handling, and logging
	- fix: Directed error feedback to match with the new Logger usage replacing previous console errors
	- chore: Removed compatibility with pkg from CommonJs
	- fix: Broadened error notifications for AI suggestion failures. Added stack if available and specific error handling for common network issues.

- (vsmsh) Refined commit messaging and added new color functions
	- feat: added new color functions in colors.js
	- fix: improved token counting mechanism in commit.js
	- feat: added blueOnWhite logging property in logger.js
	- style: modified how log messages are presented in commit.js

- (vsmsh) Refactored code related to user prompts and session usage
	- feat: introduced enhanced credit display
	- feat: added warning before every AI suggestion
	- fix: improved Ctrl+C handling in raw and readline interfaces
	- feat: added AI usage breakdown details
	- feat: added low credit warning

- (vsmsh) Improved debug mode and enhanced documentation
	- fix: updated context title in .windsurf
	- docs: added explanation for Debug Mode Token Validation in README
	- feat: introduced new token-validator.js for debugging API tokens
	- feat: integrated token-validator in main application (maiass.mjs)

## 1.0.16
28 July 2025

- (vsmsh) MAI-7 Removed unused binary build files and tweaked logging in maiass-pipeline.js
	- chore: deleted maiass-arm64 build file
	- chore: deleted maiass-x64 build file
	- refactor: remove redundant logging line in validateAndHandleBranching
	- style: changed logger output color to blue for 'Phase 1: Branch Detection and Validation' message

- (vsmsh) MAI-7 Implemented AI symbol and updated AI message identifier
	- feat(symbols): added new 'brain' symbol for AI
	- refactor(commit): changed AI suggestion message symbol from 'INFO' to 'BRAIN'
- (vsmsh) MAI-7 Improved logging output symbolism
	- feat: introduced distinct symbols for different logging operations
	- refactor: replaced standard logging symbols with detailed ones for merging, pulling and pushing actions

- (vsmsh) MAI-7 Updated logger symbol in pipeline
	- refactor: changed logger symbol from INFO to GEAR in maiass-pipeline.js

- (vsmsh) MAI-7 Updated logging functionality and error handling
	- refactor: replaced SYMBOLS.INFO with SYMBOLS.GEAR in logging messages
	- feat: incorporated error handling using logger instead of console.error
	- refactor: updated all console.log statements to use the logger module
	- feat: added more descriptive log messages for git operations

- (vsmsh) MAI-7 Refactored logging framework for enhanced error management
	- feat(logger.js): added a debugging method to logger
	- feat(devlog.js, version-manager.js): replaced console.log with custom logger methods
	- fix(version-manager.js): managed exceptions for file reading/navigating errors
- (vsmsh) MAI-7 Updated logging in maiass-pipeline.js
	- feat: replaced console.log with a logger
	- feat: started logging current branch and version information
	- fix: replaced console.error with logger for error handling

- (vsmsh) MAI-7 Updated logging in maiass-pipeline.js
	- refactor: replaced console.log with logger for better debuguity
	- refactor: replaced console.error with logger.error for better error tracking
	- refactor: replaced console.success with logger.success for improved success message tracking
	- refactor: refined logger messages
	- refactor: streamlined calls to use git commands through logger functionality

- (vsmsh) MAI-7 Updated logger and main packages
	- refactor: Changed log.info to log.aisuggestion in commit.js
	- feat: Imported logger from './lib/logger.js'
	- refactor: Replaced console.log with logger.header in maiass.mjs file
	- style: Changed text color to bright yellow in logger
	- refactor: Removed MAIASS_PREFIX from aisuggestion log method
	- feat: Added aisuggestion method to logger.js
	- fix: Updated logging call for aiSuggestion
	- feat: Added bold lime color function to colors.js
	- refactor: Version and description update in package.json
- (vsmsh) MAI-7 Updated documentation and code to reflect changes in project name
	- docs: Updated README, documentation, and scripts to change name to "Semantic Scribe"
	- refactor: Updated JavaScript files to change project name display to "Semantic Scribe"
	- feat: Added new symbol 'maiassdot' in symbols.js
	- refactor: Removed logger.header line in maiass.mjs
	- fix: Updated project description in package.json

- (vsmsh) MAI-7 Refactor log method in commit.js
	- refactor: changed log.info to log.aisuggestion in commit.js
- (vsmsh) MAI-7 Updated logging in maiass.mjs
	- feat: imported logger from './lib/logger.js'
	- refactor: replaced console.log with logger.header for displaying version
	- chore: added a blue colored horizontal line for better UI

- (vsmsh) MAI-7 Updated style and behavior of logger
	- style(logger): changed text color to bright yellow
	- refactor(logger): removed MAIASS_PREFIX from aisuggestion log method
- (vsmsh) MAI-7 Updated logger functionality
	- feat: added aisuggestion method to logger.js
- (vsmsh) MAI-7 Improved logging in commit.js
	- fix: updated logging call for aiSuggestion

- (vsmsh) MAI-7 Added new color to colors.js
	- feat: added bold lime color function to colors.js

- (vsmsh) Updated logger functionality
	- feat: added bold parameter to logger methods
	- fix: updated color selection based on boldness

- (vsmsh) Updated message in maiass-command.js
	- fix: corrected application name in thank you message

- (vsmsh) MAI-7 Updated logging systems in maiass and removed unnecessary logs
	- refactor(maiass): replace console.log with the logger system for better output control
	- refactor(maiass): change user prompts to use the logger system instead of console.log
	- fix(maiass): correct comment typo on commit functionality script
	- fix(maiass): remove unnecessary log commenting on ES module import success
	- style(maiass): remove excess white spaces in commitThis function

## 0.9.7
28 July 2025

- (vsmsh) MAI-7 Enhanced Wordpress Integration and Debugging Information
	- feat: expanded WordPress plugin and theme management functionality
	- feat: added methods for updating version in WordPress theme style.css and PHP version constant
	- feat: implemented version constant generator based on file path for WordPress plugins and themes
	- feat: incorporated automatic generation of constants in WordPress update process
	- feat: Implemented dry run mode for WordPress updates previewing
	- feat: included expanded debugging information in configuration load and WordPress update functions
	- fix: corrected list format in create-release.sh script
	- docs: extensive descriptions and usage examples in workflow.md
	- docs: provided configuration metro information for WordPress plugin/theme management in configuration.md

## 0.9.6
27 July 2025

- (vsmsh) MAI-7 Updated files to utilize common JS execution
	- fix: replaced 'maiass.mjs' with 'maiass.cjs' in debug-git-test.js
	- fix: changed file path for 'maiass.mjs' to 'maiass.cjs' in test-runner.js

- (vsmsh) MAI-7 Updated test scripts to use .mjs node files
	- fix: change reference from maiass.js to maiass.mjs in debug-git-test.js
	- fix: modify path to maiass.mjs in test-runner.js

- (vsmsh) MAI-7 Improved git release workflow
	- feat: added write permissions for creating releases
	- feat: extended checkout action for fetching all history and tags
	- feat: enhanced mechanism for getting latest git tag with default value set when no tags found

- (vsmsh) MAI-7 Update create-release.sh script and enhance branching flows
	- feat: add current branch detection
	- feat: add options for merging branches
	- feat: improve branch-switching handling in script
	- fix: improve error handling for invalid user choice

- (vsmsh) MAI-7 Updated GitHub release workflow triggers
	- fix(workflow): change release trigger condition to main branch update or workflow dispatch event

## 0.7.12
27 July 2025

- (vsmsh) VEL-405 Changed command option in devlog.js
	- fix: updated the second parameter from "0" to "?" in devlog.js command execution

- (vsmsh) VEL-405 Refine devlog logs
	- refactor: remove extra log from devlog for cleaner output

- (vsmsh) VEL-405 Updated devlog.js to handle different parameters
	- fix: corrected second parameter in devlog.sh command

- (vsmsh) VEL-405 Refactored devlog command parameters
	- fix: removed unused 'type' parameter from devlog.sh command execution in devlog.js

- (vsmsh) VEL-405 Refactor logging and merging operations - refactor(devlog): switched execution from synchronous to asynchronous - fix(commit): handleStagedCommit now passes along the entire gitInfo object - refactor(devlog): replace default names with clearly outlined  attributes - feat(devlog): extractDevlogContext to separate gitInfo context extraction logic - feat(devlog): use extracted context in logCommit and logMerge functions - refactor(maiass-pipeline): pass along originalGitInfo to logMerge function in handleMergeToDevelop method

- (vsmsh) VEL-405 Refined debugging messages in devlog.js
	- feat: added logging of messages to devlog.sh
	- fix: corrected the error and debug message handling
	- refactor: streamlined debug message print conditions
- (vsmsh) VEL-405 Improve debug handling in devlog
	- feat: introduced condition for command execution during debug
	- refactor: reordered execSync command execution
	- fix(devlog): revised handling for both debug and non-debug scenarios

- (vsmsh) VEL-405 Improved output capture in devlog
	- fix: replaced trim method in execSync command output capture in devlog.js
	- feat: added functionality for logging full command result, including errors
- (vsmsh) VEL-405 Modify devlog.js functionality
	- refactor: changed console output behavior within logThis function
	- feat: added silent execution of command for cleaner log display
- (vsmsh) VEL-405 Added debug message for devlog.sh command execution
	- feat: add debug message condition in devlog.js to show the executed command if MAIASS_DEBUG is set to true

- (vsmsh) VEL-405 Integrate devlog functionality and improve commit and merge logging
	- feat: added devlog functionality as a separate module
	- feat: implemented commit logging to devlog in 'commit.js'
	- feat: introduced merge logging in 'maiass-pipeline.js' within 'handleMergeToDevelop' and 'handleVersionManagement'
	- feat: created 'devlog.js' file with multiple utility functions for development logging

- (vsmsh) VEL-405 Updated AI endpoint and configuration
	- fix: Changed default AI endpoint in commit.js
	- docs: Removed MAIASS_AI_ENDPOINT from configuration.md
	- refactor: Updated MAIASS variable references to non-branded AI in maiass-variables.js

- (vsmsh) VEL-405 Update project configuration and variables related to AI
	- feat: renamed all occurrences of 'OPENAI' to 'AI' in variables and configuration files
	- docs: updated README and documentations to reflect the changes made in configuration and variable names
	- test: updated test setup to use the renamed AI_MODE configuration variable

## 0.7.1
25 July 2025

- (vsmsh) VEL-405 Updated symbols.js
	- feat: Added new emoji and ascii representations for symbols

## 0.6.28
25 July 2025

- (vsmsh) VEL-405 Updated merging process in maiass-pipeline
	- feat: added silent option to handleMergeToDevelop function
	- feat: automated merge command reply when in silent mode
- (vsmsh) VEL-405 Introduced silent mode for automated approval
	- feat(lib): added silent mode for automated commit approval
	- feat(lib): integrated silent mode into the command handler module
	- feat(lib): integrated silent mode into the pipeline module
	- feat(maiass.js): Added silent mode CLI option for automated prompts approval

- (vsmsh) VEL-405 Refactored changelog update function
	- fix: updated regex to filter irrelevant commits in updateChangelog function

- (vsmsh) VEL-405 Improved changelog update filtering
	- refactor: improved readability by moving check for irrelevant commits directly into return statement
	- fix: corrected regular expression to better identify JIRA tickets

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Improved commit message filtering in Changelog updates
	- fix: updated commit filtering regex in updateChangelog function
- (vsmsh) Merge branch 'release/0.6.24' into develop

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Refactored maiass-pipeline.js filter conditions
	- refactor: simplified filtering conditions in updateChangelog function
- (vsmsh) Merge branch 'release/0.6.23' into develop

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Updated Changelog and Maiass Pipeline code
	- refactor: improved line filtering in maiass-pipeline.js
	- refactor: simplified commit filtering logic in updateChangelog function
	- feat: added check for existing changelog, creating new if non-existent
	- feat: updated or prepended new entries based on version and date
	- fix: resolved issue of new entries overwriting entire changelog
	- refactor: updated variable names for clarity
	- fix: modified git log command format in maiass-pipeline.js
	- refactor: replaced const with let for commit message formatting
	- style: improved readability of commit formats in maiass-pipeline.js
	- docs: removed entries in CHANGELOG.md
- (vsmsh) Merge branch 'release/0.6.22' into develop

- (vsmsh) Merge branch 'release/0.6.17' into develop
- 99ba0c7 VEL-405 Updated Git log format in Maiass Pipeline
	- fix: updated git log formatting in executeGitCommand for better readability (vsmsh)
- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Updated maiass-pipeline.js
	- fix: changed the format of internal log result in updateChangelog function
- (vsmsh) Merge branch 'release/0.6.15' into develop
- 697c40e VEL-405 Improved formatting of commit messages and cleaned up CHANGELOG
	- refactor(maiass-pipeline): replaced const with let for commit message formatting
	- style(maiass-pipeline): improved readability of commit formats
	- docs: removed entries in CHANGELOG.md (vsmsh)
- e340cfe VEL-405 Implemented several revisions to changelog updates   - feat: Added functionality for retrieving commit messages with author details   - fix: Resolved issues with commit message processing for the main changelog   - refactor: Modified how internal commit messages are extracted   - style: Cleaned up code for better readability and maintenance (vsmsh)

## 0.6.9
25 July 2025

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Refactored main functionality in maiass-pipeline.js
-   - fix(maiass-pipeline): corrected commitMessages variable reference
-   - docs(maiass-pipeline): added comment explaining commit message processing
- (vsmsh) Merge branch 'release/0.6.8' into develop

## 0.6.5
25 July 2025

- Merge branch 'feature/VEL-405_changelog_fixes' into develop (vsmsh)
- VEL-405 Updated CHANGELOG_internal.md   - docs: bumped version in CHANGELOG_internal.md   - feat: merged feature/VEL-405_changelog_fixes branch into develop (vsmsh)
- Revert "VEL-405 Refactor commit logging in changelog update pipeline" (vsmsh)
- Merge branch 'release/0.6.4' into develop (vsmsh)

## 0.6.4
25 July 2025

- Merge branch 'feature/VEL-405_changelog_fixes' into develop (vsmsh)
- Revert "VEL-405 Refactored changelog update function" (vsmsh)
- Merge branch 'release/0.6.2' into develop (vsmsh)

## 0.6.1
25 July 2025

- Merge branch 'feature/VEL-405_changelog_fixes' into develop (vsmsh)
- VEL-405 Improved log output in maiass-pipeline.js   - fix: Removed commit hash from internalLogResult output in maiass-pipeline.js (vsmsh)
- Merge branch 'release/0.6.0' into develop (vsmsh)

## 0.6.0
24 July 2025

- 2b36c93 VEL-405 Update to version 0.5.8 with changelog improvements and error handling   - feat: Changed git command for internal log in maiass-pipeline.js   - fix: Enhanced error handling for internal changelog extraction   - docs: Added details on automated changelog generation to README (vsmsh)

## 0.5.8
24 July 2025

-  (vsmsh)
- 40c8bac VEL-405 Improved internal changelog extraction
-   - feat: Changed commit log command to include full commit message and author name
-   - fix: Improved error handling when failing to get commits for internal changelog
-  (vsmsh)
-  (vsmsh)

## 0.5.7
24 July 2025

- 821494d VEL-405 Update README and maiass-pipeline.js with changelog generation   - docs(README): add automated changelog generation to features and config instructions   - docs(README): elaborate on dual changelog system, including format and features   - feat(maiass-pipeline.js): import fs/promises module for filesystem operations (vsmsh)

## 0.5.0
Wednesday, 23 July 2025

- Improved commit processing and auto-tagging
  - feat: enhanced logic for processing single and multi-line commits
  - feat: added support for updating an internal changelog with raw commit messages
  - refactor: changed default value of "MAIASS_AUTO_TAG_RELEASES" variable to "true"
- Updated Changelog creation and code refactoring
  - feat: enhanced logic to pull commit messages since last tag in changelog update
  - refactor: modified appending method to changelog file depending on commit history
  - feat: improved commit message formatting for changelog display
  - fix: improved error handling during changelog update process
  - feat: updated code to filter out irrelevant commits and strip JIRA tickets
  - fix: adjusted coding approach for removing extra bullet points during indenting body lines
  - refactor: expanded handleVersionManagement function to handle more activities
  - docs: enhanced README file and improved configuration guide on environment variables
  - refactor: updated .gitignore to adapt to new environment file formats and updated
- Updated changelog creation and formatting logic
  - feat: added logic to pull commit messages since last tag in changelog update
  - refactor: changed appending method to changelog file depending on commit history
  - feat: implemented commit message formatting for proper changelog display
  - fix: handled errors more gracefully during changelog update process
- Refactored version management and added auto-tagging feature
  - feat: added option for automatic version tagging based on environment config
  - refactor: refactored version tagging to include auto-tagging or user prompt
  - feat: included new MAIASS_AUTO_TAG_RELEASES environment variable
- Updated maiass-pipeline.js to return to the original branch after pipeline execution
  - feat: Added check for branch switch during pipeline operation and return to original branch if switched.
  - feat: Implemented log messages to display status of branch switching operation.
- Updated maiass-pipeline for better error handling
  - fix: improved Git error logging for Pull, Merge, Check Out and Push operations
  - feat: added detailed output results for git operations
  - fix: enhanced success condition checks for git operations
  - refactor: streamlined git command lines by embedding them in executeGitCommand calls
- Improved git command execution and error handling
  - fix: remove 'git' from string in execSync call
  - feat: add error output for failed git commands
  - fix: append 'git' to branch and remote related commands
  - docs: clarify comments on branch switching function
- Improved version management in pipeline
  - feat: Added checkRemoteExists function to check if a git remote exists
  - feat: Implemented updateChangelog function to update the project's changelog with new version
  - refactor: Significantly expanded and refined the handleVersionManagement function to include creation of a release branch, updating of version files, committing changes, tagging and merging back to develop
  - feat: Integrated checkRemoteExists function in handleVersionManagement to allow for the pushing of release branches to remote
  - fix: Corrected error handling within handleVersionManagement to provide more specific and informative error messages
  - feat: Import and usage of bumpVersion and updateVersionFiles functions from version-manager in handleVersionManagement
- Updated project documentation and configuration management
  - docs: restructured and enhanced the entire README file
  - feat: introduced detailed API guide with module descriptions
  - docs: updated configuration guide on environment variables
  - feat: added test helpers and error handling methods in api guide
- Updated environment file naming and .gitignore
  - feat: updated .gitignore to include new environment file formats
  - refactor: changed naming convention for environment files
  - refactor: modified environment file paths in core logic
  - refactor: updated command line arguments to match new environment file names
- Added configuration management
  - feat: added .gitignore to ignore environment files
  - feat: implemented configuration command handler
  - feat: introduced a configuration manager
  - feat: linked configuration command to main file

