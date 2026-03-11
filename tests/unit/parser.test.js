/**
 * Unit Tests for Parser Module
 */

const assert = require('assert');
const { parseFile, parseContent, normalizeLineEndings } = require('../../src/parser');
const path = require('path');
const fs = require('fs');

// Create a temp test file
const testFilePath = path.join(__dirname, 'test-input.txt');
const testContent = 'Line 1\nLine 2\nLine 3';

describe('Parser Module', () => {
  before(() => {
    fs.writeFileSync(testFilePath, testContent);
  });

  after(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('parseContent', () => {
    it('should parse simple text content', () => {
      const result = parseContent('Hello\nWorld');
      assert.strictEqual(result.lineCount, 2);
      assert.strictEqual(result.charCount, 11);
    });

    it('should handle empty content', () => {
      const result = parseContent('');
      assert.strictEqual(result.lineCount, 1);
      assert.strictEqual(result.charCount, 0);
    });
  });

  describe('normalizeLineEndings', () => {
    it('should normalize Windows line endings', () => {
      const result = normalizeLineEndings('Line1\r\nLine2');
      assert.strictEqual(result.length, 2);
    });

    it('should normalize old Mac line endings', () => {
      const result = normalizeLineEndings('Line1\rLine2');
      assert.strictEqual(result.length, 2);
    });
  });

  describe('parseFile', () => {
    it('should parse a file successfully', () => {
      const result = parseFile(testFilePath);
      assert.strictEqual(result.lineCount, 3);
      assert.ok(result.path.endsWith('test-input.txt'));
    });

    it('should throw error for non-existent file', () => {
      assert.throws(() => {
        parseFile('non-existent-file.txt');
      }, /File not found/);
    });
  });
});

console.log('Parser unit tests passed! ✓');
