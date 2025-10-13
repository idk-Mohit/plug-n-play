import { openDB } from "idb";

const DB_NAME = "app-datasets";
const STORE = "datasets";

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

export async function idbSave(key: string, data: unknown) {
  const db = await getDb();
  await db.put(STORE, data, key);
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(STORE, key);
}

export async function idbDelete(key: string) {
  const db = await getDb();
  await db.delete(STORE, key);
}
