import { LEGACY_LIBRARY_DIRECTORY, LEGACY_LIBRARY_MODEL_KEY, LEGACY_LOCAL_PREFIX, LIBRARY_DIRECTORY, LIBRARY_MODEL_FILE, LIBRARY_MODEL_KEY, PREVIOUS_LIBRARY_DIRECTORY } from "../core/constants.js";
import { libraryRuntime } from "../core/state.js";
import { cloneQuestions, safeJsonParse, supportsLocalStorage } from "../core/utils.js";
import { validateQuizData } from "../quiz/quiz-validation.js";
import { getFolder, nextQuizId, normalizeLibraryModel } from "./library-model.js";
import { ensureUniqueQuizName, normalizeUploadedQuizName } from "./naming.js";

export async function readTextFileFromDirectory(directoryHandle, fileName) {
  try {
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (error) {
    return null;
  }
}

export async function writeTextFileToDirectory(directoryHandle, fileName, content) {
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function readLibraryModelFromStorage() {
  if (libraryRuntime.mode === "opfs" && libraryRuntime.directoryHandle) {
    const currentPayload = await readTextFileFromDirectory(libraryRuntime.directoryHandle, LIBRARY_MODEL_FILE);
    if (currentPayload) {
      libraryRuntime.loadedFromLegacyStorage = false;
      return safeJsonParse(currentPayload, null);
    }

    if (libraryRuntime.legacyDirectoryHandle) {
      const legacyPayload = await readTextFileFromDirectory(libraryRuntime.legacyDirectoryHandle, LIBRARY_MODEL_FILE);
      if (legacyPayload) {
        libraryRuntime.loadedFromLegacyStorage = true;
        return safeJsonParse(legacyPayload, null);
      }
    }

    return null;
  }

  if (libraryRuntime.mode === "localStorage") {
    const rawValue = localStorage.getItem(LIBRARY_MODEL_KEY) || localStorage.getItem(LEGACY_LIBRARY_MODEL_KEY);
    libraryRuntime.loadedFromLegacyStorage = !localStorage.getItem(LIBRARY_MODEL_KEY) && Boolean(rawValue);
    return rawValue ? safeJsonParse(rawValue, null) : null;
  }

  return null;
}

export async function saveLibraryModel() {
  if (!libraryRuntime.model) {
    return;
  }

  const serialized = JSON.stringify(libraryRuntime.model);

  if (libraryRuntime.mode === "opfs" && libraryRuntime.directoryHandle) {
    await writeTextFileToDirectory(libraryRuntime.directoryHandle, LIBRARY_MODEL_FILE, serialized);
  }

  if (libraryRuntime.mode === "localStorage") {
    localStorage.setItem(LIBRARY_MODEL_KEY, serialized);
    localStorage.removeItem(LEGACY_LIBRARY_MODEL_KEY);
  }
}

export function scheduleLibrarySave() {
  if (libraryRuntime.saveTimer) {
    window.clearTimeout(libraryRuntime.saveTimer);
  }
  libraryRuntime.saveTimer = window.setTimeout(() => {
    saveLibraryModel().catch(() => {});
  }, 150);
}

export async function initializeLibraryStorage() {
  if (navigator.storage && typeof navigator.storage.getDirectory === "function") {
    try {
      const rootDirectory = await navigator.storage.getDirectory();
      libraryRuntime.directoryHandle = await rootDirectory.getDirectoryHandle(LIBRARY_DIRECTORY, { create: true });
      try {
        libraryRuntime.legacyDirectoryHandle = await rootDirectory.getDirectoryHandle(PREVIOUS_LIBRARY_DIRECTORY, { create: false });
      } catch (error) {
        try {
          libraryRuntime.legacyDirectoryHandle = await rootDirectory.getDirectoryHandle(LEGACY_LIBRARY_DIRECTORY, {
            create: false
          });
        } catch (legacyError) {
          libraryRuntime.legacyDirectoryHandle = null;
        }
      }
      libraryRuntime.mode = "opfs";
    } catch (error) {
      libraryRuntime.mode = "memory";
    }
  }

  if (libraryRuntime.mode !== "opfs" && supportsLocalStorage()) {
    libraryRuntime.mode = "localStorage";
  }

  const rawModel = await readLibraryModelFromStorage();
  libraryRuntime.model = normalizeLibraryModel(rawModel);
  libraryRuntime.currentFolderId = libraryRuntime.model.rootFolderId;

  const importedLegacy = await importLegacyQuizzesIfNeeded();
  if (importedLegacy || !rawModel || libraryRuntime.loadedFromLegacyStorage) {
    await saveLibraryModel();
    libraryRuntime.loadedFromLegacyStorage = false;
  }

}

export async function importLegacyQuizzesIfNeeded() {
  if (libraryRuntime.model.flags.legacyImported) {
    return false;
  }

  let importedCount = 0;

  if (libraryRuntime.mode === "opfs" && libraryRuntime.directoryHandle) {
    try {
      for await (const [name, handle] of libraryRuntime.directoryHandle.entries()) {
        if (handle.kind !== "file" || !name.toLowerCase().endsWith(".json") || name === LIBRARY_MODEL_FILE) {
          continue;
        }

        try {
          const file = await handle.getFile();
          const parsed = safeJsonParse(await file.text(), null);
          const questions = validateQuizData(parsed);
          addQuizToFolder("root", name, questions);
          importedCount += 1;
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      importedCount += 0;
    }
  }

  if (supportsLocalStorage()) {
    const legacyKeys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith(LEGACY_LOCAL_PREFIX)) {
        legacyKeys.push(key);
      }
    }

    legacyKeys.forEach((key) => {
      const shortName = key.slice(LEGACY_LOCAL_PREFIX.length) || "legacy-quiz.json";
      const payloadText = localStorage.getItem(key);
      if (!payloadText) {
        localStorage.removeItem(key);
        return;
      }

      let candidate = safeJsonParse(payloadText, null);
      if (candidate && typeof candidate === "object" && typeof candidate.data === "string") {
        candidate = safeJsonParse(candidate.data, null);
      }

      try {
        const questions = validateQuizData(candidate);
        addQuizToFolder("root", shortName, questions);
        importedCount += 1;
      } catch (error) {
        importedCount += 0;
      }

      localStorage.removeItem(key);
    });
  }

  libraryRuntime.model.flags.legacyImported = true;
  return importedCount > 0;
}

export function addQuizToFolder(folderId, quizName, questions) {
  return addQuizRecord(folderId, {
    name: quizName,
    questions
  });
}

export function addQuizRecord(folderId, config) {
  const folder = getFolder(folderId);
  const quizId = nextQuizId();
  const now = Date.now();
  const kind = config && config.kind === "overview" ? "overview" : "quiz";
  const sourceQuizIds =
    config && Array.isArray(config.sourceQuizIds)
      ? config.sourceQuizIds.filter((value) => typeof value === "string")
      : [];

  libraryRuntime.model.quizzes[quizId] = {
    id: quizId,
    name: config.name,
    questions: cloneQuestions(config.questions),
    parentFolderId: folderId,
    kind,
    sourceQuizIds,
    createdAt: now,
    updatedAt: now
  };
  folder.quizIds.push(quizId);
  return libraryRuntime.model.quizzes[quizId];
}

export async function saveUploadedQuizToFolder(folderId, questions, fileName) {
  const initialName = normalizeUploadedQuizName(fileName);
  const uniqueName = ensureUniqueQuizName(folderId, initialName, null);
  return addQuizToFolder(folderId, uniqueName, questions);
}
