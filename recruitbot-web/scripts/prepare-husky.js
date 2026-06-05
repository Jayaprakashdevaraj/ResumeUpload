#!/usr/bin/env node
const { execSync } = require('child_process');

function hasGit() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

if (!hasGit()) {
  console.log('No git repository found. Skipping husky install.');
  process.exit(0);
}

try {
  console.log('Git repo found — installing husky hooks...');
  execSync('npx husky install', { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to install husky hooks (continuing):', err.message);
}

process.exit(0);
