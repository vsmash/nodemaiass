## 5.7.22
24 November 2025

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
