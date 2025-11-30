#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function readVersion() {
  const versionFile = join(rootDir, 'version.json');
  const content = JSON.parse(readFileSync(versionFile, 'utf8'));
  return content.version;
}

function writeVersion(version) {
  const versionFile = join(rootDir, 'version.json');
  writeFileSync(versionFile, JSON.stringify({ version }, null, 2) + '\n');
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}`);
  }
}

function updateTsPackageJson(version) {
  const filePath = join(rootDir, 'packages/ts-sdk/package.json');
  const content = JSON.parse(readFileSync(filePath, 'utf8'));
  content.version = version;
  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
}

function updateKotlinBuildGradle(version) {
  const filePath = join(rootDir, 'packages/kotlin-sdk/build.gradle.kts');
  let content = readFileSync(filePath, 'utf8');
  content = content.replace(/^version = ".*"$/m, `version = "${version}"`);
  writeFileSync(filePath, content);
}

function main() {
  const type = process.argv[2];
  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('Usage: bump-version.js <patch|minor|major>');
    process.exit(1);
  }

  const current = readVersion();
  const next = bumpVersion(current, type);

  writeVersion(next);
  updateTsPackageJson(next);
  updateKotlinBuildGradle(next);

  console.log(`${current} → ${next}`);
}

main();
