## 1.0.17
31 July 2025

- (vsmsh) Improved debug mode and enhanced documentation
	- fix: updated context title in .windsurf
	- docs: added explanation for Debug Mode Token Validation in README
	- feat: introduced new token-validator.js for debugging API tokens
	- feat: integrated token-validator in main application (maiassnode.mjs)

## 1.0.16
28 July 2025

- (vsmsh) MAI-7 Removed unused binary build files and tweaked logging in maiass-pipeline.js
	- chore: deleted maiassnode-arm64 build file
	- chore: deleted maiassnode-x64 build file
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

- (vsmsh) MAI-7 Updated logging systems in maiassnode and removed unnecessary logs
	- refactor(maiassnode): replace console.log with the logger system for better output control
	- refactor(maiassnode): change user prompts to use the logger system instead of console.log
	- fix(maiassnode): correct comment typo on commit functionality script
	- fix(maiass): remove unnecessary log commenting on ES module import success
	- style(maiassnode): remove excess white spaces in commitThis function

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
	- fix: replaced 'maiassnode.mjs' with 'maiassnode.cjs' in debug-git-test.js
	- fix: changed file path for 'maiassnode.mjs' to 'maiassnode.cjs' in test-runner.js

- (vsmsh) MAI-7 Updated test scripts to use .mjs node files
	- fix: change reference from maiassnode.js to maiassnode.mjs in debug-git-test.js
	- fix: modify path to maiassnode.mjs in test-runner.js

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
	- feat(maiassnode.js): Added silent mode CLI option for automated prompts approval

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

