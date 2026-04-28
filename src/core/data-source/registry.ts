import type { DataSource } from "@/core/data-source/DataSource";

const byId = new Map<string, DataSource<unknown>>();

/** Register a DataSource for Activity / diagnostics (call from DataSource constructor). */
export function registerDataSource(ds: DataSource<unknown>): void {
  byId.set(ds.vizId, ds);
}

export function unregisterDataSource(vizId: string): void {
  byId.delete(vizId);
}

/** Active memory-bounded table sources (vizId-bound). */
export function getRegisteredDataSources(): DataSource<unknown>[] {
  return [...byId.values()];
}

/** @internal Vitest — prevent registry leakage across tests. */
export function __resetDataSourceRegistryForTests(): void {
  byId.clear();
}
