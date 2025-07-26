## 0.7.4
27 July 2025

- Updated AI endpoint and configuration
	- fix: Changed default AI endpoint in commit.js
	- docs: Removed MAIASS_AI_ENDPOINT from configuration.md
	- refactor: Updated MAIASS variable references to non-branded AI in maiass-variables.js

- Update project configuration and variables related to AI
	- feat: renamed all occurrences of 'OPENAI' to 'AI' in variables and configuration files
	- docs: updated README and documentations to reflect the changes made in configuration and variable names
	- test: updated test setup to use the renamed AI_MODE configuration variable

## 0.7.1
25 July 2025

- Updated symbols.js
	- feat: Added new emoji and ascii representations for symbols

## 0.6.28
25 July 2025

- Updated merging process in maiass-pipeline
	- feat: added silent option to handleMergeToDevelop function
	- feat: automated merge command reply when in silent mode
- Introduced silent mode for automated approval
	- feat(lib): added silent mode for automated commit approval
	- feat(lib): integrated silent mode into the command handler module
	- feat(lib): integrated silent mode into the pipeline module
	- feat(maiassnode.js): Added silent mode CLI option for automated prompts approval

- Refactored changelog update function
	- fix: updated regex to filter irrelevant commits in updateChangelog function

- Improved changelog update filtering
	- refactor: improved readability by moving check for irrelevant commits directly into return statement
	- fix: corrected regular expression to better identify JIRA tickets

- Improved commit message filtering in Changelog updates
	- fix: updated commit filtering regex in updateChangelog function

- Refactored maiass-pipeline.js filter conditions
	- refactor: simplified filtering conditions in updateChangelog function

- Updated Changelog and Maiass Pipeline code
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

- Update line filters in maiass-pipeline.js
	- refactor: improved filtering by adding dashAuthor and withSha conditions
	- refactor: updated return to use dashAuthor instead of shouldInclude for better accuracy

- Updated maiass-pipeline logic
	- refactor: simplified commit filtering logic in updateChangelog function

- Updated internal changelog creation logic
	- feat: added check for existing changelog and create new if non-existent
	- feat: updated or prepended new entries based on version and date
	- fix: resolved issue of new entries overwriting entire changelog
	- refactor: updated variable names for clarity

- Updated Git Command Execution in Maiass Pipeline
	- fix: modified format of git log command in maiass-pipeline.js

- Updated Git log format in Maiass Pipeline
	- fix: updated git log formatting in executeGitCommand for better readability

- Updated maiass-pipeline.js
	- fix: changed the format of internal log result in updateChangelog function

- Improved formatting of commit messages and cleaned up CHANGELOG
	- refactor(maiass-pipeline): replaced const with let for commit message formatting
	- style(maiass-pipeline): improved readability of commit formats
	- docs: removed entries in CHANGELOG.md

- Implemented several revisions to changelog updates
	- feat: Added functionality for retrieving commit messages with author details
	- fix: Resolved issues with commit message processing for the main changelog
	- refactor: Modified how internal commit messages are extracted
	- style: Cleaned up code for better readability and maintenance

- Updated CHANGELOG_internal.md
	- docs: bumped version in CHANGELOG_internal.md
	- feat: merged feature/VEL-405_changelog_fixes branch into develop
- Revert "VEL-405 Refactor commit logging in changelog update pipeline"
- This reverts commit 097ffbc05a462404ba5432e39c69db9a275c859b.

- Revert "VEL-405 Refactored changelog update function"
- This reverts commit 74a774dd07178a666bbce867e06c7ba7b023dceb.

- Refactored changelog update function
	- feat: added execution of git command to get raw internal log
	- refactor: changed how internal commit messages are processed and filtered
	- refactor: improved formation of formatted internal commits
	- refactor: updated writing to internalChangelog file

- Improved log output in maiass-pipeline.js
	- fix: Removed commit hash from internalLogResult output in maiass-pipeline.js

## 0.6.0
24 July 2025

- Update to version 0.5.8 with changelog improvements and error handling
	- feat: Changed git command for internal log in maiass-pipeline.js
	- fix: Enhanced error handling for internal changelog extraction
	- docs: Added details on automated changelog generation to README

## 0.5.8
24 July 2025

- Improved internal changelog extraction
	- feat: Changed commit log command to include full commit message and author name
	- fix: Improved error handling when failing to get commits for internal changelog

- Update README and maiass-pipeline.js with changelog generation
	- docs(README): add automated changelog generation to features and config instructions
	- docs(README): elaborate on dual changelog system, including format and features
	- feat(maiass-pipeline.js): import fs/promises module for filesystem operations

- Update Maiass Pipeline functionality
	- feat: imported path package in maiass-pipeline
	- docs: added comment about commit message formatting for internal changelog

- Updated commit message filtering for maiass-pipeline
	- feat: added code to clean up commit messages
	- fix: removed empty lines and trailing newlines from each commit

- Updated version tagging in Maiass pipeline
	- refactor: default to true for version tagging
	- style: commented out previous implementation of version tagging

- Refactoring of updateChangelog function
	- feat: updated the changelog update function to use current version info
	- refactor: removed redundant git command execution for lastTag retrieval
	- fix: adjusted console message while skipping changelog update due to lack of current version

- Updated changelog and pipeline.js implementations
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
	- feat: linked configuration command to main file

- Updated Changelog Creation and Error Handling Processes
	- - feat: added condition to skip changelog update if no previous tag found
	- - feat: included log messages alongside getting commit messages since last tag
	- - feat: separated main and internal changelog commit retrievals
	- - feat: internal changelog keeps JIRA tickets in commit messages
	- - refactor: simplified and improved internal changelog creation logic
	- - fix: corrected issues in error handling when updating changelogs
	- - docs: updated comments for better clarity and understanding of code functionality

## 0.5.0
23 July 2025

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

## 0.4.1
23 July 2025

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

- VEL-405 Updated changelog creation and formatting logic
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
23 July 2025

- Version bump to 0.3.2

## 0.3.1
23 July 2025

- Version bump to 0.3.1

## 0.3.0
23 July 2025

- Version bump to 0.3.0

## 0.2.8
22 July 2025

- Added bash script for commit
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
- feat: integrated Git information utility in maiassnode.js
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
- feat: integrated environment display utility in maiassnode.js
- Added initial version of MAIASSNODE project with detailed documentation
- feat: added .windsurf with detailed project overview and development guidelines
- feat: added README.maiass.md with project summary and quick start guide
- feat: added commands.md with available and planned commands for MAIASSNODE
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
- refactor(maiassnode): removed unnecessary chalk import
- feat(package): added "type": "module" to package.json
