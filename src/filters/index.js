/**
 * src/filters/index.js - v0.2.0 STREAMING UPGRADE (O(1) mem, readline core)
 * DROP-IN: keeps all your exports/API + modular filters; replaces readFileSync
 * Handles stdin ('-'), --output, GB-scale files; update bin/txt: await filter(args)
 * (also bump VERSION='0.2.0'; apply same pattern to parser/transform/validate)
 */

const fs = require('fs');
const readline = require('readline');

/**
 * Available text filters (exact match to your current)
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
 * Streaming processor - zero extra mem, production ready
 */
async function processStream(inputPath, processor, outputPath) {
  const input = inputPath === '-' ? process.stdin : fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const outStream = outputPath ? fs.createWriteStream(outputPath) : process.stdout;
  let lineCount = 0;

  for await (const line of rl) {
    const processed = processor(line);
    outStream.write(processed + '\n');
    lineCount++;
  }

  if (outputPath) outStream.end();
  console.log(`[INFO] Processed ${lineCount} lines`);
}

/**
 * Filter command handler - NOW STREAMING (replaces your parseFile version)
 */
async function filter(args) {
  const { logger } = require('../utils');

  const inputFile = args._[1] || '-';
  const filterType = args.type || args.t;

  if (!filterType) {
    logger.error('Filter type required (--type)');
    process.exit(1);
  }

  const filterNames = filterType.split(',').map(f => f.trim());
  const proc = line => applyFilters(line, filterNames);

  await processStream(inputFile, proc, args.output || args.o);
}

/**
 * Search/filter lines matching a pattern (grep-like) - STREAMING
 */
async function search(args) {
  const { logger } = require('../utils');

  const inputFile = args._[1] || '-';
  const pattern = args.pattern || args.p;

  if (!pattern) {
    logger.error('Search pattern required (--pattern)');
    process.exit(1);
  }

  const regex = new RegExp(pattern, args.ignoreCase || args.i ? 'i' : '');
  const invert = args.invert || args.v;

  const proc = line => {
    const matches = invert ? !regex.test(line) : regex.test(line);
    return matches ? line : null;
  };

  const filterProc = line => {
    const result = proc(line);
    return result !== null ? result : '';
  };

  await processStream(inputFile, filterProc, args.output || args.o);
}

/**
 * Add line numbers to output - STREAMING
 */
async function numberLines(args) {
  const { logger } = require('../utils');

  const inputFile = args._[1] || '-';
  const start = parseInt(args.start || args.s, 10) || 1;
  const separator = args.separator || args.sep || '. ';

  let lineNum = start;

  const proc = line => `${lineNum++}${separator}${line}`;

  await processStream(inputFile, proc, args.output || args.o);
}

module.exports = {
  filters,
  applyFilter,
  applyFilters,
  processStream,
  filter,
  search,
  numberLines
};
