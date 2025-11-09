export async function listOpfsRoot() {
  const root = await navigator.storage.getDirectory();
  const entries: { name: string; kind: "file" | "directory" }[] = [];
  for await (const [name, handle] of root.entries()) {
    entries.push({ name, kind: handle.kind });
  }
  return entries;
}

export async function readOpfsFile(filename: string) {
  const root = await navigator.storage.getDirectory();
  try {
    const fileHandle = await root.getFileHandle(filename);
    console.log(fileHandle);
    const file = await fileHandle.getFile();
    console.log(file);
    const text = await file.text(); // Or file.arrayBuffer(), file.stream()
    console.log(text);
    return text;
  } catch (err) {
    console.error("Failed to read OPFS file:", err);
    return null;
  }
}
