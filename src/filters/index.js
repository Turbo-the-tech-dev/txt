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
  base64Decode: (text) => Buffer.from(text, 'base64').toString('utf-8')
};

/**
 * Apply a filter to text
 * @param {string} text - Input text
 * @param {string} filterName - Name of the filter to apply
 * @returns {string} Filtered text
 */
function applyFilter(text, filterName) {
  const filter = filters[filterName];
  if (!filter) {
    throw new Error(`Unknown filter: ${filterName}`);
  }
  return filter(text);
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
    const fs = require('fs');
    fs.writeFileSync(args.output || args.o, result);
    logger.info(`Output written to ${args.output || args.o}`);
  } else {
    console.log(result);
  }
}

module.exports = {
  filters,
  applyFilter,
  applyFilters,
  filter
};
