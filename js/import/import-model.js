import { normalizeEntityName } from "../storage/naming.js";

export function normalizeImportPathSegments(relativePath) {
  if (typeof relativePath !== "string") {
    return [];
  }

  return relativePath
    .split(/[\\/]+/)
    .map((segment) => normalizeEntityName(segment, "").trim())
    .filter(Boolean);
}

export function createImportEntry(file, relativePath) {
  return {
    file,
    relativePath: typeof relativePath === "string" ? relativePath : file.webkitRelativePath || ""
  };
}

export function createTextImportEntry(fileName, relativePath, content) {
  return createImportEntry(
    {
      name: fileName,
      type: "application/json",
      text: () => Promise.resolve(content)
    },
    relativePath
  );
}

export function isJsonImportEntry(entry) {
  return entry.file && (entry.file.type === "application/json" || entry.file.name.toLowerCase().endsWith(".json"));
}

export function isZipImportEntry(entry) {
  return entry.file && (
    entry.file.type === "application/zip" ||
    entry.file.type === "application/x-zip-compressed" ||
    entry.file.name.toLowerCase().endsWith(".zip")
  );
}

export function getImportEntriesFromFileList(fileList) {
  return Array.from(fileList || [])
    .filter(Boolean)
    .map((file) => createImportEntry(file, file.webkitRelativePath || ""));
}
