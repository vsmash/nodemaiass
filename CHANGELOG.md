## 5.13.6
25 May 2026

- # Conflicts:
	#	.CHANGELOG_internal.md
	#	CHANGELOG.md
	#	package.json
- Synced package-lock.json.

## 5.13.4
24 May 2026

- bump version-bump.yml node-version 20->24 (MAI-56 template parity) (#21)
- Co-authored-by: Tyler Durton <tyler@wipeyour.com>
	Sync package-lock.json with bumped version

## 5.13.2
25 May 2026

- Synced package-lock.json to align with the updated version.

## 5.13.1
24 May 2026

- + MAI-59: fix secondary version-files docs and stale code comment (#19)
- * MAI-57: fix secondary version-files docs (pipe/colon format, multi-line \n)
	  - document real pipe-separated, colon-delimited file:type:pattern format with correct example
	  - drop MAIASS_VERSION_SECONDARY_TYPES (never read by code); mark not implemented
	  - list the three supported type values (pattern, txt, json) and what each does
	  - add multi-line \n note (double-quoted, pattern type only) with caveat it rewrites in place
- * MAI-57 MAI-59: fix stale comma-separated comment for MAIASS_VERSION_SECONDARY_FILES
- ---------
- Co-authored-by: Tyler Durton <tyler@wipeyour.com>
	drop cache:'npm' and bump node 20→24 in generated bump workflow (#18)
- - remove cache: 'npm' from generated setup-node step so workflow runs on projects without a Node lock file
	  - bump generated node-version 20 to 24 (node 20 deprecated on GitHub runners)
- Co-authored-by: Tyler Durton <tyler@wipeyour.com>
	Merge branch 'release/5.13.0' into develop

## 5.13.0
21 May 2026

- Synchronized package-lock.json with the updated version.

## 5.12.14
19 May 2026

- Consolidated same-date sections post-AI.
- Improved AI consolidation to handle non-adjacent patches.
- Stopped relying on AI for consolidation; reorganized sections by normalized date and merged entries.
- Updated existing cleaned files for consistent section merges.
- Addressed a separate issue where an entry was dropped during AI processing.
- Cleaned up changelog via the new cleanup command.
- Included .gitignore in the cleanup commit to prevent blocking on modified files.
- Added the `--cleanup-changelogs` command for improved changelog management.
- Resolved issues with AI-written commit messages affecting changelog format.
- Introduced a new module for changelog cleanup, enabling enhanced management of changelog files.
- Implemented auto-picking of AI models based on input size for efficiency.
- Added a branch-safety protocol to ensure proper checkout procedures during cleanup.
- Enhanced inline bump resilience to prevent blocks in the changelog pipeline.
- Credits from cleanup AI calls are now tracked in the existing environment variable.
- Synced package-lock.json with the updated version.

## 5.12.13
13 May 2026

- Added a lockfile sync step to the auto-version-bump workflow. The workflow now runs npm install --no-audit --no-fund --ignore-scripts after the bump and commits any lockfile delta, resolving long-standing drift.
- Removed redundant --current flag from the version subcommand; it previously functioned the same as the version command with no args.
- Fixed the subcommand-flag validation contract. Generalized validation with a per-subcommand FLAGS allow-list, re-enabling version --current functionality.
- Fixed the broken config subcommand wiring. The handler now accepts argv array and has routing for config --help.

## 5.12.6
12 May 2026

- Documented the CI auto-version-bump workflow, including the --create-gh-action, --show-gl-excerpt, and --show-bb-excerpt flags in multiple documentation files.
- Substituted MAIASS_DEVELOPBRANCH in CI templates, baking it into rendered templates with a silent fallback to 'develop'.

## 5.12.3
27 April 2026

- Enhanced the account information command with top-up link logging for anonymous subscriptions, improving code formatting and spacing.

## 5.11.2
25 April 2026

- Added logic to return user to original branch after release workflow, excluding develop or release branches.
- Updated configuration options and introduced automation flags for auto-staging, auto-pushing, auto-approving, and auto-merging.
- Removed deprecated autopush commits variable.
- Reorganized auto modes and flags in maiass.mjs for clarity and updated command options in help message.
- Updated pull request handling to include new configuration for pull requests and added logic to open a pull request if set to 'on'.

## 5.10.6
21 April 2026

- Added contributing guidelines, including a CONTRIBUTING.md file and updates to package.json to include this file and a CODE_OF_CONDUCT.md.

## 5.10.5
17 April 2026

- Added update check functionality with unit tests and handled various response scenarios in tests.
- Updated command references from `nma` to `maiass` in CLI command examples and modified related documentation.
- Updated CI templates and enhanced argument handling with new commands for creating GitHub Action and displaying CI excerpts, along with improved argument parsing and help output.

## 5.10.2
16 April 2026

- Improved handling of git repository context in maiass.mjs by adding logic to change working directory to the git root if in a subdirectory.

## 5.9.58
16 April 2026

- Pulled latest develop before version bump to prevent stale base.
	- Fixed pulling origin/develop at the start of handleVersionManagement before reading version files to prevent bumping from a stale local version when remote has already been bumped.
	- Moved develop-branch guard before getCurrentVersion() to fail fast without unnecessary file I/O.
	- Added explicit git checkout develop step in version-bump.yml to ensure workflow lands on the real branch head, not the PR merge commit ref.
- Added GitHub Actions workflow for version bump on PR merge.
	- Implemented version bump workflow triggered by merged pull requests.
	- Configured steps for checking out code and setting up Node.js environment.
	- Installed 'maiass' for version incrementing.
	- Configured git settings for automated commits.
- Refactored MAIASS command logic.
	- Removed anonymous subscription creation logic.
	- Streamlined command handling in MAIASS pipeline.
- Enhanced branch name parsing and updated dependencies.
	- Improved Jira ticket extraction from branch names.
	- Added support for numeric ticket formats in branch names.
	- Updated package version to 5.9.53 and added funding links.
	- Included new development dependencies for coverage and testing.

## 5.9.57
15 April 2026

- Improved version-bump workflow: cached npm and suppressed noise.
	- Added npm cache to setup-node step for faster installs.
	- Added --no-fund and --no-audit flags to npm install to reduce output noise.
- Updated Node.js version requirements and documentation.
	- Updated Node.js requirement from 18+ to 20+.
	- Corrected MAIASS_AI_COMMITS to MAIASS_AI_MODE in usage examples.
	- Modified ticket integration description for clarity.
	- Added e2e testing section and specifications.
	- Streamlined release process instructions.
	- Changed Node.js engine requirement from 18+ to 20+.
- Updated package-lock.json for dependency upgrades.
	- Bumped version from 5.9.53 to 5.9.55.
	- Updated vitest from ^3.2.4 to ^4.1.4.
	- Removed unused esbuild nodes from dependencies.
- Updated strawfile with workflow testing.
	- Changed testing description for GitHub workflows.
	- Eliminated obsolete test entries.

## 5.9.52
13 April 2026

- Updated homepage in package.json.
	- Changed homepage from maiass.com to maiass.net.

## 5.9.49
11 April 2026

- Fixed deployment duplicate version branch return.
- Updated strawfile with additional test case.
	- Added second test entry in strawfile.txt.
- Updated strawfile with deployment testing note.
	- Added note for deployment testing regarding ghost accounts.

## 5.9.44
10 April 2026

- Updated project description and homepage in package.json.
	- Revised project description for clarity and detail.
	- Updated homepage link to reflect new site address.
	- Modified keywords in package.json for better alignment with project features.

## 5.8.10
25 November 2025

- Added handling for new repositories without commits.
	- Skipped merge workflow for new repositories with no branch yet.
- Updated getGitInfo function to handle new repository state.
	- Retrieved status when no branch exists yet.
	- Set branch as null in return object.
	- Assigned status properties to return object based on retrieved status.

## 5.8.4
24 November 2025

- Added logger functionality to the secure storage module.
	- Updated logger import in secure-storage.js.
	- Updated debug log messages in secure-storage.js.
- Added client info utilities.
	- Introduced client-info module for client name and version retrieval.
	- Added getClientName function for client name in API headers.
	- Added getClientVersion function for client version in API headers.
- Enhanced features in the bootstrap module and fixed log message.
	- Added functions for project type detection and version source identification.
	- Implemented configuration setup steps.
	- Updated log message for anonymous subscription request in account-info module.
- Updated automated AI suggestion prompts.
	- Added automatic approval for AI suggestions based on environment variables.
	- Added automatic push options for commits based on environment variables.
	- Added automatic staging of changes based on environment variables.
	- Added automatic merging to the develop branch based on environment variables.

## 5.7.34
24 November 2025

- Updated internal changelog logic, improving formatting and restructuring.
- Enhanced internal changelog with weekday format and improved date usage.
- Implemented logging and exit functionality for internal changelog updates.
- Updated version files and configurations for better management.
- Improved color handling and commit message flow.
- Displayed MAIASS version and current git branch information.

## 5.7.6
14 September 2025

- Added new features and optimizations to changelog processing.

## 5.6.0
11 August 2025

- Updated Maiass Pipeline functionality.

## 5.5.0
11 August 2025

- Updated changelog entries with latest version and commit messages.
- Improved logic to find and update changelog entries.

## 5.4.0
11 August 2025

- Updated test configuration with more descriptive comments for environment settings.

## 5.3.31
11 August 2025

- Updated version check to npm registry.
- Retrieved latest version and URL from npm registry data.
- Handled case when no latest version is found in npm registry.
- Updated git diff command to exclude changelog files.
- Enhanced debug logging for AI commit suggestions.
- Outputted diff and parameters in debug mode.
- Outputted AI suggestion in debug mode.
- Modified commit message handling for cross-platform compatibility.
- Prepended JIRA ticket to commit message if present and not already.
- Updated variable reference to use the final commit message instead of the original commit message.
- Updated internal changelog file name to '.CHANGELOG_internal.md'.
- Updated package-lock.json version to '5.3.22'.
- Changed release URL from 'maiass.dev' to 'maiass.net' in development.md.
- Added conditional checks before copying maiass-windows-x64.exe.
- Removed redundant zip creation for maiass-windows-arm64.exe.
- Standardized version URLs by removing 'v' prefix.
- Adjusted GitHub release commands to not include 'v' prefix.
- Added conditional logic to prevent devlog.sh availability on Windows.

## 5.3.18
3 August 2025

- Changed release URL from 'maiass.dev' to 'maiass.net' in development.md.
- Updated R2_BASE_URL in scripts to 'maiass.net'.
- Replaced occurrences of 'maiass.dev' with 'maiass.net' in respective script files.
- Added conditional checks before copying maiass-windows-x64.exe.
- Removed redundant zip creation for maiass-windows-arm64.exe.
- Removed 'v' prefix from version URLs and messages.
- Adjusted GitHub release commands to not include 'v' prefix.
- Corrected file permissions for copied binaries. 
- Created README in scripts directory detailing all MAIASS scripts.
- Added new scripts for code signing and signature verification for individual binaries.
- Updated development documentation with build and release workflows.

## 5.2.9
02 August 2025

- Updated .gitignore to include unused Formula file.
- Deleted unused 'Formula/maiass.rb' file.
- Updated Maiass version in homebrew formula to 5.2.7.
- Remodeled URL structure in Maiass formula and creation script.
- Added new symlink names for the main MAIASS tool.
- Streamlined 'create-homebrew-formula.sh' layout.
- Updated URL patterns in 'create-release.sh' to remove 'v' from version tag.
- Updated maiass sha256 checksum in homebrew formula.
- Removed superfluous 'v' from download URLs in homebrew formula and shell scripts.
- Changed feature name from 'AI-Assisted Semantic Savant' to 'AI-Augmented Semantic Scribe'.
- Adjusted associated references in documentation and code for the new feature name.
- Added functionality to check for version updates from the GitHub releases.
- Updated brew configuration to correctly define augmented semantic scribe.
- Updated package.json with new version and adjusted description.
- Added GPL-3.0-only license.
- Adjusted package version according to recent changes.
- Added new Modular AI-Assisted Semantic Savant feature to the project.
- Overhauled README with updated descriptions and examples.
- Updated brew configuration to correctly tap into maiass instead of nodemaiass.
- Deleted old maiassnode.rb file.
- Modified Homebrew setup script to accommodate updates.
- Ignored additional files (HOMEBREW_TAP_SETUP.md, script creations) in .pkgignore.
- Copied updated maiass.rb Homebrew formula to homebrew.

## 1.2.12
02 August 2025

- Set release ignore rules and enhanced release and pkgignore files.
- Updated script and test files to reflect the name change of the main script to "maiass". 

## 1.2.11
01 August 2025

- Updated GitHub actions and documentation for cross-platform release, including executable permissions for "maiass" binaries and updated filenames from "maiassnode" to "maiass".
- Added support for MacOS ARM64, Linux ARM64, and Windows ARM64 in the release script.
- Refactored script and file names, including adjustments in output file names and executable file names in the release process.
- Refactored build process and release script, improving build directory checks, cleanup, and file handling.
- Updated script files and added scripts/ path to the package ignore list.
- Added .DS_Store to .pkgignore to ignore these files in packaging.
- Updated package building and release script to exclude development files from builds.
- Removed unneeded test files.
- Renamed internal changelog file.
- Stopped creating a new internal changelog if one does not exist.
- Updated internal CHANGELOG file.

## 1.1.9
01 August 2025

- Improved command line user input handling and commit message suggestion.
	Handled invalid user inputs during commit message creation.
	Resolved process exiting prematurely by maintaining original raw mode state during input collection.
- Revised 'No relevant commits found for changelog' behavior to skip changelog update.
- Updated treatment for absence of internal changelog commits from version bump entry.
- Updated maiass-pipeline.js to improve git commit handling.
	Modified method of acquiring latest git tag and introduced a fallback for no git tags to get all commits.
	Added filtering logic to exclude empty commit message lines.
- Updated Changelog and fixed behavior for empty commits.
	Revised behavior for empty commits in changelog.
- Refined changelog update process.
	Made log warnings more precise about changelog updates when no commits present.
- Updated Changelog and warning messages.
	Revised Changelog for version 1.1.3.
	Updated warning messages and skip behavior for empty commits.
- Refactored changelog update logic.
	Added conditional logic for updating changelog regardless of relevant commits.
- Improved Maiass pipeline logging and branch handling.
	Added cache for finalBranch and originalBranch to avoid repeating git calls.
- Updated warning messages and handling for empty commits.
	Changed treatment for absent internal changelog commits from version bump entry to skipping update.

## 1.0.34
01 August 2025

- Improved handling of commit logs.
- Added capability for version bump fallback when no changelogs are found.
- Updated version tagging workflow with options for version bump and tagging strategy.
- Simplified release handling into bump and full release workflows.
- Made failure messages in git operations more consistent.
- Improved git command handling and added debug verbosity.
- Enhanced logging and error management in the MAIASS system.
- Refactored configuration handling.
- Refactored pipeline logic and improved debugging.
- Enhanced commit and pipeline handling.
- Updated logger functionality and streamlined pipeline code.
- Refined logging and prompting capabilities, added new config options.
- Improved application naming and documentation.
- Updated install script.
- Enhanced AI key management and added machine fingerprinting.

## 1.0.22
31 July 2025

- Updated logger, refined API interaction, and improved error handling.
- Refined commit messaging and added new color functions.
- Refactored code related to user prompts and session usage.
- Improved debug mode and enhanced documentation.

## 1.0.16
28 July 2025

- Removed unused binary build files and tweaked logging.
- Implemented AI symbol and updated AI message identifier.
- Updated logger symbol in pipeline.
- Updated logging functionality and error handling.
- Refactored logging framework for enhanced error management.
- Updated logging in maiass-pipeline.js.
- Standardized logging syntax and improved logging statements.
- Updated documentation and code to reflect changes in project name.
- Refactored log method in commit.js.
- Updated style and behavior of logger.
- Added new color to colors.js.
- Updated logger functionality.
- Corrected application name in thank you message.
- Updated logging systems in maiassnode and removed unnecessary logs.
- Updated codebase and documentation for rebranding.

## 0.9.7
28 July 2025

- Enhanced WordPress integration with expanded plugin and theme management functionality.
- Added methods for updating version in WordPress theme style.css and PHP version constant.
- Implemented version constant generator based on file path for WordPress plugins and themes.
- Incorporated automatic generation of constants in WordPress update process.
- Implemented dry run mode for previewing WordPress updates.
- Included expanded debugging information in configuration load and WordPress update functions.
- Corrected list format in create-release.sh script.
- Provided extensive descriptions and usage examples in workflow.md and configuration metro information for WordPress management in configuration.md.

## 0.9.6
27 July 2025

- Updated files to utilize common JS execution.
- Replaced 'maiassnode.mjs' with 'maiassnode.cjs' in debug-git-test.js.
- Changed file path for 'maiassnode.mjs' to 'maiassnode.cjs' in test-runner.js.
- Updated test scripts to use .mjs node files.
- Changed reference from maiassnode.js to maiassnode.mjs in debug-git-test.js.
- Modified path to maiassnode.mjs in test-runner.js.
- Improved git release workflow with added write permissions for creating releases.
- Extended checkout action for fetching all history and tags.
- Enhanced mechanism for getting the latest git tag with a default value set when no tags are found.
- Updated create-release.sh script and enhanced branching flows with current branch detection and options for merging branches.
- Improved branch-switching handling in the script and error handling for invalid user choice.
- Updated GitHub release workflow triggers, changing the release trigger condition to main branch updates or workflow dispatch events.
- Expanded CLI functionality for MAIASSNODE workflow, adding version bump functionality ('major', 'minor', 'patch') and several new flags for CLI.
- Improved help text for better usability.
- Updated node execution from cjs to mjs in nodemaiass.sh.
- Corrected positional arguments array writing in 'version' command.
- Implemented GitHub Actions for testing and release automation, including workflows for cross-platform builds and multiple Node.js version tests.
- Created a new home-brew setup markdown file and a new release template markdown file.
- Added cross-platform binary building script with compiled binaries for arm64 and x64.

## 0.7.12
27 July 2025

- Changed command option in devlog.js to use "?" instead of "0".
- Refined devlog logs for cleaner output.
- Updated devlog.js to handle different parameters for command execution.
- Refactored devlog command parameters by removing unused 'type' parameter.
- Refactored logging and merging operations in devlog:
	- Switched execution from synchronous to asynchronous.
	- Handled entire gitInfo object in handleStagedCommit.
	- Replaced default names with clearly outlined attributes.
	- Extracted context for logCommit and logMerge functions.
	- Passed originalGitInfo to logMerge function in handleMergeToDevelop.
- Refined debugging messages in devlog.js:
	- Added logging of messages to devlog.sh.
	- Corrected error and debug message handling.
	- Streamlined debug message print conditions.
- Improved debug handling in devlog:
	- Introduced command execution condition during debug.
	- Reordered execSync command execution.
	- Revised handling for both debug and non-debug scenarios.
- Improved output capture in devlog:
	- Replaced trim method in execSync command output capture.
	- Added functionality for logging full command result, including errors.
- Modified devlog.js functionality:
	- Changed console output behavior within logThis function.
	- Added silent execution of command for cleaner log display.
- Added debug message for devlog.sh command execution when MAIASS_DEBUG is true.
- Integrated devlog functionality and improved commit and merge logging:
	- Added devlog functionality as a separate module.
	- Implemented commit logging in 'commit.js'.
	- Introduced merge logging within 'handleMergeToDevelop' and 'handleVersionManagement'.
	- Created 'devlog.js' file with utility functions for development logging.
- Changed default AI endpoint in commit.js.
- Removed MAIASS_AI_ENDPOINT from configuration documentation.
- Updated MAIASS variable references to non-branded AI in maiass-variables.js.
- Renamed occurrences of 'OPENAI' to 'AI' in variables and configuration files.
- Updated README and documentation to reflect changes in configuration and variable names.
- Updated test setup to use the renamed AI_MODE configuration variable.

## 0.7.1
25 July 2025

- Added new emoji and ascii representations for symbols in symbols.js.

## 0.6.28
25 July 2025

- Updated merging process in maiass-pipeline.
	Added silent option to handleMergeToDevelop function and automated merge command reply when in silent mode.
- Introduced silent mode for automated approval.
	Added CLI option for automated prompts approval and integrated this mode into the command handler and pipeline modules.
- Refactored changelog update function.
	Updated regex to filter irrelevant commits in the updateChangelog function.
- Improved changelog update filtering.
	Enhanced readability by moving the check for irrelevant commits directly into the return statement and corrected the regular expression to better identify JIRA tickets.
- Improved commit message filtering in changelog updates.
	Updated commit filtering regex in the updateChangelog function.
- Refactored maiass-pipeline.js filter conditions.
	Simplified filtering conditions in the updateChangelog function.
- Updated changelog and maiass-pipeline code.
	Improved line filtering in maiass-pipeline.js, simplified commit filtering logic in updateChangelog function, added check for existing changelog, created a new one if non-existent, updated or prepended new entries based on version and date, resolved the issue of new entries overwriting the entire changelog, updated variable names for clarity, modified git log command format, replaced const with let for commit message formatting, and improved readability of commit formats in maiass-pipeline.js.
- Updated line filters in maiass-pipeline.js.
	Improved filtering by adding dashAuthor and withSha conditions, and updated return to use dashAuthor instead of shouldInclude for better accuracy.
- Updated maiass-pipeline logic.
	Simplified commit filtering logic in the updateChangelog function.
- Improved commit message filtering.
	Added more specific filtering for commit messages and corrected checking pattern for ignoring merge and bump messages.
- Updated internal changelog creation logic.
	Added check for existing changelog and created a new one if non-existent, updated or prepended new entries based on version and date, and resolved the issue of new entries overwriting the entire changelog.
- Updated Git command execution in maiass-pipeline.
	Modified format of git log command.
- Updated Git log format in maiass-pipeline.
	Updated git log formatting for better readability.
- Updated maiass-pipeline.js.
	Changed the format of internal log result in the updateChangelog function.
- Improved formatting of commit messages and cleaned up changelog.
	Replaced const with let for commit message formatting and improved readability of commit formats.
- Implemented several revisions to changelog updates.
	Added functionality for retrieving commit messages with author details and resolved issues with commit message processing for the main changelog.
	Changed commit log output format in the updateChangelog function.
- Consolidated commit modification functions in maiass-pipeline.js.
	Merged two .map functions into one.
	Renamed variables for better understanding and streamlined operations using the renamed variable.
- Refactored author extraction in the main changelog update.
	Modified git log command to include author in a unique format and added functionality to extract the author name from command output.
- Refactored main functionality in maiass-pipeline.js.
	Corrected commitMessages variable reference and added comments explaining commit message processing.
- Refactored changelog update in maiass-pipeline.
	Optimized commit message processing by removing author extraction and made commit filtering from irrelevant phrases case insensitive.
- Refactored code in maiass-pipeline.js.
	Simplified commitMessages variable assignment and removed duplicate operation by utilizing mainLogResult.
- Updated git log command for changelog generation.
	Changed mainLogResult to include author info and added author extraction from internalLogResult.
- Updated CHANGELOG_internal.md.
	Bumped version in CHANGELOG_internal.md and merged feature branch into develop.
- Refactored commit logging in changelog update pipeline.
	Modified git log command to retrieve complete commit info and improved relevancy filter for commits.
	Added execution of git command to get raw internal log and improved formation of formatted internal commits.
- Improved log output in maiass-pipeline.js.
	Removed commit hash from internalLogResult output.

## 0.6.0
24 July 2025

- Updated to version 0.5.8 with changelog improvements and error handling.
	Changed git command for internal log in maiass-pipeline and enhanced error handling for internal changelog extraction.

## 0.5.8
24 July 2025

- Improved internal changelog extraction.
	Changed commit log command to include full commit message and author name.
	Improved error handling for internal changelog commits.
- Updated README and maiass-pipeline.js with changelog generation.
	Added automated changelog generation to features and config instructions.
	Elaborated on dual changelog system, including format and features.
	Imported fs/promises module for filesystem operations.
- Updated Maiass Pipeline functionality.
	Imported path package in maiass-pipeline.
	Added comment about commit message formatting for internal changelog.
- Updated commit message filtering for maiass-pipeline.
	Cleaned up commit messages by removing empty lines and trailing newlines.
- Updated version tagging in Maiass pipeline.
	Changed default to true for version tagging.
- Refactored updateChangelog function.
	Updated the changelog update function to use current version info.
	Adjusted console message while skipping changelog update due to lack of current version.
- Updated changelog and pipeline.js implementations.
	Improved handling of commit message formatting for internal changelog and streamlined code.
- Updated Changelog Creation and Error Handling Processes.
	Added conditions to improve changelog updates and included helpful log messages during retrieval.

## 0.5.0
23 July 2025

- Improved commit processing and auto-tagging.
	Enhanced logic for processing commits and added support for updating an internal changelog.

## 0.4.1
23 July 2025

- Enhanced logic to pull commit messages since the last tag in the changelog update.
- Improved commit message formatting for changelog display.
- Improved error handling during the changelog update process.
- Updated code to filter out irrelevant commits and strip JIRA tickets.
- Enhanced the README file and improved the configuration guide on environment variables. 
- Added logic to pull commit messages since the last tag in the changelog update.
- Implemented commit message formatting for proper changelog display.
- Handled errors more gracefully during the changelog update process.

## 0.3.2
23 July 2025

- Added an option for automatic version tagging based on environment configuration.
- Improved version management by integrating auto-tagging or user prompt.
- Implemented a check to return to the original branch after pipeline execution with log messages displaying the status of branch switching.
- Enhanced Git error logging and added detailed output results for git operations.
- Streamlined git command execution and improved error handling.
- Integrated new features for checking remote existence, automatic changelog updates, and error handling in the version management process.
- Restructured project documentation and updated the configuration management, including enhancements to the README file and API guide.
- Modified environment file management and improved the configuration handling process.

## 0.2.8
22 July 2025

- Added a bash script for commit functionality, including a commit function and logic to prepend JIRA ticket to commit messages when not already present.
- Improved commit message handling by removing wrapping quotes, adjusting trimming behavior for git commands, and enhancing error handling during command execution.
- Reconfigured environment variable load order and optimization for identification methods.
- Updated tests and documentation.
- Added a Git information extraction and display utility, integrating it into the CLI for user commands.
- Enhanced visual presentation in terminal output with improved readability using symbols and consistent color arrangements.
- Enhanced environment variable display with new color options and improved logic for MAIASS-specific variables.
- Updated documentation and introduced an environment display utility within the project.
- Launched the initial version of the MAIASSNODE project with comprehensive documentation including setup and contribution guidelines.
- Implemented cross-platform configuration loading and environment setup for improved application management.
- Updated code for better module management and removed unnecessary imports.

## 0.1.1
22 July 2025

- Initialized MAIASSNODE project with a basic structure, including primary script files and CLI color definitions.
- Set up package information and dependencies in package.json.
- Added initial project information in README.md.
- Created CHANGELOG.md for future updates.
- Included package-lock.json for dependency versions.
