#!/usr/bin/env node
/**
 * CommonJS wrapper for maiassnode.mjs to ensure pkg compatibility
 * This file serves as an entry point that pkg can properly handle
 */

// Import the ES module using dynamic import with detailed error handling
(async () => {
  try {
    // Check if we're running in pkg environment
    const isPkg = typeof process.pkg !== 'undefined';
    
    if (isPkg) {
      // In pkg environment, try different import approaches
      console.log('Running in pkg environment, attempting ES module import...');
    }
    
    const module = await import('./maiassnode.mjs');
    console.log('ES module imported successfully');
  } catch (error) {
    console.error('Error starting maiassnode:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a specific pkg-related error
    if (error.message.includes('Invalid host defined options')) {
      console.error('\nThis appears to be a pkg/yargs compatibility issue.');
      console.error('Try running with Node.js directly: node maiassnode.cjs');
    }
    
    process.exit(1);
  }
})();
