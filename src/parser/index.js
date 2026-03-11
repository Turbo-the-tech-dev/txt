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
  const { encoding = 'utf-8' } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, encoding);
  const lines = normalizeLineEndings(content);

  return {
    path: path.resolve(filePath),
    lines: lines,
    lineCount: lines.length,
    charCount: content.length,
    encoding: encoding
  };
}

/**
 * Normalize line endings
 * @param {string} content - File content
 * @returns {string[]} Array of lines
 */
function normalizeLineEndings(content) {
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
  return {
    lines: lines,
    lineCount: lines.length,
    charCount: content.length
  };
}

module.exports = {
  parseFile,
  parseContent,
  normalizeLineEndings
};
