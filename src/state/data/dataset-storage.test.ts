import { describe, expect, it, vi } from "vitest";

import { DEFAULT_SAMPLE_DATASET_ID } from "./defaultSampleDataset";
import type { DatasetMeta } from "./dataset";

const mockIdbSave = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock("@/core/storage/indexdb", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/core/storage/indexdb")>();
  return {
    ...mod,
    idbSave: mockIdbSave,
  };
});

import { stubLocalStorageForTests } from "@/test/local-storage-mock";

import {
  DATASETS_MANIFEST_IDB_KEY,
  PREVIEW_MAX_ROWS,
  countRecoverableDatasetIds,
  hasIndexedDbRecoverableDatasets,
  isPersistedDatasourcesListEmptyInLs,
  mergeDatasetManifests,
  mergePersistedDatasetsWithIndexedDbSources,
  mergePlaceholderMetasForIdbDatasetKeys,
  needsPreviewHydration,
  slimDatasetMetaForPersistence,
} from "./dataset-storage";

function meta(partial: Partial<DatasetMeta> & Pick<DatasetMeta, "id">): DatasetMeta {
  return {
    name: "n",
    type: "json",
    size: "1 B",
    uploadDate: "2020-01-01T00:00:00.000Z",
    preview: [],
    storageKey: `dataset:${partial.id}` as DatasetMeta["storageKey"],
    ...partial,
  };
}

describe("slimDatasetMetaForPersistence", () => {
  it("clamps preview row count and long string cells", () => {
    const rows = Array.from({ length: PREVIEW_MAX_ROWS + 5 }, (_, i) => ({
      s: "x".repeat(300),
      i,
    }));
    const slim = slimDatasetMetaForPersistence(
      meta({ id: "a", preview: rows }),
    );
    expect(Array.isArray(slim.preview)).toBe(true);
    expect((slim.preview as object[]).length).toBe(PREVIEW_MAX_ROWS);
    const first = (slim.preview as { s: string }[])[0];
    expect(first.s.endsWith("…")).toBe(true);
    expect(first.s.length).toBeLessThanOrEqual(257);
  });
});

describe("mergeDatasetManifests", () => {
  it("unions by id and prefers the entry with longer preview", () => {
    const a = meta({
      id: "1",
      preview: [{ a: 1 }],
    });
    const b = meta({
      id: "1",
      preview: [{ a: 1 }, { a: 2 }],
    });
    const merged = mergeDatasetManifests([a], [b]);
    expect(merged).toHaveLength(1);
    expect((merged[0].preview as unknown[]).length).toBe(2);
  });
});

describe("mergePlaceholderMetasForIdbDatasetKeys", () => {
  it("adds placeholder metas for unknown dataset:* keys", () => {
    const out = mergePlaceholderMetasForIdbDatasetKeys(
      [meta({ id: "known", name: "K" })],
      ["dataset:known", "dataset:new-id-here"],
      DEFAULT_SAMPLE_DATASET_ID,
    );
    const ids = new Map(out.map((d) => [d.id, d]));
    expect(ids.get("known")?.name).toBe("K");
    expect(ids.get("new-id-here")?.name).toContain("Stored dataset");
    expect(ids.get("new-id-here")?.storageKey).toBe("dataset:new-id-here");
  });

  it("skips built-in sample id keys", () => {
    const out = mergePlaceholderMetasForIdbDatasetKeys(
      [],
      [`dataset:${DEFAULT_SAMPLE_DATASET_ID}`],
      DEFAULT_SAMPLE_DATASET_ID,
    );
    expect(out).toHaveLength(0);
  });
});

describe("isPersistedDatasourcesListEmptyInLs", () => {
  stubLocalStorageForTests();

  it("treats missing, empty array JSON, and [] as empty", () => {
    expect(isPersistedDatasourcesListEmptyInLs()).toBe(true);
    localStorage.setItem("datasources", "[]");
    expect(isPersistedDatasourcesListEmptyInLs()).toBe(true);
    localStorage.setItem("datasources", "[{}]");
    expect(isPersistedDatasourcesListEmptyInLs()).toBe(false);
  });
});

describe("hasIndexedDbRecoverableDatasets & countRecoverableDatasetIds", () => {
  const builtIn = DEFAULT_SAMPLE_DATASET_ID;

  it("detects manifest or non-built-in dataset keys", () => {
    expect(hasIndexedDbRecoverableDatasets(undefined, [], builtIn)).toBe(false);
    expect(
      hasIndexedDbRecoverableDatasets([meta({ id: "m" })], [], builtIn),
    ).toBe(true);
    expect(
      hasIndexedDbRecoverableDatasets([], ["dataset:other"], builtIn),
    ).toBe(true);
    expect(
      hasIndexedDbRecoverableDatasets(
        [],
        [`dataset:${builtIn}`],
        builtIn,
      ),
    ).toBe(false);
  });

  it("counts unique ids across manifest and keys", () => {
    expect(
      countRecoverableDatasetIds(
        [meta({ id: "a" }), meta({ id: "b" })],
        ["dataset:a", "dataset:c"],
        builtIn,
      ),
    ).toBe(3);
  });
});

describe("needsPreviewHydration", () => {
  it("returns false for default sample id", () => {
    expect(
      needsPreviewHydration(meta({ id: DEFAULT_SAMPLE_DATASET_ID })),
    ).toBe(false);
  });

  it("returns true when preview missing or empty", () => {
    expect(needsPreviewHydration(meta({ id: "x", preview: [] }))).toBe(true);
    expect(
      needsPreviewHydration(
        meta({ id: "x", preview: [{ a: 1 }] as unknown }),
      ),
    ).toBe(false);
  });
});

describe("mergePersistedDatasetsWithIndexedDbSources", () => {
  it("prepends default sample when missing", () => {
    const out = mergePersistedDatasetsWithIndexedDbSources(
      [],
      [],
      [],
      DEFAULT_SAMPLE_DATASET_ID,
    );
    expect(out[0]?.id).toBe(DEFAULT_SAMPLE_DATASET_ID);
  });

  it("mirrors prev manifest to idb when idb manifest is empty", () => {
    mockIdbSave.mockClear();
    const prev = [meta({ id: "u1", name: "One" })];
    mergePersistedDatasetsWithIndexedDbSources(
      prev,
      undefined,
      [],
      DEFAULT_SAMPLE_DATASET_ID,
    );
    expect(mockIdbSave).toHaveBeenCalledWith(
      DATASETS_MANIFEST_IDB_KEY,
      expect.any(Array),
    );
  });
});
