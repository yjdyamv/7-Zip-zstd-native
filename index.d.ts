/** Absolute path to the 7zz binary for the current platform. */
export const path: string;

/** Resolve (and validate) the 7zz binary path for the current platform. */
export function getPath(): string;

/** The npm package version. */
export const version: string;

/** Upstream 7-Zip ZS identity the binaries were built from (set at publish). */
export const upstream:
  | {
      upstreamTag: string;
      upstreamCommit: string;
      revision: number;
      zstd: string;
      buildRepoCommit: string;
    }
  | undefined;
