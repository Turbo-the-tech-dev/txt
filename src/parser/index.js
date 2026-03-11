/**
 * Parser module - Text parsing logic
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a text file and return structured output
 * @param {string} filePath - Path to the input file
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed content
 */
function parseFile(filePath, options = {}) {
  const { encoding = 'utf-8', lineEnding = 'unix' } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, encoding);
  const lines = normalizeLineEndings(content, lineEnding);
  const words = content.split(/\s+/).filter(w => w.length > 0);

  return {
    path: path.resolve(filePath),
    content: content,
    lines: lines,
    lineCount: lines.length,
    wordCount: words.length,
    charCount: content.length,
    charCountNoSpaces: content.replace(/\s/g, '').length,
    encoding: encoding
  };
}

/**
 * Normalize line endings based on option
 * @param {string} content - File content
 * @param {string} lineEnding - 'unix', 'windows', or 'old-mac'
 * @returns {string[]} Array of lines
 */
function normalizeLineEndings(content, lineEnding = 'unix') {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized.split('\n');
}

/**
 * Parse text content directly
 * @param {string} content - Text content
 * @returns {Object} Parsed content
 */
function parseContent(content) {
  const lines = content.split('\n');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  return {
    content: content,
    lines: lines,
    lineCount: lines.length,
    wordCount: words.length,
    charCount: content.length,
    charCountNoSpaces: content.replace(/\s/g, '').length
  };
}

/**
 * Get file statistics
 * @param {string} filePath - Path to the input file
 * @returns {Object} File statistics
 */
function getStats(filePath) {
  const parsed = parseFile(filePath);
  const emptyLines = parsed.lines.filter(l => l.trim() === '').length;
  
  return {
    file: parsed.path,
    lines: parsed.lineCount,
    words: parsed.wordCount,
    characters: parsed.charCount,
    charactersNoSpaces: parsed.charCountNoSpaces,
    emptyLines: emptyLines,
    codeLines: parsed.lineCount - emptyLines,
    averageLineLength: Math.round(parsed.charCount / parsed.lineCount * 100) / 100
  };
}

module.exports = {
  parseFile,
  parseContent,
  normalizeLineEndings,
  getStats,
  parse
};

/**
 * Parse command handler
 * @param {Object} args - Command line arguments
 */
function parse(args) {
  const { logger } = require('../utils');
  
  const inputFile = args._[1];

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  try {
    const result = parseFile(inputFile);
    
    if (args.json || args.j) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log('');
    console.log(`📄 File: ${result.path}`);
    console.log(`   Lines: ${result.lineCount}`);
    console.log(`   Words: ${result.wordCount}`);
    console.log(`   Characters: ${result.charCount}`);
    console.log(`   Characters (no spaces): ${result.charCountNoSpaces}`);
    console.log(`   Encoding: ${result.encoding}`);
    console.log('');
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}
