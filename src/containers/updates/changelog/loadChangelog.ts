import type { Update } from "./UpdateCard";

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
 */
export async function loadChangelog(): Promise<ChangelogJson> {
  const url =
    import.meta.env.VITE_CHANGELOG_URL?.trim() || "/changelog.json";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Changelog HTTP ${res.status}`);
  }
  return res.json() as Promise<ChangelogJson>;
}
