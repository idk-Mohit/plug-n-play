export async function listOpfsRoot() {
  const root = await navigator.storage.getDirectory();
  const entries: { name: string; kind: "file" | "directory" }[] = [];
  for await (const [name, handle] of root.entries()) {
    entries.push({ name, kind: handle.kind });
  }
  return entries;
}
