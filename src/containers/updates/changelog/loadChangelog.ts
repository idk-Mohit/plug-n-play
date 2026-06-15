import type { Update } from "./UpdateCard";
import { getChangelogUrl } from "@/lib/app-version";

/** Root shape of `public/changelog.json`. */
export type ChangelogJson = {
  version: number;
  updates: Update[];
};

/**
 * Loads changelog entries. Default: same-origin `/changelog.json` (from `public/` at build).
 *
 * Override with `VITE_CHANGELOG_URL` to point at a hosted file, e.g. GitHub raw:
 * `https://raw.githubusercontent.com/<org>/<repo>/<branch>/public/changelog.json`
 * (CORS must allow your app origin; raw.githubusercontent.com typically allows GET.)
 *
 * Update checks use the paired `version.json` URL derived from the same env vars.
 */
export async function loadChangelog(): Promise<ChangelogJson> {
  const url = getChangelogUrl();
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) {
    throw new Error(`Changelog HTTP ${res.status}`);
  }
  return res.json() as Promise<ChangelogJson>;
}
