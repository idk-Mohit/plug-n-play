/** Poll interval for update checks. Shorter in dev for easier manual testing. */
export const APP_UPDATE_POLL_MS = import.meta.env.DEV ? 15_000 : 5 * 60_000;

const UPDATE_DISMISS_KEY = "pnp-update-dismissed-at-version";

/** Shape of `public/version.json` (and the `version` field in changelog.json). */
export interface AppVersionPayload {
  version?: unknown;
  buildTime?: unknown;
}

/** Result when the server manifest is newer than the running bundle. */
export interface AppUpdateCheckResult {
  serverVersion: number;
  clientVersion: number;
}

/** Validates and extracts the numeric release version from a manifest payload. */
export function parseAppVersion(payload: AppVersionPayload): number | null {
  const version = payload.version;
  if (typeof version !== "number" || !Number.isFinite(version)) return null;
  return version;
}

/** Version baked into the running bundle (snapshotted when the dev server or build started). */
export function getClientAppVersion(): number {
  return __APP_CHANGELOG_VERSION__;
}

/** True when the server manifest reports a higher release version than the client. */
export function isUpdateAvailable(
  serverVersion: number,
  clientVersion: number,
): boolean {
  return serverVersion > clientVersion;
}

/**
 * Resolves the lightweight version manifest URL.
 * Honors `VITE_VERSION_URL`, then derives from `VITE_CHANGELOG_URL`, else `/version.json`.
 */
export function resolveVersionCheckUrl(
  versionUrl: string | undefined,
  changelogUrl: string | undefined,
): string {
  const explicitVersion = versionUrl?.trim();
  if (explicitVersion) return explicitVersion;

  const explicitChangelog = changelogUrl?.trim();
  if (explicitChangelog) {
    if (/changelog\.json$/i.test(explicitChangelog)) {
      return explicitChangelog.replace(/changelog\.json$/i, "version.json");
    }
    return new URL("version.json", explicitChangelog).href;
  }

  return "/version.json";
}

export function getVersionCheckUrl(): string {
  return resolveVersionCheckUrl(
    import.meta.env.VITE_VERSION_URL,
    import.meta.env.VITE_CHANGELOG_URL,
  );
}

export function resolveChangelogUrl(changelogUrl: string | undefined): string {
  return changelogUrl?.trim() || "/changelog.json";
}

/** Same-origin or env-configured changelog URL for the updates page. */
export function getChangelogUrl(): string {
  return resolveChangelogUrl(import.meta.env.VITE_CHANGELOG_URL);
}

/** Server version the user dismissed for this session; re-shows when a newer release ships. */
export function getDismissedUpdateVersion(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(UPDATE_DISMISS_KEY);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Persists dismiss until `serverVersion` changes (sessionStorage). */
export function dismissUpdateForVersion(serverVersion: number): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(UPDATE_DISMISS_KEY, String(serverVersion));
}

export function shouldShowUpdateBanner(
  serverVersion: number,
  clientVersion: number,
  dismissedAtVersion: number | null,
): boolean {
  if (!isUpdateAvailable(serverVersion, clientVersion)) return false;
  return dismissedAtVersion !== serverVersion;
}

/**
 * Fetches the live release version from `version.json` (prod) with a dev fallback
 * to `changelog.json` when the manifest has not been re-synced yet.
 */
export async function fetchServerAppVersion(): Promise<number | null> {
  const versionFromManifest = await fetchVersionFromUrl(getVersionCheckUrl());
  if (versionFromManifest !== null) return versionFromManifest;

  // Dev convenience: after bumping changelog.json, poll still works before re-sync.
  if (import.meta.env.DEV) {
    return fetchVersionFromUrl(getChangelogUrl());
  }

  return null;
}

async function fetchVersionFromUrl(url: string): Promise<number | null> {
  try {
    const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}_nc=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as AppVersionPayload;
    return parseAppVersion(payload);
  } catch {
    return null;
  }
}

/**
 * Compares server vs build-time client version and respects per-version dismiss.
 * @returns Payload for the banner, or `null` when no update should be shown.
 */
export async function checkForAppUpdate(): Promise<AppUpdateCheckResult | null> {
  const serverVersion = await fetchServerAppVersion();
  if (serverVersion === null) return null;

  const clientVersion = getClientAppVersion();
  if (!isUpdateAvailable(serverVersion, clientVersion)) return null;

  const dismissedAtVersion = getDismissedUpdateVersion();
  if (!shouldShowUpdateBanner(serverVersion, clientVersion, dismissedAtVersion)) {
    return null;
  }

  return { serverVersion, clientVersion };
}

/** Hard refresh after an update: clear Cache Storage, then cache-bust navigation. */
export async function reloadForAppUpdate(): Promise<void> {
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      // Best-effort; navigation below still runs.
    }
  }

  const url = new URL(window.location.href);
  url.searchParams.set("_app_update", String(Date.now()));
  window.location.replace(url.toString());
}
