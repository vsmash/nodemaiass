# API Reference

This document provides detailed API reference for MAIASSNODE's internal modules and functions.

## 📦 Core Modules

### `maiass-pipeline.js`

Main orchestration module that coordinates the complete MAIASS workflow.

#### `runMaiassPipeline(options)`

Executes the complete 4-phase MAIASS workflow.

**Parameters:**
- `options` (Object): Pipeline configuration options
  - `commitsOnly` (boolean): Only run commit workflow, skip version management
  - `autoStage` (boolean): Automatically stage all changes before committing
  - `versionBump` (string): Version bump type ('major', 'minor', 'patch', or specific version)
  - `dryRun` (boolean): Preview changes without applying them
  - `tag` (boolean): Create git tag for new version
  - `force` (boolean): Skip confirmation prompts

**Returns:**
- `Promise<Object>`: Pipeline result with success status and phase results

**Example:**
```javascript
import { runMaiassPipeline } from './lib/maiass-pipeline.js';

const result = await runMaiassPipeline({
  versionBump: 'minor',
  tag: true,
  dryRun: false
});

if (result.success) {
  console.log('Pipeline completed successfully');
}
```

### `git-info.js`

Git repository information and operations module.

#### `getGitInfo()`

Retrieves comprehensive Git repository information.

**Returns:**
- `Promise<Object>`: Git information object
  - `isRepository` (boolean): Whether current directory is a Git repository
  - `currentBranch` (string): Current branch name
  - `gitAuthor` (string): Git author name and email
  - `jiraTicket` (string|null): JIRA ticket extracted from branch name
  - `hasChanges` (boolean): Whether there are uncommitted changes
  - `stagedChanges` (Array): List of staged files
  - `unstagedChanges` (Array): List of unstaged files

#### `getCurrentBranch()`

Gets the current Git branch name.

**Returns:**
- `string`: Current branch name

#### `classifyBranch(branchName, options)`

Classifies a branch according to Git flow conventions.

**Parameters:**
- `branchName` (string): Branch name to classify
- `options` (Object): Branch configuration
  - `developBranch` (string): Develop branch name
  - `masterBranch` (string): Master branch name
  - `stagingBranch` (string): Staging branch name

**Returns:**
- `Object`: Branch classification
  - `isFeature` (boolean): Is feature branch
  - `isRelease` (boolean): Is release branch
  - `isHotfix` (boolean): Is hotfix branch
  - `isDevelop` (boolean): Is develop branch
  - `isMaster` (boolean): Is master branch

### `version-manager.js`

Semantic version management and file operations.

#### `getCurrentVersion()`

Detects and returns current project version information.

**Returns:**
- `Promise<Object>`: Version information
  - `current` (string|null): Current version string
  - `hasVersionFiles` (boolean): Whether version files were found
  - `files` (Array): Detected version files
  - `primary` (Object): Primary version file info

#### `bumpVersion(currentVersion, bumpType)`

Calculates new version based on semantic versioning rules.

**Parameters:**
- `currentVersion` (string): Current version (e.g., "1.2.3")
- `bumpType` (string): Bump type ('major', 'minor', 'patch', or specific version)

**Returns:**
- `string`: New version string

**Example:**
```javascript
import { bumpVersion } from './lib/version-manager.js';

const newVersion = bumpVersion('1.2.3', 'minor');
// Returns: '1.3.0'
```

#### `updateVersionFiles(newVersion, options)`

Updates version in all detected version files.

**Parameters:**
- `newVersion` (string): New version to set
- `options` (Object): Update options
  - `dryRun` (boolean): Preview changes without applying

**Returns:**
- `Promise<Object>`: Update result
  - `success` (boolean): Whether update succeeded
  - `filesUpdated` (Array): List of updated files
  - `errors` (Array): Any errors encountered

### `commit.js`

AI-powered commit workflow management.

#### `commitThis(options)`

Executes the complete commit workflow with AI assistance.

**Parameters:**
- `options` (Object): Commit options
  - `autoStage` (boolean): Automatically stage all changes
  - `commitsOnly` (boolean): Commit-only mode flag

**Returns:**
- `Promise<void>`: Resolves when commit workflow completes

### `config-manager.js`

Configuration file management and environment variable handling.

#### `loadConfig()`

Loads configuration from all sources with proper priority.

**Returns:**
- `Object`: Loaded configuration with source tracking

#### `getConfigValue(key)`

Gets a configuration value with fallback to defaults.

**Parameters:**
- `key` (string): Configuration key (e.g., 'MAIASS_DEBUG')

**Returns:**
- `string`: Configuration value

#### `setConfigValue(key, value, scope)`

Sets a configuration value in the specified scope.

**Parameters:**
- `key` (string): Configuration key
- `value` (string): Configuration value
- `scope` (string): Configuration scope ('global' or 'project')

**Returns:**
- `Promise<boolean>`: Whether the operation succeeded

## 🎨 Utility Modules

### `colors.js`

Terminal color and formatting utilities.

**Exports:**
- `Red(text)`: Red text
- `Green(text)`: Green text
- `Yellow(text)`: Yellow text
- `Blue(text)`: Blue text
- `Cyan(text)`: Cyan text
- `White(text)`: White text
- `Gray(text)`: Gray text
- `BRed(text)`: Bright red text
- `BGreen(text)`: Bright green text
- `BYellow(text)`: Bright yellow text
- `BBlue(text)`: Bright blue text
- `BCyan(text)`: Bright cyan text
- `BWhite(text)`: Bright white text

### `symbols.js`

Cross-platform console symbols with Unicode/ASCII fallback.

**Exports:**
- `SYMBOLS.CHECKMARK`: ✅ or [✓]
- `SYMBOLS.CROSS`: ❌ or [✗]
- `SYMBOLS.INFO`: ℹ️ or [i]
- `SYMBOLS.WARNING`: ⚠️ or [!]
- `SYMBOLS.GEAR`: ⚙️ or [*]
- `SYMBOLS.ROCKET`: 🚀 or [>]

### `input-utils.js`

User input handling utilities.

#### `getSingleCharInput(prompt)`

Gets a single character input from user.

**Parameters:**
- `prompt` (string): Input prompt to display

**Returns:**
- `Promise<string>`: Single character entered by user

#### `getLineInput(prompt)`

Gets a line of input from user.

**Parameters:**
- `prompt` (string): Input prompt to display

**Returns:**
- `Promise<string>`: Line entered by user

#### `getMultiLineInput(prompt)`

Gets multi-line input from user.

**Parameters:**
- `prompt` (string): Input prompt to display

**Returns:**
- `Promise<string>`: Multi-line text entered by user

## 🔧 Configuration Constants

### `maiass-variables.js`

Defines all MAIASS configuration variables with defaults and descriptions.

#### `MAIASS_VARIABLES`

Object containing all configuration variable definitions:

```javascript
{
  'MAIASS_DEBUG': {
    default: 'false',
    description: 'Enable debug mode',
    sensitive: false
  },
  'MAIASS_OPENAI_TOKEN': {
    default: '',
    description: 'OpenAI API key for AI features',
    sensitive: true
  }
  // ... more variables
}
```

## 🎯 Command Handlers

### `maiass-command.js`

#### `handleMaiassCommand(args)`

Main command handler for the MAIASS pipeline.

**Parameters:**
- `args` (Object): Parsed command-line arguments from yargs

### `commit-command.js`

#### `handleCommitCommand(args)`

Command handler for commit-only workflow.

**Parameters:**
- `args` (Object): Parsed command-line arguments

### `version-command.js`

#### `handleVersionCommand(args)`

Command handler for version management operations.

**Parameters:**
- `args` (Object): Parsed command-line arguments

### `config-command.js`

#### `handleConfigCommand(args)`

Command handler for configuration management.

**Parameters:**
- `args` (Object): Parsed command-line arguments

## 🔍 Error Handling

### Error Types

All modules use consistent error handling patterns:

```javascript
// Success result
{
  success: true,
  data: { /* result data */ }
}

// Error result
{
  success: false,
  error: 'Error message',
  details: { /* additional error info */ }
}
```

### Common Error Codes

- `NOT_GIT_REPOSITORY`: Current directory is not a Git repository
- `NO_VERSION_FILES`: No version files detected in project
- `MERGE_CONFLICT`: Git merge conflict encountered
- `INVALID_VERSION`: Invalid version format provided
- `CONFIG_ERROR`: Configuration file error
- `OPENAI_ERROR`: OpenAI API error

## 🧪 Testing Utilities

### Mock Functions

For testing, modules provide mock implementations:

```javascript
// Mock git operations
import { mockGitInfo } from './lib/git-info.js';

mockGitInfo({
  currentBranch: 'feature/test',
  hasChanges: true,
  stagedChanges: ['src/test.js']
});
```

### Test Helpers

```javascript
// Create test repository
import { createTestRepo } from './test/helpers.js';

const testRepo = await createTestRepo({
  branch: 'develop',
  files: ['package.json', 'src/app.js'],
  version: '1.0.0'
});
```

## 📊 Performance Considerations

### Async Operations

All file operations and Git commands are asynchronous:

```javascript
// Good: Proper async handling
const gitInfo = await getGitInfo();
const version = await getCurrentVersion();

// Bad: Blocking operations
const gitInfo = getGitInfoSync(); // Does not exist
```

### Memory Management

Large repositories are handled efficiently:

- Git operations use streaming where possible
- File operations are batched
- Memory usage is monitored in debug mode

### Caching

Configuration and Git information is cached appropriately:

- Config values cached per session
- Git branch info cached until changed
- Version file detection cached per run

---

**💡 Pro Tip**: Use TypeScript definitions for better IDE support and type safety when integrating MAIASSNODE into your projects.
