#!/usr/bin/env node
/**
 * Post-build guard: dist/version.json must exist and match public/changelog.json.
 * Run automatically at the end of `pnpm build`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changelogPath = path.join(root, "public/changelog.json");
const distVersionPath = path.join(root, "dist/version.json");

function fail(message) {
  console.error(`verify-build-version: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distVersionPath)) {
  fail("dist/version.json is missing; ensure public/version.json is synced before build");
}

let changelog;
let distVersion;
try {
  changelog = JSON.parse(fs.readFileSync(changelogPath, "utf8"));
  distVersion = JSON.parse(fs.readFileSync(distVersionPath, "utf8"));
} catch {
  fail("could not parse changelog.json or dist/version.json");
}

if (typeof changelog.version !== "number" || !Number.isFinite(changelog.version)) {
  fail("public/changelog.json must contain a numeric version");
}

if (distVersion.version !== changelog.version) {
  fail(
    `dist/version.json (${distVersion.version}) does not match changelog.json (${changelog.version})`,
  );
}

console.log(
  `verify-build-version: dist/version.json matches changelog.json (version ${changelog.version})`,
);
