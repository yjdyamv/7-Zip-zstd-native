'use strict';

const fs = require('node:fs');
const nodePath = require('node:path');

// Platform key -> executable file name inside bin/<key>/.
// Linux ships the musl-static build only: it runs on both glibc and musl
// hosts, so no libc detection is needed.
const BINARIES = {
  'linux-x64': '7zz',
  'linux-arm64': '7zz',
  'darwin-arm64': '7zz',
  'darwin-x64': '7zz',
  'win32-x64': '7zz.exe',
  'win32-arm64': '7zz.exe',
};

const KEY = `${process.platform}-${process.arch}`;

function getPath() {
  const file = BINARIES[KEY];
  if (!file) {
    throw new Error(
      `7zip-zstd-native: no prebuilt 7zz binary for "${KEY}". ` +
        `Supported platforms: ${Object.keys(BINARIES).join(', ')}.`
    );
  }

  const binPath = nodePath.join(__dirname, 'bin', KEY, file);
  if (!fs.existsSync(binPath)) {
    throw new Error(
      `7zip-zstd-native: expected binary at ${binPath} but it is missing. ` +
        `Reinstall the package (bin/ contents may have been stripped).`
    );
  }

  // npm only guarantees the exec bit for files listed in package.json#bin,
  // so make the real binary executable ourselves. Idempotent and safe to
  // repeat; ignore failures on read-only filesystems.
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(binPath, 0o755);
    } catch {
      // already executable or read-only mount
    }
  }

  return binPath;
}

const pkg = require('./package.json');

module.exports = {
  path: getPath(),
  getPath,
  version: pkg.version,
  upstream: pkg['7zipZstd'],
};
