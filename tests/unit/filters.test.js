/**
 * Unit Tests for Filters Module
 */

const assert = require('assert');
const { filters, applyFilter, applyFilters } = require('../../src/filters');

describe('Filters Module', () => {
  describe('built-in filters', () => {
    it('uppercase should convert to uppercase', () => {
      assert.strictEqual(filters.uppercase('hello'), 'HELLO');
    });

    it('lowercase should convert to lowercase', () => {
      assert.strictEqual(filters.lowercase('HELLO'), 'hello');
    });

    it('trim should remove whitespace', () => {
      assert.strictEqual(filters.trim('  hello  '), 'hello');
    });

    it('reverse should reverse the string', () => {
      assert.strictEqual(filters.reverse('hello'), 'olleh');
    });
  });

  describe('applyFilter', () => {
    it('should apply a single filter', () => {
      const result = applyFilter('hello', 'uppercase');
      assert.strictEqual(result, 'HELLO');
    });

    it('should throw error for unknown filter', () => {
      assert.throws(() => {
        applyFilter('test', 'unknown');
      }, /Unknown filter/);
    });
  });

  describe('applyFilters', () => {
    it('should apply multiple filters in sequence', () => {
      const result = applyFilters('  hello  ', ['trim', 'uppercase']);
      assert.strictEqual(result, 'HELLO');
    });
  });
});

console.log('Filters unit tests passed! ✓');
