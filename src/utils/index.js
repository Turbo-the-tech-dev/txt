/**
 * Utils module - Helper functions
 */

/**
 * ANSI color codes & icons
 */
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m'
};
const icons = {
  info: 'ℹ ',
  warn: '⚠ ',
  error: '✖ ',
  debug: '⚙ '
};

/**
 * Simple colorized logger utility
 */
const logger = {
  info: (msg) => console.log(`${colors.cyan}${icons.info}[INFO]${colors.reset} ${msg}`),
  warn: (msg) => console.warn(`${colors.yellow}${icons.warn}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}${icons.error}[ERROR]${colors.reset} ${msg}`),
  debug: (msg) => console.debug(`${colors.dim}${icons.debug}[DEBUG]${colors.reset} ${msg}`)
};

/**
 * Parse command line arguments
 * @param {string[]} argv - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(argv) {
  const args = { _: [] };
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[++i] : true;
      args[key] = value;
    } else if (arg.startsWith('-') && arg.length > 1) {
      const key = arg.slice(1);
      const value = argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[++i] : true;
      args[key] = value;
    } else {
      args._.push(arg);
    }
  }
  
  return args;
}

/**
 * Read file safely
 * @param {string} filePath - Path to file
 * @param {string} encoding - File encoding
 * @returns {string} File content
 */
function readFile(filePath, encoding = 'utf-8') {
  const fs = require('fs');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  return fs.readFileSync(filePath, encoding);
}

/**
 * Write file safely
 * @param {string} filePath - Path to file
 * @param {string} content - File content
 * @param {string} encoding - File encoding
 */
function writeFile(filePath, content, encoding = 'utf-8') {
  const fs = require('fs');
  const path = require('path');
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content, encoding);
}

module.exports = {
  logger,
  parseArgs,
  readFile,
  writeFile
};
