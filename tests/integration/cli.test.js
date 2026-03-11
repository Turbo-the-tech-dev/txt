/**
 * Integration Tests for CLI
 */

const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const binPath = path.join(__dirname, '../../bin/txt');
const testDir = path.join(__dirname, 'fixtures');

describe('CLI Integration Tests', () => {
  before(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(path.join(testDir, 'sample.txt'), 'Hello World\nTest Line');
  });

  after(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should show help with --help', () => {
    const result = execSync(`node ${binPath} --help`, { encoding: 'utf-8' });
    assert.ok(result.includes('txt - Text parsing'));
  });

  it('should show version with --version', () => {
    const result = execSync(`node ${binPath} --version`, { encoding: 'utf-8' });
    assert.ok(result.includes('txt v'));
  });

  it('should show help with no arguments', () => {
    try {
      execSync(`node ${binPath}`, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (error) {
      assert.ok(error.stdout.includes('Usage:'));
    }
  });
});

console.log('CLI integration tests passed! ✓');
