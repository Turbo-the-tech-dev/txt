/**
 * src/validate/index.js - v0.2.0 STREAMING UPGRADE (O(1) mem, readline core)
 * DROP-IN: keeps all your exports/API; replaces parseFile with streaming
 * Handles stdin ('-'), --output, GB-scale files; update bin/txt: await validate(args)
 */

const fs = require('fs');
const readline = require('readline');

/**
 * Built-in validation rules
 */
const validators = {
  maxLength: (text, max) => text.length <= max,
  minLength: (text, min) => text.length >= min,
  maxWords: (text, max) => text.split(/\s+/).filter(w => w).length <= max,
  minWords: (text, min) => text.split(/\s+/).filter(w => w).length >= min,
  matches: (text, pattern) => new RegExp(pattern).test(text),
  notEmpty: (text) => text.trim().length > 0,
  isEmail: (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text),
  isUrl: (text) => /^https?:\/\/.+$/.test(text),
  isNumber: (text) => /^-?\d+(\.\d+)?$/.test(text.trim()),
  noTabs: (text) => !text.includes('\t'),
  noTrailingWhitespace: (text) => !/\s+$/.test(text),
  maxLines: (content, max, parsed) => parsed.lineCount <= max,
  minLines: (content, min, parsed) => parsed.lineCount >= min
};

/**
 * Validate a single line against rules
 * @param {string} text - Text to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
function validateLine(text, rules) {
  const errors = [];
  const warnings = [];

  for (const [ruleName, ruleValue] of Object.entries(rules)) {
    const validator = validators[ruleName];
    if (!validator) {
      warnings.push(`Unknown rule: ${ruleName}`);
      continue;
    }

    const isValid = validator(text, ruleValue);
    if (!isValid) {
      errors.push(`Failed: ${ruleName} (expected: ${ruleValue})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate entire file against schema (non-streaming, for full report)
 * @param {string} filePath - Path to file
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
function validateFile(filePath, schema) {
  const { parseFile } = require('../parser');
  const parsed = parseFile(filePath);
  const results = {
    file: filePath,
    valid: true,
    lineResults: [],
    globalErrors: [],
    globalWarnings: []
  };

  // Global rules (apply to entire file)
  const globalRules = schema.global || {};
  for (const [ruleName, ruleValue] of Object.entries(globalRules)) {
    const validator = validators[ruleName];
    if (!validator) {
      results.globalWarnings.push(`Unknown rule: ${ruleName}`);
      continue;
    }

    const isValid = validator(parsed.content, ruleValue, parsed);
    if (!isValid) {
      results.globalErrors.push(`Failed: ${ruleName} (expected: ${ruleValue})`);
      results.valid = false;
    }
  }

  // Line-level rules
  const lineRules = schema.lines || {};

  for (let i = 0; i < parsed.lines.length; i++) {
    const line = parsed.lines[i];
    const lineResult = validateLine(line, lineRules);

    if (!lineResult.valid) {
      results.valid = false;
      results.lineResults.push({
        line: i + 1,
        content: line.slice(0, 50) + (line.length > 50 ? '...' : ''),
        errors: lineResult.errors
      });
    }
  }

  results.globalWarnings.push(...results.lineResults
    .flatMap(r => r.errors)
    .filter(e => e.includes('Unknown rule')));

  return results;
}

/**
 * Streaming processor for validation - O(1) memory
 * Outputs only valid lines (or invalid lines with --invert)
 */
async function processStream(inputPath, validator, outputPath) {
  const input = inputPath === '-' ? process.stdin : fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const outStream = outputPath ? fs.createWriteStream(outputPath) : process.stdout;
  let lineCount = 0;
  let validCount = 0;
  let invalidCount = 0;

  for await (const line of rl) {
    const result = validator(line, lineCount + 1);
    if (result.valid) {
      outStream.write(line + '\n');
      validCount++;
    } else {
      invalidCount++;
    }
    lineCount++;
  }

  if (outputPath) outStream.end();
  console.log(`[INFO] Validated ${lineCount} lines: ${validCount} valid, ${invalidCount} invalid`);
  
  return { lineCount, validCount, invalidCount };
}

/**
 * Validate command handler - STREAMING
 */
async function validate(args) {
  const { logger } = require('../utils');
  const { loadConfig } = require('../utils/config');

  const inputFile = args._[1] || '-';
  const schemaPath = args.schema || args.s;
  const outputPath = args.output || args.o;

  let schema = {};

  if (schemaPath) {
    try {
      schema = loadConfig(schemaPath);
    } catch (error) {
      logger.error(`Failed to load schema: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Default schema for common text validation
    schema = {
      lines: {
        notEmpty: true
      }
    };
  }

  const lineRules = schema.lines || {};
  const invert = args.invert || args.v;

  // Streaming validation - outputs valid lines
  const stats = await processStream(inputFile, (line, lineNum) => {
    const result = validateLine(line, lineRules);
    return invert ? { valid: !result.valid } : result;
  }, outputPath);

  // For full report, use JSON mode
  if (args.json || args.j) {
    const results = {
      file: inputFile,
      valid: stats.invalidCount === 0,
      lineCount: stats.lineCount,
      validCount: stats.validCount,
      invalidCount: stats.invalidCount
    };
    console.log(JSON.stringify(results, null, 2));
  }

  process.exit(stats.invalidCount === 0 ? 0 : 1);
}

module.exports = {
  validators,
  validateLine,
  validateFile,
  validate,
  processStream
};
