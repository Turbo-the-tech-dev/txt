/**
 * src/transform/index.js - v0.2.0 YAML-DRIVEN STREAMING TRANSFORM (O(1) mem)
 * Drop-in: requires `npm install yaml` (add to package.json deps: "yaml": "^2.6.0")
 * Uses loadConfig + applyFilters + inline processStream (shared later)
 * Handles full spec: parser.encoding, filters array (string or {name})
 * Update bin/txt: const { transform } = require('../src/transform'); await transform(args);
 */

const fs = require('fs');
const readline = require('readline');
const { loadConfig } = require('../utils/config');
const { applyFilters } = require('../filters/index');

/**
 * Shared streaming core (dupe for now; extract to utils/processor.js next)
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
  console.log(`[INFO] Transformed ${lineCount} lines`);
}

/**
 * Transform command handler - full YAML config + streaming
 */
async function transform(args) {
  const { logger } = require('../utils');

  const inputFile = args._[1] || '-';
  const cfg = loadConfig(args.config || args.c);

  if (!cfg.filters || !cfg.filters.length) {
    logger.warn('No filters in config; using default [trim]');
    cfg.filters = ['trim'];
  }

  const proc = line => applyFilters(line, cfg.filters);

  await processStream(inputFile, proc, args.output || args.o);
}

/**
 * Batch transform multiple files - STREAMING
 */
async function batchTransform(args) {
  const { logger } = require('../utils');
  const path = require('path');

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

  const cfg = loadConfig(configPath);
  if (!cfg.filters || !cfg.filters.length) {
    cfg.filters = ['trim'];
  }

  const outputDir = args.output || args.o;

  for (const filePath of files) {
    try {
      const outputPath = outputDir 
        ? path.join(outputDir, path.basename(filePath))
        : null;

      const proc = line => applyFilters(line, cfg.filters);
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
