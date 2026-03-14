/**
 * Integration Tests for CLI
 */

const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const binPath = path.join(__dirname, '../../bin/txt');
const testDir = path.join(__dirname, 'fixtures');
const sampleFile = path.join(testDir, 'sample.txt');
const sampleContent = 'Hello World\nTest Line\nThird Line';

function runTests() {
  console.log('Running CLI Integration Tests...\n');

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  fs.writeFileSync(sampleFile, sampleContent);

  try {
    console.log('Test: should show help with --help');
    const helpResult = execSync(`node ${binPath} --help`, { encoding: 'utf-8' });
    assert.ok(helpResult.includes('txt v'));
    assert.ok(helpResult.includes('Commands:'));
    console.log('  ✓ Passed\n');

    console.log('Test: should show version with --version');
    const versionResult = execSync(`node ${binPath} --version`, { encoding: 'utf-8' });
    assert.ok(versionResult.includes('txt v'));
    console.log('  ✓ Passed\n');

    console.log('Test: should show help with no arguments');
    try {
      execSync(`node ${binPath}`, { encoding: 'utf-8', stdio: 'pipe' });
      assert.fail('Should have exited with error');
    } catch (error) {
      assert.ok(error.stdout.includes('Usage:'));
    }
    console.log('  ✓ Passed\n');

    console.log('Test: should parse a file');
    const parseResult = execSync(`node ${binPath} parse ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(parseResult.includes('Processed'));
    assert.ok(parseResult.includes('lines'));
    assert.ok(parseResult.includes('words'));
    console.log('  ✓ Passed\n');

    console.log('Test: should filter with uppercase');
    const filterResult = execSync(`node ${binPath} filter -t uppercase ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(filterResult.includes('HELLO WORLD'));
    assert.ok(filterResult.includes('TEST LINE'));
    console.log('  ✓ Passed\n');

    console.log('Test: should filter with multiple filters');
    const multiFilterResult = execSync(`node ${binPath} filter -t "trim,uppercase" ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(multiFilterResult.includes('HELLO WORLD'));
    console.log('  ✓ Passed\n');

    console.log('Test: should search with pattern');
    const searchResult = execSync(`node ${binPath} search -p "Test" ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(searchResult.includes('Test Line'));
    assert.ok(!searchResult.includes('Hello World'));
    console.log('  ✓ Passed\n');

    console.log('Test: should add line numbers');
    const numberResult = execSync(`node ${binPath} number ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(numberResult.includes('1. Hello World'));
    assert.ok(numberResult.includes('2. Test Line'));
    console.log('  ✓ Passed\n');

    console.log('Test: should count words and lines');
    const countResult = execSync(`node ${binPath} count ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(countResult.includes('Lines'));
    assert.ok(countResult.includes('Words'));
    console.log('  ✓ Passed\n');

    console.log('Test: should show stats');
    const statsResult = execSync(`node ${binPath} stats ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(statsResult.includes('File Statistics'));
    assert.ok(statsResult.includes('Lines'));
    console.log('  ✓ Passed\n');

    console.log('Test: should handle transform with config');
    const configPath = path.join(testDir, 'config.json');
    fs.writeFileSync(configPath, '{"filters": ["uppercase"]}');
    const transformResult = execSync(`node ${binPath} transform -c ${configPath} ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(transformResult.includes('HELLO WORLD'));
    fs.unlinkSync(configPath);
    console.log('  ✓ Passed\n');

    console.log('Test: should find no duplicates in unique file');
    const dupResult = execSync(`node ${binPath} duplicates ${sampleFile}`, { encoding: 'utf-8' });
    assert.ok(dupResult.includes('No duplicate lines found') || dupResult.includes('✅'));
    console.log('  ✓ Passed\n');

  } finally {
    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  }

  console.log('✅ All CLI integration tests passed!\n');
}

runTests();
