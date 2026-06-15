/// <reference types="vite/client" />

/** Injected at build time from `public/version.json` (synced from changelog). */
declare const __APP_CHANGELOG_VERSION__: number;

interface ImportMetaEnv {
  /** Optional absolute URL for changelog JSON (e.g. GitHub raw). Defaults to `/changelog.json`. */
  readonly VITE_CHANGELOG_URL?: string;
  /** Optional absolute URL for version manifest. Defaults to `/version.json` or derived from changelog URL. */
  readonly VITE_VERSION_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
