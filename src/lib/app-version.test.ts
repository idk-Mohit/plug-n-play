import { describe, expect, it } from "vitest";
import {
  isUpdateAvailable,
  parseAppVersion,
  resolveChangelogUrl,
  resolveVersionCheckUrl,
  shouldShowUpdateBanner,
} from "@/lib/app-version";

describe("parseAppVersion", () => {
  it("returns a finite number version", () => {
    expect(parseAppVersion({ version: 2 })).toBe(2);
  });

  it("rejects missing or invalid versions", () => {
    expect(parseAppVersion({})).toBeNull();
    expect(parseAppVersion({ version: "2" })).toBeNull();
    expect(parseAppVersion({ version: NaN })).toBeNull();
  });
});

describe("isUpdateAvailable", () => {
  it("is true only when server version is newer", () => {
    expect(isUpdateAvailable(2, 1)).toBe(true);
    expect(isUpdateAvailable(2, 2)).toBe(false);
    expect(isUpdateAvailable(1, 2)).toBe(false);
  });
});

describe("shouldShowUpdateBanner", () => {
  it("hides when client is current or dismissed for this server version", () => {
    expect(shouldShowUpdateBanner(2, 2, null)).toBe(false);
    expect(shouldShowUpdateBanner(3, 2, null)).toBe(true);
    expect(shouldShowUpdateBanner(3, 2, 3)).toBe(false);
    expect(shouldShowUpdateBanner(4, 2, 3)).toBe(true);
  });
});

describe("resolveVersionCheckUrl", () => {
  it("prefers an explicit version URL", () => {
    expect(
      resolveVersionCheckUrl("https://cdn.example.com/version.json", undefined),
    ).toBe("https://cdn.example.com/version.json");
  });

  it("derives version.json from a changelog URL", () => {
    expect(
      resolveVersionCheckUrl(
        undefined,
        "https://cdn.example.com/public/changelog.json",
      ),
    ).toBe("https://cdn.example.com/public/version.json");
  });

  it("defaults to same-origin version.json", () => {
    expect(resolveVersionCheckUrl(undefined, undefined)).toBe("/version.json");
  });
});

describe("resolveChangelogUrl", () => {
  it("defaults to same-origin changelog.json", () => {
    expect(resolveChangelogUrl(undefined)).toBe("/changelog.json");
  });
});
