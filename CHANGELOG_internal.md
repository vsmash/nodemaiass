## 0.6.21
25 July 2025

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Updated maiass-pipeline logic
	- refactor: simplified commit filtering logic in updateChangelog function
- (vsmsh) Merge branch 'release/0.6.20' into develop

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Updated internal changelog creation logic
	- feat: added check for existing changelog and create new if non-existent
	- feat: updated or prepended new entries based on version and date
	- fix: resolved issue of new entries overwriting entire changelog
	- refactor: updated variable names for clarity
- (vsmsh) Merge branch 'release/0.6.18' into develop

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Updated Git Command Execution in Maiass Pipeline
	- fix: modified format of git log command in maiass-pipeline.js
- (vsmsh) Merge branch 'release/0.6.17' into develop

## 0.6.17
25 July 2025

- 99ba0c7 VEL-405 Updated Git log format in Maiass Pipeline
	- fix: updated git log formatting in executeGitCommand for better readability (vsmsh)

## 0.6.16
25 July 2025

- (vsmsh) Merge branch 'feature/VEL-405_changelog_fixes' into develop
- (vsmsh) VEL-405 Updated maiass-pipeline.js
	- fix: changed the format of internal log result in updateChangelog function
- (vsmsh) Merge branch 'release/0.6.15' into develop

## 0.6.15
25 July 2025

- 697c40e VEL-405 Improved formatting of commit messages and cleaned up CHANGELOG
	- refactor(maiass-pipeline): replaced const with let for commit message formatting
	- style(maiass-pipeline): improved readability of commit formats
	- docs: removed entries in CHANGELOG.md (vsmsh)

## 0.6.14
25 July 2025

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

