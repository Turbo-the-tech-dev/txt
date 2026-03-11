/**
 * Unit Tests for Filters Module
 */

const assert = require('assert');
const { filters, applyFilter, applyFilters } = require('../../src/filters');

function runTests() {
  console.log('Running Filters Module Tests...\n');

  // Test built-in filters
  console.log('Test: uppercase should convert to uppercase');
  assert.strictEqual(filters.uppercase('hello'), 'HELLO');
  console.log('  ✓ Passed\n');

  console.log('Test: lowercase should convert to lowercase');
  assert.strictEqual(filters.lowercase('HELLO'), 'hello');
  console.log('  ✓ Passed\n');

  console.log('Test: trim should remove whitespace');
  assert.strictEqual(filters.trim('  hello  '), 'hello');
  console.log('  ✓ Passed\n');

  console.log('Test: reverse should reverse the string');
  assert.strictEqual(filters.reverse('hello'), 'olleh');
  console.log('  ✓ Passed\n');

  console.log('Test: capitalize should capitalize first letter of words');
  assert.strictEqual(filters.capitalize('hello world'), 'Hello World');
  console.log('  ✓ Passed\n');

  console.log('Test: titleCase should convert to title case');
  assert.strictEqual(filters.titleCase('hello WORLD'), 'Hello World');
  console.log('  ✓ Passed\n');

  console.log('Test: snakeCase should convert to snake case');
  assert.strictEqual(filters.snakeCase('hello world'), 'hello_world');
  console.log('  ✓ Passed\n');

  console.log('Test: kebabCase should convert to kebab case');
  assert.strictEqual(filters.kebabCase('hello world'), 'hello-world');
  console.log('  ✓ Passed\n');

  console.log('Test: camelCase should convert to camel case');
  assert.strictEqual(filters.camelCase('hello-world'), 'helloWorld');
  console.log('  ✓ Passed\n');

  console.log('Test: squeeze should collapse multiple spaces');
  assert.strictEqual(filters.squeeze('hello   world'), 'hello world');
  console.log('  ✓ Passed\n');

  console.log('Test: base64Encode should encode to base64');
  assert.strictEqual(filters.base64Encode('hello'), 'aGVsbG8=');
  console.log('  ✓ Passed\n');

  console.log('Test: base64Decode should decode from base64');
  assert.strictEqual(filters.base64Decode('aGVsbG8='), 'hello');
  console.log('  ✓ Passed\n');

  // Test applyFilter
  console.log('Test: applyFilter should apply a single filter');
  assert.strictEqual(applyFilter('hello', 'uppercase'), 'HELLO');
  console.log('  ✓ Passed\n');

  console.log('Test: applyFilter should throw error for unknown filter');
  try {
    applyFilter('test', 'unknown');
    assert.fail('Should have thrown');
  } catch (error) {
    assert.ok(error.message.includes('Unknown filter'));
  }
  console.log('  ✓ Passed\n');

  // Test applyFilters
  console.log('Test: applyFilters should apply multiple filters in sequence');
  assert.strictEqual(applyFilters('  hello  ', ['trim', 'uppercase']), 'HELLO');
  console.log('  ✓ Passed\n');

  console.log('Test: applyFilters should apply filters in correct order');
  assert.strictEqual(applyFilters('hello world', ['uppercase', 'reverse']), 'DLROW OLLEH');
  console.log('  ✓ Passed\n');

  console.log('✅ All filters unit tests passed!\n');
}

runTests();
