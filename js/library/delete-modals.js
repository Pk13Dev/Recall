import { elements } from "../core/dom.js";
import { clearError, showError } from "../core/screens.js";
import { libraryRuntime } from "../core/state.js";
import { deleteFolderRecursively, deleteQuizRecord, getFolderStats, moveFolderToParent, moveQuizToFolder, persistAndRefreshLibrary } from "./library-actions.js";
import { closeLibraryEditor } from "./library-editor.js";
import { getFolder, getQuiz } from "../storage/library-model.js";

export function closeFolderDeleteModal() {
  libraryRuntime.pendingFolderDeleteId = null;
  elements.folderDeleteContents.checked = false;
  elements.folderDeleteMessage.textContent = "";
  elements.folderDeleteModal.hidden = true;
}

export function closeQuizDeleteModal() {
  libraryRuntime.pendingQuizDeleteId = null;
  elements.quizDeleteMessage.textContent = "";
  elements.quizDeleteModal.hidden = true;
}

export function openFolderDeleteModal(folderId) {
  const folder = getFolder(folderId);
  if (!folder || !folder.parentId) {
    showError("The library root folder cannot be removed.");
    return;
  }

  closeLibraryEditor();
  const stats = getFolderStats(folderId);
  libraryRuntime.pendingFolderDeleteId = folderId;
  elements.folderDeleteContents.checked = false;
  elements.folderDeleteMessage.textContent =
    `${folder.name} contains ${stats.folders} folder(s) and ${stats.quizzes} quiz file(s).`;
  elements.folderDeleteModal.hidden = false;
}

export function openQuizDeleteModal(quizId) {
  const quiz = getQuiz(quizId);
  if (!quiz) {
    showError("That quiz no longer exists.");
    return;
  }

  closeLibraryEditor();
  libraryRuntime.pendingQuizDeleteId = quizId;
  elements.quizDeleteMessage.textContent =
    `Remove ${quiz.name}? This saved quiz will be removed from your library.`;
  elements.quizDeleteModal.hidden = false;
}

export async function confirmFolderDelete() {
  clearError();

  const folderId = libraryRuntime.pendingFolderDeleteId;
  const folder = getFolder(folderId);
  if (!folder || !folder.parentId) {
    closeFolderDeleteModal();
    showError("That folder no longer exists.");
    return;
  }

  const parentFolderId = folder.parentId;
  const removeContents = elements.folderDeleteContents.checked;

  if (removeContents) {
    deleteFolderRecursively(folderId);
  } else {
    folder.quizIds.slice().forEach((quizId) => moveQuizToFolder(quizId, parentFolderId));
    folder.childFolderIds.slice().forEach((childFolderId) => moveFolderToParent(childFolderId, parentFolderId));
    deleteFolderRecursively(folderId);
  }

  closeFolderDeleteModal();
  libraryRuntime.currentFolderId = getFolder(libraryRuntime.currentFolderId) ? libraryRuntime.currentFolderId : parentFolderId;
  await persistAndRefreshLibrary();
}

export async function confirmQuizDelete() {
  clearError();

  const quizId = libraryRuntime.pendingQuizDeleteId;
  const quiz = getQuiz(quizId);
  if (!quiz) {
    closeQuizDeleteModal();
    showError("That quiz no longer exists.");
    return;
  }

  deleteQuizRecord(quizId);
  closeQuizDeleteModal();
  await persistAndRefreshLibrary();
}
