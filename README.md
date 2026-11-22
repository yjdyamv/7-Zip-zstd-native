# 7-Zip ZS Native Builds

CI that builds native [7-Zip ZS](https://github.com/mcmilk/7-Zip-zstd)
(`7zz` console) binaries for Linux, macOS and Windows, and publishes them
as GitHub Releases under the **same tag name** as the upstream release
(e.g. `v26.02-v1.5.7-R2`).

The source is always checked out at the upstream tag's pinned commit SHA,
so every release can be traced back to the exact source it was built from
(recorded in each archive's `VERSION` file).

## Platforms

| Platform | Runner | Artifact |
|---|---|---|
| Linux x64 | `ubuntu-latest` (Alpine container) | `7zz-linux-x64.tar.gz` |
| Linux arm64 | `ubuntu-24.04-arm` (Alpine container) | `7zz-linux-arm64.tar.gz` |
| macOS arm64 | `macos-26` | `7zz-macos-arm64.tar.gz` |
| macOS x64 | `macos-26` (cross-compiled) | `7zz-macos-x64.tar.gz` |
| Windows x64 | `windows-latest` (MSVC nmake) | `7zz-windows-x64.zip` |
| Windows arm64 | `windows-11-arm` (MSVC nmake) | `7zz-windows-arm64.zip` |

The Linux binaries are a single **fully static musl** build per arch (built
natively in an Alpine container, `LDFLAGS_STATIC_2=-static`), so one binary
runs on **both** glibc and musl (Alpine) hosts. The glibc-linked variants are
deliberately **not** built: linked on `ubuntu-latest` (glibc 2.39) they would
only run on the newest distros, a strictly worse trade than the static build.

GitHub's macOS runners are Apple Silicon only, so the Intel (`x86_64`) build
is cross-compiled on `macos-26` with `clang -arch x86_64` (verified by
inspecting the binary's architecture — the build itself runs natively).

## npm package

The binaries are also published to npm as the single package
[`7zip-zstd-native`](https://www.npmjs.com/package/7zip-zstd-native), primarily so the
**vscode-smart-archive** extension can locate a `7zz` binary at runtime, and
secondarily for anyone who wants a zero-setup `7zz` in Node.

The npm package ships the same Linux builds as the releases: the single
static musl binary per arch, which runs on both glibc and musl hosts.

Supported platforms in the npm package:

| `process.platform` | `process.arch` | `bin/` dir | Source build |
|---|---|---|---|
| `linux` | `x64` | `linux-x64` | `7zz-linux-x64` |
| `linux` | `arm64` | `linux-arm64` | `7zz-linux-arm64` |
| `darwin` | `arm64` | `darwin-arm64` | `7zz-macos-arm64` |
| `darwin` | `x64` | `darwin-x64` | `7zz-macos-x64` |
| `win32` | `x64` | `win32-x64` | `7zz-windows-x64` |
| `win32` | `arm64` | `win32-arm64` | `7zz-windows-arm64` |

```bash
npm i -g 7zip-zstd-native     # global CLI: `7zz ...`
npx 7zip-zstd-native i        # one-off, no install
```

```js
const { spawn } = require('node:child_process');
const { path } = require('7zip-zstd-native'); // absolute path to the 7zz binary

spawn(path, ['x', 'archive.7z'], { stdio: 'inherit' });
```

The export also includes `getPath()` (same value, resolved lazily on call),
`version` (the npm package version) and `upstream` for tracing the binaries
back to the upstream source.

### Version numbers

The npm version is derived from the upstream tag at publish time, matching the
sibling [7zip-zstd-wasm](https://github.com/yjdyamv/7-Zip-zstd-wasm) package:

    <7-Zip major>.<7-Zip minor>.<publish counter>

`v26.05-v1.5.7-R1` → `26.5.0`; another publish of the same 7-Zip line → `26.5.1`,
`26.5.2`, …; `v26.06-…` → `26.6.0`. The counter is per 7-Zip line and is
consumed by every publish of that line, whether it comes from a new upstream
tag or a rebuild. The computed version is clamped above the newest published
one so an older upstream line can never move `latest` backwards.

Upstream's exact identity (tag, commit, R revision, zstd version) is *not* in
the version number — it is recorded in the package's `7zip` field, in each
archive's `VERSION` file, and exposed at runtime as `require('7zip-zstd-native').upstream`.

## Usage

### Manual build

Actions → **Build native 7-Zip ZS** → Run workflow:

- `tag` — upstream tag to build (default: newest upstream tag by version).
- `publish` — create/update a GitHub Release **and** publish to npm.
- `overwrite` — replace assets of an existing release with the same tag.

### Tag push

Pushing any tag matching `v*` (e.g. `git tag v26.02-v1.5.7-R2`) builds the
corresponding upstream tag and publishes/updates the release automatically.

## Build notes

- macOS builds with the upstream `makefile.gcc` directly (clang). Linux
  builds in an Alpine 3.24 container (`apk add build-base`) so g++ links
  natively against musl — no cross-toolchain ABI risk — then
  `LDFLAGS_STATIC_2=-static` (command-line override wins over the
  makefile's empty default) makes the binary fully static, so one binary
  covers glibc and musl hosts. Each Linux job verifies the result: `file`
  must not report "dynamically linked" (static or static-PIE both pass)
  and the binary must run (`7zz i`).
- Windows x64/arm64 use the upstream nmake `makefile` with MSVC
  (`vcvarsall.bat` + `nmake PLATFORM=x64|arm64`) on native runners — the
  same route upstream uses for official Windows builds, so no MinGW
  workarounds are needed.
- `-Werror` is relaxed to non-fatal warnings (`-Wall -Wextra`) so future
  toolchain warnings cannot break the build.

## License

The CI configuration in this repository is MIT licensed. The built binaries
are 7-Zip ZS, licensed under LGPL-2.1+ (see upstream
[mcmilk/7-Zip-zstd](https://github.com/mcmilk/7-Zip-zstd)); the `LICENSE`
file inside each release archive is the upstream `COPYING`. The npm package
keeps the wrapper under MIT (`LICENSE`) and ships the upstream license as
`COPYING` alongside the binaries.
