/**
 * View State Management
 *
 * This module contains Jotai atoms for managing application navigation and view state.
 * Handles current view selection and view-specific metadata.
 */

import { atomWithStorage, createJSONStorage } from "jotai/utils";

import {
  ACTIVE_VIEW_STORAGE_KEY,
  parseViewFromHash,
  resolveViewFromLocation,
} from "./view-hash";

/**
 * Available application views/pages
 * Represents the main navigation sections of the dashboard
 */
export type ViewName =
  | "dashboard" // Main dashboard view
  | "datasources" // Data source management
  | "visuals" // Visualization gallery (future)
  | "activity" // User activity tracking (future)
  | "changelogs" // Change logs and updates
  | "dataset"; // Dataset detail view

/**
 * View state interface containing current view and metadata
 * Stores navigation state and any view-specific parameters
 */
export interface ViewState {
  /** Currently active view name */
  view: ViewName;
  /** Optional metadata for the current view */
  meta?: {
    /** Dataset ID for dataset-specific views */
    datasetId?: string;
    /** Active dashboard when `view` is `dashboard` (stored in `#dashboard?dashboardId=…`). */
    dashboardId?: string;
    /** Active tab within a view */
    tab?: string;
    /** Additional view-specific parameters */
    [k: string]: string | number | boolean | undefined;
  };
}

const defaultViewState: ViewState = { view: "dashboard", meta: undefined };

/** Hash wins on read so reload preserves `#visuals`, `#dataset?…`, etc. */
const viewStorage = createJSONStorage<ViewState>(() => ({
  getItem: (key: string) => {
    const fromHash = parseViewFromHash(window.location.hash);
    if (fromHash) return JSON.stringify(fromHash);
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
  },
}));

/**
 * Persisted atom containing the current application view state.
 * Uses localStorage to remember the user's last view across sessions.
 * On reload, `location.hash` takes precedence over stored JSON.
 */
export const activeViewAtom = atomWithStorage<ViewState>(
  ACTIVE_VIEW_STORAGE_KEY,
  typeof window !== "undefined" ? resolveViewFromLocation() : defaultViewState,
  viewStorage,
  { getOnInit: true },
);
