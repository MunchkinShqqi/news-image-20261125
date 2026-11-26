// News-image entry for Wednesday 25 November 2026 (news-image-20261125).
// The program writes the front-page image this repository holds to the
// grader's output directory. It only copies a committed file, so the
// output is byte-identical on every run. No network, no clock, no
// randomness, no arguments.
//
// The image is a dense front page: US proposes new tariffs on 14 trading
// partners, plus 34 more date-checked stories in 6 sections (Top Stories,
// Americas, Europe, Middle East, Africa, Asia-Pacific) — 35 in all.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const REPO_DIR = dirname(fileURLToPath(import.meta.url));
// The competition caps the image at 1 MiB; refuse a copy that exceeds it.
const MAX_IMAGE_BYTES = 1024 * 1024;
// PNG files start with this fixed 8-byte signature; checking it catches a
// truncated or corrupt copy that happens to have the right size.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

mkdirSync(OUTPUT_DIR, { recursive: true });

const source = join(REPO_DIR, "entry.png");
const dest = join(OUTPUT_DIR, "entry.png");

const sourceSize = statSync(source).size;
if (sourceSize > MAX_IMAGE_BYTES) {
  throw new Error(`entry.png exceeds the 1 MiB cap: ${sourceSize} bytes`);
}
copyFileSync(source, dest);

const want = statSync(source).size;
const got = statSync(dest).size;
if (got !== want) {
  throw new Error(`entry.png copy incomplete: ${got} of ${want} bytes`);
}
// The committed entry image: 1024x1024 PNG, 161,510 bytes, sha256
// 7b77dc3f72eb274b546e8ef97c922b80d7bb4a7164bb4e16d15abc509663a52f,
// 35 date-checked stories from 25 November 2026 (lead: US tariffs on 14
// trading partners). Rendered by build_image.py and verified visually.
if (!readFileSync(dest).subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png copy is not a valid PNG (bad signature)");
}
