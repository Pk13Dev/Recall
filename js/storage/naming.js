import { libraryRuntime } from "../core/state.js";
import { getFolder, getQuiz } from "./library-model.js";

export function normalizeEntityName(name, fallbackName) {
  const fallback = fallbackName || "Untitled";
  if (typeof name !== "string") {
    return fallback;
  }
  const cleaned = name.replace(/[\x00-\x1f]/g, "").trim();
  return cleaned || fallback;
}

export function sanitizeManagedEntryName(name, fallbackName) {
  const fallback = fallbackName || "Untitled";
  const cleaned = normalizeEntityName(name, fallback).replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/\.+$/g, "").trim();
  return cleaned || fallback;
}

export function ensureManagedJsonFileName(name, fallbackName) {
  const baseName = sanitizeManagedEntryName(name, fallbackName || "quiz.json");
  return baseName.toLowerCase().endsWith(".json") ? baseName : `${baseName}.json`;
}

export function ensureUniqueManagedEntryName(baseName, usedNames) {
  const lowerBase = baseName.toLowerCase();
  if (!usedNames.has(lowerBase)) {
    usedNames.add(lowerBase);
    return baseName;
  }

  const dotIndex = baseName.lastIndexOf(".");
  const stem = dotIndex > 0 ? baseName.slice(0, dotIndex) : baseName;
  const extension = dotIndex > 0 ? baseName.slice(dotIndex) : "";
  let counter = 2;
  let candidate = `${stem} (${counter})${extension}`;
  while (usedNames.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${stem} (${counter})${extension}`;
  }

  usedNames.add(candidate.toLowerCase());
  return candidate;
}

export function ensureUniqueFolderName(parentFolderId, desiredName, excludedFolderId) {
  const parent = getFolder(parentFolderId);
  const existingNames = new Set(
    parent.childFolderIds
      .filter((folderId) => folderId !== excludedFolderId)
      .map((folderId) => getFolder(folderId))
      .filter(Boolean)
      .map((folder) => folder.name.toLowerCase())
  );

  if (!existingNames.has(desiredName.toLowerCase())) {
    return desiredName;
  }

  let suffix = 2;
  let candidate = `${desiredName} (${suffix})`;
  while (existingNames.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${desiredName} (${suffix})`;
  }
  return candidate;
}

export function ensureUniqueQuizName(folderId, desiredName, excludedQuizId) {
  const folder = getFolder(folderId);
  const existingNames = new Set(
    folder.quizIds
      .filter((quizId) => quizId !== excludedQuizId)
      .map((quizId) => getQuiz(quizId))
      .filter(Boolean)
      .map((quiz) => quiz.name.toLowerCase())
  );

  if (!existingNames.has(desiredName.toLowerCase())) {
    return desiredName;
  }

  let suffix = 2;
  let candidate = `${desiredName} (${suffix})`;
  while (existingNames.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${desiredName} (${suffix})`;
  }
  return candidate;
}

export function normalizeUploadedQuizName(fileName) {
  const fallback = `Quiz ${Object.keys(libraryRuntime.model.quizzes).length + 1}`;
  const rawName = normalizeEntityName(fileName, fallback);
  return rawName.toLowerCase().endsWith(".json") ? rawName : `${rawName}.json`;
}
