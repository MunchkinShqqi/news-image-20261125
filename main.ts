// World News, 25 November 2026 — make.fun entry (news-image-20261125)
//
// This entry is a single dense front-page newspaper image for
// Wednesday, 25 November 2026. The image (entry.png, 1024x1024)
// packs 35 date-checked news stories across six sections —
// Top Stories, Americas, Europe, Middle East, Africa and
// Asia-Pacific — led by the United States proposing new tariffs
// on 14 trading partners.
//
// This script is the entrypoint. It does one small, deterministic
// job: copy entry.png from the repo root into the output directory
// so the entry can be scored. It makes no network requests, reads
// no clock, uses no randomness and takes no arguments.

import { copyFileSync, existsSync, mkdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// One mebibyte — the maximum size allowed for the entry image.
const MAX_IMAGE_BYTES: number = 1024 * 1024;

// The eight bytes every PNG file starts with.
const PNG_SIGNATURE: readonly number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const IMAGE_NAME: string = "entry.png";

// The repo root is the directory holding this script.
const repoRoot: string = dirname(fileURLToPath(import.meta.url));
const sourcePath: string = join(repoRoot, IMAGE_NAME);

// The output directory comes from the environment, defaulting to /output.
const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const destinationPath: string = join(outputDir, IMAGE_NAME);

function fail(message: string): never {
  throw new Error(`news-image-20261125: ${message}`);
}

function main(): void {
  if (!existsSync(sourcePath)) {
    fail(`source image not found: ${sourcePath}`);
  }

  const sourceSize: number = statSync(sourcePath).size;
  if (sourceSize > MAX_IMAGE_BYTES) {
    fail(
      `${IMAGE_NAME} is ${sourceSize} bytes, which exceeds the 1 MiB limit (${MAX_IMAGE_BYTES} bytes).`,
    );
  }

  mkdirSync(outputDir, { recursive: true });
  copyFileSync(sourcePath, destinationPath);

  // Confirm the copy is a real PNG by checking its signature bytes.
  // A truncated copy shorter than the 8-byte signature must fail here
  // too, rather than passing on a partial comparison.
  const copiedHead: Buffer = readFileSync(destinationPath).subarray(0, PNG_SIGNATURE.length);
  if (copiedHead.length !== PNG_SIGNATURE.length) {
    fail(`copied ${IMAGE_NAME} is truncated: only ${copiedHead.length} bytes could be read.`);
  }
  const signatureMatches: boolean = PNG_SIGNATURE.every(
    (expectedByte, index) => copiedHead[index] === expectedByte,
  );
  if (!signatureMatches) {
    fail(`copied ${IMAGE_NAME} does not start with a valid PNG signature.`);
  }

  // Confirm the copy is complete by comparing byte sizes.
  const copiedSize: number = statSync(destinationPath).size;
  if (copiedSize !== sourceSize) {
    fail(
      `copied ${IMAGE_NAME} is ${copiedSize} bytes, expected ${sourceSize} bytes — copy incomplete.`,
    );
  }

  console.log(`Copied ${IMAGE_NAME} (${sourceSize} bytes) to ${destinationPath}`);
}

main();
