/**
 * Config module - YAML/JSON config parsing
 * Uses native yaml package for full YAML spec support
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

/**
 * Parse YAML content using yaml package (full spec support)
 * @param {string} yaml - YAML content
 * @returns {Object} Parsed object
 */
function parseYaml(yaml) {
  return YAML.parse(yaml);
}

/**
 * Parse a YAML value to appropriate type (for inline use)
 * @param {string} value - Value string
 * @returns {*} Parsed value
 */
function parseValue(value) {
  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Null
  if (value === 'null' || value === '~') return null;

  // Number
  const num = Number(value);
  if (!isNaN(num)) return num;

  return value;
}

/**
 * Load config from file (YAML or JSON)
 * @param {string} filePath - Path to config file
 * @returns {Object} Parsed config
 */
function loadConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return JSON.parse(content);
  }

  if (ext === '.yaml' || ext === '.yml') {
    return parseYaml(content);
  }

  // Try JSON first, then YAML
  try {
    return JSON.parse(content);
  } catch {
    return parseYaml(content);
  }
}

module.exports = {
  parseYaml,
  parseValue,
  loadConfig
};
