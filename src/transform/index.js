/**
 * Transform module - Text transformation engine
 */

const path = require('path');
const { parseFile } = require('../parser');
const { applyFilters } = require('../filters');
const { logger, writeFile } = require('../utils');
const { loadConfig } = require('../utils/config');

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

  let config = { filters: ['trim'] };

  if (configFile) {
    try {
      config = loadConfig(configFile);
    } catch (error) {
      logger.error(`Failed to parse config: ${error.message}`);
      process.exit(1);
    }
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

/**
 * Batch transform multiple files
 * @param {Object} args - Command line arguments
 */
function batchTransform(args) {
  const configPath = args.config || args.c;
  const files = args._.slice(1);

  if (!configPath) {
    logger.error('Config file required for batch transform (--config)');
    process.exit(1);
  }

  if (files.length === 0) {
    logger.error('At least one input file required');
    process.exit(1);
  }

  let config;
  try {
    config = loadConfig(configPath);
  } catch (error) {
    logger.error(`Failed to parse config: ${error.message}`);
    process.exit(1);
  }

  const filterNames = config.filters || ['trim'];
  const outputDir = args.output || args.o;

  for (const filePath of files) {
    try {
      const parsed = parseFile(filePath);
      const result = parsed.lines
        .map(line => applyFilters(line, filterNames))
        .join('\n');

      if (outputDir) {
        const fileName = path.basename(filePath);
        const outputPath = path.join(outputDir, fileName);
        writeFile(outputPath, result);
        logger.info(`Processed: ${filePath} -> ${outputPath}`);
      } else {
        console.log(`=== ${filePath} ===`);
        console.log(result);
        console.log('');
      }
    } catch (error) {
      logger.error(`Failed to process ${filePath}: ${error.message}`);
    }
  }
}

module.exports = {
  transform,
  batchTransform
};
