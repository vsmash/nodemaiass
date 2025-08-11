/**
 * Test configuration for MAIASS
 */

export const TEST_CONFIG = {
  // Test environment settings needing updates
  timeout: 30000,
  verbose: process.env.MAIASS_TEST_VERBOSE === 'true',
  keepTempFiles: process.env.MAIASS_TEST_KEEP_FILES === 'true',
  
  // Mock settings for testing
  mockOpenAI: true,
  mockGitRemote: false,
  
  // Test data
  testVersions: ['1.0.0', '1.2.3', '2.0.0-beta.1'],
  testBranches: ['main', 'develop', 'feature/TEST-123-feature', 'hotfix/urgent-fix'],
  
  // Expected outputs
  expectedCommands: [
    'hello',
    'env', 
    'git',
    'commit',
    'version',
    'config',
    'maiass'
  ]
};

export default TEST_CONFIG;
