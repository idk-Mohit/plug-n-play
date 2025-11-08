// thin controller facade for datasets domain
// Usage: const res = await datasetsController.getList(rpc);

import type { MiniGrpc } from "../config/client";

// Lightweight DTO type
export type DatasetMeta = { id: string; name: string; modifiedAt?: string };

export const datasetsController = {
  /**
   * Fetch dataset metadata list from LocalStore via rpc client.
   * - returns an array of DatasetMeta
   * - does minimal normalization/validation
   */
  async getList(rpc: MiniGrpc): Promise<DatasetMeta[]> {
    if (!rpc) throw new Error("rpc client required");

    // call RPC (LocalStore implemented in your worker / dispatchLocal)
    const raw = await rpc.call("LocalStore", "listDatasets");

    // Minimal runtime validation and normalization
    if (!Array.isArray(raw)) {
      throw new Error("Malformed response: expected array");
    }

    const normalized: DatasetMeta[] = raw.map(
      (item: { id?: string; name?: string; modifiedAt?: string }) => {
        // Be permissive but normalize types
        return {
          id:
            item?.id != null ? String(item.id) : String(Math.random()).slice(2),
          name: item?.name != null ? String(item.name) : "",
          // modifiedAt:
          //   item?.modifiedAt != null ? String(item.modifiedAt) : undefined,
        };
      }
    );

    return normalized;
  },

  /**
   * Optional helper: get single dataset by id (example)
   */
  async getOne(rpc: MiniGrpc, id: string) {
    if (!rpc) throw new Error("rpc client required");
    if (!id) throw new Error("id required");
    const raw = await rpc.call("LocalStore", "getDataset", [id]);
    return raw;
  },
};
