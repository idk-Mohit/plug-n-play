/**
 * Dataset State Management
 * 
 * This module contains Jotai atoms for managing dataset metadata and selection.
 * Handles dataset persistence, active selection, and data source management.
 */

import type { DatasetRef } from "@/core/rpc/controllers/datasources";
import type { uuid } from "@/types/data.types";
import { atomWithStorage } from "jotai/utils";

/**
 * Supported dataset types for file uploads
 */
export type DatasetType = "json" | "csv";

/**
 * Metadata interface for uploaded datasets
 * Contains all information needed to identify and manage datasets
 */
export interface DatasetMeta {
  /** Unique identifier for the dataset */
  id: string;
  /** Human-readable name for the dataset */
  name: string;
  /** Type of the dataset file */
  type: DatasetType;
  /** Human-readable file size (e.g., "12.3 KB") */
  size: string;
  /** Number of records/rows in the dataset (if applicable) */
  records?: number;
  /** ISO timestamp of when the dataset was uploaded */
  uploadDate: string;
  /** Preview of the dataset content */
  preview: unknown;
  /** Storage key used in IndexedDB */
  storageKey: uuid;
}

/**
 * Alias for DatasetMeta for backward compatibility
 * @deprecated Use DatasetMeta instead
 */
export type Dataset = DatasetMeta;

/**
 * Persisted atom containing all uploaded dataset metadata
 * Uses localStorage to persist dataset list across sessions
 * 
 * @value DatasetMeta[] - Array of dataset metadata
 */
export const persistedDatasetsAtom = atomWithStorage<DatasetMeta[]>(
  "datasources",
  []
);

/**
 * Persisted atom containing the currently active dataset
 * Uses localStorage to remember the selected dataset across sessions
 * 
 * @value DatasetRef | null - Reference to the active dataset or null if none selected
 */
export const activeDatasetAtom = atomWithStorage<DatasetRef | null>(
  "activeDataset",
  null
);
