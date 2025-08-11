## 5.3.26
11 August 2025

- Refactor commit message handling
	- refactor: modify commit message handling for cross-platform compatibility
	- feat: prepend JIRA ticket to commit message if present and not already
	- fix: update variable reference to use the final commit message instead of the original commit message

## 5.3.25

11 August 2025

- Update internal changelog and filenames for version 5.3.24	- fix: updated internal changelog file name to '.CHANGELOG_internal.md'	- fix: updated package-lock.json version to '5.3.22'

- Update domain in documentation and scripts for version 5.3.18	- docs: changed release URL from 'maiass.dev' to 'maiass.net' in development.md	- refactor: replaced all occurrences of 'maiass.dev' with 'maiass.net' in respective script files	- feat: added conditional checks before copying maiass-windows-x64.exe	- refactor: removed redundant zip creation for maiass-windows-arm64.exe	- chore: updated archive and

- Update internal changelog and filenames	- fix: update internal changelog file name to '.CHANGELOG_internal.md'	- fix: update package-lock.json version to '5.3.22'

- Refactor release script for Windows binary handling	- feat: add conditional checks before copying maiass-windows-x64.exe	- refactor: remove redundant zip creation for maiass-windows-arm64.exe	- chore: update archive and checksum script segment for Windows executables

- Standardize version URLs and release commands	- refactor: standardized version URLs by removing 'v' prefix	- fix: adjust GitHub release commands to not include 'v' prefix	- chore: ensure correct versioning in R2 and GitHub communication

- "Add conditional logic to prevent devlog.sh availability on Windows\n  - refactor: update isDevlogAvailable function to return false if process.platform is 'win32'"

- "Update internal changelog file name and fix package-lock.json version\n  - fix: update internal changelog file name to '.CHANGELOG_internal.md'\n  - fix: update package-lock.json version to '5.3.22'"

- more changes

## 5.3.24
11 August 2025- Update internal changelog and filenames
	- fix: update internal changelog file name to '.CHANGELOG_internal.md'
	- fix: update package-lock.json version to '5.3.22'- Refactor release script for Windows binary handling
	- feat: add conditional checks before copying maiass-windows-x64.exe
	- refactor: remove redundant zip creation for maiass-windows-arm64.exe
	- chore: update archive and checksum script segment for Windows executables- Standardize version URLs and release commands
	- refactor: standardized version URLs by removing 'v' prefix
	- fix: adjust GitHub release commands to not include 'v' prefix
	- chore: ensure correct versioning in R2 and GitHub communication- "Add conditional logic to prevent devlog.sh availability on Windows\n  - refactor: update isDevlogAvailable function to return false if process.platform is 'win32'"- "Update internal changelog file name and fix package-lock.json version\n  - fix: update internal changelog file name to '.CHANGELOG_internal.md'\n  - fix: update package-lock.json version to '5.3.22'"- more changes

## 5.3.23

11 August 2025- "Add conditional logic to prevent devlog.sh availability on Windows\n  - refactor: update isDevlogAvailable function to return false if process.platform is 'win32'"- "Update internal changelog file name and fix package-lock.json version\n  - fix: update internal changelog file name to '.CHANGELOG_internal.md'\n  - fix: update package-lock.json version to '5.3.22'"- more changes



## 5.3.18

3 August 2025- Update domain in documentation and scripts
	- docs: changed release URL from 'maiass.dev' to 'maiass.net' in development.md
	- chore: updated R2_BASE_URL in create-homebrew-formula.sh, deploy-to-r2.sh, and release-and-deploy.sh scripts to 'maiass.net'
	- refactor: replaced all occurrences of 'maiass.dev' with 'maiass.net' in respective script files

- more permissions fix

- fixed permissions issue

- Handle Windows binary copy conditional in release script
	- feat: added conditional checks before copying maiass-windows-x64.exe
	- refactor: removed redundant zip creation for maiass-windows-arm64.exe
	- chore: updated archive and checksum script segment for Windows executables

- Remove 'v' prefix from version URLs and messages
	- refactor: standardized version URLs by removing 'v' prefix
	- fix: adjusted GitHub release commands to not include 'v' prefix
	- chore: ensured correct versioning in R2 and GitHub communication
	- fix: corrected file permissions for copied binaries
	- chore: added copying of .exe files to build directory

- Add MAIASS script documentation and environment variable setup
	- docs: created README in scripts directory detailing all MAIASS scripts
	- chore: added GITHUB_TOKEN entry to .dev.vars.example
	- feat(release): incorporated .dev.vars loading in release-and-deploy.sh to auto-source env variables- more permissions fix

- fixed permissions issue

- Handle Windows binary copy conditional in release script
	- feat: added conditional checks before copying maiass-windows-x64.exe
	- refactor: removed redundant zip creation for maiass-windows-arm64.exe
	- chore: updated archive and checksum script segment for Windows executables

- Remove 'v' prefix from version URLs and messages
	- refactor: standardized version URLs by removing 'v' prefix
	- fix: adjusted GitHub release commands to not include 'v' prefix
	- chore: ensured correct versioning in R2 and GitHub communication
	- fix: corrected file permissions for copied binaries
	- chore: added copying of .exe files to build directory

- Add MAIASS script documentation and environment variable setup
	- docs: created README in scripts directory detailing all MAIASS scripts
	- chore: added GITHUB_TOKEN entry to .dev.vars.example
	- feat(release): incorporated .dev.vars loading in release-and-deploy.sh to auto-source env variables- fixed permissions issue

- Handle Windows binary copy conditional in release script
	- feat: added conditional checks before copying maiass-windows-x64.exe
	- refactor: removed redundant zip creation for maiass-windows-arm64.exe
	- chore: updated archive and checksum script segment for Windows executables

- Remove 'v' prefix from version URLs and messages
	- refactor: standardized version URLs by removing 'v' prefix
	- fix: adjusted GitHub release commands to not include 'v' prefix
	- chore: ensured correct versioning in R2 and GitHub communication
	- fix: corrected file permissions for copied binaries
	- chore: added copying of .exe files to build directory

- Add MAIASS script documentation and environment variable setup
	- docs: created README in scripts directory detailing all MAIASS scripts
	- chore: added GITHUB_TOKEN entry to .dev.vars.example
	- feat(release): incorporated .dev.vars loading in release-and-deploy.sh to auto-source env variables- Handle Windows binary copy conditional in release script
	- feat: added conditional checks before copying maiass-windows-x64.exe
	- refactor: removed redundant zip creation for maiass-windows-arm64.exe
	- chore: updated archive and checksum script segment for Windows executables

- Remove 'v' prefix from version URLs and messages
	- refactor: standardized version URLs by removing 'v' prefix
	- fix: adjusted GitHub release commands to not include 'v' prefix
	- chore: ensured correct versioning in R2 and GitHub communication
	- fix: corrected file permissions for copied binaries
	- chore: added copying of .exe files to build directory

- Add MAIASS script documentation and environment variable setup
	- docs: created README in scripts directory detailing all MAIASS scripts
	- chore: added GITHUB_TOKEN entry to .dev.vars.example
	- feat(release): incorporated .dev.vars loading in release-and-deploy.sh to auto-source env variables- Remove 'v' prefix from version URLs and messages
	- refactor: standardized version URLs by removing 'v' prefix
	- fix: adjusted GitHub release commands to not include 'v' prefix
	- chore: ensured correct versioning in R2 and GitHub communication
	- fix: corrected file permissions for copied binaries
	- chore: added copying of .exe files to build directory

- Add MAIASS script documentation and environment variable setup
	- docs: created README in scripts directory detailing all MAIASS scripts
	- chore: added GITHUB_TOKEN entry to .dev.vars.example
	- feat(release): incorporated .dev.vars loading in release-and-deploy.sh to auto-source env variables- Add MAIASS script documentation and environment variable setup
	- docs: created README in scripts directory detailing all MAIASS scripts
	- chore: added GITHUB_TOKEN entry to .dev.vars.example
	- feat(release): incorporated .dev.vars loading in release-and-deploy.sh to auto-source env variables- Introduce R2 deployment and improve .gitignore
	- feat: created  for example environment variables
	- feat: added new Homebrew formula file
	- feat: implemented  for standalone Node.js execution
	- feat: added  for deploying release binaries to Cloudflare R2
	- fix: removed obsolete checksum files from  and
	- fix: updated  to use R2 URLs, preserving signatures
	- docs: updated development documentation with build and release workflows
	- chore: updated  to

- Update release process and checksums

- chore: updated checksums for all platform binaries
	- feat: added preparation step for binary code signing
	- refactor: modified script to prioritize signed binaries for release







## 5.3.10



2 August 2025- Update release process and checksums

- chore: updated checksums for all platform binaries
	- feat: added preparation step for binary code signing
	- refactor: modified script to prioritize signed binaries for release- Improve build scripts for reliability and flexibility
	- refactor(advanced-build.sh): disabled nexe builds due to incompatibilities
	- refactor(release-and-deploy.sh): updated to use Bun-built binaries when available
	- fallback(release-and-deploy.sh): added PKG-built binaries as a secondary option
	- feat(release-and-deploy.sh): implemented error handling for missing binaries

- Refactored build scripts for standalone file usage
	- refactor: updated package.json to use  for , , and  input
	- refactor: removed unused > pkg@5.8.1
	- > Error! Entry file/directory is expected
	- Pass --help to see usage information scripts and assets configuration in package.json
	- refactor: altered  to require  for PKG and Nexe builds
	- refactor: removed platform loop in  and built for each specific platform with updated standalone references
	- refactor: adjusted Bun build process in  to handle standalone file and renamed platform outputs

- Update dependencies and configurations
	- chore: upgraded package version from 0.7.1 to 5.3.6
	- chore: switched maiass bin from .mjs to .cjs
	- chore: added nexe as a devDependency
	- chore: added several new devDependencies including webpack and ajv packages- Refactored build scripts for standalone file usage
	- refactor: updated package.json to use  for , , and  input
	- refactor: removed unused > pkg@5.8.1
	- > Error! Entry file/directory is expected
	- Pass --help to see usage information scripts and assets configuration in package.json
	- refactor: altered  to require  for PKG and Nexe builds
	- refactor: removed platform loop in  and built for each specific platform with updated standalone references
	- refactor: adjusted Bun build process in  to handle standalone file and renamed platform outputs

- Update dependencies and configurations
	- chore: upgraded package version from 0.7.1 to 5.3.6
	- chore: switched maiass bin from .mjs to .cjs
	- chore: added nexe as a devDependency
	- chore: added several new devDependencies including webpack and ajv packages- Update dependencies and configurations
	- chore: upgraded package version from 0.7.1 to 5.3.6
	- chore: switched maiass bin from .mjs to .cjs
	- chore: added nexe as a devDependency
	- chore: added several new devDependencies including webpack and ajv packages- Updated release process and scripts
	- feat: added code signing for macOS binaries in release.yml
	- refactor: modified release asset creation to include signature-preserving archives
	- refactor: updated instructions and details in release descriptors
	- feat: added quick-release.sh for building, signing, and uploading
	- feat: added release-and-deploy.sh for complete automated release process, including Homebrew update.

- Improved code signing and binary hashing
	- feat(scripts): added advanced options to code signing in codesign.sh
	- feat(scripts): added Gatekeeper assessment to code signing in codesign.sh
	- refactor(scripts): changed binary hashing to archive hashing in create-homebrew-formula.sh
	- refactor(scripts): changed binary links to archive links in create-homebrew-formula.sh
	- feat(scripts): added binary archiving in create-release.sh
	- feat(scripts): added Gatekeeper assessment in create-release.sh
	- refactor(scripts): added archive hashing in create-release.sh
	- docs(scripts): updated next steps instructions in create-release.sh

- Upgrade to release process and checksum generation
	- feat: added new checksums for various platforms in checksums.txt
	- fix(scripts): revised create-homebrew-formula.sh to prefer x64 over intel
	- fix(scripts): amended copy command in create-release.sh from "maiass-macos-intel" to "maiass-macos-x64"
	- feat(scripts): incorporated code signature verification in create-release.sh for macOS binaries

- Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages- Improved code signing and binary hashing
	- feat(scripts): added advanced options to code signing in codesign.sh
	- feat(scripts): added Gatekeeper assessment to code signing in codesign.sh
	- refactor(scripts): changed binary hashing to archive hashing in create-homebrew-formula.sh
	- refactor(scripts): changed binary links to archive links in create-homebrew-formula.sh
	- feat(scripts): added binary archiving in create-release.sh
	- feat(scripts): added Gatekeeper assessment in create-release.sh
	- refactor(scripts): added archive hashing in create-release.sh
	- docs(scripts): updated next steps instructions in create-release.sh

- Upgrade to release process and checksum generation
	- feat: added new checksums for various platforms in checksums.txt
	- fix(scripts): revised create-homebrew-formula.sh to prefer x64 over intel
	- fix(scripts): amended copy command in create-release.sh from "maiass-macos-intel" to "maiass-macos-x64"
	- feat(scripts): incorporated code signature verification in create-release.sh for macOS binaries

- Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages- Upgrade to release process and checksum generation
	- feat: added new checksums for various platforms in checksums.txt
	- fix(scripts): revised create-homebrew-formula.sh to prefer x64 over intel
	- fix(scripts): amended copy command in create-release.sh from "maiass-macos-intel" to "maiass-macos-x64"
	- feat(scripts): incorporated code signature verification in create-release.sh for macOS binaries

- Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages- Updated binary hashing in Homebrew formula creation
	- feat: updated script to download and hash binaries from actual GitHub release
	- fix: improved error handling if binary download fails
	- refactor: clarity improvements to status and error messages- Updated maiass.sh and nodemaiass.sh scripts
	- fix: updated node command to use .cjs modules in maiass.sh and nodemaiass.sh scripts

- Updated script for Homebrew formula creation and added binary file for testing
	- refactor(scripts): change process for retrieving SHA256 hashes in Homebrew script
	- feat: added new test binary file

- Updated code signing for macOS and Windows binaries
	- feat: added certificate files to .gitignore
	- feat: added code signing for .exe files in build.js
	- docs: created new detailed documents on code signing for both platforms
	- feat: added new scripts for code signing and signature verification for individual binaries

- Updated .gitignore and removed unused Formula file
	- feat: added 'Formula/maiass.rb' to .gitignore
	- fix: deleted unused 'Formula/maiass.rb' file

- Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag- Updated code signing for macOS and Windows binaries
	- feat: added certificate files to .gitignore
	- feat: added code signing for .exe files in build.js
	- docs: created new detailed documents on code signing for both platforms
	- feat: added new scripts for code signing and signature verification for individual binaries

- Updated .gitignore and removed unused Formula file
	- feat: added 'Formula/maiass.rb' to .gitignore
	- fix: deleted unused 'Formula/maiass.rb' file

- Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag







## 5.2.9



2 August 2025- Updated .gitignore and removed unused Formula file
	- feat: added 'Formula/maiass.rb' to .gitignore
	- fix: deleted unused 'Formula/maiass.rb' file

- Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag- Update Maiass formula and related scripts
	- feat: updated Maiass version in brew formula to 5.2.7
	- fix: remodeled URL structure in Maiass formula and creation script
	- feat: added new symlink names for main MAIASS tool
	- fix: streamlined 'create-homebrew-formula.sh' layout
	- fix: updated URL patterns in 'create-release.sh' removing v from version tag- Update MAIASS homebrew formula and script
	- fix: update maiass sha256 checksum in homebrew formula
	- refactor: remove superfluous 'v' from download URLs in homebrew formula and shells script

- Updated feature name and implemented version update checker
	- refactor: Changed feature name from 'AI-Assisted Semantic Savant' to 'AI-Augmented Semantic Scribe'
	- fix: Adjusted associated references in documentation and code for the new feature name
	- feat: Added functionality to check for version updates from the GitHub releases
	- fix: Updated brew configuration to correctly define augmented semantic scribe
	- feat: Updated package.json with new version and adjusted description.

- Project Maintenance and Improvement
	- feat: Added GPL-3.0-only license
	- fix: Adjusted package version according to recent changes
	- feat: Added new Modular AI-Assisted Semantic Savant feature to the project
	- doc: Overhauled README with updated descriptions and examples
	- fix: Updated brew configuration to correctly tap into maiass instead of nodemaiass
	- refactor: Deleted old maiassnode.rb file
	- feat: Modified Homebrew setup script to accommodate updates
	- doc: Ignored additional files (HOMEBREW_TAP_SETUP.md, script creations) on .pkgignore
	- doc: Copied updated maiass.rb Homebrew formula to homebrew

- Set release ignore rules, enhance release and pkgignore files
	- feat: created .gitattributes to manage release ignoring rules
	- docs(release.yml): added note for using binary downloads not source code archives
	- feat(.pkgignore): added more rules to pkgignore
	- docs(RELEASE_TEMPLATE.md): updated version numbers, added Linux ARM64 support and repeated note about binary downloads

- Updated script and test files to reflect name change of main script
	- refactor: Updated name of CLI script from "maiassnode" to "maiass"
	- refactor: Revised file directories in scripts and tests to reflect new script name
	- docs: Updated documentation for script usage and module interactions based on new name

- Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files

- Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script

- Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh

- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md

- Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection

- Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line

- Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag

- Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits

- Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well

- Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits

- Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs

- Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function- Updated feature name and implemented version update checker
	- refactor: Changed feature name from 'AI-Assisted Semantic Savant' to 'AI-Augmented Semantic Scribe'
	- fix: Adjusted associated references in documentation and code for the new feature name
	- feat: Added functionality to check for version updates from the GitHub releases
	- fix: Updated brew configuration to correctly define augmented semantic scribe
	- feat: Updated package.json with new version and adjusted description.- Project Maintenance and Improvement
	- feat: Added GPL-3.0-only license
	- fix: Adjusted package version according to recent changes
	- feat: Added new Modular AI-Augmented Semantic Scribe feature to the project
	- doc: Overhauled README with updated descriptions and examples
	- fix: Updated brew configuration to correctly tap into maiass instead of nodemaiass
	- refactor: Deleted old maiassnode.rb file
	- feat: Modified Homebrew setup script to accommodate updates
	- doc: Ignored additional files (HOMEBREW_TAP_SETUP.md, script creations) on .pkgignore
	- doc: Copied updated maiass.rb Homebrew formula to homebrew

- Set release ignore rules, enhance release and pkgignore files
	- feat: created .gitattributes to manage release ignoring rules
	- docs(release.yml): added note for using binary downloads not source code archives
	- feat(.pkgignore): added more rules to pkgignore
	- docs(RELEASE_TEMPLATE.md): updated version numbers, added Linux ARM64 support and repeated note about binary downloads

- Updated script and test files to reflect name change of main script
	- refactor: Updated name of CLI script from "maiassnode" to "maiass"
	- refactor: Revised file directories in scripts and tests to reflect new script name
	- docs: Updated documentation for script usage and module interactions based on new name

- Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files

- Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script

- Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh

- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md







## 1.2.12



2 August 2025- Set release ignore rules, enhance release and pkgignore files
	- feat: created .gitattributes to manage release ignoring rules
	- docs(release.yml): added note for using binary downloads not source code archives
	- feat(.pkgignore): added more rules to pkgignore
	- docs(RELEASE_TEMPLATE.md): updated version numbers, added Linux ARM64 support and repeated note about binary downloads

- Updated script and test files to reflect name change of main script
	- refactor: Updated name of CLI script from "maiassnode" to "maiass"
	- refactor: Revised file directories in scripts and tests to reflect new script name
	- docs: Updated documentation for script usage and module interactions based on new name

- Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files

- Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script

- Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh

- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md







## 1.2.11



1 August 2025- Updated GitHub actions and documentation for cross-platform release
	- feat: updated filenames from "maiassnode" to "maiass" in copying & renaming step
	- feat: added executable permissions for "maiass" binaries
	- feat: updated shasum command from "maiassnode" to "maiass"
	- fix: revised tag name message format in echo command logic
	- fix: changed value of name from "MAIASSNODE" to "maiass" in release action
	- docs: updated references from "maiassnode" to "maiass" in description and download links
	- feat: added references to maiass-linux-arm64 and maiass-windows-arm64.exe in release files

- Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script

- Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh

- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Updated release script for additional platforms
	- feat: Added support for MacOS ARM64 in release script
	- feat: Added support for Linux ARM64 in release script
	- feat: Added support for Windows ARM64 in release script

- Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh

- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Refactoring script and file names
	- refactor: updated output file names in build.js
	- refactor: modify repo path in create-release.sh
	- refactor: adjusted names when copying binaries in create-release.sh
	- refactor: changed executable file names in create-release.sh

- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Refactoring build process and release script
	- feat(build.js): mapped targets to output filenames
	- feat(build.js): improved build directory check and cleanup
	- fix(package.json): removed unused scripts in pkg section
	- feat(scripts/create-release.sh): refactored release binaries copy process
	- fix(scripts/create-release.sh): updated chmod and shasum commands to match new filenames
	- cleanup(scripts/create-release.sh): removed unnecessary comments and conditions

- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Updated script files
	- fix(build.js): corrected project name in build script
	- feat(.pkgignore): added scripts/ path to package ignore list

- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Added .DS_Store to .pkgignore
	- feat: ignore .DS_Store files in packaging

- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Updated package building and release script
	- feat: added .pkgignore to exclude development files from builds
	- feat(package.json): included relevant files to assets in package.json
	- fix(scripts): removed premature exit command from create-release.sh

- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Removed unneeded test files
	- feat: Deleted test-credit-display.js
	- feat: Deleted test-file.txt
	- feat: Removed test-install.sh
	- feat: Erased test.env

- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Renamed internal changelog file
	- refactor: renamed CHANGELOG_internal_bak.md to CHANGELOG_internal.md

- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Stop creating new internal changelog if not existent
	- refactor: removed CHANGELOG_internal.md
	- refactor(maiass-pipeline): stopped creating new internal changelog if it doesn't exist

- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Update internal CHANGELOG file
	- refactor: renamed CHANGELOG_internal.md to CHANGELOG_internal_bak.md- Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection

- Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line

- Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag

- Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits

- Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well

- Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits

- Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs

- Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function







## 1.1.10



1 August 2025- Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection

- Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line

- Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag

- Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits

- Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well

- Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits

- Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs

- Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function- Improved command line user input handling and commit message suggestion
	- feat: added handling for invalid user inputs during commit message creation
	- refactor: improved visibility of user prompts and data handling during single character input collection
	- fix: resolve process exiting prematurely by maintaining original raw mode state during input collection

- Update Changelog file
	- fix: revised 'No relevant commits found for changelog' behavior
	- fix: updated treatment for absence of internal changelog commits from version bump entry
	- style: relocated formattedCommits definition in updateInternalChangelog function
	- remove: deleted 'Version bump' line

- Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag

- Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits

- Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well

- Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits

- Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs

- Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function- Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag

- Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits

- Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well

- Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits

- Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs

- Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function- Updated maiass-pipeline.js to improve git commit handling
	- feat: modified method of acquiring latest git tag
	- feat: introduced fallback for no git tags to get all commits
	- feat: added filtering logic to exclude empty commit message lines
	- refactor: removed default 'Version bump' for lack of formatted commits
	- refactor: improved git logs command flexibility for main and internal changelogs
	- refactor: replaced hardcoded last tag with dynamically fetched git tag

- Updated Changelog and Behavior Fixes
	- docs: updated CHANGELOG.md content
	- fix: revised behavior for empty commits in changelog
	- fix: adjusted treatment for absent internal changelog commits

- Refined changelog update process
	- fix: made log warnings more precise about changelog updates when no commits present
	- refactor: modified changelog generation process to add formatted commits selectively
	- refactor: mirrored these changes for updateInternalChangelog function as well

- Updated Changelog and Warning Messages
	- docs: revised Changelog for version 1.1.3
	- fix: updated warning messages and skip behavior for empty commits

- Refactored changelog update logic
	- feat: Added conditional logic for updating changelog regardless of relevant commits
	- refactor: Reconfigured message formatting of commit messages
	- fix: Adjusted logic for handling of internal changelogs

- Improved Maiass pipeline logging and branch handling
	- refactor: replaced logger with log in Maiass pipeline
	- feat: added cache for finalBranch and originalBranch to avoid repeating git calls
	- feat: included logging for final branch after attempted switch
	- refactor: encapsulated debug file writing logic within try-catch block to prevent blocking of pipeline completion

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function

- Updated warning messages and handling for empty commits
	- fix: revised 'No relevant commits found for changelog' behavior to skip changelog update
	- fix: changed treatment for absent internal changelog commits from version bump entry to skipping update
	- style: moved formattedCommits definition closer to its usage in updateInternalChangelog function- Version bump







## 1.0.34



1 August 2025- Version bump- Improved handling of commit logs
	- refactor: updated condition for executing changelog commits processing
	- feat: added proceed action when no commits are found
	- refactor: modified commit processing only to execute if commits exist
	- feat: added version bump fallback for change logs with no commits
	- refactor: unified fallback to version bump when no changelogs are found
	- feat: added tool's capability to create version bump entry for internal changelog- Updated version tagging workflow
	- feat: added options for version bump and tagcreation in handleMergeToDevelop
	- feat: added functionality to decide tagging strategy
	- feat: Split release handling into simple bump and full release branch workflow
	- feat: Simple bump updates version and skips release branch and tagging
	- feat: Full release workflow includes release branch creation and tagging
	- feat: Updated return message with workflow used
	- fix: Made failure messages in git operations more consistent
	- chore: Removed redundant and commented out code sections.
	- style: Cleaned up logging and commenting for readability improvement- Refactor commit handler
	- refactor(lib): removed verbosity check in handleStagedCommit function

- Simplified debug check in handleStagedCommit function
	- fix(lib): remove unnecessary condition from debug check

- Improved git command handling and added debug verbosity
	- fix: changed default silent parameter value in executeGitCommand function
	- feat: added function to display git push command under debug verbosity
	- refactor: adjusted conditional check within handleStagedCommit function- Updated default parameter in executeGitCommand function
	- refactor: changed silent's default value from false to 'pipe' in executeGitCommand

- Enhancements to Logging and Error Management in the MAIASS system
	- feat: implemented a debug buffer system for logging sessions in logger.js
	- feat: added methods to initialize a debugging session, add entries to the buffer and retrieve it
	- feat: ability to write debug content to a temporary file
	- feat: ability to retrieve current debug session info in logger.js
	- refactor: enhanced error logging in logger.js to include debug buffer
	- feat: added logging side-effect to executeGitCommand() in maiass-pipeline.js for better output tracking
	- feat: improved error management in executeGitCommand() function
	- feat: debug information are now written to a file when there's an error

- Refactor log handling in version-manager
	- refactor: replaced console.log with logger.debug for .env.maiass content display- Refactor configuration handling
	- refactor: revised parameter order in  in  to include global option
	- feat: added  option in  in  to allow global key value setting
	- feat: updated  in  to use  method for determining the config path based on  option- Refactored pipeline.js logic and improved debugging
	- feat: added condition to handle user-cancelled merges gracefully in runMaiassPipeline function
	- refactor: replaced console.debug with logger.debug for better logging in branchExists function

- Improved commit and pipeline handling
	- feat: display git status in detailed format
	- feat: enhanced handling for unstaged/untracked changes
	- fix(lib): improved messaging and error handling for different commit states
	- feat: added conditionals to handle commit workflow cancellation and uncommitted changes in pipeline mode
	- feat: included additional exit points in various commit/pipeline stages
	- feat: handle clean working directory state check after commit workflow

- Refactor input utility methods
	- refactor: moved getSingleCharInput and getMultiLineInput to input-utils.js
	- fix: autoformatted user prompts for increased visibility
	- refactor: cleaned up manage input methods in commit.js
	- refactor: removed color formatting from prompt calling methods in maiass-pipeline.js

- Updated Maiass pipeline logic
	- feat: Added line to pause execution in handleMergeToDevelop function- Updated logger functionality and streamlined pipeline code
	- feat: added BWhite logging method in logger.js
	- refactor: simplified logger usage in maiass-pipeline.js

- Updated logging methods in maiass-pipeline.js
	- fix(code): replaced logger.White with logger.log.BWhite for currentBranch output

- Updated color configurations and trimming functions
	- feat(lib/colors.js): add BSoftPink and SoftPink color definitions
	- fix(lib/commit.js): trim whitespace from edited and AI suggested commit messages
	- refactor(lib/logger.js): changed MAIASS branding color to BSoftPink and modified log settings

- Refined logging and prompting capabilities, added new config options
	- feat(lib): introduced 'critical' and 'prompt' log levels
	- feat(lib): added shouldLog function based on verbosity in logger.js
	- refactor(lib): replaced certain log.info calls with log.critical in commit.js
	- refactor(lib): changed MAIASS_PREFIX icon in logger.js
	- feat(lib): added 'autoSwitch' variable to control version mgmt in maiass-pipeline.js
	- feat(lib): introduced new symbol 'maiassass' in symbols.js
	- feat: added new command line options '--commits-only, -c' and '--auto-stage, -a' in maiass.mjs
	- -- Improved application naming and documentation
	- refactor: renamed maiass.mjs to maiass.mjs
	- docs: updated command references in cross-platform documentation
	- docs: updated command references in node compatibility documentation
	- build: modified references in package.json script section and pkg property
	- refactor: removed maiass.mjs file from the project- Updated install script
	- fix: corrected repository path in install.sh
	- feat: updated binary name in install.sh- Enhanced AI key management and added machine fingerprinting
	- feat: Added functionality to auto-create anonymous subscriptions if no API key exists
	- feat: Added new module for generating a unique machine fingerprint for abuse prevention
	- refactor: Updated API requests to include the machine fingerprint
	- test: Created test file for credit display functionality







## 1.0.22



31 July 2025- Improved MAIASS functionalities and user experience
	- feat: added new color functions  and  in colors.js
	- refact: removed redundant logic and enhanced error messages related to AI API request in commit.js
	- feat: added credit usage breakdown with details in commit.js
	- chore: updated project context title in .windsurf
	- docs: added 'Debug Mode Token Validation' section in README.maiass.md
	- feat: created new file CREDIT_IMPROVEMENTS.md outlining credit display enhancements and other safety features

- Updated pertinently the logger, refined API interaction, and more
	- feat: Revamped logger for better debugging
	- feat: Altered handling of requests to API with enhanced timeouts, error handling, and logging
	- fix: Directed error feedback to match with the new Logger usage replacing previous console errors
	- chore: Removed compatibility with pkg from CommonJs
	- fix: Broadened error notifications for AI suggestion failures. Added stack if available and specific error handling for common network issues.- Refined commit messaging and added new color functions
	- feat: added new color functions in colors.js
	- fix: improved token counting mechanism in commit.js
	- feat: added blueOnWhite logging property in logger.js
	- style: modified how log messages are presented in commit.js- Refactored code related to user prompts and session usage
	- feat: introduced enhanced credit display
	- feat: added warning before every AI suggestion
	- fix: improved Ctrl+C handling in raw and readline interfaces
	- feat: added AI usage breakdown details
	- feat: added low credit warning- Improved debug mode and enhanced documentation
	- fix: updated context title in .windsurf
	- docs: added explanation for Debug Mode Token Validation in README
	- feat: introduced new token-validator.js for debugging API tokens
	- feat: integrated token-validator in main application (maiass.mjs)







## 1.0.16



28 July 2025- Removed unused binary build files and tweaked logging in maiass-pipeline.js
	- chore: deleted maiass-arm64 build file
	- chore: deleted maiass-x64 build file
	- refactor: remove redundant logging line in validateAndHandleBranching
	- style: changed logger output color to blue for 'Phase 1: Branch Detection and Validation' message- Implemented AI symbol and updated AI message identifier
	- feat(symbols): added new 'brain' symbol for AI
	- refactor(commit): changed AI suggestion message symbol from 'INFO' to 'BRAIN'

- Improved logging output symbolism
	- feat: introduced distinct symbols for different logging operations
	- refactor: replaced standard logging symbols with detailed ones for merging, pulling and pushing actions- Updated logger symbol in pipeline
	- refactor: changed logger symbol from INFO to GEAR in maiass-pipeline.js- Updated logging functionality and error handling
	- refactor: replaced SYMBOLS.INFO with SYMBOLS.GEAR in logging messages
	- feat: incorporated error handling using logger instead of console.error
	- refactor: updated all console.log statements to use the logger module
	- feat: added more descriptive log messages for git operations- Refactored logging framework for enhanced error management
	- feat(logger.js): added a debugging method to logger
	- feat(devlog.js, version-manager.js): replaced console.log with custom logger methods
	- fix(version-manager.js): managed exceptions for file reading/navigating errors

- Updated logging in maiass-pipeline.js
	- feat: replaced console.log with a logger
	- feat: started logging current branch and version information
	- fix: replaced console.error with logger for error handling- Updated logging in maiass-pipeline.js
	- refactor: replaced console.log with logger for better debuguity
	- refactor: replaced console.error with logger.error for better error tracking
	- refactor: replaced console.success with logger.success for improved success message tracking
	- refactor: refined logger messages
	- refactor: streamlined calls to use git commands through logger functionality- Updated logger and main packages
	- refactor: Changed log.info to log.aisuggestion in commit.js
	- feat: Imported logger from './lib/logger.js'
	- refactor: Replaced console.log with logger.header in maiass.mjs file
	- style: Changed text color to bright yellow in logger
	- refactor: Removed MAIASS_PREFIX from aisuggestion log method
	- feat: Added aisuggestion method to logger.js
	- fix: Updated logging call for aiSuggestion
	- feat: Added bold lime color function to colors.js
	- refactor: Version and description update in package.json

- Updated documentation and code to reflect changes in project name
	- docs: Updated README, documentation, and scripts to change name to "Semantic Scribe"
	- refactor: Updated JavaScript files to change project name display to "Semantic Scribe"
	- feat: Added new symbol 'maiassdot' in symbols.js
	- refactor: Removed logger.header line in maiass.mjs
	- fix: Updated project description in package.json- Refactor log method in commit.js
	- refactor: changed log.info to log.aisuggestion in commit.js

- Updated logging in maiass.mjs
	- feat: imported logger from './lib/logger.js'
	- refactor: replaced console.log with logger.header for displaying version
	- chore: added a blue colored horizontal line for better UI- Updated style and behavior of logger
	- style(logger): changed text color to bright yellow
	- refactor(logger): removed MAIASS_PREFIX from aisuggestion log method

- Updated logger functionality
	- feat: added aisuggestion method to logger.js

- Improved logging in commit.js
	- fix: updated logging call for aiSuggestion- Added new color to colors.js
	- feat: added bold lime color function to colors.js- Updated logger functionality
	- feat: added bold parameter to logger methods
	- fix: updated color selection based on boldness- Updated message in maiass-command.js
	- fix: corrected application name in thank you message- Updated logging systems in maiass and removed unnecessary logs
	- refactor(maiass): replace console.log with the logger system for better output control
	- refactor(maiass): change user prompts to use the logger system instead of console.log
	- fix(maiass): correct comment typo on commit functionality script
	- fix(maiass): remove unnecessary log commenting on ES module import success
	- style(maiass): remove excess white spaces in commitThis function







## 0.9.7



28 July 2025- Enhanced Wordpress Integration and Debugging Information
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



27 July 2025- Updated files to utilize common JS execution
	- fix: replaced 'maiass.mjs' with 'maiass.cjs' in debug-git-test.js
	- fix: changed file path for 'maiass.mjs' to 'maiass.cjs' in test-runner.js- Updated test scripts to use .mjs node files
	- fix: change reference from maiass.js to maiass.mjs in debug-git-test.js
	- fix: modify path to maiass.mjs in test-runner.js- Improved git release workflow
	- feat: added write permissions for creating releases
	- feat: extended checkout action for fetching all history and tags
	- feat: enhanced mechanism for getting latest git tag with default value set when no tags found- Update create-release.sh script and enhance branching flows
	- feat: add current branch detection
	- feat: add options for merging branches
	- feat: improve branch-switching handling in script
	- fix: improve error handling for invalid user choice- Updated GitHub release workflow triggers
	- fix(workflow): change release trigger condition to main branch update or workflow dispatch event







## 0.7.12



27 July 2025- Changed command option in devlog.js
	- fix: updated the second parameter from "0" to "?" in devlog.js command execution- Refine devlog logs
	- refactor: remove extra log from devlog for cleaner output- Updated devlog.js to handle different parameters
	- fix: corrected second parameter in devlog.sh command- Refactored devlog command parameters
	- fix: removed unused 'type' parameter from devlog.sh command execution in devlog.js- Refactor logging and merging operations
	- refactor(devlog): switched execution from synchronous to asynchronous
	- fix(commit): handleStagedCommit now passes along the entire gitInfo object
	- refactor(devlog): replace default names with clearly outlined  attributes
	- feat(devlog): extractDevlogContext to separate gitInfo context extraction logic
	- feat(devlog): use extracted context in logCommit and logMerge functions
	- refactor(maiass-pipeline): pass along originalGitInfo to logMerge function in handleMergeToDevelop method- Refined debugging messages in devlog.js
	- feat: added logging of messages to devlog.sh
	- fix: corrected the error and debug message handling
	- refactor: streamlined debug message print conditions

- Improve debug handling in devlog
	- feat: introduced condition for command execution during debug
	- refactor: reordered execSync command execution
	- fix(devlog): revised handling for both debug and non-debug scenarios- Improved output capture in devlog
	- fix: replaced trim method in execSync command output capture in devlog.js
	- feat: added functionality for logging full command result, including errors

- Modify devlog.js functionality
	- refactor: changed console output behavior within logThis function
	- feat: added silent execution of command for cleaner log display

- Added debug message for devlog.sh command execution
	- feat: add debug message condition in devlog.js to show the executed command if MAIASS_DEBUG is set to true- Integrate devlog functionality and improve commit and merge logging
	- feat: added devlog functionality as a separate module
	- feat: implemented commit logging to devlog in 'commit.js'
	- feat: introduced merge logging in 'maiass-pipeline.js' within 'handleMergeToDevelop' and 'handleVersionManagement'
	- feat: created 'devlog.js' file with multiple utility functions for development logging- Updated AI endpoint and configuration
	- fix: Changed default AI endpoint in commit.js
	- docs: Removed MAIASS_AI_ENDPOINT from configuration.md
	- refactor: Updated MAIASS variable references to non-branded AI in maiass-variables.js- Update project configuration and variables related to AI
	- feat: renamed all occurrences of 'OPENAI' to 'AI' in variables and configuration files
	- docs: updated README and documentations to reflect the changes made in configuration and variable names
	- test: updated test setup to use the renamed AI_MODE configuration variable







## 0.7.1



25 July 2025- Updated symbols.js
	- feat: Added new emoji and ascii representations for symbols







## 0.6.28



25 July 2025- Updated merging process in maiass-pipeline
	- feat: added silent option to handleMergeToDevelop function
	- feat: automated merge command reply when in silent mode

- Introduced silent mode for automated approval
	- feat(lib): added silent mode for automated commit approval
	- feat(lib): integrated silent mode into the command handler module
	- feat(lib): integrated silent mode into the pipeline module
	- feat(maiass.js): Added silent mode CLI option for automated prompts approval- Refactored changelog update function
	- fix: updated regex to filter irrelevant commits in updateChangelog function- Improved changelog update filtering
	- refactor: improved readability by moving check for irrelevant commits directly into return statement
	- fix: corrected regular expression to better identify JIRA tickets- Improved commit message filtering in Changelog updates
	- fix: updated commit filtering regex in updateChangelog function- Refactored maiass-pipeline.js filter conditions
	- refactor: simplified filtering conditions in updateChangelog function- Updated Changelog and Maiass Pipeline code
	- refactor: improved line filtering in maiass-pipeline.js
	- refactor: simplified commit filtering logic in updateChangelog function
	- feat: added check for existing changelog, creating new if non-existent
	- feat: updated or prepended new entries based on version and date
	- fix: resolved issue of new entries overwriting entire changelog
	- refactor: updated variable names for clarity
	- fix: modified git log command format in maiass-pipeline.js
	- refactor: replaced const with let for commit message formatting
	- style: improved readability of commit formats in maiass-pipeline.js
	- docs: removed entries in CHANGELOG.md- Update line filters in maiass-pipeline.js
	- refactor: improved filtering by adding dashAuthor and withSha conditions
	- refactor: updated return to use dashAuthor instead of shouldInclude for better accuracy- Updated maiass-pipeline logic
	- refactor: simplified commit filtering logic in updateChangelog function- Updated internal changelog creation logic
	- feat: added check for existing changelog and create new if non-existent
	- feat: updated or prepended new entries based on version and date
	- fix: resolved issue of new entries overwriting entire changelog
	- refactor: updated variable names for clarity- Updated Git Command Execution in Maiass Pipeline
	- fix: modified format of git log command in maiass-pipeline.js- Updated Git log format in Maiass Pipeline
	- fix: updated git log formatting in executeGitCommand for better readability- Updated maiass-pipeline.js
	- fix: changed the format of internal log result in updateChangelog function- Improved formatting of commit messages and cleaned up CHANGELOG
	- refactor(maiass-pipeline): replaced const with let for commit message formatting
	- style(maiass-pipeline): improved readability of commit formats
	- docs: removed entries in CHANGELOG.md- Implemented several revisions to changelog updates
	- feat: Added functionality for retrieving commit messages with author details
	- fix: Resolved issues with commit message processing for the main changelog
	- refactor: Modified how internal commit messages are extracted
	- style: Cleaned up code for better readability and maintenance- Updated CHANGELOG_internal.md
	- docs: bumped version in CHANGELOG_internal.md
	- feat: merged feature/VEL-405_changelog_fixes branch into develop

- Revert "VEL-405 Refactor commit logging in changelog update pipeline"

- This reverts commit 097ffbc05a462404ba5432e39c69db9a275c859b.- Revert "VEL-405 Refactored changelog update function"

- This reverts commit 74a774dd07178a666bbce867e06c7ba7b023dceb.- Refactored changelog update function
	- feat: added execution of git command to get raw internal log
	- refactor: changed how internal commit messages are processed and filtered
	- refactor: improved formation of formatted internal commits
	- refactor: updated writing to internalChangelog file- Improved log output in maiass-pipeline.js
	- fix: Removed commit hash from internalLogResult output in maiass-pipeline.js







## 0.6.0



24 July 2025- Update to version 0.5.8 with changelog improvements and error handling
	- feat: Changed git command for internal log in maiass-pipeline.js
	- fix: Enhanced error handling for internal changelog extraction
	- docs: Added details on automated changelog generation to README







## 0.5.8



24 July 2025- Improved internal changelog extraction
	- feat: Changed commit log command to include full commit message and author name
	- fix: Improved error handling when failing to get commits for internal changelog- Update README and maiass-pipeline.js with changelog generation
	- docs(README): add automated changelog generation to features and config instructions
	- docs(README): elaborate on dual changelog system, including format and features
	- feat(maiass-pipeline.js): import fs/promises module for filesystem operations- Update Maiass Pipeline functionality
	- feat: imported path package in maiass-pipeline
	- docs: added comment about commit message formatting for internal changelog- Updated commit message filtering for maiass-pipeline
	- feat: added code to clean up commit messages
	- fix: removed empty lines and trailing newlines from each commit- Updated version tagging in Maiass pipeline
	- refactor: default to true for version tagging
	- style: commented out previous implementation of version tagging- Refactoring of updateChangelog function
	- feat: updated the changelog update function to use current version info
	- refactor: removed redundant git command execution for lastTag retrieval
	- fix: adjusted console message while skipping changelog update due to lack of current version- Updated changelog and pipeline.js implementations
	- refactor: altered indented bullet inclusion for changelogs to prevent double bullets
	- refactor: removed file system module reference in updateInternalChangelog function
	- refactor: changed path of internalChangelogPath for consistency
	- refactor: replaced the implementation of updateInternalChangelog with improved logic handling commit message formatting
	- refactor: updated content generation in updateInternalChangelog making it more efficient
	- fix: incorporated better error handling when no commit messages are available
	- refactor: streamlined updateInternalChangelog code by removing redundant code blocks

- Updated Changelog Creation and Error Handling Processes
	- feat: added condition to skip changelog update if no previous tag found
	- feat: included log messages alongside getting commit messages since last tag
	- feat: separated main and internal changelog commit retrievals
	- feat: internal changelog keeps JIRA tickets in commit messages
	- refactor: simplified and improved internal changelog creation logic
	- fix: corrected issues in error handling when updating changelogs
	- docs: updated comments for better clarity and understanding of code functionality

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
	- feat: linked configuration command to main file- Updated Changelog Creation and Error Handling Processes
	- - feat: added condition to skip changelog update if no previous tag found
	- - feat: included log messages alongside getting commit messages since last tag
	- - feat: separated main and internal changelog commit retrievals
	- - feat: internal changelog keeps JIRA tickets in commit messages
	- - refactor: simplified and improved internal changelog creation logic
	- - fix: corrected issues in error handling when updating changelogs
	- - docs: updated comments for better clarity and understanding of code functionality







## 0.5.0



23 July 2025- Improved commit processing and auto-tagging
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







## 0.4.1



23 July 2025- Updated Changelog creation and code refactoring
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
	- feat: linked configuration command to main file- VEL-405 Updated changelog creation and formatting logic
	- feat: added logic to pull commit messages since last tag in changelog update
	- refactor: changed appending method to changelog file depending on commit history
	- feat: implemented commit message formatting for proper changelog display
	- fix: handled errors more gracefully during changelog update process

- VEL-404 Refactored version management and added auto-tagging feature
	- feat: added option for automatic version tagging based on environment config
	- refactor: refactored version tagging to include auto-tagging or user prompt
	- feat: included new MAIASS_AUTO_TAG_RELEASES environment variable

- VEL-404 Updated maiass-pipeline.js to return to the original branch after pipeline execution
	- feat: Added check for branch switch during pipeline operation and return to original branch if switched.
	- feat: Implemented log messages to display status of branch switching operation.

- Updated maiass-pipeline for better error handling
	- fix: improved Git error logging for Pull, Merge, Check Out and Push operations
	- feat: added detailed output results for git operations
	- fix: enhanced success condition checks for git operations
	- refactor: streamlined git command lines by embedding them in executeGitCommand calls

- VEL-404 Improved git command execution and error handling
	- fix: remove 'git' from string in execSync call
	- feat: add error output for failed git commands
	- fix: append 'git' to branch and remote related commands
	- docs: clarify comments on branch switching function

- VEL-404 Improved version management in pipeline
	- feat: Added checkRemoteExists function to check if a git remote exists
	- feat: Implemented updateChangelog function to update the project's changelog with new version
	- refactor: Significantly expanded and refined the handleVersionManagement function to include creation of a release branch, updating of version files, committing changes, tagging and merging back to develop
	- feat: Integrated checkRemoteExists function in handleVersionManagement to allow for the pushing of release branches to remote
	- fix: Corrected error handling within handleVersionManagement to provide more specific and informative error messages
	- feat: Import and usage of bumpVersion and updateVersionFiles functions from version-manager in handleVersionManagement

- VEL-404 Updated project documentation and configuration management
	- docs: restructured and enhanced the entire README file
	- feat: introduced detailed API guide with module descriptions
	- docs: updated configuration guide on environment variables
	- feat: added test helpers and error handling methods in api guide

- VEL-403 Updated environment file naming and .gitignore
	- feat: updated .gitignore to include new environment file formats
	- refactor: changed naming convention for environment files
	- refactor: modified environment file paths in core logic
	- refactor: updated command line arguments to match new environment file names

- VEL-403 Added configuration management
	- feat: added .gitignore to ignore environment files
	- feat: implemented configuration command handler
	- feat: introduced a configuration manager
	- feat: linked configuration command to main file







## 0.3.2



23 July 2025- Version bump to 0.3.2







## 0.3.1



23 July 2025- Version bump to 0.3.1







## 0.3.0



23 July 2025- Version bump to 0.3.0







## 0.2.8



22 July 2025- Added bash script for commit

- feat: added new committhis.sh bash script

- feat: implemented nma commit function in script

- Programmatically prepended JIRA ticket to commit message

-  - feat: implemented logic to prepend JIRA ticket to edited message if not already present

-  - feat: added condition to prepend JIRA ticket to AI suggestion when accepted as default

- Improved commit message handling and command execution

-  - feat: Added clean up to remove wrapping quotes from commit message suggestions

-  - refactor: Rearranged console message display order in handleStagedCommit method

-  - fix: Adjusted trimming behavior for git commands, preserving leading spaces for 'git status --porcelain' command

-  - fix: Handle all exceptions/error scenarios during git command execution

- 'Reconfigured environment variable load order and sources

-  - feat: reversed file load order for environment variables

-  - feat: added specific file load prioritization to environment configuration

-  - fix(lib): improved environment variable source identification methods

-  - clean: removed unnecessary test file'

- Line 1 test

- line 2 test

- Line 3 test

- Added Git information extraction and display utility

- feat: added a Git information utility in lib/git-info.js

- feat: integrated Git information utility in maiass.js

- feat: added Git info display and validation commands in CLI

- Improved visual presentation in terminal output

- feat: added symbols.js for Unicode/ASCII fallbacks

- refactor: integrated symbols into env-display.js for better readability

- refactor: rearranged colors.js for consistency

- Enhanced environment variable display and added new color options

- feat: added new color options in colors.js

- feat: improved environment variable display in env-display.js

- feat: added new file maiass-variables.js for managing MAIASS environment variables

- Refactored environment variable display logic

- fix(lib): simplified display of MAIASS-specific variables

- fix(lib): removed additional relevant variables from MAIASS display

- fix(lib): adjusted displayAllEnvironmentVariables to show only MAIASS-prefixed vars

- Updated documentation and added environment display utility

- docs: simplified and updated project documentation

- feat: exported getConfigPaths function in lib/config.js

- feat: added new file lib/env-display.js for environment display utility

- feat: integrated environment display utility in maiass.js

- Added initial version of MAIASS project with detailed documentation

- feat: added .windsurf with detailed project overview and development guidelines

- feat: added README.maiass.md with project summary and quick start guide

- feat: added commands.md with available and planned commands for MAIASS

- feat: added configuration.md with details on environment variable loading and setup

- feat: added development.md with code style guide, testing instructions, and contribution guidelines

- feat: added setup.md with installation, environment setup, and troubleshooting instructions

- Implemented cross-platform configuration loading and environment setup

- feat: added new configuration handling module

- feat: introduced environment variable loading from multiple sources

- feat: created helper script for environment setup

- feat: made application an ES module

- refactor: updated version fetching in main script from package.json

- # Conflicts:

- #	package.json

- Updated code for better module management and removed unnecessary imports

- refactor(lib): switched from module.exports to export default in colors.js

- refactor(maiass): removed unnecessary chalk import

- feat(package): added "type": "module" to package.json



