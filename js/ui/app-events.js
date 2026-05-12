import { openAnalyticsScreen } from "../analytics/analytics-renderer.js";
import { DEFAULT_GOAL_PERCENT, DEFAULT_PROGRESS_NOTE_SLIDE, DEFAULT_THEME, DEFAULT_VOLUME, demoQuizData } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { getActiveScreenName, showError, showScreen } from "../core/screens.js";
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
import { initializeQuizCreatorEvents } from "../creator/quiz-creator-events.js";
import { initializeAudioUnlockEvents } from "./audio.js";
import { closeGuideScreen, goToMainMenu, openGuideScreen } from "./navigation.js";
import { closeAllMiniPopups, handleGlobalPopupClose } from "./popups.js";
import { setGoalPercent, setNotificationVolume, setProgressNoteSlideMode, setTheme, updateLibraryNote } from "./settings.js";
import { initializeUploadEvents } from "./upload-events.js";

function isTextEntryTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("button, a, [role='button']"));
}

function handleQuizAnswerShortcut(event) {
  if (event.ctrlKey || event.altKey || event.metaKey || isTextEntryTarget(event.target)) {
    return;
  }

  const optionIndex = Number(event.key) - 1;
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) {
    return;
  }

  if (getActiveScreenName() !== "quiz") {
    return;
  }

  const optionButtons = Array.from(elements.optionsContainer.querySelectorAll(".option-btn"));
  const optionButton = optionButtons[optionIndex];
  if (!optionButton || optionButton.disabled) {
    return;
  }

  event.preventDefault();
  optionButton.click();
}

function handleQuizNextShortcut(event) {
  if (event.ctrlKey || event.altKey || event.metaKey || isTextEntryTarget(event.target) || isInteractiveTarget(event.target)) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  if (getActiveScreenName() !== "quiz" || elements.nextBtn.disabled) {
    return;
  }

  event.preventDefault();
  nextQuestion();
}

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
  elements.settingsOpenBtn.addEventListener("click", function () {
    closeLibraryEditor();
    closeAllMiniPopups();
    showScreen("settings");
  });
  elements.resultsAnalyticsBtn.addEventListener("click", openAnalyticsScreen);
  elements.analyticsBackBtn.addEventListener("click", function () {
    showScreen("upload");
  });
  elements.guideBackBtn.addEventListener("click", closeGuideScreen);
  elements.settingsBackBtn.addEventListener("click", function () {
    closeAllMiniPopups();
    showScreen(libraryRuntime.lastNonSettingsScreen || "upload");
  });
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
  });

  elements.progressNoteSlideOptions.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) {
      return;
    }
    const slideButton = event.target.closest("[data-progress-note-slide]");
    if (!slideButton) {
      return;
    }
    const slideMode = slideButton.getAttribute("data-progress-note-slide");
    if (!slideMode) {
      return;
    }
    setProgressNoteSlideMode(slideMode, true);
  });

  document.addEventListener("click", handleGlobalPopupClose);
  document.addEventListener("keydown", handleQuizAnswerShortcut);
  document.addEventListener("keydown", handleQuizNextShortcut);
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
  initializeQuizCreatorEvents();
  showScreen("upload");
  setTheme(DEFAULT_THEME, false);
  closeAllMiniPopups();
  setNotificationVolume(DEFAULT_VOLUME, false);
  setGoalPercent(DEFAULT_GOAL_PERCENT, false);
  setProgressNoteSlideMode(DEFAULT_PROGRESS_NOTE_SLIDE, false);
  await initializeLibraryStorage();
  setTheme(libraryRuntime.model.settings.theme, false);
  setNotificationVolume(libraryRuntime.model.settings.volume, false);
  setGoalPercent(libraryRuntime.model.settings.goalPercent, false);
  setProgressNoteSlideMode(libraryRuntime.model.settings.progressNoteSlide, false);
  updateLibraryNote();
  refreshLibraryUI();
}
