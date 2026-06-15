#!/usr/bin/env node
/**
 * Syncs `public/version.json` from `public/changelog.json`.
 * Run automatically via `predev` / `prebuild`. Bump `changelog.json` `"version"`
 * before every release build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changelogPath = path.join(root, "public/changelog.json");
const versionPath = path.join(root, "public/version.json");

function fail(message) {
  console.error(`sync-app-version: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(changelogPath)) {
  fail("missing public/changelog.json");
}

let changelog;
try {
  changelog = JSON.parse(fs.readFileSync(changelogPath, "utf8"));
} catch {
  fail("public/changelog.json is not valid JSON");
}

const version = changelog.version;
if (typeof version !== "number" || !Number.isFinite(version) || version < 1) {
  fail('"version" in public/changelog.json must be a positive number');
}

if (fs.existsSync(versionPath)) {
  try {
    const previous = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    if (
      typeof previous.version === "number" &&
      Number.isFinite(previous.version) &&
      version < previous.version
    ) {
      fail(
        `version ${version} is lower than the previous ${previous.version}; bump monotonically`,
      );
    }
  } catch {
    // Overwrite corrupt version.json below.
  }
}

const payload = {
  version,
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(versionPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`sync-app-version: wrote public/version.json (version ${version})`);
