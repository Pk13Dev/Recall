import { clearError, showError, showScreen } from "../core/screens.js";
import { elements } from "../core/dom.js";
import { libraryRuntime } from "../core/state.js";
import { safeJsonParse } from "../core/utils.js";
import { getImportEntriesFromFileList, isJsonImportEntry, normalizeImportPathSegments } from "./import-model.js";
import { expandZipImportEntries } from "./zip.js";
import { closeLibraryEditor } from "../library/library-editor.js";
import { refreshLibraryUI } from "../library/library-renderer.js";
import { getLaunchContextForQuiz, startQuiz } from "../quiz/quiz-runtime.js";
import { validateQuizData } from "../quiz/quiz-validation.js";
import { createFolderRecord, getCurrentFolder, getFolder } from "../storage/library-model.js";
import { ensureUniqueFolderName, normalizeEntityName } from "../storage/naming.js";
import { saveLibraryModel, saveUploadedQuizToFolder } from "../storage/storage.js";

export function ensureFolderPath(parentFolderId, segments) {
  let currentFolder = getFolder(parentFolderId);

  segments.forEach((segment) => {
    const normalizedSegment = normalizeEntityName(segment, "");
    if (!normalizedSegment) {
      return;
    }

    const existingFolder = currentFolder.childFolderIds
      .map((folderId) => getFolder(folderId))
      .find((folder) => folder && folder.name.toLowerCase() === normalizedSegment.toLowerCase());

    if (existingFolder) {
      currentFolder = existingFolder;
      return;
    }

    const uniqueName = ensureUniqueFolderName(currentFolder.id, normalizedSegment, null);
    currentFolder = createFolderRecord(currentFolder.id, uniqueName);
  });

  return currentFolder;
}

export async function processQuizFiles(fileList) {
  clearError();
  try {
    const importEntries = Array.isArray(fileList) && fileList.length && fileList[0] && fileList[0].file
      ? fileList
      : getImportEntriesFromFileList(fileList);

    if (!importEntries.length) {
      showError("No files selected. Please choose at least one JSON or ZIP file.");
      return;
    }

    const { expandedEntries, zipErrors } = await expandZipImportEntries(importEntries);
    const jsonEntries = expandedEntries.filter(isJsonImportEntry);

    if (!jsonEntries.length) {
      const firstZipError = zipErrors[0];
      if (firstZipError) {
        showError(`Could not import "${firstZipError.fileName}". ${firstZipError.message}`);
        return;
      }

      showError("No JSON quizzes were found in that selection.");
      return;
    }

    const currentFolder = getCurrentFolder();
    let importedCount = 0;
    const unsupportedCount = expandedEntries.length - jsonEntries.length;
    let invalidCount = zipErrors.length;
    let firstImportedQuestions = null;
    let firstImportedQuiz = null;
    let firstImportedFolderId = currentFolder.id;
    const importErrors = [...zipErrors];

    for (const entry of jsonEntries) {
      try {
        const file = entry.file;
        const fileText = await file.text();
        const parsedData = safeJsonParse(fileText, null);
        if (!parsedData) {
          throw new Error("The file could not be read as valid JSON.");
        }

        const questions = validateQuizData(parsedData);
        const relativeSegments = normalizeImportPathSegments(entry.relativePath || "");
        const folderSegments = relativeSegments.slice(0, -1);
        const destinationFolder = ensureFolderPath(currentFolder.id, folderSegments);

        const savedQuiz = await saveUploadedQuizToFolder(destinationFolder.id, questions, file.name);

        if (!firstImportedQuestions) {
          firstImportedQuestions = questions;
          firstImportedQuiz = savedQuiz;
          firstImportedFolderId = destinationFolder.id;
        }
        importedCount += 1;
      } catch (error) {
        console.error("Quiz import failed:", entry && entry.file && entry.file.name ? entry.file.name : "Unknown file", error);
        invalidCount += 1;
        importErrors.push({
          fileName: entry && entry.file && entry.file.name ? entry.file.name : "Unknown file",
          message: error && error.message ? error.message : "The file could not be imported."
        });
      }
    }

    if (!importedCount) {
      const firstError = importErrors[0];
      if (firstError) {
        showError(`Could not import "${firstError.fileName}". ${firstError.message}`);
        return;
      }

      showError("No valid quiz JSON files could be imported. Reload the page to ensure the latest app changes are active, then try again.");
      return;
    }

    await saveLibraryModel();
    refreshLibraryUI();
    closeLibraryEditor();
    libraryRuntime.currentFolderId = firstImportedFolderId;
    refreshLibraryUI();

    if (importedCount === 1 && firstImportedQuestions) {
      startQuiz(firstImportedQuestions, firstImportedQuiz ? getLaunchContextForQuiz(firstImportedQuiz) : null);
      return;
    }

    showScreen("upload");
    const ignoredCount = unsupportedCount + invalidCount;
    if (ignoredCount > 0) {
      const firstError = importErrors[0];
      const detail = firstError ? ` First import issue: "${firstError.fileName}" - ${firstError.message}` : "";
      showError(`Imported ${importedCount} quiz file(s). Ignored ${ignoredCount} unsupported or invalid file(s).${detail}`);
      return;
    }

    clearError();
  } catch (error) {
    showError(error && error.message ? error.message : "The selected quiz files could not be imported.");
  } finally {
    elements.fileInput.value = "";
    elements.folderInput.value = "";
  }
}

export async function processQuizFile(file) {
  await processQuizFiles(file ? [file] : []);
}
