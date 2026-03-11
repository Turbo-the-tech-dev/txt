/**
 * Count module - File and text statistics
 */

const { parseFile, getStats } = require('../parser');
const { logger } = require('../utils');
const fs = require('fs');
const path = require('path');

/**
 * Count words, lines, characters in a file
 * @param {Object} args - Command line arguments
 */
function count(args) {
  const files = args._.slice(1);
  const showDetails = args.details || args.d;
  const jsonOutput = args.json || args.j;

  if (files.length === 0) {
    logger.error('At least one file required');
    process.exit(1);
  }

  const results = [];
  let totalLines = 0;
  let totalWords = 0;
  let totalChars = 0;

  for (const filePath of files) {
    try {
      const stats = getStats(filePath);
      results.push(stats);
      totalLines += stats.lines;
      totalWords += stats.words;
      totalChars += stats.characters;
    } catch (error) {
      logger.error(`Failed to process ${filePath}: ${error.message}`);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ files: results, total: { lines: totalLines, words: totalWords, characters: totalChars } }, null, 2));
    return;
  }

  // Table output
  console.log('');
  console.log('┌─────────────────────────────────────┬────────┬────────┬──────────┬──────────┐');
  console.log('│ File                                │ Lines  │ Words  │ Chars    │ Chars NS │');
  console.log('├─────────────────────────────────────┼────────┼────────┼──────────┼──────────┤');

  for (const result of results) {
    const fileName = path.basename(result.file).padEnd(35);
    console.log(`│ ${fileName} │ ${String(result.lines).padStart(6)} │ ${String(result.words).padStart(6)} │ ${String(result.characters).padStart(8)} │ ${String(result.charactersNoSpaces).padStart(8)} │`);
  }

  console.log('├─────────────────────────────────────┼────────┼────────┼──────────┼──────────┤');
  console.log(`│ ${'TOTAL'.padEnd(35)} │ ${String(totalLines).padStart(6)} │ ${String(totalWords).padStart(6)} │ ${String(totalChars).padStart(8)} │ ${String(totalChars - results.reduce((sum, r) => sum + (r.lines - r.codeLines), 0)).padStart(8)} │`);
  console.log('└─────────────────────────────────────┴────────┴────────┴──────────┴──────────┘');
  console.log('');
}

/**
 * Show detailed file statistics
 * @param {Object} args - Command line arguments
 */
function stats(args) {
  const inputFile = args._[1];
  const showDetails = args.details || args.d;

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  const parsed = parseFile(inputFile);
  const emptyLines = parsed.lines.filter(l => l.trim() === '').length;
  const codeLines = parsed.lineCount - emptyLines;

  // Word frequency
  const words = parsed.content.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = {};
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Character frequency
  const charFreq = {};
  for (const char of parsed.content.replace(/\s/g, '')) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }
  const topChars = Object.entries(charFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Line length stats
  const lineLengths = parsed.lines.map(l => l.length);
  const avgLineLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length || 0;
  const maxLineLength = Math.max(...lineLengths, 0);
  const minLineLength = Math.min(...lineLengths, 0);

  console.log('');
  console.log(`📄 File Statistics: ${inputFile}`);
  console.log('');
  console.log('┌─────────────────────────┬────────────┐');
  console.log('│ Metric                  │ Value      │');
  console.log('├─────────────────────────┼────────────┤');
  console.log(`│ Lines                   │ ${String(parsed.lineCount).padStart(10)} │`);
  console.log(`│ Words                   │ ${String(parsed.wordCount).padStart(10)} │`);
  console.log(`│ Characters              │ ${String(parsed.charCount).padStart(10)} │`);
  console.log(`│ Characters (no spaces)  │ ${String(parsed.charCountNoSpaces).padStart(10)} │`);
  console.log(`│ Empty lines             │ ${String(emptyLines).padStart(10)} │`);
  console.log(`│ Code lines              │ ${String(codeLines).padStart(10)} │`);
  console.log(`│ Avg line length         │ ${String(Math.round(avgLineLength * 100) / 100).padStart(10)} │`);
  console.log(`│ Max line length         │ ${String(maxLineLength).padStart(10)} │`);
  console.log(`│ Min line length         │ ${String(minLineLength).padStart(10)} │`);
  console.log('└─────────────────────────┴────────────┘');
  console.log('');

  if (showDetails) {
    console.log('📊 Top 10 Words:');
    for (const [word, count] of topWords) {
      const bar = '█'.repeat(Math.min(count, 50));
      console.log(`   ${word.padEnd(15)} ${count.toString().padStart(4)} ${bar}`);
    }
    console.log('');

    console.log('📊 Top 10 Characters:');
    for (const [char, count] of topChars) {
      const bar = '█'.repeat(Math.min(count, 50));
      console.log(`   '${char}'.padEnd(15) ${count.toString().padStart(4)} ${bar}`);
    }
    console.log('');
  }
}

/**
 * Find duplicate lines
 * @param {Object} args - Command line arguments
 */
function findDuplicates(args) {
  const inputFile = args._[1];
  const ignoreCase = args.ignoreCase || args.i;

  if (!inputFile) {
    logger.error('Input file required');
    process.exit(1);
  }

  const parsed = parseFile(inputFile);
  const lineMap = new Map();

  for (let i = 0; i < parsed.lines.length; i++) {
    const line = parsed.lines[i];
    const key = ignoreCase ? line.toLowerCase().trim() : line.trim();
    if (!lineMap.has(key)) {
      lineMap.set(key, []);
    }
    lineMap.get(key).push(i + 1);
  }

  const duplicates = Array.from(lineMap.entries())
    .filter(([, lines]) => lines.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate lines found');
    return;
  }

  console.log(`\n📋 Found ${duplicates.length} duplicate lines:\n`);
  for (const [line, occurrences] of duplicates) {
    console.log(`   "${line.slice(0, 60)}${line.length > 60 ? '...' : ''}"`);
    console.log(`      Lines: ${occurrences.join(', ')}`);
    console.log('');
  }
}

module.exports = {
  count,
  stats,
  findDuplicates
};
