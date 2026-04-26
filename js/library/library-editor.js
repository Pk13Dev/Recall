import { ROOT_LIBRARY_LABEL } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { clearError, showError } from "../core/screens.js";
import { libraryRuntime } from "../core/state.js";
import { createElement } from "../core/utils.js";
import { refreshLibraryUI } from "./library-renderer.js";
import { getAllFolderPaths, getCurrentFolder, getFolder, getFolderDepth, getFolderPath, getQuiz, nextFolderId } from "../storage/library-model.js";
import { ensureUniqueFolderName, ensureUniqueQuizName, normalizeEntityName } from "../storage/naming.js";
import { saveLibraryModel } from "../storage/storage.js";

async function persistAndRefreshLibrary() {
  await saveLibraryModel();
  refreshLibraryUI();
}

export function closeLibraryEditor() {
  libraryRuntime.editor.mode = null;
  libraryRuntime.editor.entityId = null;
  elements.libraryEditor.hidden = true;
  elements.libraryEditorTitle.textContent = "";
  elements.libraryEditorSubtitle.textContent = "";
  elements.libraryNameInput.value = "";
  elements.libraryNameInput.hidden = true;
  elements.libraryMoveLabel.hidden = true;
  elements.libraryMoveSelect.hidden = true;
  elements.libraryMoveSelect.innerHTML = "";
}

export function populateMoveFolderOptions(currentFolderId, selectedFolderId) {
  elements.libraryMoveSelect.innerHTML = "";

  const folders = getAllFolderPaths()
    .map((entry) => getFolder(entry.id))
    .filter(Boolean)
    .sort((left, right) => getFolderPath(left.id).localeCompare(getFolderPath(right.id)));

  folders.forEach((folder) => {
    const option = document.createElement("option");
    const depth = getFolderDepth(folder.id);
    const prefix = depth ? `${"  ".repeat(depth)}- ` : "";
    option.value = folder.id;
    option.textContent = `${prefix}${folder.id === "root" ? ROOT_LIBRARY_LABEL : folder.name}`;
    if (folder.id === selectedFolderId) {
      option.selected = true;
    }
    elements.libraryMoveSelect.appendChild(option);
  });

  elements.libraryMoveSelect.value = selectedFolderId || currentFolderId || "root";
}

export function openLibraryEditor(mode, entityId) {
  libraryRuntime.editor.mode = mode;
  libraryRuntime.editor.entityId = entityId || null;
  elements.libraryEditor.hidden = false;
  elements.libraryNameInput.hidden = true;
  elements.libraryMoveLabel.hidden = true;
  elements.libraryMoveSelect.hidden = true;

  if (mode === "create-folder") {
    const currentFolder = getCurrentFolder();
    elements.libraryEditorTitle.textContent = "Create Folder";
    elements.libraryEditorSubtitle.textContent = `Inside ${currentFolder.id === "root" ? ROOT_LIBRARY_LABEL : currentFolder.name}`;
    elements.libraryNameInput.hidden = false;
    elements.libraryNameInput.value = "";
    elements.libraryEditorSaveBtn.textContent = "Create";
  }

  if (mode === "rename-folder") {
    const folder = getFolder(entityId);
    elements.libraryEditorTitle.textContent = "Rename Folder";
    elements.libraryEditorSubtitle.textContent = `Update the folder name for ${folder.name}`;
    elements.libraryNameInput.hidden = false;
    elements.libraryNameInput.value = folder.name;
    elements.libraryEditorSaveBtn.textContent = "Save";
  }

  if (mode === "rename-quiz") {
    const quiz = getQuiz(entityId);
    elements.libraryEditorTitle.textContent = "Rename Quiz";
    elements.libraryEditorSubtitle.textContent = `Update the quiz name for ${quiz.name}`;
    elements.libraryNameInput.hidden = false;
    elements.libraryNameInput.value = quiz.name;
    elements.libraryEditorSaveBtn.textContent = "Save";
  }

  if (mode === "move-quiz") {
    const quiz = getQuiz(entityId);
    elements.libraryEditorTitle.textContent = "Move Quiz";
    elements.libraryEditorSubtitle.textContent = `Choose a destination folder for ${quiz.name}`;
    elements.libraryMoveLabel.hidden = false;
    elements.libraryMoveSelect.hidden = false;
    populateMoveFolderOptions(quiz.parentFolderId, quiz.parentFolderId);
    elements.libraryEditorSaveBtn.textContent = "Move";
  }

  if (!elements.libraryNameInput.hidden) {
    elements.libraryNameInput.focus();
    elements.libraryNameInput.select();
  } else {
    elements.libraryMoveSelect.focus();
  }
}

export function saveLibraryEditor() {
  clearError();

  const mode = libraryRuntime.editor.mode;
  const entityId = libraryRuntime.editor.entityId;
  if (!mode) {
    return;
  }

  if (mode === "create-folder") {
    const currentFolder = getCurrentFolder();
    let folderName = normalizeEntityName(elements.libraryNameInput.value, "");
    if (!folderName) {
      showError("Folder name cannot be empty.");
      return;
    }
    if (folderName.includes("/")) {
      showError("Folder names cannot include '/'.");
      return;
    }

    folderName = ensureUniqueFolderName(currentFolder.id, folderName, null);
    const folderId = nextFolderId();
    const now = Date.now();

    libraryRuntime.model.folders[folderId] = {
      id: folderId,
      name: folderName,
      parentId: currentFolder.id,
      childFolderIds: [],
      quizIds: [],
      createdAt: now,
      updatedAt: now
    };

    currentFolder.childFolderIds.push(folderId);
    persistAndRefreshLibrary()
      .then(() => closeLibraryEditor())
      .catch(() => showError("Could not save folder right now."));
    return;
  }

  if (mode === "rename-folder") {
    const folder = getFolder(entityId);
    if (!folder || !folder.parentId) {
      showError("The library root folder cannot be renamed.");
      return;
    }

    let nextName = normalizeEntityName(elements.libraryNameInput.value, "");
    if (!nextName) {
      showError("Folder name cannot be empty.");
      return;
    }
    if (nextName.includes("/")) {
      showError("Folder names cannot include '/'.");
      return;
    }

    nextName = ensureUniqueFolderName(folder.parentId, nextName, folder.id);
    folder.name = nextName;
    folder.updatedAt = Date.now();
    persistAndRefreshLibrary()
      .then(() => closeLibraryEditor())
      .catch(() => showError("Could not rename folder right now."));
    return;
  }

  if (mode === "rename-quiz") {
    const quiz = getQuiz(entityId);
    if (!quiz) {
      return;
    }

    let nextName = normalizeEntityName(elements.libraryNameInput.value, "");
    if (!nextName) {
      showError("Quiz name cannot be empty.");
      return;
    }

    nextName = ensureUniqueQuizName(quiz.parentFolderId, nextName, quiz.id);
    quiz.name = nextName;
    quiz.updatedAt = Date.now();
    persistAndRefreshLibrary()
      .then(() => closeLibraryEditor())
      .catch(() => showError("Could not rename quiz right now."));
    return;
  }

  if (mode === "move-quiz") {
    const quiz = getQuiz(entityId);
    const targetFolderId = elements.libraryMoveSelect.value;
    const targetFolder = getFolder(targetFolderId);
    if (!quiz || !targetFolder) {
      showError("Choose a valid destination folder.");
      return;
    }

    if (targetFolder.id === quiz.parentFolderId) {
      closeLibraryEditor();
      return;
    }

    const sourceFolder = getFolder(quiz.parentFolderId);
    sourceFolder.quizIds = sourceFolder.quizIds.filter((id) => id !== quiz.id);
    quiz.parentFolderId = targetFolder.id;
    quiz.name = ensureUniqueQuizName(targetFolder.id, quiz.name, quiz.id);
    quiz.updatedAt = Date.now();
    targetFolder.quizIds.push(quiz.id);
    persistAndRefreshLibrary()
      .then(() => closeLibraryEditor())
      .catch(() => showError("Could not move quiz right now."));
  }
}
