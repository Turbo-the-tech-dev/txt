/**
 * Transform module - Text transformation engine
 */

const { parseFile } = require('../parser');
const { applyFilters } = require('../filters');
const { logger, writeFile } = require('../utils');

/**
 * Transform command handler
 * @param {Object} args - Command line arguments
 */
function transform(args) {
  const inputFile = args._[1];
  const configFile = args.config || args.c;

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  let config = { filters: [] };

  if (configFile) {
    const fs = require('fs');
    if (!fs.existsSync(configFile)) {
      logger.error(`Config file not found: ${configFile}`);
      process.exit(1);
    }
    
    // Simple YAML-like config parsing (for demo)
    const configContent = fs.readFileSync(configFile, 'utf-8');
    // TODO: Implement proper YAML parsing
    config = JSON.parse(configContent.replace(/(\w+):/g, '"$1":'));
  }

  const parsed = parseFile(inputFile);
  const filterNames = config.filters || ['trim'];

  const result = parsed.lines
    .map(line => applyFilters(line, filterNames))
    .join('\n');

  if (args.output || args.o) {
    writeFile(args.output || args.o, result);
    logger.info(`Output written to ${args.output || args.o}`);
  } else {
    console.log(result);
  }
}

module.exports = {
  transform
};
