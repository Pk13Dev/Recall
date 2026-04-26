import { clearError, showError } from "../core/screens.js";
import { libraryRuntime } from "../core/state.js";
import { closeLibraryEditor, openLibraryEditor } from "./library-editor.js";
import { refreshLibraryUI } from "./library-renderer.js";
import { generateOverviewQuizForFolder } from "./overview-quizzes.js";
import { getLaunchContextForQuiz, startQuiz } from "../quiz/quiz-runtime.js";
import { getCurrentFolder, getFolder, getQuiz } from "../storage/library-model.js";
import { ensureUniqueFolderName, ensureUniqueQuizName } from "../storage/naming.js";
import { saveLibraryModel } from "../storage/storage.js";

export function getFolderStats(folderId) {
  const folder = getFolder(folderId);
  if (!folder) {
    return { folders: 0, quizzes: 0 };
  }

  let folders = folder.childFolderIds.length;
  let quizzes = folder.quizIds.length;

  folder.childFolderIds.forEach((childFolderId) => {
    const childStats = getFolderStats(childFolderId);
    folders += childStats.folders;
    quizzes += childStats.quizzes;
  });

  return { folders, quizzes };
}

export function moveQuizToFolder(quizId, targetFolderId) {
  const quiz = getQuiz(quizId);
  const sourceFolder = quiz ? getFolder(quiz.parentFolderId) : null;
  const targetFolder = getFolder(targetFolderId);
  if (!quiz || !targetFolder) {
    return;
  }

  if (sourceFolder) {
    sourceFolder.quizIds = sourceFolder.quizIds.filter((id) => id !== quiz.id);
  }

  quiz.parentFolderId = targetFolder.id;
  quiz.name = ensureUniqueQuizName(targetFolder.id, quiz.name, quiz.id);
  quiz.updatedAt = Date.now();
  targetFolder.quizIds.push(quiz.id);
}

export function moveFolderToParent(folderId, targetParentId) {
  const folder = getFolder(folderId);
  const currentParent = folder ? getFolder(folder.parentId) : null;
  const targetParent = getFolder(targetParentId);
  if (!folder || !currentParent || !targetParent) {
    return;
  }

  currentParent.childFolderIds = currentParent.childFolderIds.filter((id) => id !== folder.id);
  folder.parentId = targetParent.id;
  folder.name = ensureUniqueFolderName(targetParent.id, folder.name, folder.id);
  folder.updatedAt = Date.now();
  targetParent.childFolderIds.push(folder.id);
}

export function deleteQuizRecord(quizId) {
  const quiz = getQuiz(quizId);
  if (!quiz) {
    return;
  }

  const parentFolder = getFolder(quiz.parentFolderId);
  if (parentFolder) {
    parentFolder.quizIds = parentFolder.quizIds.filter((id) => id !== quiz.id);
  }
  delete libraryRuntime.model.quizzes[quizId];
}

export function deleteFolderRecursively(folderId) {
  const folder = getFolder(folderId);
  if (!folder) {
    return;
  }

  folder.childFolderIds.slice().forEach((childFolderId) => deleteFolderRecursively(childFolderId));
  folder.quizIds.slice().forEach((quizId) => deleteQuizRecord(quizId));

  const parentFolder = folder.parentId ? getFolder(folder.parentId) : null;
  if (parentFolder) {
    parentFolder.childFolderIds = parentFolder.childFolderIds.filter((id) => id !== folder.id);
  }

  delete libraryRuntime.model.folders[folder.id];
}

export function createFolder() {
  clearError();
  openLibraryEditor("create-folder", null);
}

export function openFolder(folderId) {
  if (!getFolder(folderId)) {
    return;
  }
  libraryRuntime.currentFolderId = folderId;
  refreshLibraryUI();
}

export function goUpOneFolder() {
  const currentFolder = getCurrentFolder();
  if (!currentFolder.parentId) {
    return;
  }
  closeLibraryEditor();
  libraryRuntime.currentFolderId = currentFolder.parentId;
  refreshLibraryUI();
}

export function loadQuizById(quizId) {
  clearError();
  closeLibraryEditor();
  const quiz = getQuiz(quizId);
  if (!quiz) {
    showError("This quiz no longer exists.");
    return;
  }
  startQuiz(quiz.questions, getLaunchContextForQuiz(quiz));
}

export function startQuickieQuizById(quizId) {
  clearError();
  closeLibraryEditor();
  const quiz = getQuiz(quizId);
  if (!quiz) {
    showError("This quiz no longer exists.");
    return;
  }

  startQuiz(quiz.questions, {
    ...getLaunchContextForQuiz(quiz),
    questionLimit: 3,
    quizKind: "quickie"
  });
}

export function createOverviewForCurrentFolder() {
  generateOverviewQuizForFolder(getCurrentFolder().id, true).catch(() => {
    showError("Could not generate the overview quiz right now.");
  });
}

export async function persistAndRefreshLibrary() {
  await saveLibraryModel();
  refreshLibraryUI();
}
