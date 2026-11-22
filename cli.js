#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { path: binPath } = require('./index.js');

const result = spawnSync(binPath, process.argv.slice(2), { stdio: 'inherit' });

if (result.error) {
  console.error(`7zip-zstd-native: failed to run ${binPath}: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
