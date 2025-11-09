export interface DataEngine {
  saveDataset(datasetId: string, data: unknown): Promise<void>;
  getDataset(datasetId: string): Promise<unknown>;
  deleteDataset(datasetId: string): Promise<void>;
  getDatasetPreview(datasetId: string, limit?: number): Promise<unknown[]>;
}

// path: src/core/data-engine.ts
import { idbSave, idbGet, idbDelete } from "./storage/indexdb";
import { metaDataFromDatasetId } from "./storage/localStorage";

type uuid = string;

export const dataEngine = {
  // local-storage
  getDatasetMetaById(id: uuid) {
    return metaDataFromDatasetId(id);
  },

  // idb
  async saveDataset(id: uuid, data: unknown) {
    await idbSave(`dataset:${id}`, data);
  },

  async getDataset(id: uuid) {
    return (await idbGet(`dataset:${id}`)) ?? [];
  },

  async deleteDataset(id: uuid) {
    await idbDelete(`dataset:${id}`);
  },

  async getDatasetPreview(id: uuid, limit = 50) {
    const full = (await idbGet<unknown[]>(`dataset:${id}`)) ?? [];
    return Array.isArray(full) ? full.slice(0, limit) : [full];
  },
};
