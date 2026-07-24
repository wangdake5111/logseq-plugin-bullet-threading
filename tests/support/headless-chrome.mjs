/* eslint-env node */

import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chromePath = chromeCandidates.find((candidate) =>
  existsSync(candidate),
);

export function runHeadlessFixture(html) {
  assert.ok(
    chromePath,
    "Chrome or Chromium was not found; set CHROME_PATH explicitly",
  );

  const tempRoot = mkdtempSync(
    join(tmpdir(), "bullet-threading-regression-"),
  );
  const fixturePath = join(tempRoot, "fixture.html");

  try {
    writeFileSync(fixturePath, html);

    const chrome = spawnSync(
      chromePath,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--dump-dom",
        pathToFileURL(fixturePath).href,
      ],
      { encoding: "utf8", timeout: 30_000 },
    );

    assert.equal(
      chrome.status,
      0,
      chrome.stderr ||
        chrome.error?.message ||
        `Chrome fixture failed${chrome.signal ? ` (${chrome.signal})` : ""}`,
    );

    const resultMatch = chrome.stdout.match(
      /<pre id="result">([^<]+)<\/pre>/,
    );
    assert.ok(resultMatch, "Regression fixture did not emit a result");

    return JSON.parse(decodeURIComponent(resultMatch[1]));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}
