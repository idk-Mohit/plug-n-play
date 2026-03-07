/**
 * View State Management
 * 
 * This module contains Jotai atoms for managing application navigation and view state.
 * Handles current view selection and view-specific metadata.
 */

import { atomWithStorage } from "jotai/utils";

/**
 * Available application views/pages
 * Represents the main navigation sections of the dashboard
 */
export type ViewName =
  | "dashboard"      // Main dashboard view
  | "datasources"    // Data source management
  | "visuals"        // Visualization gallery (future)
  | "activity"       // User activity tracking (future)
  | "changelogs"     // Change logs and updates
  | "dataset";       // Dataset detail view

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
    /** Active tab within a view */
    tab?: string;
    /** Additional view-specific parameters */
    [k: string]: string | number | boolean | undefined;
  };
}

/**
 * Persisted atom containing the current application view state
 * Uses localStorage to remember the user's last view across sessions
 * 
 * @value ViewState - Current view and metadata
 */
export const activeViewAtom = atomWithStorage<ViewState>("activeView:v2", {
  view: "dashboard",
  meta: undefined,
});
