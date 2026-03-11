/**
 * src/transform/index.js - v0.2.0 STREAMING UPGRADE (O(1) mem, readline core)
 * DROP-IN: keeps all your exports/API; replaces parseFile with streaming
 * Handles stdin ('-'), --output, GB-scale files; update bin/txt: await transform(args)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Streaming processor - O(1) memory, handles GB-scale files
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
 * Transform command handler - STREAMING
 */
async function transform(args) {
  const { logger } = require('../utils');
  const { loadConfig } = require('../utils/config');

  const inputFile = args._[1] || '-';
  const configFile = args.config || args.c;
  const outputPath = args.output || args.o;

  let config = { filters: ['trim'] };

  if (configFile) {
    try {
      config = loadConfig(configFile);
    } catch (error) {
      logger.error(`Failed to parse config: ${error.message}`);
      process.exit(1);
    }
  }

  const filterNames = config.filters || ['trim'];
  const { applyFilters } = require('../filters');
  const proc = line => applyFilters(line, filterNames);

  await processStream(inputFile, proc, outputPath);
}

/**
 * Batch transform multiple files - STREAMING
 */
async function batchTransform(args) {
  const { logger } = require('../utils');
  const { loadConfig } = require('../utils/config');
  const { applyFilters } = require('../filters');

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
      const outputPath = outputDir 
        ? path.join(outputDir, path.basename(filePath))
        : null;

      const proc = line => applyFilters(line, filterNames);
      await processStream(filePath, proc, outputPath);

      if (outputPath) {
        logger.info(`Processed: ${filePath} -> ${outputPath}`);
      } else {
        console.log(`=== ${filePath} ===`);
      }
    } catch (error) {
      logger.error(`Failed to process ${filePath}: ${error.message}`);
    }
  }
}

module.exports = {
  transform,
  batchTransform,
  processStream
};
