import { createTextImportEntry, isZipImportEntry } from "./import-model.js";
import { normalizeEntityName } from "../storage/naming.js";

export function getZipRootName(fileName) {
  const normalizedName = normalizeEntityName(fileName || "Imported ZIP", "Imported ZIP");
  const rootName = normalizedName.toLowerCase().endsWith(".zip") ? normalizedName.slice(0, -4) : normalizedName;
  return rootName || "Imported ZIP";
}

export function getUint16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

export function getUint32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

export function findZipEndOfCentralDirectory(bytes) {
  const minimumOffset = Math.max(0, bytes.length - 65557);
  for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
    if (getUint32(bytes, offset) === 0x06054b50) {
      return offset;
    }
  }
  return -1;
}

export function decodeZipText(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}

export async function inflateZipBytes(bytes) {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser cannot unpack compressed ZIP files.");
  }

  const formats = ["deflate-raw", "deflate"];
  let lastError = null;
  for (const format of formats) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("This ZIP file could not be decompressed.");
}

export async function readZipEntryBytes(bytes, centralEntry) {
  const localHeaderOffset = centralEntry.localHeaderOffset;
  if (getUint32(bytes, localHeaderOffset) !== 0x04034b50) {
    throw new Error("This ZIP file has an unreadable file header.");
  }

  const localNameLength = getUint16(bytes, localHeaderOffset + 26);
  const localExtraLength = getUint16(bytes, localHeaderOffset + 28);
  const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
  const compressedBytes = bytes.slice(dataOffset, dataOffset + centralEntry.compressedSize);

  if (centralEntry.compressionMethod === 0) {
    return compressedBytes;
  }

  if (centralEntry.compressionMethod === 8) {
    return inflateZipBytes(compressedBytes);
  }

  throw new Error("Only stored and deflated ZIP files are supported.");
}

export async function extractJsonEntriesFromZip(entry) {
  const bytes = new Uint8Array(await entry.file.arrayBuffer());
  const endOffset = findZipEndOfCentralDirectory(bytes);
  if (endOffset < 0) {
    throw new Error("This ZIP file could not be read.");
  }

  const entryCount = getUint16(bytes, endOffset + 10);
  let centralOffset = getUint32(bytes, endOffset + 16);
  const zipRootName = getZipRootName(entry.file.name);
  const extractedEntries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (getUint32(bytes, centralOffset) !== 0x02014b50) {
      throw new Error("This ZIP file has an unreadable directory.");
    }

    const flags = getUint16(bytes, centralOffset + 8);
    const compressionMethod = getUint16(bytes, centralOffset + 10);
    const compressedSize = getUint32(bytes, centralOffset + 20);
    const nameLength = getUint16(bytes, centralOffset + 28);
    const extraLength = getUint16(bytes, centralOffset + 30);
    const commentLength = getUint16(bytes, centralOffset + 32);
    const localHeaderOffset = getUint32(bytes, centralOffset + 42);
    const nameBytes = bytes.slice(centralOffset + 46, centralOffset + 46 + nameLength);
    const relativeName = decodeZipText(nameBytes).replace(/\\/g, "/");
    centralOffset += 46 + nameLength + extraLength + commentLength;

    if (!relativeName || relativeName.endsWith("/") || !relativeName.toLowerCase().endsWith(".json")) {
      continue;
    }

    if (flags & 1) {
      throw new Error("Encrypted ZIP files are not supported.");
    }

    const entryBytes = await readZipEntryBytes(bytes, {
      compressionMethod,
      compressedSize,
      localHeaderOffset
    });
    const pathSegments = [zipRootName, ...relativeName.split("/")].filter(
      (segment) => segment && segment !== "." && segment !== ".."
    );
    const fileName = pathSegments[pathSegments.length - 1] || "quiz.json";
    extractedEntries.push(createTextImportEntry(fileName, pathSegments.join("/"), decodeZipText(entryBytes)));
  }

  return extractedEntries;
}

export async function expandZipImportEntries(importEntries) {
  const expandedEntries = [];
  const zipErrors = [];

  for (const entry of importEntries) {
    if (!isZipImportEntry(entry)) {
      expandedEntries.push(entry);
      continue;
    }

    try {
      const zipEntries = await extractJsonEntriesFromZip(entry);
      if (zipEntries.length) {
        expandedEntries.push(...zipEntries);
      } else {
        zipErrors.push({
          fileName: entry.file.name,
          message: "No JSON quiz files were found inside this ZIP."
        });
      }
    } catch (error) {
      zipErrors.push({
        fileName: entry.file.name,
        message: error && error.message ? error.message : "This ZIP file could not be imported."
      });
    }
  }

  return { expandedEntries, zipErrors };
}
