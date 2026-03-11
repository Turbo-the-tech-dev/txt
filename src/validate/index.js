/**
 * src/validate/index.js - YAML SCHEMA VALIDATION v1.0 (lightweight rule engine, streaming O(1) mem)
 * Drop-in: npm install yaml (already in deps); supports pre_filters + rules array
 * Schema YAML example:
 * validation:
 *   pre_filters: [trim, lowercase]
 *   rules:
 *     - type: pattern
 *       pattern: ^[A-Z0-9_]+$
 *       message: "Must be uppercase alphanum"
 *     - type: length
 *       min: 3
 *       max: 500
 *     - type: enum
 *       values: ["ERROR", "WARN", "INFO"]
 *     - type: prefix
 *       value: "LOG_"
 *   on_invalid: skip  # skip | warn | fail
 * Update bin/txt: const { validate } = require('../src/validate'); await validate(args);
 */

const fs = require('fs');
const readline = require('readline');
const YAML = require('yaml');
const { applyFilters } = require('../filters/index');

const DEFAULT_SCHEMA = {
  pre_filters: ['trim'],
  rules: [],
  on_invalid: 'skip'
};

/**
 * Load + normalize YAML validation schema
 */
function loadSchema(schemaPath) {
  if (!schemaPath || !fs.existsSync(schemaPath)) {
    console.warn('[WARN] No schema provided, using empty rules (all lines pass)');
    return DEFAULT_SCHEMA;
  }
  try {
    const raw = YAML.parse(fs.readFileSync(schemaPath, 'utf8')) || {};
    const schema = { ...DEFAULT_SCHEMA, ...(raw.validation || raw) };
    if (!Array.isArray(schema.rules)) schema.rules = [];
    schema.pre_filters = Array.isArray(schema.pre_filters) ? schema.pre_filters : ['trim'];
    return schema;
  } catch (err) {
    console.error(`[ERROR] YAML schema parse failed: ${schemaPath} -> ${err.message}`);
    process.exit(1);
  }
}

/**
 * Rule engine - returns {valid: bool, error?: string}
 */
function validateLine(line, rules) {
  for (const rule of rules) {
    switch (rule.type) {
      case 'pattern':
        if (!new RegExp(rule.pattern).test(line)) return { valid: false, error: rule.message || `Failed pattern: ${rule.pattern}` };
        break;
      case 'length':
        if (rule.min !== undefined && line.length < rule.min) return { valid: false, error: `Too short (min ${rule.min})` };
        if (rule.max !== undefined && line.length > rule.max) return { valid: false, error: `Too long (max ${rule.max})` };
        break;
      case 'notEmpty':
        if (!line) return { valid: false, error: 'Empty line' };
        break;
      case 'enum':
        if (!rule.values.includes(line)) return { valid: false, error: `Not in enum: ${rule.values.join(', ')}` };
        break;
      case 'prefix':
        if (!line.startsWith(rule.value)) return { valid: false, error: `Missing prefix: ${rule.value}` };
        break;
      case 'suffix':
        if (!line.endsWith(rule.value)) return { valid: false, error: `Missing suffix: ${rule.value}` };
        break;
      default:
        console.warn(`[WARN] Unknown rule type: ${rule.type}`);
    }
  }
  return { valid: true };
}

/**
 * Shared streaming core - O(1) memory
 */
async function processStream(inputPath, processor, outputPath) {
  const input = inputPath === '-' ? process.stdin : fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const outStream = outputPath ? fs.createWriteStream(outputPath) : process.stdout;
  let total = 0, valid = 0, invalid = 0;

  for await (const line of rl) {
    total++;
    const processed = processor(line);
    if (processed.valid) {
      outStream.write(line + '\n');
      valid++;
    } else {
      invalid++;
      if (processed.onInvalid === 'fail') {
        console.error(`[FAIL] Line ${total}: ${processed.error}`);
        process.exit(1);
      } else if (processed.onInvalid === 'warn') {
        console.warn(`[WARN] Line ${total}: ${processed.error}`);
      }
      // skip: do nothing
    }
  }

  if (outputPath) outStream.end();
  console.log(`[INFO] Validated ${valid}/${total} lines`);
}

/**
 * Validate command handler - full YAML schema + streaming
 */
async function validate(args) {
  const inputFile = args._[1] || '-';
  const schemaPath = args.schema || args.s || args.config || args.c;
  const schema = loadSchema(schemaPath);

  const preProc = line => applyFilters(line, schema.pre_filters);
  const proc = rawLine => {
    const line = preProc(rawLine);
    const result = validateLine(line, schema.rules);
    return { ...result, onInvalid: schema.on_invalid };
  };

  await processStream(inputFile, proc, args.output || args.o);
}

module.exports = { validate, loadSchema, validateLine };
