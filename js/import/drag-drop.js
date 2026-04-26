import { createImportEntry, getImportEntriesFromFileList } from "./import-model.js";

export async function readDroppedHandle(handle, parentPath) {
  if (!handle) {
    return [];
  }

  if (handle.kind === "file") {
    const file = await handle.getFile().catch(() => null);
    if (!file) {
      return [];
    }

    const nextPath = parentPath ? `${parentPath}/${file.name}` : file.name;
    return [createImportEntry(file, nextPath)];
  }

  if (handle.kind === "directory") {
    const nextPath = parentPath ? `${parentPath}/${handle.name}` : handle.name;
    const nestedEntries = [];

    for await (const childHandle of handle.values()) {
      const childEntries = await readDroppedHandle(childHandle, nextPath);
      nestedEntries.push(...childEntries);
    }

    return nestedEntries;
  }

  return [];
}

export function readDroppedFile(entry, parentPath) {
  return new Promise((resolve) => {
    entry.file(
      (file) => {
        const nextPath = parentPath ? `${parentPath}/${file.name}` : file.name;
        resolve([createImportEntry(file, nextPath)]);
      },
      () => resolve([])
    );
  });
}

export function readAllDirectoryEntries(reader) {
  return new Promise((resolve, reject) => {
    const collectedEntries = [];

    function readBatch() {
      reader.readEntries(
        (entries) => {
          if (!entries.length) {
            resolve(collectedEntries);
            return;
          }

          collectedEntries.push(...entries);
          readBatch();
        },
        (error) => reject(error)
      );
    }

    readBatch();
  });
}

export async function readDroppedEntry(entry, parentPath) {
  if (!entry) {
    return [];
  }

  if (entry.isFile) {
    return readDroppedFile(entry, parentPath);
  }

  if (entry.isDirectory) {
    const nextPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
    const reader = entry.createReader();
    const children = await readAllDirectoryEntries(reader).catch(() => []);
    const nestedEntries = [];

    for (const childEntry of children) {
      const childFiles = await readDroppedEntry(childEntry, nextPath);
      nestedEntries.push(...childFiles);
    }

    return nestedEntries;
  }

  return [];
}

export async function getImportEntriesFromDrop(event) {
  const dataTransfer = event.dataTransfer;
  const items = Array.from((dataTransfer && dataTransfer.items) || []);
  const droppedFiles = Array.from((dataTransfer && dataTransfer.files) || []);
  const entries = [];

  if (items.length) {
    for (const item of items) {
      if (!item || item.kind !== "file") {
        continue;
      }

      if (typeof item.getAsFileSystemHandle === "function") {
        const handle = await item.getAsFileSystemHandle().catch(() => null);
        if (handle) {
          const droppedHandleEntries = await readDroppedHandle(handle, "");
          if (droppedHandleEntries.length) {
            entries.push(...droppedHandleEntries);
            continue;
          }
        }
      }

      const entry = typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
      if (entry) {
        const droppedEntries = await readDroppedEntry(entry, "");
        if (droppedEntries.length) {
          entries.push(...droppedEntries);
          continue;
        }
      }

      const file = item.getAsFile();
      if (file) {
        entries.push(createImportEntry(file, file.name));
      }
    }
  }

  if (!entries.length) {
    return getImportEntriesFromFileList(droppedFiles);
  }

  return entries;
}
