import { openAnalyticsScreen } from "../analytics/analytics-renderer.js";
import { DEFAULT_GOAL_PERCENT, DEFAULT_THEME, DEFAULT_VOLUME, demoQuizData } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { showError, showScreen } from "../core/screens.js";
import { libraryRuntime } from "../core/state.js";
import { clamp, normalizeGoalPercent } from "../core/utils.js";
import { closeFolderDeleteModal, closeQuizDeleteModal, confirmFolderDelete, confirmQuizDelete } from "../library/delete-modals.js";
import { createFolder, createOverviewForCurrentFolder, goUpOneFolder } from "../library/library-actions.js";
import { handleLibraryClick } from "../library/library-events.js";
import { closeLibraryEditor, saveLibraryEditor } from "../library/library-editor.js";
import { refreshLibraryUI } from "../library/library-renderer.js";
import { nextQuestion, startQuiz } from "../quiz/quiz-runtime.js";
import { validateQuizData } from "../quiz/quiz-validation.js";
import { initializeLibraryStorage } from "../storage/storage.js";
import { initializeAudioUnlockEvents } from "./audio.js";
import { closeGuideScreen, goToMainMenu, openGuideScreen } from "./navigation.js";
import { closeAllMiniPopups, handleGlobalPopupClose, repositionOpenMiniPopups, setGoalPopupOpen, setSoundPopupOpen, setThemePopupOpen } from "./popups.js";
import { setGoalPercent, setNotificationVolume, setTheme, updateLibraryNote } from "./settings.js";
import { initializeUploadEvents } from "./upload-events.js";

export function initializeActionEvents() {
  elements.nextBtn.addEventListener("click", nextQuestion);

  elements.demoBtn.addEventListener("click", function () {
    try {
      const questions = validateQuizData(demoQuizData);
      startQuiz(questions, {
        source: "demo",
        quizName: "Demo Quiz",
        quizKind: "demo"
      });
    } catch (error) {
      showError(error.message);
    }
  });

  elements.restartBtn.addEventListener("click", function () {
    goToMainMenu();
  });
  elements.appHomeBtn.addEventListener("click", goToMainMenu);

  elements.overviewFolderBtn.addEventListener("click", createOverviewForCurrentFolder);
  elements.analyticsOpenBtn.addEventListener("click", openAnalyticsScreen);
  elements.guideOpenBtn.addEventListener("click", openGuideScreen);
  elements.resultsAnalyticsBtn.addEventListener("click", openAnalyticsScreen);
  elements.analyticsBackBtn.addEventListener("click", function () {
    showScreen("upload");
  });
  elements.guideBackBtn.addEventListener("click", closeGuideScreen);
  elements.newFolderBtn.addEventListener("click", createFolder);
  elements.upFolderBtn.addEventListener("click", goUpOneFolder);
  elements.libraryEditorSaveBtn.addEventListener("click", saveLibraryEditor);
  elements.libraryEditorCancelBtn.addEventListener("click", closeLibraryEditor);
  elements.folderDeleteConfirmBtn.addEventListener("click", function () {
    confirmFolderDelete().catch(() => {
      showError("Could not remove the folder right now.");
    });
  });
  elements.folderDeleteCancelBtn.addEventListener("click", closeFolderDeleteModal);
  elements.folderDeleteModal.addEventListener("click", function (event) {
    if (event.target === elements.folderDeleteModal) {
      closeFolderDeleteModal();
    }
  });
  elements.quizDeleteConfirmBtn.addEventListener("click", function () {
    confirmQuizDelete().catch(() => {
      showError("Could not remove the quiz right now.");
    });
  });
  elements.quizDeleteCancelBtn.addEventListener("click", closeQuizDeleteModal);
  elements.quizDeleteModal.addEventListener("click", function (event) {
    if (event.target === elements.quizDeleteModal) {
      closeQuizDeleteModal();
    }
  });
  elements.libraryNameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveLibraryEditor();
    }
  });
  elements.savedQuizList.addEventListener("click", handleLibraryClick);
  elements.libraryBreadcrumb.addEventListener("click", handleLibraryClick);

  elements.volumeControl.addEventListener("input", function () {
    const percent = clamp(Number(elements.volumeControl.value), 0, 100);
    setNotificationVolume(percent / 100, true);
  });

  elements.goalControl.addEventListener("input", function () {
    const percent = normalizeGoalPercent(elements.goalControl.value);
    setGoalPercent(percent, true);
  });

  elements.themeToggleBtn.addEventListener("click", function () {
    const isOpen = elements.themePopup.classList.contains("is-open");
    setThemePopupOpen(!isOpen);
    if (!isOpen) {
      setSoundPopupOpen(false);
      setGoalPopupOpen(false);
    }
  });

  elements.themeOptions.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) {
      return;
    }
    const themeButton = event.target.closest("[data-theme]");
    if (!themeButton) {
      return;
    }
    const themeName = themeButton.getAttribute("data-theme");
    if (!themeName) {
      return;
    }
    setTheme(themeName, true);
    setThemePopupOpen(false);
  });

  elements.soundToggleBtn.addEventListener("click", function () {
    const isOpen = elements.soundPopup.classList.contains("is-open");
    setSoundPopupOpen(!isOpen);
    if (!isOpen) {
      setThemePopupOpen(false);
      setGoalPopupOpen(false);
    }
  });

  elements.goalToggleBtn.addEventListener("click", function () {
    const isOpen = elements.goalPopup.classList.contains("is-open");
    setGoalPopupOpen(!isOpen);
    if (!isOpen) {
      setSoundPopupOpen(false);
      setThemePopupOpen(false);
    }
  });

  document.addEventListener("click", handleGlobalPopupClose);
  window.addEventListener("resize", repositionOpenMiniPopups);
  window.addEventListener("scroll", repositionOpenMiniPopups, { passive: true });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllMiniPopups();
      closeFolderDeleteModal();
      closeQuizDeleteModal();
    }
  });
}

export async function initializeApp() {
  initializeAudioUnlockEvents();
  initializeUploadEvents();
  initializeActionEvents();
  showScreen("upload");
  setTheme(DEFAULT_THEME, false);
  closeAllMiniPopups();
  setNotificationVolume(DEFAULT_VOLUME, false);
  setGoalPercent(DEFAULT_GOAL_PERCENT, false);
  await initializeLibraryStorage();
  setTheme(libraryRuntime.model.settings.theme, false);
  setNotificationVolume(libraryRuntime.model.settings.volume, false);
  setGoalPercent(libraryRuntime.model.settings.goalPercent, false);
  updateLibraryNote();
  refreshLibraryUI();
}
