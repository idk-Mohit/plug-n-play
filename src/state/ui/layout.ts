/**
 * Layout State Management
 * 
 * This module contains Jotai atoms for managing UI layout state.
 * Handles transitions, sidebar states, and other layout-related UI elements.
 */

import { atom } from "jotai";

/**
 * Atom for managing sidebar transition state
 * Used to coordinate chart rendering during layout animations
 * 
 * @value boolean - true when sidebar is transitioning, false otherwise
 */
export const sidebarTransitionAtom = atom(false);
