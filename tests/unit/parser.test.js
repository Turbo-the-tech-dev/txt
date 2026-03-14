/**
 * Unit Tests for Parser Module
 */

const assert = require('assert');
const { parseFile, parseContent, normalizeLineEndings, getStats } = require('../../src/parser');
const path = require('path');
const fs = require('fs');

// Create a temp test file
const testFilePath = path.join(__dirname, 'test-input.txt');
const testContent = 'Line 1\nLine 2\nLine 3';

function runTests() {
  console.log('Running Parser Module Tests...\n');

  // Test parseContent
  console.log('Test: parseContent should parse simple text content');
  const result = parseContent('Hello\nWorld');
  assert.strictEqual(result.lineCount, 2);
  assert.strictEqual(result.wordCount, 2);
  console.log('  ✓ Passed\n');

  console.log('Test: parseContent should handle empty content');
  const emptyResult = parseContent('');
  assert.strictEqual(emptyResult.lineCount, 1);
  assert.strictEqual(emptyResult.charCount, 0);
  console.log('  ✓ Passed\n');

  console.log('Test: parseContent should count words correctly');
  const wordResult = parseContent('one two three four');
  assert.strictEqual(wordResult.wordCount, 4);
  console.log('  ✓ Passed\n');

  // Test normalizeLineEndings
  console.log('Test: normalizeLineEndings should normalize Windows line endings');
  const windowsResult = normalizeLineEndings('Line1\r\nLine2');
  assert.strictEqual(windowsResult.split('\n').length, 2);
  console.log('  ✓ Passed\n');

  console.log('Test: normalizeLineEndings should normalize old Mac line endings');
  const macResult = normalizeLineEndings('Line1\rLine2');
  assert.strictEqual(macResult.split('\n').length, 2);
  console.log('  ✓ Passed\n');

  // Test parseFile
  fs.writeFileSync(testFilePath, testContent);
  
  console.log('Test: parseFile should parse a file successfully');
  const fileResult = parseFile(testFilePath);
  assert.strictEqual(fileResult.lineCount, 3);
  assert.strictEqual(fileResult.wordCount, 6);
  assert.ok(fileResult.path.endsWith('test-input.txt'));
  console.log('  ✓ Passed\n');

  console.log('Test: parseFile should throw error for non-existent file');
  try {
    parseFile('non-existent-file.txt');
    assert.fail('Should have thrown');
  } catch (error) {
    assert.ok(error.message.includes('File not found'));
  }
  console.log('  ✓ Passed\n');

  console.log('Test: parseFile should include content in result');
  assert.strictEqual(fileResult.content, testContent);
  console.log('  ✓ Passed\n');

  // Test getStats
  console.log('Test: getStats should return file statistics');
  const stats = getStats(testFilePath);
  assert.strictEqual(stats.lines, 3);
  assert.strictEqual(stats.words, 6);
  assert.ok(stats.file.endsWith('test-input.txt'));
  console.log('  ✓ Passed\n');

  console.log('Test: getStats should count empty lines');
  const emptyFile = path.join(__dirname, 'test-empty.txt');
  fs.writeFileSync(emptyFile, 'Line1\n\nLine3');
  const emptyStats = getStats(emptyFile);
  assert.strictEqual(emptyStats.emptyLines, 1);
  assert.strictEqual(emptyStats.codeLines, 2);
  fs.unlinkSync(emptyFile);
  console.log('  ✓ Passed\n');

  // Cleanup
  fs.unlinkSync(testFilePath);

  console.log('✅ All parser unit tests passed!\n');
}

runTests();
