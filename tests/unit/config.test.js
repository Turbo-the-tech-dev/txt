/**
 * Unit Tests for Config Module
 */

const assert = require('assert');
const { parseYaml, parseValue, loadConfig } = require('../../src/utils/config');
const path = require('path');
const fs = require('fs');

function runTests() {
  console.log('Running Config Module Tests...\n');

  // Test parseValue
  console.log('Test: parseValue should parse strings');
  assert.strictEqual(parseValue('hello'), 'hello');
  console.log('  ✓ Passed\n');

  console.log('Test: parseValue should parse quoted strings');
  assert.strictEqual(parseValue('"hello"'), 'hello');
  assert.strictEqual(parseValue("'hello'"), 'hello');
  console.log('  ✓ Passed\n');

  console.log('Test: parseValue should parse booleans');
  assert.strictEqual(parseValue('true'), true);
  assert.strictEqual(parseValue('false'), false);
  console.log('  ✓ Passed\n');

  console.log('Test: parseValue should parse numbers');
  assert.strictEqual(parseValue('42'), 42);
  assert.strictEqual(parseValue('3.14'), 3.14);
  console.log('  ✓ Passed\n');

  console.log('Test: parseValue should parse null');
  assert.strictEqual(parseValue('null'), null);
  assert.strictEqual(parseValue('~'), null);
  console.log('  ✓ Passed\n');

  // Test parseYaml
  console.log('Test: parseYaml should parse simple key-value pairs');
  const yaml1 = 'name: test\nversion: 1';
  const result1 = parseYaml(yaml1);
  assert.strictEqual(result1.name, 'test');
  assert.strictEqual(result1.version, 1);
  console.log('  ✓ Passed\n');

  console.log('Test: parseYaml should parse nested objects');
  const yaml2 = 'parent:\n  child: value';
  const result2 = parseYaml(yaml2);
  assert.strictEqual(result2.parent.child, 'value');
  console.log('  ✓ Passed\n');

  console.log('Test: parseYaml should parse arrays');
  const yaml3 = 'items:\n  - one\n  - two\n  - three';
  const result3 = parseYaml(yaml3);
  assert.deepStrictEqual(result3.items, ['one', 'two', 'three']);
  console.log('  ✓ Passed\n');

  console.log('Test: parseYaml should skip comments');
  const yaml4 = '# comment\nname: test';
  const result4 = parseYaml(yaml4);
  assert.strictEqual(result4.name, 'test');
  console.log('  ✓ Passed\n');

  console.log('Test: parseYaml should parse filters config');
  const yaml5 = 'filters:\n  - trim\n  - uppercase';
  const result5 = parseYaml(yaml5);
  assert.deepStrictEqual(result5.filters, ['trim', 'uppercase']);
  console.log('  ✓ Passed\n');

  // Test loadConfig
  const testConfigPath = path.join(__dirname, 'test-config.yaml');
  const testJsonPath = path.join(__dirname, 'test-config.json');

  fs.writeFileSync(testConfigPath, 'filters:\n  - trim\n  - uppercase');
  fs.writeFileSync(testJsonPath, '{"filters": ["trim", "uppercase"]}');

  console.log('Test: loadConfig should load YAML config');
  const config1 = loadConfig(testConfigPath);
  assert.deepStrictEqual(config1.filters, ['trim', 'uppercase']);
  console.log('  ✓ Passed\n');

  console.log('Test: loadConfig should load JSON config');
  const config2 = loadConfig(testJsonPath);
  assert.deepStrictEqual(config2.filters, ['trim', 'uppercase']);
  console.log('  ✓ Passed\n');

  console.log('Test: loadConfig should throw error for non-existent file');
  try {
    loadConfig('non-existent.yaml');
    assert.fail('Should have thrown');
  } catch (error) {
    assert.ok(error.message.includes('Config file not found'));
  }
  console.log('  ✓ Passed\n');

  // Cleanup
  fs.unlinkSync(testConfigPath);
  fs.unlinkSync(testJsonPath);

  console.log('✅ All config unit tests passed!\n');
}

runTests();
