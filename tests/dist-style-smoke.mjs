/* eslint-env node */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(testDir, "../dist");
const indexPath = resolve(distDir, "index.html");
const indexHtml = readFileSync(indexPath, "utf8");
const referencedAssets = [
  ...indexHtml.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
].map((match) => match[1]);

assert.ok(referencedAssets.length > 0, "dist/index.html references no assets");

const generatedSource = referencedAssets
  .map((asset) => readFileSync(resolve(distDir, asset), "utf8"))
  .join("\n");

assert.match(indexHtml, /assets\/index\.[a-z0-9]+\.js/);
assert.ok(
  generatedSource.includes("blocks-list-wrap"),
  "Built plugin does not contain the Logseq DB wrapper selectors",
);
assert.ok(
  generatedSource.includes("v1.26.17"),
  "Built plugin does not contain the bundled offline baseline version",
);
assert.ok(
  generatedSource.includes("--ls-block-bullet-threading-width"),
  "Built plugin does not contain the bundled base stylesheet",
);
assert.ok(
  generatedSource.includes(
    "left: calc(31px - var(--ls-block-bullet-threading-width));",
  ),
  "Built plugin does not contain the stable DB parent-stem anchor",
);
assert.ok(
  generatedSource.includes(
    "right: calc(15px + var(--ls-block-bullet-threading-width) * 0.5);",
  ),
  "Built plugin does not contain width-aware DB curve spacing",
);
assert.ok(
  !generatedSource.includes(
    "api.github.com/repos/pengx17/logseq-dev-theme",
  ),
  "Built plugin still contains the unverified runtime update path",
);

console.log("PASS built plugin contains bundled and DB compatibility styles");
