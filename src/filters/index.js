/**
 * Filters module - Text transformation filters
 */

/**
 * Available text filters
 */
const filters = {
  uppercase: (text) => text.toUpperCase(),
  lowercase: (text) => text.toLowerCase(),
  trim: (text) => text.trim(),
  trimLeft: (text) => text.trimStart(),
  trimRight: (text) => text.trimEnd(),
  reverse: (text) => text.split('').reverse().join(''),
  base64Encode: (text) => Buffer.from(text).toString('base64'),
  base64Decode: (text) => Buffer.from(text, 'base64').toString('utf-8'),
  capitalize: (text) => text.replace(/\b\w/g, c => c.toUpperCase()),
  titleCase: (text) => text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()),
  snakeCase: (text) => text.replace(/\s+/g, '_').toLowerCase(),
  kebabCase: (text) => text.replace(/\s+/g, '-').toLowerCase(),
  camelCase: (text) => text.replace(/[-_\s](\w)/g, (_, c) => c.toUpperCase()),
  removeEmpty: (text) => text.trim() === '' ? '' : text,
  squeeze: (text) => text.replace(/\s+/g, ' '),
  padLeft: (text, len = 20) => text.padStart(len),
  padRight: (text, len = 20) => text.padEnd(len),
  truncate: (text, len = 50) => text.length > len ? text.slice(0, len) + '...' : text
};

/**
 * Apply a filter to text
 * @param {string} text - Input text
 * @param {string} filterName - Name of the filter to apply
 * @param {*} extraArgs - Extra arguments for filters that need them
 * @returns {string} Filtered text
 */
function applyFilter(text, filterName, extraArgs) {
  const filter = filters[filterName];
  if (!filter) {
    throw new Error(`Unknown filter: ${filterName}`);
  }
  return filter(text, extraArgs);
}

/**
 * Apply multiple filters in sequence
 * @param {string} text - Input text
 * @param {string[]} filterNames - Array of filter names
 * @returns {string} Filtered text
 */
function applyFilters(text, filterNames) {
  return filterNames.reduce((result, name) => applyFilter(result, name), text);
}

/**
 * Filter command handler
 * @param {Object} args - Command line arguments
 */
function filter(args) {
  const { parseFile } = require('../parser');
  const { logger } = require('../utils');

  const inputFile = args._[1];
  const filterType = args.type || args.t;

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  if (!filterType) {
    logger.error('Filter type required (--type)');
    process.exit(1);
  }

  const parsed = parseFile(inputFile);
  const filterNames = filterType.split(',').map(f => f.trim());

  const result = parsed.lines
    .map(line => applyFilters(line, filterNames))
    .join('\n');

  if (args.output || args.o) {
    const { writeFile } = require('../utils');
    writeFile(args.output || args.o, result);
    logger.info(`Output written to ${args.output || args.o}`);
  } else {
    console.log(result);
  }
}

/**
 * Search/filter lines matching a pattern (grep-like)
 * @param {Object} args - Command line arguments
 */
function search(args) {
  const { parseFile } = require('../parser');
  const { logger } = require('../utils');

  const inputFile = args._[1];
  const pattern = args.pattern || args.p;

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  if (!pattern) {
    logger.error('Search pattern required (--pattern)');
    process.exit(1);
  }

  const parsed = parseFile(inputFile);
  const regex = new RegExp(pattern, args.ignoreCase || args.i ? 'i' : '');
  const invert = args.invert || args.v;

  const result = parsed.lines
    .filter(line => invert ? !regex.test(line) : regex.test(line))
    .join('\n');

  if (args.output || args.o) {
    const { writeFile } = require('../utils');
    writeFile(args.output || args.o, result);
    logger.info(`Output written to ${args.output || args.o}`);
  } else {
    console.log(result);
  }
}

/**
 * Add line numbers to output
 * @param {Object} args - Command line arguments
 */
function numberLines(args) {
  const { parseFile } = require('../parser');
  const { logger } = require('../utils');

  const inputFile = args._[1];
  const start = parseInt(args.start || args.s, 10) || 1;
  const separator = args.separator || args.sep || '. ';

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  const parsed = parseFile(inputFile);
  const result = parsed.lines
    .map((line, i) => `${start + i}${separator}${line}`)
    .join('\n');

  if (args.output || args.o) {
    const { writeFile } = require('../utils');
    writeFile(args.output || args.o, result);
    logger.info(`Output written to ${args.output || args.o}`);
  } else {
    console.log(result);
  }
}

module.exports = {
  filters,
  applyFilter,
  applyFilters,
  filter,
  search,
  numberLines
};
