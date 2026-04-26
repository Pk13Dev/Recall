import { clearError, showScreen } from "../core/screens.js";
import { libraryRuntime } from "../core/state.js";
import { closeFolderDeleteModal, closeQuizDeleteModal } from "../library/delete-modals.js";
import { closeLibraryEditor } from "../library/library-editor.js";
import { resetQuizState } from "../quiz/quiz-runtime.js";
import { resetVictoryFeedback } from "./effects.js";
import { closeAllMiniPopups } from "./popups.js";

export function goToMainMenu() {
  closeAllMiniPopups();
  closeLibraryEditor();
  closeFolderDeleteModal();
  closeQuizDeleteModal();
  resetVictoryFeedback();
  resetQuizState();
  clearError();
  showScreen("upload");
}

export function openGuideScreen() {
  closeLibraryEditor();
  clearError();
  closeAllMiniPopups();
  resetVictoryFeedback();
  showScreen("guide");
}

export function closeGuideScreen() {
  closeAllMiniPopups();
  showScreen(libraryRuntime.lastNonGuideScreen || "upload");
}
