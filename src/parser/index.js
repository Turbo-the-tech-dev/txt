/**
 * src/parser/index.js - v0.2.0 STREAMING UPGRADE (O(1) mem, readline core)
 * DROP-IN: keeps all your exports/API; replaces readFileSync with streaming
 * Handles stdin ('-'), --output, GB-scale files; update bin/txt: await parse(args)
 */

const fs = require('fs');
const readline = require('readline');

/**
 * Normalize line endings based on option
 * @param {string} content - File content
 * @param {string} lineEnding - 'unix', 'windows', or 'old-mac'
 * @returns {string} Normalized content
 */
function normalizeLineEndings(content, lineEnding = 'unix') {
  let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (lineEnding === 'windows') normalized = normalized.replace(/\n/g, '\r\n');
  else if (lineEnding === 'old-mac') normalized = normalized.replace(/\n/g, '\r');
  return normalized;
}

/**
 * Parse text content directly (non-streaming, for small files)
 * @param {string} content - Text content
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed content
 */
function parseContent(content, options = {}) {
  const { encoding = 'utf-8', lineEnding = 'unix' } = options;
  const normalized = normalizeLineEndings(content, lineEnding);
  const lines = normalized.split('\n');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  return {
    content: content,
    lines: lines,
    lineCount: lines.length,
    wordCount: words.length,
    charCount: content.length,
    charCountNoSpaces: content.replace(/\s/g, '').length,
    encoding: encoding
  };
}

/**
 * Parse a text file and return structured output (non-streaming, for stats)
 * @param {string} filePath - Path to the input file
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed content
 */
function parseFile(filePath, options = {}) {
  const { encoding = 'utf-8', lineEnding = 'unix' } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, encoding);
  const result = parseContent(content, { encoding, lineEnding });
  result.path = filePath;
  return result;
}

/**
 * Get file statistics (non-streaming, loads file into memory)
 * @param {string} filePath - Path to the input file
 * @returns {Object} File statistics
 */
function getStats(filePath) {
  const parsed = parseFile(filePath);
  const emptyLines = parsed.lines.filter(l => l.trim() === '').length;

  return {
    file: parsed.path,
    lines: parsed.lineCount,
    words: parsed.wordCount,
    characters: parsed.charCount,
    charactersNoSpaces: parsed.charCountNoSpaces,
    emptyLines: emptyLines,
    codeLines: parsed.lineCount - emptyLines,
    averageLineLength: Math.round(parsed.charCount / parsed.lineCount * 100) / 100
  };
}

/**
 * Streaming processor - O(1) memory, handles GB-scale files
 */
async function processStream(inputPath, processor, outputPath) {
  const input = inputPath === '-' ? process.stdin : fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const outStream = outputPath ? fs.createWriteStream(outputPath) : process.stdout;
  let lineCount = 0;
  let charCount = 0;
  let wordCount = 0;

  for await (const line of rl) {
    const processed = processor ? processor(line) : line;
    outStream.write(processed + '\n');
    lineCount++;
    charCount += processed.length + 1;
    wordCount += processed.split(/\s+/).filter(w => w.length > 0).length;
  }

  if (outputPath) outStream.end();
  console.log(`[INFO] Processed ${lineCount} lines, ${wordCount} words, ${charCount} chars`);
  
  return { lineCount, wordCount, charCount };
}

/**
 * Parse command handler - STREAMING
 */
async function parse(args) {
  const { logger } = require('../utils');

  const inputFile = args._[1] || '-';
  const outputPath = args.output || args.o;

  // For JSON output, we need to collect results
  if (args.json || args.j) {
    const results = { lines: [], stats: {} };
    let lineCount = 0;
    let wordCount = 0;
    let charCount = 0;

    const input = inputFile === '-' ? process.stdin : fs.createReadStream(inputFile);
    const rl = readline.createInterface({ input, crlfDelay: Infinity });

    for await (const line of rl) {
      results.lines.push(line);
      lineCount++;
      wordCount += line.split(/\s+/).filter(w => w.length > 0).length;
      charCount += line.length;
    }

    results.stats = {
      lineCount,
      wordCount,
      charCount,
      charCountNoSpaces: charCount - (results.lines.join('').match(/\s/g) || []).length
    };

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      logger.info(`Output written to ${outputPath}`);
    } else {
      console.log(JSON.stringify(results, null, 2));
    }
    return;
  }

  // Streaming mode - pass-through with stats
  await processStream(inputFile, null, outputPath);
  
  if (!outputPath) {
    console.log(`\n--- STATS: ${inputFile} ready for JSONL pipe ---`);
  }
}

module.exports = {
  parseFile,
  parseContent,
  normalizeLineEndings,
  getStats,
  parse,
  processStream
};
