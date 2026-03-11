/**
 * Validate module - Text validation against schemas/rules
 */

const { parseFile } = require('../parser');
const { logger } = require('../utils');

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
 * Validate entire file against schema
 * @param {string} filePath - Path to file
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
function validateFile(filePath, schema) {
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
 * Validate command handler
 * @param {Object} args - Command line arguments
 */
function validate(args) {
  const inputFile = args._[1];
  const schemaPath = args.schema || args.s;

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  let schema = {};

  if (schemaPath) {
    const { loadConfig } = require('../utils/config');
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

  const results = validateFile(inputFile, schema);

  // Output results
  if (args.json || args.j) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`\n📄 File: ${results.file}`);
    console.log(`Status: ${results.valid ? '✅ Valid' : '❌ Invalid'}`);

    if (results.globalErrors.length > 0) {
      console.log('\n🔴 Global errors:');
      results.globalErrors.forEach(e => console.log(`   - ${e}`));
    }

    if (results.lineResults.length > 0) {
      console.log(`\n🔴 Line errors (${results.lineResults.length} lines):`);
      results.lineResults.slice(0, 10).forEach(r => {
        console.log(`   Line ${r.line}: ${r.errors.join(', ')}`);
        console.log(`      "${r.content}"`);
      });
      if (results.lineResults.length > 10) {
        console.log(`   ... and ${results.lineResults.length - 10} more`);
      }
    }

    if (results.valid && results.globalErrors.length === 0 && results.lineResults.length === 0) {
      console.log('\n✨ All validations passed!');
    }
  }

  process.exit(results.valid ? 0 : 1);
}

module.exports = {
  validators,
  validateLine,
  validateFile,
  validate
};
