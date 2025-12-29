## 5.9.3
30 December 2025

- Added development log configurations
	  - feat: introduce MAIASS_DEVLOG_CLIENT, MAIASS_DEVLOG_SUBCLIENT, and MAIASS_DEVLOG_PROJECT in environment variables
- Add npm deployment script
	  - feat: implement npm deployment script
	  - chore: merge develop branch into main before deployment
	  - fix(script): ensure npm user is logged in before publishing

## 5.9.1
25 November 2025

- Enhanced command line help output
	  - feat: added detailed help messages for valid commands and flags
	  - refactor: grouped flags by category for improved readability
	  - fix: removed redundant help command message
- Enhanced command and flag validation
	  - feat: added dynamic command validation for first argument
	  - feat: implemented flag validation for recognized options
	  - fix: improved error handling for unrecognized commands and flags
	  - docs: updated help output to include --account-info option
- Update README with AI mode options
	  - docs: add AI mode options to enable intelligent commit suggestions

## 5.8.10
25 November 2025

- Add handling for new repositories without commits
	  - feat: Skip merge workflow for new repositories with no branch yet
- Update getGitInfo function to handle new repository state
	  - Add logic to retrieve status when no branch exists yet
	  - Set branch as null in return object
	  - Assign status properties to return object based on retrieved status

## 5.8.4
24 November 2025

- Add logger functionality to secure storage module
	  - refactor: update logger import in secure-storage.js
	  - docs: update debug log messages in secure-storage.js
- Add client info utilities
	  - feat: add client-info module for client name and version retrieval
	  - feat: add getClientName function to get client name for API headers
	  - feat: add getClientVersion function to get client version for API headers
- Add features to bootstrap module and fix log message
	  - feat: Add functions for project type detection and version source identification in bootstrap module
	  - feat: Implement configuration setup steps in bootstrap module
	  - fix: Update log message for anonymous subscription request in account-info module
- Update automated AI suggestion prompts
	  - feat: add automatic approval for AI suggestions based on environment variables
	  - feat: add automatic push option for commits based on environment variables
	  - feat: add automatic staging of changes based on environment variables
	  - feat: add automatic merging to develop branch based on environment variables

## 5.7.34
24 November 2025

- Update package.json with new version and additional files
	  - chore: update package.json version to 5.7.33
	  - chore: add new files to package.json "files" section
- Update internal changelog logic
	  - refactor: remove unnecessary comments and unused code
	  - refactor: simplify formatting of commit messages
	  - refactor: restructure logic for handling existing changelog entries
- Update internal changelog function to remove console log and process exit
- Update internal changelog formatting
	  - fix: correct date variable usage
	  - fix: remove unnecessary console.log and process.exit calls
- Update internal changelog function
	  - refactor: remove redundant console.log statements
	  - style: fix indentation issue
- Add logging and exit functionality
	  - refactor: log the dateWithWeekday
	  - refactor: add process exit functionality
- Update date format in internal changelog
	  - refactor: use dateWithWeekday instead of date
- Update internal changelog formatting
	  - refactor: use  instead of Mon Nov 24 13:16:21 AEDT 2025 for better readability
- Updated internal changelog
	- refactor: simplified date formatting in internal changelog
	- refactor: improved content update logic in internal changelog
- Update internal changelog content
	  - refactor: simplify date formatting
	  - refactor: improve content update logic in the changelog
- Update internal changelog entries with weekday in date
	  - refactor: replace date with weekday in internal changelog entries
- Update date format in changelog
	  - refactor: modify date format in changelog to include capitalized weekday
	  - refactor: update weekday to be capitalized in changelog
- Update internal changelog with weekday format and normalize date strings
	  - feat: create/update internal changelog with weekday format
	  - refactor: normalize date strings for comparison
- Update version files with new version and configurations
	  - feat: add function to update secondary version files based on config
	  - feat: implement logic to update secondary version files with new version and patterns
	  - docs: add detailed comments and explanation for the updateSecondaryVersionFiles function
- Update color handling and commit message flow
	- feat: added bold orange in colors.js
	- feat: implemented function to get color based on credit count in commit.js
	- feat: created function to print gradient line in commit.js
	- fix: optimized credit information extraction and display in commit.js
	- feat: added anonymous subscription creation when no AI token found in commit.js
	- feat: improved AI suggestion display with gradient lines in commit.js
- Add MAIASS version display and git branch info
	  - feat: add displayHeader function for MAIASS version
	  - feat: get own MAIASS version from package.json
	  - feat: display MAIASS version in displayVersionInfo
	  - feat: show current git branch in validateAndHandleBranching
- Update verbosity and debug mode settings in .env file
	  - fix: disable debug mode in MAIASS_VERBOSITY
	  - fix: enable debug mode in MAIASS_DEBUG
- Update .gitignore and maiass.mjs
	  - chore: remove unused entries in .gitignore
	  - feat: add handling for --auto flag in maiass.mjs
- Update changelog.js to keep JIRA ticket in internal changelog
	  - refactor: modify line to keep JIRA ticket information in subject
- Add new function to update changelog path
	  - feat: import updateChangelogNew function
	  - feat: add logic to handle changelog path
	  - feat: call updateChangelogNew with changelog path and new version
## 5.7.6
14 September 2025
