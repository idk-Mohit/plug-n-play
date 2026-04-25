import { getEngineRpc } from "@/core/rpc/engineSingleton";
import { metaDataFromDatasetId } from "./storage/localStorage";

type uuid = string;

export const dataEngine = {
  getDatasetMetaById(id: uuid) {
    return metaDataFromDatasetId(id);
  },

  async saveDataset(id: uuid, data: unknown) {
    await getEngineRpc().call("Data", "save", [{ datasetId: id, data }]);
  },

  async deleteDataset(id: uuid) {
    await getEngineRpc().call("Data", "deleteDataset", [id]);
  },

  async getDatasetPreview(id: uuid, limit = 50) {
    return getEngineRpc().call<unknown[]>("Data", "getPreview", [
      { datasetId: id, limit },
    ]);
  },
};
