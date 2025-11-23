## 5.7.15
24 November 2025

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
