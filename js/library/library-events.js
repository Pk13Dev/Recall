import { showError } from "../core/screens.js";
import { openFolderDeleteModal, openQuizDeleteModal } from "./delete-modals.js";
import { loadQuizById, openFolder, startQuickieQuizById } from "./library-actions.js";
import { closeLibraryEditor, openLibraryEditor } from "./library-editor.js";
import { generateOverviewQuizForFolder } from "./overview-quizzes.js";
import { closeQuizActionMenus } from "../ui/popups.js";

export function handleLibraryClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  const action = actionButton.getAttribute("data-action");
  const folderId = actionButton.getAttribute("data-folder-id");
  const quizId = actionButton.getAttribute("data-quiz-id");

  if (action === "toggle-quiz-menu" && quizId) {
    const parentMenu = actionButton.closest(".saved-action-menu");
    const shouldOpen = !parentMenu || !parentMenu.classList.contains("is-open");
    closeQuizActionMenus(shouldOpen ? quizId : null);
    return;
  }

  closeQuizActionMenus();

  if (action === "open-folder" && folderId) {
    closeLibraryEditor();
    openFolder(folderId);
    return;
  }

  if (action === "edit-folder" && folderId) {
    openLibraryEditor("rename-folder", folderId);
    return;
  }

  if (action === "delete-folder" && folderId) {
    openFolderDeleteModal(folderId);
    return;
  }

  if (action === "overview-folder" && folderId) {
    generateOverviewQuizForFolder(folderId, true).catch(() => {
      showError("Could not generate the overview quiz right now.");
    });
    return;
  }

  if (action === "load-quiz" && quizId) {
    loadQuizById(quizId);
    return;
  }

  if (action === "quickie-quiz" && quizId) {
    startQuickieQuizById(quizId);
    return;
  }

  if (action === "edit-quiz" && quizId) {
    openLibraryEditor("rename-quiz", quizId);
    return;
  }

  if (action === "edit-move-quiz" && quizId) {
    openLibraryEditor("move-quiz", quizId);
    return;
  }

  if (action === "delete-quiz" && quizId) {
    openQuizDeleteModal(quizId);
    return;
  }

  if (action === "goto-folder" && folderId) {
    closeLibraryEditor();
    openFolder(folderId);
  }
}
