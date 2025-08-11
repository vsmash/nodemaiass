## 5.6.0
11 August 2025

- Update Maiass Pipeline functionality
	- refactor: update variable name from lastTag to lastVersion in updateChangelog function in maiass-pipeline.js
- Update changelog entries with latest version and commit messages
	- refactor: determine latest version from changelog file
	- refactor: handle fallback scenarios for missing version and changelog
	- refactor: improve logic to find and update changelog entries
