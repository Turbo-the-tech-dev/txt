/**
 * Config module - YAML/JSON config parsing
 */

const fs = require('fs');
const path = require('path');

/**
 * Simple YAML parser (supports basic key-value, arrays, nested objects)
 * @param {string} yaml - YAML content
 * @returns {Object} Parsed object
 */
function parseYaml(yaml) {
  const result = {};
  const lines = yaml.split('\n');
  const stack = [{ obj: result, indent: -1 }];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.search(/\S/);
    const isListItem = trimmed.startsWith('- ');

    // Pop stack until we find parent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1].obj;

    if (isListItem) {
      const value = trimmed.slice(2).trim();
      if (Array.isArray(current)) {
        current.push(parseValue(value));
      }
    } else {
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      if (value === '') {
        // Check if next line is a list or object
        const nextLine = lines[lines.indexOf(line) + 1];
        if (nextLine && nextLine.trim().startsWith('- ')) {
          current[key] = [];
        } else {
          current[key] = {};
        }
        stack.push({ obj: current[key], indent });
      } else {
        current[key] = parseValue(value);
      }
    }
  }

  return result;
}

/**
 * Parse a YAML value to appropriate type
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
