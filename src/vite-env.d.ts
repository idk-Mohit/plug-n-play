/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute URL for changelog JSON (e.g. GitHub raw). Defaults to `/changelog.json`. */
  readonly VITE_CHANGELOG_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
