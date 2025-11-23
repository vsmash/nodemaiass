## 5.7.8
24 November 2025

- Updated endpoints and enhanced logging for API interaction
	- feat(lib): replaced 'anonymous-subscription' endpoint with '/v1/token' in account-info.js and commit.js
	- feat(lib): added 'X-Client-Name' and 'X-Client-Version' headers to API requests
	- fix(lib): replaced direct access of response data with compatibility checks for multiple field names
	- refactor(lib): improved logging with more detailed API key, subscription ID, and credits info
	- refactor(lib): updated machine-fingerprint.js comments to reflect algorithm change
	- feat(commit): included 'X-Subscription-ID' in commit.js headers

## 5.7.7
23 November 2025

- Updated MAIASS project with key changes
	- fix(docs): updated file paths in .windsurf
	- feat: added maiass.log and .env.maiass.bak to .gitignore
	- refactor: replaced "openai" with "maiass" in README.md and other documents
	- refactor: changed "masterbranch" references to "mainbranch" throughout the project
	- fix(docs): updated API token validation information in README.maiass.md
	- fix(docs): updated branch classification method description in api.md
	- fix: updated MAIASS_AI_TOKEN description in configuration variable definitions

## 5.7.6
14 September 2025
