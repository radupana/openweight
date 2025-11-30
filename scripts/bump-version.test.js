import { test, describe } from 'node:test';
import assert from 'node:assert';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

describe('bump-version.js', () => {
  let tempDir;
  const scriptPath = new URL('./bump-version.js', import.meta.url).pathname;

  function setupTempDir() {
    tempDir = mkdtempSync(join(tmpdir(), 'bump-version-test-'));

    writeFileSync(join(tempDir, 'version.json'), JSON.stringify({ version: '1.2.3' }, null, 2));

    const tsSdkDir = join(tempDir, 'packages/ts-sdk');
    execSync(`mkdir -p ${tsSdkDir}`);
    writeFileSync(join(tsSdkDir, 'package.json'), JSON.stringify({ name: '@openweight/sdk', version: '1.2.3' }, null, 2));

    const kotlinSdkDir = join(tempDir, 'packages/kotlin-sdk');
    execSync(`mkdir -p ${kotlinSdkDir}`);
    writeFileSync(join(kotlinSdkDir, 'build.gradle.kts'), `plugins {}\ngroup = "io.github.radupana"\nversion = "1.2.3"\n`);

    return tempDir;
  }

  function runBumpVersion(type, cwd) {
    const scriptContent = readFileSync(scriptPath, 'utf8');
    const testScript = scriptContent.replace(
      "const rootDir = join(__dirname, '..');",
      `const rootDir = "${cwd}";`
    );
    const testScriptPath = join(cwd, 'bump-version-test.js');
    writeFileSync(testScriptPath, testScript);
    return execSync(`node ${testScriptPath} ${type}`, { cwd, encoding: 'utf8' });
  }

  function cleanup() {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }

  test('patch bump: 1.2.3 → 1.2.4', () => {
    const dir = setupTempDir();
    try {
      const output = runBumpVersion('patch', dir);
      assert.match(output, /1\.2\.3 → 1\.2\.4/);

      const version = JSON.parse(readFileSync(join(dir, 'version.json'), 'utf8')).version;
      assert.strictEqual(version, '1.2.4');

      const tsVersion = JSON.parse(readFileSync(join(dir, 'packages/ts-sdk/package.json'), 'utf8')).version;
      assert.strictEqual(tsVersion, '1.2.4');

      const kotlinContent = readFileSync(join(dir, 'packages/kotlin-sdk/build.gradle.kts'), 'utf8');
      assert.match(kotlinContent, /version = "1\.2\.4"/);
    } finally {
      cleanup();
    }
  });

  test('minor bump: 1.2.3 → 1.3.0', () => {
    const dir = setupTempDir();
    try {
      const output = runBumpVersion('minor', dir);
      assert.match(output, /1\.2\.3 → 1\.3\.0/);

      const version = JSON.parse(readFileSync(join(dir, 'version.json'), 'utf8')).version;
      assert.strictEqual(version, '1.3.0');
    } finally {
      cleanup();
    }
  });

  test('major bump: 1.2.3 → 2.0.0', () => {
    const dir = setupTempDir();
    try {
      const output = runBumpVersion('major', dir);
      assert.match(output, /1\.2\.3 → 2\.0\.0/);

      const version = JSON.parse(readFileSync(join(dir, 'version.json'), 'utf8')).version;
      assert.strictEqual(version, '2.0.0');
    } finally {
      cleanup();
    }
  });
});
