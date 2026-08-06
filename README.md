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
| Linux x64 | `ubuntu-latest` | `7zz-linux-x64.tar.gz` |
| Linux arm64 | `ubuntu-24.04-arm` | `7zz-linux-arm64.tar.gz` |
| macOS arm64 | `macos-14` | `7zz-macos-arm64.tar.gz` |
| macOS x64 | `macos-13` | `7zz-macos-x64.tar.gz` |
| Windows x64 | `windows-latest` (MSYS2 MinGW) | `7zz-windows-x64.zip` |

## Usage

### Manual build

Actions → **Build native 7-Zip ZS** → Run workflow:

- `tag` — upstream tag to build (default: newest upstream tag by version).
- `publish` — create/update a GitHub Release with the assets.
- `overwrite` — replace assets of an existing release with the same tag.

### Tag push

Pushing any tag matching `v*` (e.g. `git tag v26.02-v1.5.7-R2`) builds the
corresponding upstream tag and publishes/updates the release automatically.

## Build notes

- Linux/macOS use the upstream `makefile.gcc` directly (GCC/clang).
- Windows uses MSYS2 MinGW (`makefile.gcc` is the upstream-supported native
  route; the source tree has no MSVC solution files). A small `MyWindows.o`
  is linked into the Windows build because some MinGW import libraries do
  not export the newer `FileTimeToLocalFileTime2` /
  `LocalFileTimeToFileTime2` APIs; the fallback implementation in
  `CPP/Common/MyWindows.cpp` provides them via older exported APIs.
- `-Werror` is relaxed to non-fatal warnings (`-Wall -Wextra`) so future
  toolchain warnings cannot break the build.

## License

The CI configuration in this repository is MIT licensed. The built binaries
are 7-Zip ZS, licensed under LGPL-2.1+ (see upstream
[mcmilk/7-Zip-zstd](https://github.com/mcmilk/7-Zip-zstd)); the `LICENSE`
file inside each release archive is the upstream `COPYING`.
