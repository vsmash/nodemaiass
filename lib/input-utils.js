import { createInterface } from 'readline';
import colors from './colors.js';

/**
 * Get single character input from user
 * @param {string} prompt - Prompt message to display
 * @returns {Promise<string>} Single character input
 */
export function getSingleCharInput(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    process.stdout.write(prompt);
    
    process.stdin.once('data', (key) => {
      const char = key.toString().toLowerCase();
      
      // Handle Ctrl+C
      if (key[0] === 3) {
        console.log('\n');
        process.exit(0);
      }
      
      // Echo the character and newline
      process.stdout.write(char + '\n');
      
      process.stdin.setRawMode(false);
      process.stdin.pause();
      rl.close();
      
      resolve(char);
    });
  });
}

/**
 * Get multi-line input from user
 * @param {string} prompt - Prompt message to display
 * @returns {Promise<string>} Multi-line input
 */
export function getMultiLineInput(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log(prompt);
    
    const lines = [];
    let emptyLineCount = 0;
    
    rl.on('line', (line) => {
      if (line.trim() === '') {
        emptyLineCount++;
        if (emptyLineCount >= 3) {
          rl.close();
          resolve(lines.join('\n').trim());
          return;
        }
      } else {
        emptyLineCount = 0;
        lines.push(line);
      }
    });
    
    rl.on('SIGINT', () => {
      console.log('\n');
      process.exit(0);
    });
  });
}

/**
 * Get simple line input from user
 * @param {string} prompt - Prompt message to display
 * @returns {Promise<string>} Single line input
 */
export function getLineInput(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
    
    rl.on('SIGINT', () => {
      console.log('\n');
      process.exit(0);
    });
  });
}
