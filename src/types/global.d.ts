// global.d.ts
export {}; // keep file a module so `declare global` merges

declare global {
  interface FileSystemHandle {
    kind: "file" | "directory";
    name?: string;
  }

  interface FileSystemDirectoryHandle {
    /** OPFS / File System Access: iterate [name, handle] */
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    keys?(): AsyncIterableIterator<string>;
    values?(): AsyncIterableIterator<FileSystemHandle>;
  }
}
