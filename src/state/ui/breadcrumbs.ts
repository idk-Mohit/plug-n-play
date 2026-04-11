/**
 * Breadcrumbs State Management
 * 
 * This module contains Jotai atoms for managing breadcrumb navigation.
 * Handles breadcrumb state and updates based on current view.
 */

import { atom } from "jotai";

/**
 * Interface for breadcrumb items
 */
export interface BreadcrumbItem {
  /** Display text for the breadcrumb */
  label: string;
  /** Optional navigation path */
  href?: string;
}

/**
 * Atom containing the current breadcrumb trail
 * Used to display navigation context in the UI
 */
export const breadcrumbsAtom = atom<BreadcrumbItem[]>([]);

/**
 * Action atom for setting breadcrumbs
 * Updates the breadcrumb trail with new items
 */
export const setBreadcrumbsAtom = atom(
  null,
  (_get, set, breadcrumbs: BreadcrumbItem[]) => {
    set(breadcrumbsAtom, breadcrumbs);
  }
);
