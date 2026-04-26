(function () {
  const screens = {
    upload: document.getElementById("upload-screen"),
    quiz: document.getElementById("quiz-screen"),
    results: document.getElementById("results-screen"),
    analytics: document.getElementById("analytics-screen"),
    guide: document.getElementById("guide-screen")
  };

  const elements = {
    uploadCard: document.getElementById("upload-card"),
    dropZone: document.getElementById("drop-zone"),
    chooseFileBtn: document.getElementById("choose-file-btn"),
    chooseFolderBtn: document.getElementById("choose-folder-btn"),
    fileInput: document.getElementById("file-input"),
    folderInput: document.getElementById("folder-input"),
    demoBtn: document.getElementById("demo-btn"),
    overviewFolderBtn: document.getElementById("overview-folder-btn"),
    analyticsOpenBtn: document.getElementById("analytics-open-btn"),
    guideOpenBtn: document.getElementById("guide-open-btn"),
    newFolderBtn: document.getElementById("new-folder-btn"),
    upFolderBtn: document.getElementById("up-folder-btn"),
    appHomeBtn: document.getElementById("app-home-btn"),
    themeToggleBtn: document.getElementById("theme-toggle-btn"),
    themePopup: document.getElementById("theme-popup"),
    themeValue: document.getElementById("theme-value"),
    themeOptions: document.getElementById("theme-options"),
    soundToggleBtn: document.getElementById("sound-toggle-btn"),
    soundPopup: document.getElementById("sound-popup"),
    volumeControl: document.getElementById("volume-control"),
    volumeValue: document.getElementById("volume-value"),
    goalToggleBtn: document.getElementById("goal-toggle-btn"),
    goalPopup: document.getElementById("goal-popup"),
    goalControl: document.getElementById("goal-control"),
    goalValue: document.getElementById("goal-value"),
    libraryNote: document.getElementById("library-note"),
    libraryBreadcrumb: document.getElementById("library-breadcrumb"),
    libraryEditor: document.getElementById("library-editor"),
    libraryEditorTitle: document.getElementById("library-editor-title"),
    libraryEditorSubtitle: document.getElementById("library-editor-subtitle"),
    libraryNameInput: document.getElementById("library-name-input"),
    libraryMoveLabel: document.getElementById("library-move-label"),
    libraryMoveSelect: document.getElementById("library-move-select"),
    libraryEditorSaveBtn: document.getElementById("library-editor-save-btn"),
    libraryEditorCancelBtn: document.getElementById("library-editor-cancel-btn"),
    savedEmpty: document.getElementById("saved-empty"),
    savedQuizList: document.getElementById("saved-quiz-list"),
    errorMessage: document.getElementById("error-message"),
    progressText: document.getElementById("progress-text"),
    scoreText: document.getElementById("score-text"),
    questionText: document.getElementById("question-text"),
    optionsContainer: document.getElementById("options-container"),
    nextBtn: document.getElementById("next-btn"),
    finalScore: document.getElementById("final-score"),
    scorePercent: document.getElementById("score-percent"),
    correctCount: document.getElementById("correct-count"),
    restartBtn: document.getElementById("restart-btn"),
    resultsAnalyticsBtn: document.getElementById("results-analytics-btn"),
    analyticsBackBtn: document.getElementById("analytics-back-btn"),
    guideBackBtn: document.getElementById("guide-back-btn"),
    analyticsSummaryCopy: document.getElementById("analytics-summary-copy"),
    analyticsEmpty: document.getElementById("analytics-empty"),
    analyticsContent: document.getElementById("analytics-content"),
    analyticsTotalSessions: document.getElementById("analytics-total-sessions"),
    analyticsAccuracy: document.getElementById("analytics-accuracy"),
    analyticsAverageScore: document.getElementById("analytics-average-score"),
    analyticsAverageAnswerTime: document.getElementById("analytics-average-answer-time"),
    analyticsQuestionsPerMinute: document.getElementById("analytics-questions-per-minute"),
    analyticsStudyTime: document.getElementById("analytics-study-time"),
    analyticsRollingAverage: document.getElementById("analytics-rolling-average"),
    analyticsConsistency: document.getElementById("analytics-consistency"),
    analyticsSessionList: document.getElementById("analytics-session-list"),
    analyticsQuizList: document.getElementById("analytics-quiz-list"),
    analyticsQuestionList: document.getElementById("analytics-question-list"),
    analyticsAnswerList: document.getElementById("analytics-answer-list"),
    analyticsBehaviorList: document.getElementById("analytics-behavior-list"),
    analyticsTimeList: document.getElementById("analytics-time-list"),
    analyticsTopicList: document.getElementById("analytics-topic-list"),
    analyticsScoreGraph: document.getElementById("analytics-score-graph"),
    analyticsCoverageGraph: document.getElementById("analytics-coverage-graph"),
    confettiLayer: document.getElementById("confetti-layer"),
    folderDeleteModal: document.getElementById("folder-delete-modal"),
    folderDeleteMessage: document.getElementById("folder-delete-message"),
    folderDeleteContents: document.getElementById("folder-delete-contents"),
    folderDeleteConfirmBtn: document.getElementById("folder-delete-confirm-btn"),
    folderDeleteCancelBtn: document.getElementById("folder-delete-cancel-btn"),
    quizDeleteModal: document.getElementById("quiz-delete-modal"),
    quizDeleteMessage: document.getElementById("quiz-delete-message"),
    quizDeleteConfirmBtn: document.getElementById("quiz-delete-confirm-btn"),
    quizDeleteCancelBtn: document.getElementById("quiz-delete-cancel-btn")
  };

  const demoQuizData = {
    questions: [
      {
        id: 1,
        question: "What does JSON stand for?",
        options: [
          "JavaScript Object Notation",
          "Java Source Open Network",
          "Joined Syntax Object Number",
          "Java Serialized Output Namespace",
          "Justified Syntax Operation Notation"
        ],
        correctIndex: 0
      },
      {
        id: 2,
        question: "Which index points to the first element in an array?",
        options: ["1", "-1", "0", "2", "10"],
        correctIndex: 2
      },
      {
        id: 3,
        question: "Which value type is valid in JSON?",
        options: ["undefined", "function", "symbol", "string", "bigint"],
        correctIndex: 3
      }
    ]
  };

  const DEFAULT_VOLUME = 0.75;
  const DEFAULT_GOAL_PERCENT = 70;
  const DEFAULT_THEME = "light";
  const DISPLAY_OPTION_COUNT = 4;
  const MAX_QUESTIONS_PER_ATTEMPT = 20;
  const MIN_OPTIONS_PER_QUESTION = 4;
  const MAX_OPTIONS_PER_QUESTION = 17;
  const THEMES = ["light", "dark", "neon", "vibrant"];
  const THEME_LABELS = {
    light: "Light",
    dark: "Dark",
    neon: "Neon",
    vibrant: "Vibrant"
  };
  const ROOT_LIBRARY_LABEL = "Library";
  const LIBRARY_DIRECTORY = "library";
  const PREVIOUS_LIBRARY_DIRECTORY = "libarray";
  const LEGACY_LIBRARY_DIRECTORY = "libaray";
  const LIBRARY_MODEL_FILE = "library-model.json";
  const LIBRARY_MODEL_KEY = "recall::libarray::library-model";
  const LEGACY_LIBRARY_MODEL_KEY = "recall::libaray::library-model";
  const LEGACY_LOCAL_PREFIX = "libaray::";
  const MAX_RECENT_ANALYTIC_SESSIONS = 180;
  const MAX_RECENT_ANALYTIC_ANSWERS = 2000;
  const ANALYTICS_BEHAVIOR_THRESHOLD_MS = 5000;
  const ANALYTICS_ROLLING_WINDOW = 5;
  const fireworkColors = ["#3ea66a", "#6bc58d", "#4e7b72", "#8cd9af", "#9fd5c5"];

  const quizState = {
    questions: [],
    currentQuestionIndex: 0,
    selectedIndex: null,
    score: 0,
    hasAnswered: false,
    activeSession: null,
    questionStartedAt: 0
  };

  const libraryRuntime = {
    mode: "memory",
    directoryHandle: null,
    legacyDirectoryHandle: null,
    model: null,
    currentFolderId: "root",
    lastNonGuideScreen: "upload",
    saveTimer: null,
    activeTheme: DEFAULT_THEME,
    loadedFromLegacyStorage: false,
    editor: {
      mode: null,
      entityId: null
    },
    pendingFolderDeleteId: null,
    pendingQuizDeleteId: null,
    confettiTimer: null,
    resultEffectTimer: null
  };

  const audioRuntime = {
    isPrimed: false
  };

  const SOUND_SOURCES = {
    win: "./BaDing!.mp3",
    fail: "./DaDoo!.mp3",
    victory: "./Victory.mp3",
    loser: "./Loser.mp3"
  };

  const sounds = Object.fromEntries(
    Object.entries(SOUND_SOURCES).map(([type, source]) => [type, createSoundInstance(source)])
  );

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeGoalPercent(value) {
    const goal = Math.round(Number(value));
    if (!Number.isFinite(goal)) {
      return DEFAULT_GOAL_PERCENT;
    }
    return clamp(goal, 0, 100);
  }

  function getGoalPercent() {
    if (!libraryRuntime.model || !libraryRuntime.model.settings) {
      return DEFAULT_GOAL_PERCENT;
    }
    return normalizeGoalPercent(libraryRuntime.model.settings.goalPercent);
  }

  function safeDivide(numerator, denominator, fallback) {
    const top = Number(numerator);
    const bottom = Number(denominator);
    if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom === 0) {
      return fallback === undefined ? 0 : fallback;
    }
    return top / bottom;
  }

  function roundTo(value, digits) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return 0;
    }

    const precision = Number.isInteger(digits) ? Math.max(digits, 0) : 0;
    const multiplier = 10 ** precision;
    return Math.round(amount * multiplier) / multiplier;
  }

  function safeJsonParse(text, fallbackValue) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return fallbackValue;
    }
  }

  function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
    if (name !== "guide") {
      libraryRuntime.lastNonGuideScreen = name;
    }
    screens[name].classList.add("is-active");
  }

  function clearError() {
    elements.errorMessage.textContent = "";
  }

  function showError(message) {
    elements.errorMessage.textContent = message;
  }

  function hasDraggedFiles(event) {
    const types = Array.from((event.dataTransfer && event.dataTransfer.types) || []);
    return types.includes("Files");
  }

  function setUploadDragActive(isActive) {
    elements.dropZone.classList.toggle("is-dragover", isActive);
    if (elements.uploadCard) {
      elements.uploadCard.classList.toggle("is-dragover", isActive);
    }
  }

  function resetUploadInputs() {
    elements.fileInput.value = "";
    elements.folderInput.value = "";
  }

  function resetVictoryFeedback() {
    if (libraryRuntime.resultEffectTimer) {
      window.clearTimeout(libraryRuntime.resultEffectTimer);
      libraryRuntime.resultEffectTimer = null;
    }
    clearConfetti();
    sounds.victory.onended = null;
    sounds.loser.onended = null;
    sounds.victory.pause();
    sounds.victory.currentTime = 0;
    sounds.loser.pause();
    sounds.loser.currentTime = 0;
  }

  function setLibraryNote(message) {
    elements.libraryNote.textContent = message;
  }

  function updateLibraryNote() {
    if (libraryRuntime.mode === "opfs" || libraryRuntime.mode === "localStorage") {
      setLibraryNote("Storage: Browser only");
      return;
    }

    setLibraryNote("Storage: Temporary tab session");
  }

  function isValidTheme(themeName) {
    return THEMES.includes(themeName);
  }

  function formatThemeName(themeName) {
    return THEME_LABELS[themeName] || THEME_LABELS.light;
  }

  function supportsLocalStorage() {
    try {
      const probeKey = "__recall_probe__";
      localStorage.setItem(probeKey, probeKey);
      localStorage.removeItem(probeKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function cloneQuestions(questions) {
    return questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: [...question.options],
      correctIndex: question.correctIndex
    }));
  }

  // Builds a 4-answer question for the active attempt while always keeping the correct answer visible.
  function selectQuestionOptionsForAttempt(question) {
    const correctOption = question.options[question.correctIndex];
    const incorrectOptions = question.options.filter((option, index) => index !== question.correctIndex);
    const selectedIncorrectOptions = shuffleList(incorrectOptions).slice(0, DISPLAY_OPTION_COUNT - 1);
    const attemptOptions = shuffleList([correctOption, ...selectedIncorrectOptions]);

    return {
      id: question.id,
      question: question.question,
      options: attemptOptions,
      correctIndex: attemptOptions.indexOf(correctOption)
    };
  }

  function prepareQuizQuestionsForAttempt(questions, questionLimit) {
    const maxQuestions = Number.isInteger(questionLimit) && questionLimit > 0
      ? questionLimit
      : MAX_QUESTIONS_PER_ATTEMPT;

    return shuffleList(cloneQuestions(questions))
      .slice(0, maxQuestions)
      .map(selectQuestionOptionsForAttempt);
  }

  function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  function appendChildren(parent, children) {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
  }

  function createSoundInstance(source) {
    const audio = new Audio(source);
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
    audio.playsInline = true;
    return audio;
  }

  function resetSoundPlayback(audio) {
    if (!audio) {
      return;
    }
    try {
      audio.pause();
    } catch (error) {}
    try {
      audio.currentTime = 0;
    } catch (error) {}
  }

  function recreateSound(type) {
    const source = SOUND_SOURCES[type];
    if (!source) {
      return null;
    }
    const replacement = createSoundInstance(source);
    replacement.volume = clamp(Number(elements.volumeControl.value) || DEFAULT_VOLUME * 100, 0, 100) / 100;
    sounds[type] = replacement;
    return replacement;
  }

  function primeAudioPlayback() {
    if (audioRuntime.isPrimed) {
      return;
    }
    audioRuntime.isPrimed = true;

    Object.values(sounds).forEach((audio) => {
      if (!audio) {
        return;
      }

      audio.load();
      const wasMuted = audio.muted;
      audio.muted = true;
      resetSoundPlayback(audio);

      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(() => {
              resetSoundPlayback(audio);
              audio.muted = wasMuted;
            })
            .catch(() => {
              audio.muted = wasMuted;
            });
          return;
        }
      } catch (error) {}

      audio.muted = wasMuted;
    });
  }

  function playSoundWithRecovery(type, fallbackType) {
    primeAudioPlayback();

    function attemptPlay(audio, onFailure) {
      if (!audio) {
        if (typeof onFailure === "function") {
          onFailure();
        }
        return;
      }

      resetSoundPlayback(audio);

      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            if (typeof onFailure === "function") {
              onFailure();
            }
          });
        }
      } catch (error) {
        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    }

    function playFallback() {
      if (!fallbackType || fallbackType === type) {
        return;
      }
      attemptPlay(sounds[fallbackType] || recreateSound(fallbackType));
    }

    let retriedWithFreshAudio = false;
    const sound = sounds[type] || recreateSound(type);
    attemptPlay(sound, function () {
      if (!retriedWithFreshAudio) {
        retriedWithFreshAudio = true;
        attemptPlay(recreateSound(type), playFallback);
        return;
      }
      playFallback();
    });
  }

  function playSound(type) {
    if (!type) {
      return;
    }
    playSoundWithRecovery(type);
  }

  function triggerFireworks(targetButton) {
    const rect = targetButton.getBoundingClientRect();
    const burst = document.createElement("div");
    burst.className = "firework-burst";
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;

    for (let i = 0; i < 16; i += 1) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.25;
      const distance = 36 + Math.random() * 38;
      particle.className = "firework-particle";
      particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      particle.style.backgroundColor = fireworkColors[i % fireworkColors.length];
      particle.style.animationDelay = `${Math.random() * 80}ms`;
      burst.appendChild(particle);
    }

    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), 900);
  }

  function closeFolderDeleteModal() {
    libraryRuntime.pendingFolderDeleteId = null;
    elements.folderDeleteContents.checked = false;
    elements.folderDeleteMessage.textContent = "";
    elements.folderDeleteModal.hidden = true;
  }

  // Resets the quiz delete dialog after confirm, cancel, or escape.
  function closeQuizDeleteModal() {
    libraryRuntime.pendingQuizDeleteId = null;
    elements.quizDeleteMessage.textContent = "";
    elements.quizDeleteModal.hidden = true;
  }

  function getFolderStats(folderId) {
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

  function openFolderDeleteModal(folderId) {
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

  // Opens a lightweight confirmation step before removing a saved quiz.
  function openQuizDeleteModal(quizId) {
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

  function moveQuizToFolder(quizId, targetFolderId) {
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

  function moveFolderToParent(folderId, targetParentId) {
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

  function deleteQuizRecord(quizId) {
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

  function deleteFolderRecursively(folderId) {
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

  async function confirmFolderDelete() {
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

  // Removes one quiz record and persists the updated library structure.
  async function confirmQuizDelete() {
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

  function clearConfetti() {
    if (libraryRuntime.confettiTimer) {
      window.clearTimeout(libraryRuntime.confettiTimer);
      libraryRuntime.confettiTimer = null;
    }
    elements.confettiLayer.innerHTML = "";
  }

  // Launches the full-screen success effect behind the results card.
  function triggerVictoryConfetti() {
    clearConfetti();

    const originCard = screens.results.querySelector(".card") || document.querySelector(".app-shell");
    const rect = originCard.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const colors = ["#4e7b72", "#79d6ff", "#ffd166", "#ff7b72", "#8cd9af", "#f4a261"];
    const pieceCount = 110;

    for (let index = 0; index < pieceCount; index += 1) {
      const piece = document.createElement("span");
      const spreadX = (Math.random() - 0.5) * window.innerWidth * 1.3;
      const fallY = window.innerHeight * (0.5 + Math.random() * 0.6);
      const rotate = (Math.random() - 0.5) * 1080;
      const delay = Math.random() * 240;
      const duration = 1800 + Math.random() * 1500;

      piece.className = "confetti-piece";
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.backgroundColor = colors[index % colors.length];
      piece.style.setProperty("--confetti-x", `${spreadX}px`);
      piece.style.setProperty("--confetti-y", `${fallY}px`);
      piece.style.setProperty("--confetti-rotate", `${rotate}deg`);
      piece.style.animationDelay = `${delay}ms`;
      piece.style.animationDuration = `${duration}ms`;
      elements.confettiLayer.appendChild(piece);
    }

    libraryRuntime.confettiTimer = window.setTimeout(() => {
      clearConfetti();
    }, 4200);
  }

  function playVictoryCelebration() {
    const victorySound = sounds.victory;
    if (!victorySound) {
      triggerVictoryConfetti();
      return;
    }

    primeAudioPlayback();
    resetVictoryFeedback();

    let hasTriggeredConfetti = false;
    const launchConfetti = function () {
      if (hasTriggeredConfetti) {
        return;
      }
      hasTriggeredConfetti = true;
      libraryRuntime.resultEffectTimer = null;
      triggerVictoryConfetti();
      victorySound.onended = null;
    };

    resetSoundPlayback(victorySound);
    victorySound.onended = launchConfetti;
    victorySound.play().catch(() => {
      launchConfetti();
    });

    libraryRuntime.resultEffectTimer = window.setTimeout(launchConfetti, 1400);
  }

  function triggerLossEffect() {
    clearConfetti();
    const colors = ["#7f8ea3", "#90a0b7", "#6d7f95", "#8aa3b8", "#9aa7b4"];
    const pieceCount = 84;

    for (let index = 0; index < pieceCount; index += 1) {
      const piece = document.createElement("span");
      const startX = Math.random() * window.innerWidth;
      const startY = -24 - Math.random() * (window.innerHeight * 0.2);
      const driftX = (Math.random() - 0.5) * 180;
      const driftY = window.innerHeight * (0.92 + Math.random() * 0.28);
      const rotate = (Math.random() - 0.5) * 160;
      const delay = Math.random() * 260;
      const duration = 2200 + Math.random() * 1200;

      piece.className = "confetti-piece confetti-piece-sad";
      piece.style.left = `${startX}px`;
      piece.style.top = `${startY}px`;
      piece.style.backgroundColor = colors[index % colors.length];
      piece.style.setProperty("--confetti-x", `${driftX}px`);
      piece.style.setProperty("--confetti-y", `${driftY}px`);
      piece.style.setProperty("--confetti-rotate", `${rotate}deg`);
      piece.style.animationDelay = `${delay}ms`;
      piece.style.animationDuration = `${duration}ms`;
      elements.confettiLayer.appendChild(piece);
    }

    libraryRuntime.confettiTimer = window.setTimeout(() => {
      clearConfetti();
    }, 4300);
  }

  function playLossEffect() {
    resetVictoryFeedback();
    triggerLossEffect();
    playSoundWithRecovery("loser", "fail");
  }

  // Normalizes and validates a single question record from uploaded JSON.
  function normalizeQuestion(rawQuestion, index) {
    if (typeof rawQuestion !== "object" || rawQuestion === null) {
      throw new Error(`Question ${index + 1} is not a valid object.`);
    }

    const questionText = typeof rawQuestion.question === "string" ? rawQuestion.question.trim() : "";
    if (!questionText) {
      throw new Error(`Question ${index + 1} is missing question text.`);
    }

    if (
      !Array.isArray(rawQuestion.options) ||
      rawQuestion.options.length < MIN_OPTIONS_PER_QUESTION ||
      rawQuestion.options.length > MAX_OPTIONS_PER_QUESTION
    ) {
      throw new Error(
        `Question ${index + 1} must include between ${MIN_OPTIONS_PER_QUESTION} and ${MAX_OPTIONS_PER_QUESTION} options.`
      );
    }

    const options = [];
    for (let optionIndex = 0; optionIndex < rawQuestion.options.length; optionIndex += 1) {
      const option = rawQuestion.options[optionIndex];
      if (typeof option !== "string" || !option.trim()) {
        throw new Error(`Question ${index + 1}, option ${optionIndex + 1} must be non-empty text.`);
      }
      options.push(option.trim());
    }

    if (
      typeof rawQuestion.correctIndex !== "number" ||
      !Number.isInteger(rawQuestion.correctIndex) ||
      rawQuestion.correctIndex < 0 ||
      rawQuestion.correctIndex >= options.length
    ) {
      throw new Error(`Question ${index + 1} must have a correctIndex between 0 and ${options.length - 1}.`);
    }

    if (!options[rawQuestion.correctIndex]) {
      throw new Error(`Question ${index + 1} has an invalid correct answer reference.`);
    }

    if ("correctAnswer" in rawQuestion && rawQuestion.correctAnswer !== options[rawQuestion.correctIndex]) {
      throw new Error(`Question ${index + 1} has a correct answer that does not match correctIndex.`);
    }

    return {
      id: rawQuestion.id ?? index + 1,
      question: questionText,
      options,
      correctIndex: rawQuestion.correctIndex
    };
  }

  function validateQuizData(rawData) {
    if (typeof rawData !== "object" || rawData === null || Array.isArray(rawData)) {
      throw new Error("Please upload a valid JSON object.");
    }

    if (!Array.isArray(rawData.questions) || rawData.questions.length === 0) {
      throw new Error("Your JSON must include a non-empty questions array.");
    }

    return rawData.questions.map(normalizeQuestion);
  }

  function createDefaultDailyStat() {
    return {
      studyTimeMs: 0,
      sessionsCompleted: 0,
      questionsAnswered: 0,
      correctAnswers: 0
    };
  }

  function createDefaultBehaviorStats() {
    return {
      thresholdMs: ANALYTICS_BEHAVIOR_THRESHOLD_MS,
      guessWrongCount: 0,
      slowErrorCount: 0,
      fastCorrectCount: 0,
      totalAnswersTracked: 0
    };
  }

  function createDefaultScoreMoments() {
    return { count: 0, mean: 0, m2: 0 };
  }

  function createDefaultTrendRegression() {
    return { count: 0, sumX: 0, sumY: 0, sumXY: 0, sumX2: 0 };
  }

  function createDefaultStreakStats() {
    return { currentCorrectStreak: 0, bestCorrectStreak: 0 };
  }

  function createDefaultDropoffStats() {
    return { sessionsTracked: 0, totalDropoff: 0 };
  }

  function createDefaultTopicEntry(label) {
    return {
      label: label || "Unknown",
      attempts: 0,
      totalScorePercent: 0,
      averageScorePercent: 0
    };
  }

  function normalizeBooleanResult(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }
    if (value === "correct") {
      return true;
    }
    if (value === "wrong") {
      return false;
    }
    return Boolean(fallback);
  }

  function getLocalDateKey(timestamp) {
    const value = Number(timestamp);
    if (!value) {
      return "";
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function ensureDailyStatBucket(analytics, dateKey) {
    if (!analytics.dailyStats[dateKey]) {
      analytics.dailyStats[dateKey] = createDefaultDailyStat();
    }
    return analytics.dailyStats[dateKey];
  }

  function updateRunningMoments(moments, value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return moments;
    }

    const next = moments || createDefaultScoreMoments();
    next.count += 1;
    const delta = amount - next.mean;
    next.mean += delta / next.count;
    const delta2 = amount - next.mean;
    next.m2 += delta * delta2;
    return next;
  }

  function getVarianceFromMoments(moments) {
    if (!moments || (Number(moments.count) || 0) <= 0) {
      return null;
    }
    return safeDivide(Number(moments.m2) || 0, Number(moments.count) || 0, null);
  }

  function getStdDevFromMoments(moments) {
    const variance = getVarianceFromMoments(moments);
    return Number.isFinite(variance) ? Math.sqrt(Math.max(variance, 0)) : null;
  }

  function getConsistencyFromStdDev(stdDev) {
    const amount = Number(stdDev);
    if (!Number.isFinite(amount)) {
      return null;
    }
    return safeDivide(1, 1 + amount, null);
  }

  function updateRegressionTotals(regression, timestamp, scorePercent) {
    const x = Number(timestamp);
    const y = Number(scorePercent);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return regression;
    }

    const next = regression || createDefaultTrendRegression();
    next.count += 1;
    next.sumX += x;
    next.sumY += y;
    next.sumXY += x * y;
    next.sumX2 += x * x;
    return next;
  }

  function getRegressionSlope(regression) {
    if (!regression || (Number(regression.count) || 0) < 2) {
      return null;
    }

    const count = Number(regression.count) || 0;
    const numerator = count * (Number(regression.sumXY) || 0) - (Number(regression.sumX) || 0) * (Number(regression.sumY) || 0);
    const denominator = count * (Number(regression.sumX2) || 0) - (Number(regression.sumX) || 0) ** 2;
    return safeDivide(numerator, denominator, null);
  }

  function calculateQuestionMastery(accuracyRatio, averageTimeMs) {
    const accuracy = Number(accuracyRatio);
    const averageTime = Number(averageTimeMs);
    if (!Number.isFinite(accuracy) || !Number.isFinite(averageTime)) {
      return null;
    }

    const denominator = Math.max(Math.log(averageTime + 1), 1);
    return safeDivide(accuracy, denominator, null);
  }

  function calculateHalfAccuracy(answers, startIndex, endIndex) {
    const subset = answers.slice(startIndex, endIndex);
    if (!subset.length) {
      return null;
    }
    const correctCount = subset.reduce((sum, answer) => sum + (answer && answer.isCorrect ? 1 : 0), 0);
    return safeDivide(correctCount, subset.length, null);
  }

  function calculateSessionDropoff(answers) {
    if (!Array.isArray(answers) || !answers.length) {
      return {
        firstHalfAccuracy: null,
        secondHalfAccuracy: null,
        dropoffRate: null
      };
    }

    const midpoint = Math.ceil(answers.length / 2);
    const firstHalfAccuracy = calculateHalfAccuracy(answers, 0, midpoint);
    const secondHalfAccuracy = calculateHalfAccuracy(answers, midpoint, answers.length);
    return {
      firstHalfAccuracy,
      secondHalfAccuracy,
      dropoffRate:
        Number.isFinite(firstHalfAccuracy) && Number.isFinite(secondHalfAccuracy)
          ? firstHalfAccuracy - secondHalfAccuracy
          : null
    };
  }

  function normalizeTopicEntry(rawEntry, fallbackLabel) {
    const entry = createDefaultTopicEntry(
      rawEntry && typeof rawEntry.label === "string" && rawEntry.label.trim() ? rawEntry.label.trim() : fallbackLabel
    );
    if (!rawEntry || typeof rawEntry !== "object" || Array.isArray(rawEntry)) {
      return entry;
    }

    entry.attempts = Number(rawEntry.attempts) || 0;
    entry.totalScorePercent = Number(rawEntry.totalScorePercent) || 0;
    entry.averageScorePercent = Number(rawEntry.averageScorePercent) || 0;
    return entry;
  }

  function normalizeTopicMap(rawMap) {
    const normalized = {};
    if (!rawMap || typeof rawMap !== "object" || Array.isArray(rawMap)) {
      return normalized;
    }

    Object.entries(rawMap).forEach(([key, value]) => {
      normalized[key] = normalizeTopicEntry(value, key);
    });
    return normalized;
  }

  function ensureTopicEntry(topicMap, key, label) {
    if (!topicMap[key]) {
      topicMap[key] = createDefaultTopicEntry(label);
    } else if (!topicMap[key].label && label) {
      topicMap[key].label = label;
    }
    return topicMap[key];
  }

  function updateTopicEntry(entry, scorePercent) {
    entry.attempts += 1;
    entry.totalScorePercent += Number(scorePercent) || 0;
    entry.averageScorePercent = roundTo(safeDivide(entry.totalScorePercent, entry.attempts, 0), 1);
  }

  function decorateQuestionStat(rawStat) {
    const stat = { ...rawStat };
    stat.attempts = Number(stat.attempts) || 0;
    stat.correctCount = Number(stat.correctCount) || 0;
    stat.wrongCount = Number(stat.wrongCount) || 0;
    stat.totalTimeMs = Number(stat.totalTimeMs) || 0;
    stat.averageTimeMs = stat.attempts ? Math.round(stat.totalTimeMs / stat.attempts) : 0;
    stat.lastAnsweredAt = Number(stat.lastAnsweredAt) || 0;
    stat.firstAnsweredAt = Number(stat.firstAnsweredAt) || stat.lastAnsweredAt || 0;
    stat.lastResult = normalizeBooleanResult(stat.lastResult, false);
    stat.firstResult = normalizeBooleanResult(stat.firstResult, stat.lastResult);
    stat.fastWrongCount = Number(stat.fastWrongCount) || 0;
    stat.slowWrongCount = Number(stat.slowWrongCount) || 0;
    stat.fastCorrectCount = Number(stat.fastCorrectCount) || 0;
    stat.questionAccuracy = safeDivide(stat.correctCount, stat.attempts, null);
    stat.difficulty = stat.attempts ? 1 - stat.questionAccuracy : null;
    stat.errorRate = safeDivide(stat.wrongCount, stat.attempts, null);
    stat.masteryScore = calculateQuestionMastery(stat.questionAccuracy, stat.averageTimeMs);
    return stat;
  }

  function decorateQuizStat(rawStat) {
    const stat = { ...rawStat };
    stat.attempts = Number(stat.attempts) || 0;
    stat.totalQuestions = Number(stat.totalQuestions) || 0;
    stat.totalCorrect = Number(stat.totalCorrect) || 0;
    stat.totalTimeMs = Number(stat.totalTimeMs) || 0;
    stat.totalScorePercent = Number(stat.totalScorePercent) || 0;
    stat.averageScorePercent = stat.attempts ? Math.round(stat.totalScorePercent / stat.attempts) : 0;
    stat.bestScorePercent = Number(stat.bestScorePercent) || 0;
    stat.lastCompletedAt = Number(stat.lastCompletedAt) || 0;
    stat.lastScorePercent = Number(stat.lastScorePercent) || 0;
    stat.firstCompletedAt = Number(stat.firstCompletedAt) || stat.lastCompletedAt || 0;
    stat.firstScorePercent = Number.isFinite(Number(stat.firstScorePercent))
      ? Number(stat.firstScorePercent)
      : stat.lastScorePercent || 0;
    stat.quizAccuracy = safeDivide(stat.totalCorrect, stat.totalQuestions, null);
    stat.retentionChange = stat.lastScorePercent - stat.firstScorePercent;
    stat.scoreMean = Number.isFinite(Number(stat.scoreMean)) ? Number(stat.scoreMean) : stat.averageScorePercent;
    stat.scoreM2 = Number(stat.scoreM2) || 0;
    stat.scoreVariance = Number.isFinite(Number(stat.scoreVariance))
      ? Number(stat.scoreVariance)
      : stat.attempts
        ? safeDivide(stat.scoreM2, stat.attempts, 0)
        : 0;
    stat.scoreStdDev = Number.isFinite(Number(stat.scoreStdDev))
      ? Number(stat.scoreStdDev)
      : Math.sqrt(Math.max(stat.scoreVariance, 0));
    stat.consistencyScore = Number.isFinite(Number(stat.consistencyScore))
      ? Number(stat.consistencyScore)
      : getConsistencyFromStdDev(stat.scoreStdDev);
    stat.timePerCorrectMs = Number.isFinite(Number(stat.timePerCorrectMs))
      ? Number(stat.timePerCorrectMs)
      : safeDivide(stat.totalTimeMs, stat.totalCorrect, null);
    return stat;
  }

  function createDefaultAnalyticsModel() {
    return {
      counters: { session: 0, answer: 0 },
      totals: {
        sessionsCompleted: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        totalTimeMs: 0,
        totalScorePercent: 0
      },
      recentSessions: [],
      recentAnswers: [],
      quizStats: {},
      questionStats: {},
      dailyStats: {},
      behaviorStats: createDefaultBehaviorStats(),
      scoreMoments: createDefaultScoreMoments(),
      trendRegression: createDefaultTrendRegression(),
      streakStats: createDefaultStreakStats(),
      dropoffStats: createDefaultDropoffStats(),
      topicStats: {
        byFolder: {},
        byQuizKind: {}
      }
    };
  }

  function seedAnalyticsFromHistory(analytics) {
    const shouldSeedBehavior = (Number(analytics.behaviorStats.totalAnswersTracked) || 0) <= 0;
    const shouldSeedStreak = (Number(analytics.streakStats.bestCorrectStreak) || 0) <= 0;
    const shouldSeedDaily = Object.keys(analytics.dailyStats).length === 0;
    const shouldSeedMoments = (Number(analytics.scoreMoments.count) || 0) <= 0;
    const shouldSeedRegression = (Number(analytics.trendRegression.count) || 0) <= 0;
    const shouldSeedTopics =
      !Object.keys(analytics.topicStats.byFolder).length && !Object.keys(analytics.topicStats.byQuizKind).length;
    const shouldSeedDropoff = (Number(analytics.dropoffStats.sessionsTracked) || 0) <= 0;
    const answersAscending = analytics.recentAnswers
      .slice()
      .sort((left, right) => (Number(left.answeredAt) || 0) - (Number(right.answeredAt) || 0));
    const sessionsAscending = analytics.recentSessions
      .slice()
      .sort((left, right) => (Number(left.completedAt) || 0) - (Number(right.completedAt) || 0));

    if (shouldSeedBehavior || shouldSeedStreak) {
      let currentStreak = 0;
      let bestStreak = Number(analytics.streakStats.bestCorrectStreak) || 0;
      answersAscending.forEach((answer) => {
        const elapsedMs = Number(answer.elapsedMs) || 0;
        const isCorrect = Boolean(answer.isCorrect);

        if (shouldSeedBehavior) {
          analytics.behaviorStats.totalAnswersTracked += 1;
          if (!isCorrect && elapsedMs < analytics.behaviorStats.thresholdMs) {
            analytics.behaviorStats.guessWrongCount += 1;
          }
          if (!isCorrect && elapsedMs > analytics.behaviorStats.thresholdMs) {
            analytics.behaviorStats.slowErrorCount += 1;
          }
          if (isCorrect && elapsedMs < analytics.behaviorStats.thresholdMs) {
            analytics.behaviorStats.fastCorrectCount += 1;
          }
        }

        if (isCorrect) {
          currentStreak += 1;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      if (shouldSeedStreak) {
        analytics.streakStats.currentCorrectStreak = currentStreak;
        analytics.streakStats.bestCorrectStreak = bestStreak;
      }
    }

    sessionsAscending.forEach((session, index) => {
      const scorePercent = Number(session.scorePercent) || 0;
      const completedAt = Number(session.completedAt) || 0;
      const durationMs = Number(session.durationMs) || 0;
      const questionCount = Number(session.questionCount) || 0;
      const correctCount = Number(session.correctCount) || 0;

      if (shouldSeedDaily && completedAt) {
        const bucket = ensureDailyStatBucket(analytics, getLocalDateKey(completedAt));
        bucket.studyTimeMs += durationMs;
        bucket.sessionsCompleted += 1;
        bucket.questionsAnswered += questionCount;
        bucket.correctAnswers += correctCount;
      }

      if (shouldSeedMoments) {
        updateRunningMoments(analytics.scoreMoments, scorePercent);
      }

      if (shouldSeedRegression && completedAt) {
        updateRegressionTotals(analytics.trendRegression, completedAt, scorePercent);
      }

      if (shouldSeedTopics) {
        const folderKey = session.folderId || session.folderPath || session.folderName || "library";
        updateTopicEntry(
          ensureTopicEntry(analytics.topicStats.byFolder, folderKey, session.folderName || session.folderPath || "Library"),
          scorePercent
        );
        const kindKey = session.quizKind || "quiz";
        updateTopicEntry(ensureTopicEntry(analytics.topicStats.byQuizKind, kindKey, kindKey), scorePercent);
      }

      if (shouldSeedDropoff && Number.isFinite(Number(session.dropoffRate))) {
        analytics.dropoffStats.sessionsTracked += 1;
        analytics.dropoffStats.totalDropoff += Number(session.dropoffRate);
      }

      if (!Number.isFinite(Number(session.efficiency))) {
        session.efficiency = safeDivide(scorePercent, durationMs, null);
      }
      if (!Number.isFinite(Number(session.questionsPerMinute))) {
        session.questionsPerMinute = safeDivide(questionCount, durationMs / 60000, null);
      }
      if (!Number.isFinite(Number(session.scoreDelta))) {
        session.scoreDelta = index > 0 ? scorePercent - (Number(sessionsAscending[index - 1].scorePercent) || 0) : null;
      }
    });
  }

  function normalizeAnalyticsModel(rawAnalytics) {
    const analytics = createDefaultAnalyticsModel();
    if (!rawAnalytics || typeof rawAnalytics !== "object" || Array.isArray(rawAnalytics)) {
      return analytics;
    }

    const rawCounters = rawAnalytics.counters && typeof rawAnalytics.counters === "object" ? rawAnalytics.counters : {};
    analytics.counters.session = Number.isInteger(rawCounters.session) ? Math.max(rawCounters.session, 0) : 0;
    analytics.counters.answer = Number.isInteger(rawCounters.answer) ? Math.max(rawCounters.answer, 0) : 0;

    const rawTotals = rawAnalytics.totals && typeof rawAnalytics.totals === "object" ? rawAnalytics.totals : {};
    analytics.totals.sessionsCompleted = Number(rawTotals.sessionsCompleted) || 0;
    analytics.totals.questionsAnswered = Number(rawTotals.questionsAnswered) || 0;
    analytics.totals.correctAnswers = Number(rawTotals.correctAnswers) || 0;
    analytics.totals.totalTimeMs = Number(rawTotals.totalTimeMs) || 0;
    analytics.totals.totalScorePercent = Number(rawTotals.totalScorePercent) || 0;

    if (Array.isArray(rawAnalytics.recentSessions)) {
      analytics.recentSessions = rawAnalytics.recentSessions
        .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
        .map((entry) => ({
          ...entry,
          startedAt: Number(entry.startedAt) || 0,
          completedAt: Number(entry.completedAt) || 0,
          durationMs: Number(entry.durationMs) || 0,
          questionCount: Number(entry.questionCount) || 0,
          correctCount: Number(entry.correctCount) || 0,
          wrongCount: Number(entry.wrongCount) || 0,
          scorePercent: Number(entry.scorePercent) || 0,
          averageAnswerMs: Number(entry.averageAnswerMs) || 0,
          efficiency: Number.isFinite(Number(entry.efficiency)) ? Number(entry.efficiency) : null,
          questionsPerMinute: Number.isFinite(Number(entry.questionsPerMinute)) ? Number(entry.questionsPerMinute) : null,
          scoreDelta: Number.isFinite(Number(entry.scoreDelta)) ? Number(entry.scoreDelta) : null,
          firstHalfAccuracy: Number.isFinite(Number(entry.firstHalfAccuracy)) ? Number(entry.firstHalfAccuracy) : null,
          secondHalfAccuracy: Number.isFinite(Number(entry.secondHalfAccuracy)) ? Number(entry.secondHalfAccuracy) : null,
          dropoffRate: Number.isFinite(Number(entry.dropoffRate)) ? Number(entry.dropoffRate) : null
        }))
        .slice(0, MAX_RECENT_ANALYTIC_SESSIONS);
    }

    if (Array.isArray(rawAnalytics.recentAnswers)) {
      analytics.recentAnswers = rawAnalytics.recentAnswers
        .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
        .map((entry) => ({
          ...entry,
          answeredAt: Number(entry.answeredAt) || 0,
          elapsedMs: Number(entry.elapsedMs) || 0,
          isCorrect: Boolean(entry.isCorrect)
        }))
        .slice(0, MAX_RECENT_ANALYTIC_ANSWERS);
    }

    if (rawAnalytics.quizStats && typeof rawAnalytics.quizStats === "object" && !Array.isArray(rawAnalytics.quizStats)) {
      Object.entries(rawAnalytics.quizStats).forEach(([key, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return;
        }
        analytics.quizStats[key] = decorateQuizStat({ ...value });
      });
    }

    if (
      rawAnalytics.questionStats &&
      typeof rawAnalytics.questionStats === "object" &&
      !Array.isArray(rawAnalytics.questionStats)
    ) {
      Object.entries(rawAnalytics.questionStats).forEach(([key, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return;
        }
        analytics.questionStats[key] = decorateQuestionStat({ ...value });
      });
    }

    if (rawAnalytics.dailyStats && typeof rawAnalytics.dailyStats === "object" && !Array.isArray(rawAnalytics.dailyStats)) {
      Object.entries(rawAnalytics.dailyStats).forEach(([key, value]) => {
        const bucket = createDefaultDailyStat();
        if (value && typeof value === "object" && !Array.isArray(value)) {
          bucket.studyTimeMs = Number(value.studyTimeMs) || 0;
          bucket.sessionsCompleted = Number(value.sessionsCompleted) || 0;
          bucket.questionsAnswered = Number(value.questionsAnswered) || 0;
          bucket.correctAnswers = Number(value.correctAnswers) || 0;
        }
        analytics.dailyStats[key] = bucket;
      });
    }

    if (rawAnalytics.behaviorStats && typeof rawAnalytics.behaviorStats === "object" && !Array.isArray(rawAnalytics.behaviorStats)) {
      analytics.behaviorStats.thresholdMs = Number(rawAnalytics.behaviorStats.thresholdMs) || ANALYTICS_BEHAVIOR_THRESHOLD_MS;
      analytics.behaviorStats.guessWrongCount = Number(rawAnalytics.behaviorStats.guessWrongCount) || 0;
      analytics.behaviorStats.slowErrorCount = Number(rawAnalytics.behaviorStats.slowErrorCount) || 0;
      analytics.behaviorStats.fastCorrectCount = Number(rawAnalytics.behaviorStats.fastCorrectCount) || 0;
      analytics.behaviorStats.totalAnswersTracked = Number(rawAnalytics.behaviorStats.totalAnswersTracked) || 0;
    }

    if (rawAnalytics.scoreMoments && typeof rawAnalytics.scoreMoments === "object" && !Array.isArray(rawAnalytics.scoreMoments)) {
      analytics.scoreMoments.count = Number(rawAnalytics.scoreMoments.count) || 0;
      analytics.scoreMoments.mean = Number(rawAnalytics.scoreMoments.mean) || 0;
      analytics.scoreMoments.m2 = Number(rawAnalytics.scoreMoments.m2) || 0;
    }

    if (rawAnalytics.trendRegression && typeof rawAnalytics.trendRegression === "object" && !Array.isArray(rawAnalytics.trendRegression)) {
      analytics.trendRegression.count = Number(rawAnalytics.trendRegression.count) || 0;
      analytics.trendRegression.sumX = Number(rawAnalytics.trendRegression.sumX) || 0;
      analytics.trendRegression.sumY = Number(rawAnalytics.trendRegression.sumY) || 0;
      analytics.trendRegression.sumXY = Number(rawAnalytics.trendRegression.sumXY) || 0;
      analytics.trendRegression.sumX2 = Number(rawAnalytics.trendRegression.sumX2) || 0;
    }

    if (rawAnalytics.streakStats && typeof rawAnalytics.streakStats === "object" && !Array.isArray(rawAnalytics.streakStats)) {
      analytics.streakStats.currentCorrectStreak = Number(rawAnalytics.streakStats.currentCorrectStreak) || 0;
      analytics.streakStats.bestCorrectStreak = Number(rawAnalytics.streakStats.bestCorrectStreak) || 0;
    }

    if (rawAnalytics.dropoffStats && typeof rawAnalytics.dropoffStats === "object" && !Array.isArray(rawAnalytics.dropoffStats)) {
      analytics.dropoffStats.sessionsTracked = Number(rawAnalytics.dropoffStats.sessionsTracked) || 0;
      analytics.dropoffStats.totalDropoff = Number(rawAnalytics.dropoffStats.totalDropoff) || 0;
    }

    if (rawAnalytics.topicStats && typeof rawAnalytics.topicStats === "object" && !Array.isArray(rawAnalytics.topicStats)) {
      analytics.topicStats.byFolder = normalizeTopicMap(rawAnalytics.topicStats.byFolder);
      analytics.topicStats.byQuizKind = normalizeTopicMap(rawAnalytics.topicStats.byQuizKind);
    }

    seedAnalyticsFromHistory(analytics);
    return analytics;
  }

  function createDefaultLibraryModel() {
    const now = Date.now();
    return {
      version: 4,
      rootFolderId: "root",
      folders: {
        root: {
          id: "root",
          name: ROOT_LIBRARY_LABEL,
          parentId: null,
          childFolderIds: [],
          quizIds: [],
          createdAt: now,
          updatedAt: now
        }
      },
      quizzes: {},
      counters: { folder: 0, quiz: 0 },
      settings: { volume: DEFAULT_VOLUME, theme: DEFAULT_THEME, goalPercent: DEFAULT_GOAL_PERCENT },
      flags: { legacyImported: false },
      analytics: createDefaultAnalyticsModel()
    };
  }

  // Rebuilds a safe in-memory library model from whatever was stored previously.
  function normalizeLibraryModel(rawModel) {
    const model = createDefaultLibraryModel();
    if (!rawModel || typeof rawModel !== "object" || Array.isArray(rawModel)) {
      return model;
    }

    if (rawModel.settings && typeof rawModel.settings === "object") {
      const volume = Number(rawModel.settings.volume);
      if (Number.isFinite(volume)) {
        model.settings.volume = clamp(volume, 0, 1);
      }

      if (typeof rawModel.settings.theme === "string" && isValidTheme(rawModel.settings.theme)) {
        model.settings.theme = rawModel.settings.theme;
      }

      model.settings.goalPercent = normalizeGoalPercent(rawModel.settings.goalPercent);
    }

    if (rawModel.flags && typeof rawModel.flags === "object") {
      model.flags.legacyImported = Boolean(rawModel.flags.legacyImported);
    }

    model.analytics = normalizeAnalyticsModel(rawModel.analytics);

    if (rawModel.folders && typeof rawModel.folders === "object") {
      Object.entries(rawModel.folders).forEach(([folderId, rawFolder]) => {
        if (folderId === "root") {
          return;
        }
        if (!rawFolder || typeof rawFolder !== "object" || Array.isArray(rawFolder)) {
          return;
        }
        const folderName = typeof rawFolder.name === "string" ? rawFolder.name.trim() : "";
        if (!folderName) {
          return;
        }

        model.folders[folderId] = {
          id: folderId,
          name: folderName,
          parentId: typeof rawFolder.parentId === "string" ? rawFolder.parentId : "root",
          childFolderIds: [],
          quizIds: [],
          createdAt: Number(rawFolder.createdAt) || Date.now(),
          updatedAt: Number(rawFolder.updatedAt) || Date.now()
        };
      });
    }

    Object.values(model.folders).forEach((folder) => {
      if (folder.id === "root") {
        return;
      }
      if (!folder.parentId || !model.folders[folder.parentId] || folder.parentId === folder.id) {
        folder.parentId = "root";
      }
      model.folders[folder.parentId].childFolderIds.push(folder.id);
    });

    if (rawModel.quizzes && typeof rawModel.quizzes === "object") {
      Object.entries(rawModel.quizzes).forEach(([quizId, rawQuiz]) => {
        if (!rawQuiz || typeof rawQuiz !== "object" || Array.isArray(rawQuiz)) {
          return;
        }
        const quizName = typeof rawQuiz.name === "string" ? rawQuiz.name.trim() : "";
        if (!quizName) {
          return;
        }

        let questions;
        try {
          questions = validateQuizData({ questions: rawQuiz.questions });
        } catch (error) {
          return;
        }

        const parentFolderId =
          typeof rawQuiz.parentFolderId === "string" && model.folders[rawQuiz.parentFolderId]
            ? rawQuiz.parentFolderId
            : "root";

        model.quizzes[quizId] = {
          id: quizId,
          name: quizName,
          questions,
          parentFolderId,
          kind: rawQuiz.kind === "overview" ? "overview" : "quiz",
          sourceQuizIds: Array.isArray(rawQuiz.sourceQuizIds)
            ? rawQuiz.sourceQuizIds.filter((value) => typeof value === "string")
            : [],
          createdAt: Number(rawQuiz.createdAt) || Date.now(),
          updatedAt: Number(rawQuiz.updatedAt) || Date.now()
        };
        model.folders[parentFolderId].quizIds.push(quizId);
      });
    }

    const rawCounters = rawModel.counters && typeof rawModel.counters === "object" ? rawModel.counters : {};
    model.counters.folder = Number.isInteger(rawCounters.folder) ? rawCounters.folder : 0;
    model.counters.quiz = Number.isInteger(rawCounters.quiz) ? rawCounters.quiz : 0;

    Object.keys(model.folders).forEach((folderId) => {
      const matches = /^fld-(\d+)$/.exec(folderId);
      if (matches) {
        model.counters.folder = Math.max(model.counters.folder, Number(matches[1]));
      }
    });

    Object.keys(model.quizzes).forEach((quizId) => {
      const matches = /^qz-(\d+)$/.exec(quizId);
      if (matches) {
        model.counters.quiz = Math.max(model.counters.quiz, Number(matches[1]));
      }
    });

    model.folders.root.name = ROOT_LIBRARY_LABEL;

    return model;
  }

  function getFolder(folderId) {
    return libraryRuntime.model.folders[folderId] || null;
  }

  function getQuiz(quizId) {
    return libraryRuntime.model.quizzes[quizId] || null;
  }

  function getCurrentFolder() {
    const folder = getFolder(libraryRuntime.currentFolderId);
    if (folder) {
      return folder;
    }
    libraryRuntime.currentFolderId = libraryRuntime.model.rootFolderId;
    return getFolder(libraryRuntime.currentFolderId);
  }

  function nextFolderId() {
    libraryRuntime.model.counters.folder += 1;
    return `fld-${libraryRuntime.model.counters.folder}`;
  }

  function nextQuizId() {
    libraryRuntime.model.counters.quiz += 1;
    return `qz-${libraryRuntime.model.counters.quiz}`;
  }

  function normalizeEntityName(name, fallbackName) {
    const fallback = fallbackName || "Untitled";
    if (typeof name !== "string") {
      return fallback;
    }
    const cleaned = name.replace(/[\x00-\x1f]/g, "").trim();
    return cleaned || fallback;
  }

  function sanitizeManagedEntryName(name, fallbackName) {
    const fallback = fallbackName || "Untitled";
    const cleaned = normalizeEntityName(name, fallback).replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/\.+$/g, "").trim();
    return cleaned || fallback;
  }

  function ensureManagedJsonFileName(name, fallbackName) {
    const baseName = sanitizeManagedEntryName(name, fallbackName || "quiz.json");
    return baseName.toLowerCase().endsWith(".json") ? baseName : `${baseName}.json`;
  }

  function ensureUniqueManagedEntryName(baseName, usedNames) {
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

  async function readTextFileFromDirectory(directoryHandle, fileName) {
    try {
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: false });
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      return null;
    }
  }

  async function writeTextFileToDirectory(directoryHandle, fileName, content) {
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async function readLibraryModelFromStorage() {
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

  async function saveLibraryModel() {
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

  function scheduleLibrarySave() {
    if (libraryRuntime.saveTimer) {
      window.clearTimeout(libraryRuntime.saveTimer);
    }
    libraryRuntime.saveTimer = window.setTimeout(() => {
      saveLibraryModel().catch(() => {});
    }, 150);
  }

  function addQuizToFolder(folderId, quizName, questions) {
    return addQuizRecord(folderId, {
      name: quizName,
      questions
    });
  }

  function addQuizRecord(folderId, config) {
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

  async function importLegacyQuizzesIfNeeded() {
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

  function ensureUniqueFolderName(parentFolderId, desiredName, excludedFolderId) {
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

  function ensureUniqueQuizName(folderId, desiredName, excludedQuizId) {
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

  function shuffleList(items) {
    const nextItems = items.slice();
    for (let index = nextItems.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = nextItems[index];
      nextItems[index] = nextItems[swapIndex];
      nextItems[swapIndex] = temp;
    }
    return nextItems;
  }

  function getQuizTypeLabel(quiz) {
    return quiz.kind === "overview" ? "Overview" : "Quiz";
  }

  function getEligibleOverviewSourceQuizzes(folderId) {
    const folder = getFolder(folderId);
    if (!folder || folder.childFolderIds.length > 0) {
      return [];
    }

    return folder.quizIds
      .map((quizId) => getQuiz(quizId))
      .filter((quiz) => quiz && quiz.kind !== "overview");
  }

  function canGenerateOverview(folderId) {
    return getEligibleOverviewSourceQuizzes(folderId).length > 0;
  }

  // Builds a mixed review quiz by pulling one random question from each eligible source quiz.
  function createOverviewQuestions(sourceQuizzes) {
    const selectedQuestions = sourceQuizzes.map((quiz) => {
      const randomIndex = Math.floor(Math.random() * quiz.questions.length);
      const question = quiz.questions[randomIndex];
      return {
        question: question.question,
        options: [...question.options],
        correctIndex: question.correctIndex
      };
    });

    return shuffleList(selectedQuestions).map((question, index) => ({
      id: index + 1,
      question: question.question,
      options: question.options,
      correctIndex: question.correctIndex
    }));
  }

  async function generateOverviewQuizForFolder(folderId, shouldStartQuiz) {
    clearError();

    const folder = getFolder(folderId);
    if (!folder) {
      showError("That folder no longer exists.");
      return;
    }

    const sourceQuizzes = getEligibleOverviewSourceQuizzes(folderId);
    if (!sourceQuizzes.length) {
      showError("Overview mode is only available for folders that contain quiz JSON files and no subfolders.");
      return;
    }

    const overviewQuiz = addQuizRecord(folder.id, {
      name: ensureUniqueQuizName(folder.id, `${normalizeEntityName(folder.name, "Overview")} overview.json`, null),
      questions: createOverviewQuestions(sourceQuizzes),
      kind: "overview",
      sourceQuizIds: sourceQuizzes.map((quiz) => quiz.id)
    });

    await persistAndRefreshLibrary();

    if (shouldStartQuiz) {
      startQuiz(overviewQuiz.questions, getLaunchContextForQuiz(overviewQuiz));
    }
  }

  function getFolderPath(folderId) {
    const lineage = [];
    let current = getFolder(folderId);
    while (current) {
      lineage.unshift(current);
      current = current.parentId ? getFolder(current.parentId) : null;
    }

    if (lineage.length <= 1) {
      return "/";
    }

    return `/${lineage
      .slice(1)
      .map((folder) => folder.name)
      .join("/")}`;
  }

  function nextAnalyticsId(counterKey, prefix) {
    const analytics = libraryRuntime.model.analytics;
    analytics.counters[counterKey] += 1;
    return `${prefix}-${analytics.counters[counterKey]}`;
  }

  function pushLimitedEntry(list, entry, maxItems) {
    list.unshift(entry);
    if (list.length > maxItems) {
      list.length = maxItems;
    }
  }

  function buildQuizLaunchContext(config) {
    const source = config && typeof config.source === "string" ? config.source : "library";
    const folder = config && typeof config.folderId === "string" ? getFolder(config.folderId) : null;

    return {
      source,
      quizId: config && typeof config.quizId === "string" ? config.quizId : null,
      quizName: normalizeEntityName(config && config.quizName, source === "demo" ? "Demo Quiz" : "Quiz"),
      quizKind: config && typeof config.quizKind === "string" ? config.quizKind : source === "demo" ? "demo" : "quiz",
      folderId: folder ? folder.id : null,
      folderName: folder ? folder.name : source === "demo" ? "Demo" : "Library",
      folderPath: folder ? getFolderPath(folder.id) : source === "demo" ? "/demo" : "/"
    };
  }

  function getLaunchContextForQuiz(quiz) {
    return buildQuizLaunchContext({
      source: "library",
      quizId: quiz.id,
      quizName: quiz.name,
      quizKind: quiz.kind || "quiz",
      folderId: quiz.parentFolderId
    });
  }

  function buildQuizAnalyticsKey(session) {
    if (session.quizId) {
      return session.quizId;
    }
    return `${session.source}:${session.folderPath}:${session.quizName}`;
  }

  function buildQuestionAnalyticsKey(session, question, questionIndex) {
    const questionId = question && question.id !== undefined && question.id !== null ? String(question.id) : `q-${questionIndex + 1}`;
    const normalizedText =
      typeof question.question === "string"
        ? question.question.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 160)
        : `question-${questionIndex + 1}`;
    return `${buildQuizAnalyticsKey(session)}::${questionId}::${normalizedText}`;
  }

  // Captures per-question analytics so the dashboard can show answer history and accuracy.
  function recordQuestionAnalytics(currentQuestion, selectedIndex, isCorrect, answeredAt) {
    if (!libraryRuntime.model || !quizState.activeSession) {
      return;
    }

    const analytics = libraryRuntime.model.analytics;
    const elapsedMs = Math.max(answeredAt - (quizState.questionStartedAt || answeredAt), 0);
    const session = quizState.activeSession;
    const questionNumber = quizState.currentQuestionIndex + 1;
    const questionKey = buildQuestionAnalyticsKey(session, currentQuestion, quizState.currentQuestionIndex);
    const attempt = {
      id: nextAnalyticsId("answer", "ans"),
      sessionId: session.id,
      source: session.source,
      quizId: session.quizId,
      quizName: session.quizName,
      quizKind: session.quizKind,
      folderId: session.folderId,
      folderName: session.folderName,
      folderPath: session.folderPath,
      questionId: currentQuestion.id,
      questionKey,
      questionNumber,
      questionText: currentQuestion.question,
      selectedIndex,
      selectedOption: currentQuestion.options[selectedIndex],
      correctIndex: currentQuestion.correctIndex,
      correctOption: currentQuestion.options[currentQuestion.correctIndex],
      isCorrect,
      answeredAt,
      elapsedMs
    };
    const isFastAnswer = elapsedMs < analytics.behaviorStats.thresholdMs;
    const isSlowAnswer = elapsedMs > analytics.behaviorStats.thresholdMs;

    session.answers.push(attempt);
    analytics.totals.questionsAnswered += 1;
    if (isCorrect) {
      analytics.totals.correctAnswers += 1;
    }
    analytics.behaviorStats.totalAnswersTracked += 1;
    if (!isCorrect && isFastAnswer) {
      analytics.behaviorStats.guessWrongCount += 1;
    }
    if (!isCorrect && isSlowAnswer) {
      analytics.behaviorStats.slowErrorCount += 1;
    }
    if (isCorrect && isFastAnswer) {
      analytics.behaviorStats.fastCorrectCount += 1;
    }
    if (isCorrect) {
      analytics.streakStats.currentCorrectStreak += 1;
      analytics.streakStats.bestCorrectStreak = Math.max(
        analytics.streakStats.bestCorrectStreak,
        analytics.streakStats.currentCorrectStreak
      );
    } else {
      analytics.streakStats.currentCorrectStreak = 0;
    }
    pushLimitedEntry(analytics.recentAnswers, attempt, MAX_RECENT_ANALYTIC_ANSWERS);

    const questionStat = analytics.questionStats[questionKey] || {
      questionKey,
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      quizId: session.quizId,
      quizName: session.quizName,
      quizKind: session.quizKind,
      folderId: session.folderId,
      folderName: session.folderName,
      folderPath: session.folderPath,
      attempts: 0,
      correctCount: 0,
      wrongCount: 0,
      totalTimeMs: 0,
      averageTimeMs: 0,
      questionAccuracy: null,
      difficulty: null,
      errorRate: null,
      masteryScore: null,
      firstAnsweredAt: answeredAt,
      firstResult: isCorrect,
      lastAnsweredAt: 0,
      lastResult: false,
      lastSelectedOption: "",
      correctOption: currentQuestion.options[currentQuestion.correctIndex],
      fastWrongCount: 0,
      slowWrongCount: 0,
      fastCorrectCount: 0
    };

    questionStat.attempts += 1;
    if (isCorrect) {
      questionStat.correctCount += 1;
    } else {
      questionStat.wrongCount += 1;
    }
    questionStat.totalTimeMs += elapsedMs;
    questionStat.averageTimeMs = Math.round(questionStat.totalTimeMs / questionStat.attempts);
    questionStat.questionAccuracy = safeDivide(questionStat.correctCount, questionStat.attempts, null);
    questionStat.difficulty = questionStat.attempts ? 1 - questionStat.questionAccuracy : null;
    questionStat.errorRate = safeDivide(questionStat.wrongCount, questionStat.attempts, null);
    questionStat.masteryScore = calculateQuestionMastery(questionStat.questionAccuracy, questionStat.averageTimeMs);
    if (!questionStat.firstAnsweredAt || answeredAt < questionStat.firstAnsweredAt) {
      questionStat.firstAnsweredAt = answeredAt;
      questionStat.firstResult = isCorrect;
    }
    questionStat.lastAnsweredAt = answeredAt;
    questionStat.lastResult = isCorrect;
    questionStat.lastSelectedOption = currentQuestion.options[selectedIndex];
    questionStat.correctOption = currentQuestion.options[currentQuestion.correctIndex];
    if (!isCorrect && isFastAnswer) {
      questionStat.fastWrongCount += 1;
    }
    if (!isCorrect && isSlowAnswer) {
      questionStat.slowWrongCount += 1;
    }
    if (isCorrect && isFastAnswer) {
      questionStat.fastCorrectCount += 1;
    }
    analytics.questionStats[questionKey] = decorateQuestionStat(questionStat);

    scheduleLibrarySave();
  }

  // Rolls an in-progress quiz session into the stored analytics aggregates.
  function completeAnalyticsSession(scorePercent) {
    if (!libraryRuntime.model || !quizState.activeSession) {
      return;
    }

    const analytics = libraryRuntime.model.analytics;
    const session = quizState.activeSession;
    const completedAt = Date.now();
    const durationMs = Math.max(completedAt - session.startedAt, 0);
    const previousSession = analytics.recentSessions
      .slice()
      .sort((left, right) => (Number(right.completedAt) || 0) - (Number(left.completedAt) || 0))[0];
    const dropoff = calculateSessionDropoff(session.answers);
    const scoreDelta = previousSession ? scorePercent - (Number(previousSession.scorePercent) || 0) : null;
    const questionsPerMinute = safeDivide(session.questionCount, durationMs / 60000, null);
    const summary = {
      id: session.id,
      source: session.source,
      quizId: session.quizId,
      quizName: session.quizName,
      quizKind: session.quizKind,
      folderId: session.folderId,
      folderName: session.folderName,
      folderPath: session.folderPath,
      startedAt: session.startedAt,
      completedAt,
      durationMs,
      questionCount: session.questionCount,
      correctCount: quizState.score,
      wrongCount: Math.max(session.questionCount - quizState.score, 0),
      scorePercent,
      averageAnswerMs: session.answers.length
        ? Math.round(session.answers.reduce((sum, answer) => sum + (Number(answer.elapsedMs) || 0), 0) / session.answers.length)
        : 0,
      efficiency: safeDivide(scorePercent, durationMs, null),
      questionsPerMinute,
      scoreDelta,
      firstHalfAccuracy: dropoff.firstHalfAccuracy,
      secondHalfAccuracy: dropoff.secondHalfAccuracy,
      dropoffRate: dropoff.dropoffRate
    };

    pushLimitedEntry(analytics.recentSessions, summary, MAX_RECENT_ANALYTIC_SESSIONS);
    analytics.totals.sessionsCompleted += 1;
    analytics.totals.totalTimeMs += durationMs;
    analytics.totals.totalScorePercent += scorePercent;
    updateRunningMoments(analytics.scoreMoments, scorePercent);
    updateRegressionTotals(analytics.trendRegression, completedAt, scorePercent);
    if (Number.isFinite(dropoff.dropoffRate)) {
      analytics.dropoffStats.sessionsTracked += 1;
      analytics.dropoffStats.totalDropoff += dropoff.dropoffRate;
    }

    const dailyBucket = ensureDailyStatBucket(analytics, getLocalDateKey(completedAt));
    dailyBucket.studyTimeMs += durationMs;
    dailyBucket.sessionsCompleted += 1;
    dailyBucket.questionsAnswered += session.questionCount;
    dailyBucket.correctAnswers += quizState.score;

    const quizKey = buildQuizAnalyticsKey(session);
    const quizStat = analytics.quizStats[quizKey] || {
      quizKey,
      quizId: session.quizId,
      quizName: session.quizName,
      quizKind: session.quizKind,
      folderId: session.folderId,
      folderName: session.folderName,
      folderPath: session.folderPath,
      attempts: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalTimeMs: 0,
      totalScorePercent: 0,
      averageScorePercent: 0,
      bestScorePercent: 0,
      firstCompletedAt: completedAt,
      firstScorePercent: scorePercent,
      quizAccuracy: null,
      retentionChange: 0,
      scoreMean: 0,
      scoreM2: 0,
      scoreVariance: 0,
      scoreStdDev: 0,
      consistencyScore: null,
      timePerCorrectMs: null,
      lastCompletedAt: 0,
      lastScorePercent: 0
    };

    quizStat.attempts += 1;
    quizStat.totalQuestions += session.questionCount;
    quizStat.totalCorrect += quizState.score;
    quizStat.totalTimeMs += durationMs;
    quizStat.totalScorePercent += scorePercent;
    quizStat.averageScorePercent = Math.round(quizStat.totalScorePercent / quizStat.attempts);
    quizStat.bestScorePercent = Math.max(quizStat.bestScorePercent, scorePercent);
    if (!quizStat.firstCompletedAt || completedAt < quizStat.firstCompletedAt) {
      quizStat.firstCompletedAt = completedAt;
      quizStat.firstScorePercent = scorePercent;
    }
    const quizMoments = {
      count: Math.max((Number(quizStat.attempts) || 1) - 1, 0),
      mean: Number(quizStat.scoreMean) || 0,
      m2: Number(quizStat.scoreM2) || 0
    };
    updateRunningMoments(quizMoments, scorePercent);
    quizStat.quizAccuracy = safeDivide(quizStat.totalCorrect, quizStat.totalQuestions, null);
    quizStat.retentionChange = scorePercent - (Number(quizStat.firstScorePercent) || 0);
    quizStat.scoreMean = quizMoments.mean;
    quizStat.scoreM2 = quizMoments.m2;
    quizStat.scoreVariance = safeDivide(quizStat.scoreM2, quizMoments.count || quizStat.attempts || 0, 0);
    quizStat.scoreStdDev = Math.sqrt(Math.max(quizStat.scoreVariance, 0));
    quizStat.consistencyScore = getConsistencyFromStdDev(quizStat.scoreStdDev);
    quizStat.timePerCorrectMs = safeDivide(quizStat.totalTimeMs, quizStat.totalCorrect, null);
    quizStat.lastCompletedAt = completedAt;
    quizStat.lastScorePercent = scorePercent;
    analytics.quizStats[quizKey] = decorateQuizStat(quizStat);

    const folderKey = session.folderId || session.folderPath || session.folderName || "library";
    updateTopicEntry(
      ensureTopicEntry(analytics.topicStats.byFolder, folderKey, session.folderName || session.folderPath || "Library"),
      scorePercent
    );
    const quizKindKey = session.quizKind || "quiz";
    updateTopicEntry(ensureTopicEntry(analytics.topicStats.byQuizKind, quizKindKey, quizKindKey), scorePercent);

    scheduleLibrarySave();
    quizState.activeSession = null;
    quizState.questionStartedAt = 0;
  }

  function getAllFolderPaths() {
    const paths = [];

    function visit(folderId) {
      const folder = getFolder(folderId);
      paths.push({ id: folder.id, path: getFolderPath(folder.id) });
      folder.childFolderIds
        .slice()
        .sort((leftId, rightId) => getFolder(leftId).name.localeCompare(getFolder(rightId).name))
        .forEach((childId) => visit(childId));
    }

    visit("root");
    return paths;
  }

  function getFolderDepth(folderId) {
    let depth = 0;
    let current = getFolder(folderId);
    while (current && current.parentId) {
      depth += 1;
      current = getFolder(current.parentId);
    }
    return depth;
  }

  function closeLibraryEditor() {
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

  function formatCount(count, singularLabel, pluralLabel) {
    return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
  }

  function getFolderMetaText(folder) {
    const parts = [];

    if (folder.childFolderIds.length) {
      parts.push(formatCount(folder.childFolderIds.length, "subfolder", "subfolders"));
    }

    if (folder.quizIds.length) {
      parts.push(formatCount(folder.quizIds.length, "quiz file", "quiz files"));
    }

    if (canGenerateOverview(folder.id)) {
      parts.push("overview ready");
    }

    return parts.length ? parts.join(" / ") : "Empty folder";
  }

  function getQuizMetaText(quiz) {
    const parts = [formatCount(quiz.questions.length, "question", "questions")];

    if (quiz.kind === "overview") {
      parts.push("mixed review set");
    }

    return parts.join(" / ");
  }

  function populateMoveFolderOptions(currentFolderId, selectedFolderId) {
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

  function openLibraryEditor(mode, entityId) {
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

  function renderBreadcrumb() {
    elements.libraryBreadcrumb.innerHTML = "";

    const lineage = [];
    let current = getCurrentFolder();
    while (current) {
      lineage.unshift(current);
      current = current.parentId ? getFolder(current.parentId) : null;
    }

    lineage.forEach((folder, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "library-path-btn";
      button.textContent = index === 0 ? ROOT_LIBRARY_LABEL : folder.name;
      button.setAttribute("data-action", "goto-folder");
      button.setAttribute("data-folder-id", folder.id);
      elements.libraryBreadcrumb.appendChild(button);

      if (index < lineage.length - 1) {
        const separator = document.createElement("span");
        separator.className = "library-path-sep";
        separator.textContent = "/";
        elements.libraryBreadcrumb.appendChild(separator);
      }
    });
  }

  // Builds a reusable action button for library rows.
  function createActionButton(config) {
    const button = createElement("button", config.className || "btn btn-secondary saved-item-btn", config.label);
    button.type = "button";
    button.setAttribute("data-action", config.action);
    if (config.folderId) {
      button.setAttribute("data-folder-id", config.folderId);
    }
    if (config.quizId) {
      button.setAttribute("data-quiz-id", config.quizId);
    }
    return button;
  }

  function createSavedItemCopy(typeLabel, titleText, metaText) {
    const title = createElement("p", "saved-item-title");
    const typeTag = createElement("span", "saved-item-type", typeLabel);
    title.appendChild(typeTag);
    title.appendChild(document.createTextNode(titleText));

    return appendChildren(createElement("div", "saved-item-copy"), [
      title,
      createElement("p", "saved-item-meta", metaText)
    ]);
  }

  function createSavedItemActions(actionConfigs) {
    return appendChildren(
      createElement("div", "saved-item-actions"),
      actionConfigs.map((config) => createActionButton(config))
    );
  }

  function createQuizActionMenu(quizId) {
    const menu = createElement("div", "saved-action-menu");
    menu.setAttribute("data-quiz-id", quizId);

    const toggleButton = createActionButton({
      label: "Actions",
      action: "toggle-quiz-menu",
      quizId,
      className: "btn btn-secondary saved-item-btn saved-action-menu-toggle"
    });
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-haspopup", "menu");

    const menuPanel = createElement("div", "saved-action-menu-panel");
    menuPanel.setAttribute("role", "menu");
    appendChildren(menuPanel, [
      createActionButton({ label: "Quickie", action: "quickie-quiz", quizId }),
      createActionButton({ label: "Rename", action: "edit-quiz", quizId }),
      createActionButton({ label: "Move", action: "edit-move-quiz", quizId }),
      createActionButton({
        label: "Delete",
        action: "delete-quiz",
        quizId,
        className: "btn btn-secondary saved-item-btn saved-item-danger-btn"
      })
    ]);

    appendChildren(menu, [toggleButton, menuPanel]);
    return appendChildren(createElement("div", "saved-action-menu-wrap"), [menu]);
  }

  // Renders the saved library tree for the currently open folder.
  function renderLibraryList() {
    elements.savedQuizList.innerHTML = "";
    elements.savedEmpty.textContent = "This folder is empty.";

    const currentFolder = getCurrentFolder();
    const folders = currentFolder.childFolderIds
      .map((folderId) => getFolder(folderId))
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name));

    const quizzes = currentFolder.quizIds
      .map((quizId) => getQuiz(quizId))
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name));

    if (!folders.length && !quizzes.length) {
      elements.savedEmpty.style.display = "block";
      return;
    }

    elements.savedEmpty.style.display = "none";

    folders.forEach((folder) => {
      const item = createElement("li", "saved-item saved-item-folder");
      const actionConfigs = [
        {
          label: "Open",
          action: "open-folder",
          folderId: folder.id,
          className: "btn btn-secondary saved-item-btn saved-item-main-btn"
        }
      ];

      if (canGenerateOverview(folder.id)) {
        actionConfigs.push({ label: "Overview", action: "overview-folder", folderId: folder.id });
      }

      actionConfigs.push(
        { label: "Rename", action: "edit-folder", folderId: folder.id },
        {
          label: "Delete",
          action: "delete-folder",
          folderId: folder.id,
          className: "btn btn-secondary saved-item-btn saved-item-danger-btn"
        }
      );

      appendChildren(item, [
        createSavedItemCopy("Folder", folder.name, getFolderMetaText(folder)),
        createSavedItemActions(actionConfigs)
      ]);
      elements.savedQuizList.appendChild(item);
    });

    quizzes.forEach((quiz) => {
      const item = createElement("li", "saved-item saved-item-quiz");
      const actions = createElement("div", "saved-item-actions");
      actions.appendChild(
        createActionButton({
          label: "Load",
          action: "load-quiz",
          quizId: quiz.id,
          className: "btn btn-secondary saved-item-btn saved-item-main-btn"
        })
      );
      actions.appendChild(createQuizActionMenu(quiz.id));
      appendChildren(item, [
        createSavedItemCopy(getQuizTypeLabel(quiz), quiz.name, getQuizMetaText(quiz)),
        actions
      ]);
      elements.savedQuizList.appendChild(item);
    });
  }

  function refreshLibraryUI() {
    renderBreadcrumb();
    renderLibraryList();
    const currentFolder = getCurrentFolder();
    elements.upFolderBtn.disabled = !currentFolder.parentId;
    elements.overviewFolderBtn.disabled = !canGenerateOverview(currentFolder.id);
  }

  async function persistAndRefreshLibrary() {
    await saveLibraryModel();
    refreshLibraryUI();
  }

  function formatTimestamp(timestamp) {
    const value = Number(timestamp);
    if (!value) {
      return "Unknown time";
    }

    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value));
    } catch (error) {
      return new Date(value).toLocaleString();
    }
  }

  function formatDuration(durationMs) {
    const totalMs = Math.max(Math.round(Number(durationMs) || 0), 0);
    if (totalMs > 0 && totalMs < 1000) {
      return `${totalMs}ms`;
    }

    const totalSeconds = Math.max(Math.round(totalMs / 1000), 0);
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }

    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${totalMinutes}m`;
  }

  function formatPercent(value) {
    return `${Math.round(Number(value) || 0)}%`;
  }

  function formatRatioPercent(value, digits) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "\u2014";
    }
    return `${roundTo(amount * 100, digits === undefined ? 0 : digits)}%`;
  }

  function formatDecimal(value, digits, suffix) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "\u2014";
    }
    const precision = Number.isInteger(digits) ? digits : 2;
    return `${roundTo(amount, precision)}${suffix || ""}`;
  }

  function formatSignedScoreChange(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "\u2014";
    }

    const rounded = roundTo(amount, 0);
    if (rounded > 0) {
      return `+${rounded}%`;
    }
    if (rounded < 0) {
      return `${rounded}%`;
    }
    return "0%";
  }

  function formatSignedRatioPercent(value, digits) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "\u2014";
    }

    const rounded = roundTo(amount * 100, digits === undefined ? 0 : digits);
    if (rounded > 0) {
      return `+${rounded}%`;
    }
    if (rounded < 0) {
      return `${rounded}%`;
    }
    return "0%";
  }

  function formatTrendSlope(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "\u2014";
    }

    const pointsPerDay = amount * 86400000;
    const rounded = roundTo(pointsPerDay, 1);
    if (rounded > 0) {
      return `+${rounded} pts/day`;
    }
    if (rounded < 0) {
      return `${rounded} pts/day`;
    }
    return "0 pts/day";
  }

  function formatMetricText(value, formatter) {
    if (value === null || value === undefined) {
      return "\u2014";
    }
    return typeof formatter === "function" ? formatter(value) : String(value);
  }

  function createAnalyticsEmptyMessage(message) {
    return createElement("p", "analytics-empty-message", message);
  }

  function createSvgElement(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  // Renders a limited collection or a matching empty-state message into a container.
  function renderCollection(container, items, emptyMessage, limit, buildItem) {
    container.innerHTML = "";
    if (!items.length) {
      container.appendChild(createAnalyticsEmptyMessage(emptyMessage));
      return;
    }

    items.slice(0, limit).forEach((item) => {
      container.appendChild(buildItem(item));
    });
  }

  function createAnalyticsRowCopy(titleText, metaText, detailText) {
    const copy = createElement("div", "analytics-row-copy");
    copy.appendChild(createElement("p", "analytics-row-title", titleText));
    if (metaText) {
      copy.appendChild(createElement("p", "analytics-row-meta", metaText));
    }
    if (detailText) {
      copy.appendChild(createElement("p", "analytics-row-detail", detailText));
    }
    return copy;
  }

  function createAnalyticsScoreChip(text, className) {
    return createElement("div", className || "analytics-score-chip", text);
  }

  function createAnalyticsAnswerBadge(isCorrect) {
    return createElement(
      "span",
      `analytics-answer-badge ${isCorrect ? "is-correct" : "is-wrong"}`,
      isCorrect ? "Right" : "Wrong"
    );
  }

  function createAnalyticsMiniCopy(titleText, metaText) {
    const copy = createElement("div", "analytics-mini-copy");
    copy.appendChild(createElement("p", "analytics-mini-title", titleText));
    if (metaText) {
      copy.appendChild(createElement("p", "analytics-mini-meta", metaText));
    }
    return copy;
  }

  function createAnalyticsMiniRow(titleText, metaText, chipText, chipClassName) {
    const row = createElement("article", "analytics-mini-row");
    row.appendChild(createAnalyticsMiniCopy(titleText, metaText));
    if (chipText) {
      row.appendChild(createAnalyticsScoreChip(chipText, chipClassName));
    }
    return row;
  }

  function createAnalyticsPerformanceStat(labelText, valueText, noteText) {
    return appendChildren(createElement("article", "analytics-performance-stat"), [
      createElement("p", "analytics-performance-stat-label", labelText),
      createElement("h4", "analytics-performance-stat-value", valueText),
      createElement("p", "analytics-performance-stat-note", noteText)
    ]);
  }

  function createAnalyticsPerformanceGroup(titleText, items, emptyMessage, buildItem) {
    const section = createElement("section", "analytics-performance-group");
    section.appendChild(createElement("h4", "analytics-performance-group-title", titleText));

    const list = createElement("div", "analytics-performance-list");
    if (!items.length) {
      list.appendChild(createAnalyticsEmptyMessage(emptyMessage));
    } else {
      items.forEach((item) => {
        list.appendChild(buildItem(item));
      });
    }

    section.appendChild(list);
    return section;
  }

  function buildRollingAverageSeries(sessions, windowSize) {
    const sortedSessions = sessions
      .slice()
      .sort((left, right) => (Number(left.completedAt) || 0) - (Number(right.completedAt) || 0));

    return sortedSessions.map((session, index) => {
      const startIndex = Math.max(0, index - windowSize + 1);
      const windowSessions = sortedSessions.slice(startIndex, index + 1);
      const rollingAverage = safeDivide(
        windowSessions.reduce((sum, item) => sum + (Number(item.scorePercent) || 0), 0),
        windowSessions.length,
        null
      );
      return {
        ...session,
        rollingAverage
      };
    });
  }

  function buildDailyMetrics(dailyStats) {
    return Object.entries(dailyStats || {})
      .map(([dateKey, value]) => ({
        dateKey,
        studyTimeMs: Number(value.studyTimeMs) || 0,
        sessionsCompleted: Number(value.sessionsCompleted) || 0,
        questionsAnswered: Number(value.questionsAnswered) || 0,
        correctAnswers: Number(value.correctAnswers) || 0
      }))
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
  }

  function buildTopicMetrics(topicMap) {
    return Object.entries(topicMap || {})
      .map(([key, value]) => ({
        key,
        label: value.label || key,
        attempts: Number(value.attempts) || 0,
        totalScorePercent: Number(value.totalScorePercent) || 0,
        averageScorePercent: Number(value.averageScorePercent) || 0
      }))
      .sort((left, right) => {
        const averageGap = (Number(right.averageScorePercent) || 0) - (Number(left.averageScorePercent) || 0);
        if (averageGap !== 0) {
          return averageGap;
        }
        return (Number(right.attempts) || 0) - (Number(left.attempts) || 0);
      });
  }

  // Produces sorted analytics collections that are ready to render into the dashboard.
  function getAnalyticsSnapshot() {
    const analytics = libraryRuntime.model.analytics || createDefaultAnalyticsModel();
    const totals = analytics.totals || createDefaultAnalyticsModel().totals;
    const recentSessions = analytics.recentSessions
      .slice()
      .sort((left, right) => (Number(right.completedAt) || 0) - (Number(left.completedAt) || 0));
    const recentAnswers = analytics.recentAnswers
      .slice()
      .sort((left, right) => (Number(right.answeredAt) || 0) - (Number(left.answeredAt) || 0));
    const quizStats = Object.values(analytics.quizStats || {})
      .filter(Boolean)
      .map((stat) => decorateQuizStat(stat))
      .sort(
        (left, right) =>
          (Number(right.lastCompletedAt) || 0) - (Number(left.lastCompletedAt) || 0) ||
          (Number(right.attempts) || 0) - (Number(left.attempts) || 0)
      );
    const questionStats = Object.values(analytics.questionStats || {})
      .filter(Boolean)
      .map((stat) => decorateQuestionStat(stat))
      .sort((left, right) => {
        const rightDifficulty = Number(right.difficulty);
        const leftDifficulty = Number(left.difficulty);
        if (Number.isFinite(rightDifficulty) && Number.isFinite(leftDifficulty) && rightDifficulty !== leftDifficulty) {
          return rightDifficulty - leftDifficulty;
        }

        const rightWrong = Number(right.wrongCount) || 0;
        const leftWrong = Number(left.wrongCount) || 0;
        if (rightWrong !== leftWrong) {
          return rightWrong - leftWrong;
        }

        return (Number(right.lastAnsweredAt) || 0) - (Number(left.lastAnsweredAt) || 0);
      });
    const libraryQuizzes = Object.values((libraryRuntime.model && libraryRuntime.model.quizzes) || {})
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name));
    const attemptedLibraryQuizStats = libraryQuizzes
      .map((quiz) => {
        const stat = analytics.quizStats[quiz.id];
        if (!stat || (Number(stat.attempts) || 0) <= 0) {
          return null;
        }

        return decorateQuizStat({
          ...stat,
          quizId: quiz.id,
          quizName: quiz.name,
          quizKind: quiz.kind || stat.quizKind || "quiz",
          folderId: quiz.parentFolderId
        });
      })
      .filter(Boolean);
    const unattemptedQuizzes = libraryQuizzes.filter((quiz) => {
      const stat = analytics.quizStats[quiz.id];
      return !stat || (Number(stat.attempts) || 0) <= 0;
    });

    const topPerformers = attemptedLibraryQuizStats
      .slice()
      .sort((left, right) => {
        const averageGap = (Number(right.averageScorePercent) || 0) - (Number(left.averageScorePercent) || 0);
        if (averageGap !== 0) {
          return averageGap;
        }
        const accuracyGap = (Number(right.quizAccuracy) || 0) - (Number(left.quizAccuracy) || 0);
        if (accuracyGap !== 0) {
          return accuracyGap;
        }
        return (Number(right.lastCompletedAt) || 0) - (Number(left.lastCompletedAt) || 0);
      })
      .slice(0, 3);
    const leastPerformers = attemptedLibraryQuizStats
      .slice()
      .sort((left, right) => {
        const averageGap = (Number(left.averageScorePercent) || 0) - (Number(right.averageScorePercent) || 0);
        if (averageGap !== 0) {
          return averageGap;
        }
        return (Number(right.attempts) || 0) - (Number(left.attempts) || 0);
      })
      .slice(0, 3);
    const mostConsistentQuizzes = attemptedLibraryQuizStats
      .slice()
      .sort((left, right) => {
        const consistencyGap = (Number(right.consistencyScore) || 0) - (Number(left.consistencyScore) || 0);
        if (consistencyGap !== 0) {
          return consistencyGap;
        }
        return (Number(right.averageScorePercent) || 0) - (Number(left.averageScorePercent) || 0);
      })
      .slice(0, 3);
    const mostIncorrectQuestions = questionStats.filter((stat) => (Number(stat.wrongCount) || 0) > 0).slice(0, 4);
    const attemptedQuizCount = attemptedLibraryQuizStats.length;
    const goalPercent = getGoalPercent();
    const passedQuizCount = attemptedLibraryQuizStats.filter((stat) => (Number(stat.bestScorePercent) || 0) >= goalPercent).length;
    const needsWorkQuizCount = attemptedQuizCount - passedQuizCount;
    const rollingSeries = buildRollingAverageSeries(recentSessions, ANALYTICS_ROLLING_WINDOW);
    const trendSeries = rollingSeries.slice(-8);
    const accuracy = safeDivide(totals.correctAnswers, totals.questionsAnswered, null);
    const averageScore = safeDivide(totals.totalScorePercent, totals.sessionsCompleted, null);
    const averageAnswerMs = safeDivide(totals.totalTimeMs, totals.questionsAnswered, null);
    const questionsPerMinute = safeDivide(totals.questionsAnswered, (Number(totals.totalTimeMs) || 0) / 60000, null);
    const timePerCorrectMs = safeDivide(totals.totalTimeMs, totals.correctAnswers, null);
    const variance = getVarianceFromMoments(analytics.scoreMoments);
    const stdDev = getStdDevFromMoments(analytics.scoreMoments);
    const consistencyScore = getConsistencyFromStdDev(stdDev);
    const behaviorStats = analytics.behaviorStats || createDefaultBehaviorStats();
    const guessRate = safeDivide(behaviorStats.guessWrongCount, behaviorStats.totalAnswersTracked, null);
    const slowErrorRate = safeDivide(behaviorStats.slowErrorCount, behaviorStats.totalAnswersTracked, null);
    const fastCorrectRate = safeDivide(behaviorStats.fastCorrectCount, behaviorStats.totalAnswersTracked, null);
    const dailyMetrics = buildDailyMetrics(analytics.dailyStats);
    const daysTracked = dailyMetrics.length;
    const avgStudyTimePerDay = daysTracked
      ? safeDivide(
          dailyMetrics.reduce((sum, day) => sum + day.studyTimeMs, 0),
          daysTracked,
          null
        )
      : null;
    const avgSessionsPerDay = daysTracked
      ? safeDivide(
          dailyMetrics.reduce((sum, day) => sum + day.sessionsCompleted, 0),
          daysTracked,
          null
        )
      : null;
    const topicMetrics = {
      folders: buildTopicMetrics(analytics.topicStats.byFolder),
      quizKinds: buildTopicMetrics(analytics.topicStats.byQuizKind)
    };
    const averageDropoff = safeDivide(
      analytics.dropoffStats.totalDropoff,
      analytics.dropoffStats.sessionsTracked,
      null
    );

    return {
      totals,
      globalMetrics: {
        accuracy,
        averageScore,
        averageAnswerMs,
        questionsPerMinute,
        timePerCorrectMs,
        rollingAverageScore: trendSeries.length ? trendSeries[trendSeries.length - 1].rollingAverage : null,
        improvementSlope: getRegressionSlope(analytics.trendRegression),
        variance,
        stdDev,
        consistencyScore,
        guessRate,
        slowErrorRate,
        fastCorrectRate,
        currentStreak: Number(analytics.streakStats.currentCorrectStreak) || 0,
        bestStreak: Number(analytics.streakStats.bestCorrectStreak) || 0
      },
      behaviorSummary: {
        guessRate,
        slowErrorRate,
        fastCorrectRate,
        thresholdMs: behaviorStats.thresholdMs,
        currentStreak: Number(analytics.streakStats.currentCorrectStreak) || 0,
        bestStreak: Number(analytics.streakStats.bestCorrectStreak) || 0,
        averageDropoff
      },
      timeSummary: {
        averageSessionDurationMs: safeDivide(totals.totalTimeMs, totals.sessionsCompleted, null),
        averageStudyTimePerDayMs: avgStudyTimePerDay,
        averageSessionsPerDay: avgSessionsPerDay,
        daysTracked
      },
      dailyMetrics,
      topicMetrics,
      trendSeries,
      recentSessions,
      recentAnswers,
      quizStats,
      questionStats,
      attemptedLibraryQuizStats,
      unattemptedQuizzes,
      topPerformers,
      leastPerformers,
      mostConsistentQuizzes,
      mostIncorrectQuestions,
      attemptedQuizCount,
      goalPercent,
      passedQuizCount,
      needsWorkQuizCount
    };
  }

  function renderAnalyticsSessions(sessions) {
    renderCollection(
      elements.analyticsSessionList,
      sessions,
      "No completed quiz sessions yet.",
      4,
      (session) =>
        appendChildren(createElement("article", "analytics-row analytics-row-compact"), [
          createAnalyticsRowCopy(
            session.quizName || "Untitled quiz",
            `${session.correctCount || 0}/${session.questionCount || 0} correct \u2022 ${formatDuration(session.durationMs)}`,
            `Delta ${formatMetricText(session.scoreDelta, formatSignedScoreChange)} \u2022 ${formatMetricText(
              session.questionsPerMinute,
              (value) => formatDecimal(value, 1, " qpm")
            )} \u2022 Drop-off ${formatMetricText(session.dropoffRate, formatSignedRatioPercent)}`
          ),
          createAnalyticsScoreChip(formatPercent(session.scorePercent))
        ])
    );
  }

  function renderAnalyticsQuizzes(snapshot) {
    const container = elements.analyticsQuizList;
    container.innerHTML = "";

    const summaryGrid = createElement("div", "analytics-performance-stat-grid");
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat("Attempted", String(snapshot.attemptedQuizCount), "Completed at least once")
    );
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat(`${snapshot.goalPercent}%+`, String(snapshot.passedQuizCount), `Reached ${snapshot.goalPercent}% or higher`)
    );
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat("Needs Work", String(snapshot.needsWorkQuizCount), "Below your target band")
    );
    container.appendChild(summaryGrid);

    const groups = createElement("div", "analytics-performance-groups");
    groups.appendChild(
      createAnalyticsPerformanceGroup(
        "Top Performing",
        snapshot.topPerformers,
        "No attempted quizzes yet.",
        (stat) =>
          createAnalyticsMiniRow(
            stat.quizName || "Untitled quiz",
            `Avg ${formatPercent(stat.averageScorePercent)} \u2022 Accuracy ${formatRatioPercent(stat.quizAccuracy)} \u2022 Best ${formatPercent(stat.bestScorePercent)}`,
            formatPercent(stat.averageScorePercent)
          )
      )
    );
    groups.appendChild(
      createAnalyticsPerformanceGroup(
        "Needs Attention",
        snapshot.leastPerformers,
        "No attempted quizzes yet.",
        (stat) =>
          createAnalyticsMiniRow(
            stat.quizName || "Untitled quiz",
            `Last ${formatPercent(stat.lastScorePercent)} \u2022 Retention ${formatSignedScoreChange(
              stat.retentionChange
            )} \u2022 ${stat.attempts || 0} attempt${(stat.attempts || 0) === 1 ? "" : "s"}`,
            formatPercent(stat.averageScorePercent)
          )
      )
    );
    groups.appendChild(
      createAnalyticsPerformanceGroup(
        "Most Consistent",
        snapshot.mostConsistentQuizzes,
        "Consistency builds as you complete more quizzes.",
        (stat) =>
          createAnalyticsMiniRow(
            stat.quizName || "Untitled quiz",
            `Consistency ${formatRatioPercent(stat.consistencyScore, 1)} \u2022 Std dev ${formatDecimal(
              stat.scoreStdDev,
              1
            )}`,
            formatRatioPercent(stat.consistencyScore, 1)
          )
      )
    );
    container.appendChild(groups);
  }

  function renderAnalyticsQuestions(questionStats) {
    renderCollection(
      elements.analyticsQuestionList,
      questionStats,
      "Question-level trends will appear here.",
      4,
      (stat) =>
        appendChildren(createElement("article", "analytics-row analytics-row-compact"), [
          createAnalyticsRowCopy(
            stat.questionText || "Untitled question",
            stat.quizName || "Unknown quiz",
            `Accuracy ${formatRatioPercent(stat.questionAccuracy)} \u2022 Difficulty ${formatRatioPercent(
              stat.difficulty
            )} \u2022 Avg ${formatDuration(stat.averageTimeMs)} \u2022 Mastery ${formatDecimal(stat.masteryScore, 2)}`
          ),
          createAnalyticsScoreChip(stat.lastResult ? "Last: Right" : "Last: Wrong")
        ])
    );
  }

  function renderAnalyticsAnswers(answers) {
    renderCollection(
      elements.analyticsAnswerList,
      answers,
      "Recent answers will show up here.",
      4,
      (answer) => {
        const detailText = answer.isCorrect
          ? `Correct in ${formatDuration(answer.elapsedMs)}.`
          : `Picked "${answer.selectedOption || "Unknown"}". Correct: "${answer.correctOption || "Unknown"}".`;

        return appendChildren(createElement("article", "analytics-row analytics-row-answer analytics-row-compact"), [
          createAnalyticsRowCopy(
            answer.questionText || "Untitled question",
            `${answer.quizName || "Unknown quiz"} \u2022 ${formatTimestamp(answer.answeredAt)}`,
            detailText
          ),
          createAnalyticsAnswerBadge(answer.isCorrect)
        ]);
      }
    );
  }

  function renderAnalyticsBehavior(snapshot) {
    const container = elements.analyticsBehaviorList;
    container.innerHTML = "";

    const summaryGrid = createElement("div", "analytics-performance-stat-grid");
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat("Guess Rate", formatRatioPercent(snapshot.behaviorSummary.guessRate), "Fast wrong answers")
    );
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat(
        "Slow Errors",
        formatRatioPercent(snapshot.behaviorSummary.slowErrorRate),
        "Long wrong answers"
      )
    );
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat(
        "Fast Correct",
        formatRatioPercent(snapshot.behaviorSummary.fastCorrectRate),
        "Quick correct answers"
      )
    );
    container.appendChild(summaryGrid);

    const list = createElement("div", "analytics-list analytics-list-compact");
    list.appendChild(
      createAnalyticsMiniRow(
        "Current Streak",
        `Best streak: ${snapshot.behaviorSummary.bestStreak}`,
        String(snapshot.behaviorSummary.currentStreak)
      )
    );
    list.appendChild(
      createAnalyticsMiniRow(
        "Average Drop-off",
        "Accuracy change from first half to second half",
        formatMetricText(snapshot.behaviorSummary.averageDropoff, formatSignedRatioPercent)
      )
    );
    list.appendChild(
      createAnalyticsMiniRow(
        "Speed Threshold",
        "Answers below this are treated as fast",
        formatDuration(snapshot.behaviorSummary.thresholdMs)
      )
    );
    container.appendChild(list);
  }

  function renderAnalyticsTime(snapshot) {
    const container = elements.analyticsTimeList;
    container.innerHTML = "";

    const summaryGrid = createElement("div", "analytics-performance-stat-grid");
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat(
        "Avg Session",
        formatMetricText(snapshot.timeSummary.averageSessionDurationMs, formatDuration),
        "Mean completed session length"
      )
    );
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat(
        "Time / Correct",
        formatMetricText(snapshot.globalMetrics.timePerCorrectMs, formatDuration),
        "Study time per correct answer"
      )
    );
    summaryGrid.appendChild(
      createAnalyticsPerformanceStat(
        "Sessions / Day",
        formatMetricText(snapshot.timeSummary.averageSessionsPerDay, (value) => formatDecimal(value, 1)),
        `${snapshot.timeSummary.daysTracked || 0} tracked day${snapshot.timeSummary.daysTracked === 1 ? "" : "s"}`
      )
    );
    container.appendChild(summaryGrid);

    const list = createElement("div", "analytics-list analytics-list-compact");
    if (!snapshot.dailyMetrics.length) {
      list.appendChild(createAnalyticsEmptyMessage("Daily study patterns will appear here."));
    } else {
      snapshot.dailyMetrics.slice(0, 4).forEach((day) => {
        list.appendChild(
          createAnalyticsMiniRow(
            day.dateKey,
            `${day.sessionsCompleted} session${day.sessionsCompleted === 1 ? "" : "s"} \u2022 ${day.questionsAnswered} answers`,
            formatDuration(day.studyTimeMs)
          )
        );
      });
    }
    container.appendChild(list);
  }

  function renderAnalyticsTopics(snapshot) {
    const container = elements.analyticsTopicList;
    container.innerHTML = "";

    const groups = createElement("div", "analytics-performance-groups analytics-performance-groups-two");
    groups.appendChild(
      createAnalyticsPerformanceGroup(
        "Folders",
        snapshot.topicMetrics.folders.slice(0, 3),
        "Topic strength appears after tracked sessions.",
        (topic) =>
          createAnalyticsMiniRow(
            topic.label,
            `${topic.attempts} attempt${topic.attempts === 1 ? "" : "s"}`,
            formatPercent(topic.averageScorePercent)
          )
      )
    );
    groups.appendChild(
      createAnalyticsPerformanceGroup(
        "Quiz Types",
        snapshot.topicMetrics.quizKinds.slice(0, 3),
        "Quiz-type strength appears after tracked sessions.",
        (topic) =>
          createAnalyticsMiniRow(
            topic.label,
            `${topic.attempts} attempt${topic.attempts === 1 ? "" : "s"}`,
            formatPercent(topic.averageScorePercent)
          )
      )
    );
    container.appendChild(groups);
  }

  function renderAnalyticsScoreGraph(trendSeries) {
    const container = elements.analyticsScoreGraph;
    container.innerHTML = "";

    const chartSeries = trendSeries.slice();
    if (!chartSeries.length) {
      container.appendChild(createAnalyticsEmptyMessage("Complete quizzes to see your score trend."));
      return;
    }

    const width = 360;
    const height = 170;
    const paddingLeft = 24;
    const paddingRight = 12;
    const paddingTop = 14;
    const paddingBottom = 28;
    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;
    const baselineY = paddingTop + innerHeight;
    const scores = chartSeries.map((session) => clamp(Number(session.scorePercent) || 0, 0, 100));
    const rollingScores = chartSeries.map((session) =>
      Number.isFinite(Number(session.rollingAverage)) ? clamp(Number(session.rollingAverage), 0, 100) : null
    );
    const points = scores.map((score, index) => {
      const x =
        chartSeries.length === 1
          ? paddingLeft + innerWidth / 2
          : paddingLeft + (innerWidth * index) / (chartSeries.length - 1);
      const y = baselineY - (score / 100) * innerHeight;
      return { x, y, score };
    });
    const rollingPoints = rollingScores.map((score, index) => {
      if (!Number.isFinite(score)) {
        return null;
      }
      const x =
        chartSeries.length === 1
          ? paddingLeft + innerWidth / 2
          : paddingLeft + (innerWidth * index) / (chartSeries.length - 1);
      const y = baselineY - (score / 100) * innerHeight;
      return { x, y, score };
    });

    const svg = createSvgElement("svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "analytics-line-chart");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Line chart showing score trend and rolling average over recent attempts");

    [0, 50, 100].forEach((tick) => {
      const y = baselineY - (tick / 100) * innerHeight;
      const gridLine = createSvgElement("line");
      gridLine.setAttribute("x1", String(paddingLeft));
      gridLine.setAttribute("y1", String(y));
      gridLine.setAttribute("x2", String(width - paddingRight));
      gridLine.setAttribute("y2", String(y));
      gridLine.setAttribute("class", "analytics-line-chart-grid");
      svg.appendChild(gridLine);

      const label = createSvgElement("text");
      label.setAttribute("x", "2");
      label.setAttribute("y", String(y + 3));
      label.setAttribute("class", "analytics-line-chart-axis");
      label.textContent = `${tick}%`;
      svg.appendChild(label);
    });

    const areaPoints = points.map((point) => `${point.x},${point.y}`).join(" ");
    const area = createSvgElement("polygon");
    area.setAttribute(
      "points",
      `${paddingLeft},${baselineY} ${areaPoints} ${points[points.length - 1].x},${baselineY}`
    );
    area.setAttribute("class", "analytics-line-chart-area");
    svg.appendChild(area);

    const polyline = createSvgElement("polyline");
    polyline.setAttribute("points", areaPoints);
    polyline.setAttribute("class", "analytics-line-chart-line");
    svg.appendChild(polyline);

    const rollingPolyline = createSvgElement("polyline");
    rollingPolyline.setAttribute(
      "points",
      rollingPoints
        .filter(Boolean)
        .map((point) => `${point.x},${point.y}`)
        .join(" ")
    );
    rollingPolyline.setAttribute("class", "analytics-line-chart-line analytics-line-chart-line-secondary");
    svg.appendChild(rollingPolyline);

    points.forEach((point) => {
      const circle = createSvgElement("circle");
      circle.setAttribute("cx", String(point.x));
      circle.setAttribute("cy", String(point.y));
      circle.setAttribute("r", "4");
      circle.setAttribute("class", "analytics-line-chart-point");
      svg.appendChild(circle);
    });

    chartSeries.forEach((session, index) => {
      const label = createSvgElement("text");
      label.setAttribute("x", String(points[index].x));
      label.setAttribute("y", String(height - 8));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "analytics-line-chart-axis");
      label.textContent = String(index + 1);
      svg.appendChild(label);
    });

    container.appendChild(svg);
  }

  function renderAnalyticsCoverageGraph(snapshot) {
    const container = elements.analyticsCoverageGraph;
    container.innerHTML = "";

    const bars = [
      { label: "Attempted", value: snapshot.attemptedQuizCount, tone: "default" },
      { label: `${snapshot.goalPercent}%+`, value: snapshot.passedQuizCount, tone: "success" },
      { label: `Below ${snapshot.goalPercent}%`, value: snapshot.needsWorkQuizCount, tone: "danger" },
      { label: "Unattempted", value: snapshot.unattemptedQuizzes.length, tone: "muted" }
    ];
    const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

    const chart = createElement("div", "analytics-bar-chart");
    bars.forEach((bar) => {
      const row = createElement("div", "analytics-bar-row");
      const copy = createElement("div", "analytics-bar-copy");
      copy.appendChild(createElement("span", "analytics-bar-label", bar.label));
      copy.appendChild(createElement("span", "analytics-bar-value", String(bar.value)));
      row.appendChild(copy);

      const track = createElement("div", "analytics-bar-track");
      const fill = createElement("span", `analytics-bar-fill analytics-bar-fill-${bar.tone}`);
      fill.style.width = `${(bar.value / maxValue) * 100}%`;
      track.appendChild(fill);
      row.appendChild(track);
      chart.appendChild(row);
    });

    container.appendChild(chart);
  }

  // Refreshes the analytics dashboard from the current stored analytics snapshot.
  function renderAnalyticsScreen() {
    const snapshot = getAnalyticsSnapshot();
    const totals = snapshot.totals || createDefaultAnalyticsModel().totals;
    const hasAnalyticsData =
      (Number(totals.questionsAnswered) || 0) > 0 ||
      snapshot.recentSessions.length > 0 ||
      snapshot.recentAnswers.length > 0;

    elements.analyticsEmpty.hidden = hasAnalyticsData;
    elements.analyticsContent.hidden = !hasAnalyticsData;

    if (!hasAnalyticsData) {
      elements.analyticsSummaryCopy.textContent = "Recent scores and trends.";
      return;
    }

    elements.analyticsSummaryCopy.textContent = `Local-only analytics across ${totals.sessionsCompleted || 0} session${
      (totals.sessionsCompleted || 0) === 1 ? "" : "s"
    }, with a best streak of ${snapshot.globalMetrics.bestStreak} and a trend of ${formatTrendSlope(
      snapshot.globalMetrics.improvementSlope
    )}.`;

    elements.analyticsTotalSessions.textContent = String(Number(totals.sessionsCompleted) || 0);
    elements.analyticsAccuracy.textContent = formatMetricText(snapshot.globalMetrics.accuracy, formatRatioPercent);
    elements.analyticsAverageScore.textContent = formatMetricText(snapshot.globalMetrics.averageScore, formatPercent);
    elements.analyticsAverageAnswerTime.textContent = formatMetricText(
      snapshot.globalMetrics.averageAnswerMs,
      formatDuration
    );
    elements.analyticsQuestionsPerMinute.textContent = formatMetricText(
      snapshot.globalMetrics.questionsPerMinute,
      (value) => formatDecimal(value, 1)
    );
    elements.analyticsStudyTime.textContent = formatDuration(totals.totalTimeMs);
    elements.analyticsRollingAverage.textContent = formatMetricText(
      snapshot.globalMetrics.rollingAverageScore,
      formatPercent
    );
    elements.analyticsConsistency.textContent = formatMetricText(
      snapshot.globalMetrics.consistencyScore,
      (value) => formatRatioPercent(value, 1)
    );

    renderAnalyticsSessions(snapshot.recentSessions);
    renderAnalyticsQuizzes(snapshot);
    renderAnalyticsQuestions(snapshot.mostIncorrectQuestions);
    renderAnalyticsAnswers(snapshot.recentAnswers);
    renderAnalyticsBehavior(snapshot);
    renderAnalyticsTime(snapshot);
    renderAnalyticsTopics(snapshot);
    renderAnalyticsScoreGraph(snapshot.trendSeries);
    renderAnalyticsCoverageGraph(snapshot);
  }

  function openAnalyticsScreen() {
    closeLibraryEditor();
    clearError();
    resetVictoryFeedback();
    renderAnalyticsScreen();
    showScreen("analytics");
  }

  function setNotificationVolume(volume, shouldPersist) {
    const nextVolume = clamp(Number(volume), 0, 1);
    Object.values(sounds).forEach((audio) => {
      audio.volume = nextVolume;
    });

    const percent = Math.round(nextVolume * 100);
    elements.volumeControl.value = String(percent);
    elements.volumeValue.textContent = `${percent}%`;

    if (libraryRuntime.model) {
      libraryRuntime.model.settings.volume = nextVolume;
      if (shouldPersist) {
        scheduleLibrarySave();
      }
    }
  }

  function setTheme(themeName, shouldPersist) {
    const nextTheme = isValidTheme(themeName) ? themeName : DEFAULT_THEME;
    libraryRuntime.activeTheme = nextTheme;

    document.body.classList.remove("theme-light", "theme-dark", "theme-neon", "theme-vibrant");
    document.body.classList.add(`theme-${nextTheme}`);
    elements.themeValue.textContent = formatThemeName(nextTheme);

    const themeButtons = Array.from(elements.themeOptions.querySelectorAll("[data-theme]"));
    themeButtons.forEach((button) => {
      const isActive = button.getAttribute("data-theme") === nextTheme;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (libraryRuntime.model) {
      libraryRuntime.model.settings.theme = nextTheme;
      if (shouldPersist) {
        scheduleLibrarySave();
      }
    }
  }

  function setGoalPercent(goalPercent, shouldPersist) {
    const nextGoal = normalizeGoalPercent(goalPercent);
    elements.goalControl.value = String(nextGoal);
    elements.goalValue.textContent = `${nextGoal}%`;

    if (libraryRuntime.model) {
      libraryRuntime.model.settings.goalPercent = nextGoal;
      if (shouldPersist) {
        scheduleLibrarySave();
      }
    }

    if (screens.results.classList.contains("is-active") && quizState.questions.length) {
      elements.correctCount.textContent = `Total correct answers: ${quizState.score} | Goal: ${nextGoal}%`;
    }

    if (screens.analytics.classList.contains("is-active")) {
      renderAnalyticsScreen();
    }
  }

  function closeQuizActionMenus(activeQuizId) {
    const activeId = typeof activeQuizId === "string" ? activeQuizId : null;
    const menus = Array.from(elements.savedQuizList.querySelectorAll(".saved-action-menu"));
    menus.forEach((menu) => {
      const quizId = menu.getAttribute("data-quiz-id");
      const shouldOpen = Boolean(activeId && quizId === activeId);
      menu.classList.toggle("is-open", shouldOpen);

      const toggleButton = menu.querySelector(".saved-action-menu-toggle");
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      }
    });
  }

  function positionPopupWithinViewport(triggerButton, popup) {
    if (!triggerButton || !popup || !popup.classList.contains("is-open")) {
      return;
    }

    popup.style.left = "";
    popup.style.right = "0";
    popup.style.top = "";

    const triggerRect = triggerButton.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const parentRect = popup.offsetParent ? popup.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
    const viewportPadding = 10;
    const verticalGap = 8;

    const preferredLeft = triggerRect.right - popupRect.width;
    const clampedLeft = clamp(
      preferredLeft,
      viewportPadding,
      Math.max(viewportPadding, viewportWidth - popupRect.width - viewportPadding)
    );

    let popupTop = triggerRect.bottom + verticalGap;
    if (popupTop + popupRect.height > viewportHeight - viewportPadding) {
      popupTop = Math.max(viewportPadding, triggerRect.top - popupRect.height - verticalGap);
    }

    popup.style.left = `${Math.round(clampedLeft - parentRect.left)}px`;
    popup.style.right = "auto";
    popup.style.top = `${Math.round(popupTop - parentRect.top)}px`;
  }

  function repositionOpenMiniPopups() {
    positionPopupWithinViewport(elements.soundToggleBtn, elements.soundPopup);
    positionPopupWithinViewport(elements.themeToggleBtn, elements.themePopup);
    positionPopupWithinViewport(elements.goalToggleBtn, elements.goalPopup);
  }

  function setSoundPopupOpen(isOpen) {
    const open = Boolean(isOpen);
    elements.soundPopup.classList.toggle("is-open", open);
    elements.soundToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      window.requestAnimationFrame(repositionOpenMiniPopups);
    }
  }

  function setThemePopupOpen(isOpen) {
    const open = Boolean(isOpen);
    elements.themePopup.classList.toggle("is-open", open);
    elements.themeToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      window.requestAnimationFrame(repositionOpenMiniPopups);
    }
  }

  function setGoalPopupOpen(isOpen) {
    const open = Boolean(isOpen);
    elements.goalPopup.classList.toggle("is-open", open);
    elements.goalToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      window.requestAnimationFrame(repositionOpenMiniPopups);
    }
  }

  function closeAllMiniPopups() {
    closeQuizActionMenus();
    setSoundPopupOpen(false);
    setThemePopupOpen(false);
    setGoalPopupOpen(false);
  }

  function goToMainMenu() {
    closeAllMiniPopups();
    closeLibraryEditor();
    closeFolderDeleteModal();
    closeQuizDeleteModal();
    resetVictoryFeedback();
    resetQuizState();
    clearError();
    showScreen("upload");
  }

  function openGuideScreen() {
    closeLibraryEditor();
    clearError();
    closeAllMiniPopups();
    resetVictoryFeedback();
    showScreen("guide");
  }

  function closeGuideScreen() {
    closeAllMiniPopups();
    showScreen(libraryRuntime.lastNonGuideScreen || "upload");
  }

  function handleGlobalPopupClose(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const clickedInsideSoundToggle = elements.soundToggleBtn.contains(event.target);
    const clickedInsideSoundPopup = elements.soundPopup.contains(event.target);
    const clickedInsideThemeToggle = elements.themeToggleBtn.contains(event.target);
    const clickedInsideThemePopup = elements.themePopup.contains(event.target);
    const clickedInsideGoalToggle = elements.goalToggleBtn.contains(event.target);
    const clickedInsideGoalPopup = elements.goalPopup.contains(event.target);
    const clickedInsideQuizMenu = Boolean(event.target.closest(".saved-action-menu-wrap"));

    if (!clickedInsideSoundToggle && !clickedInsideSoundPopup) {
      setSoundPopupOpen(false);
    }
    if (!clickedInsideThemeToggle && !clickedInsideThemePopup) {
      setThemePopupOpen(false);
    }
    if (!clickedInsideGoalToggle && !clickedInsideGoalPopup) {
      setGoalPopupOpen(false);
    }
    if (!clickedInsideQuizMenu) {
      closeQuizActionMenus();
    }
  }

  function createFolder() {
    clearError();
    openLibraryEditor("create-folder", null);
  }

  function createOverviewForCurrentFolder() {
    generateOverviewQuizForFolder(getCurrentFolder().id, true).catch(() => {
      showError("Could not generate the overview quiz right now.");
    });
  }

  function openFolder(folderId) {
    if (!getFolder(folderId)) {
      return;
    }
    libraryRuntime.currentFolderId = folderId;
    refreshLibraryUI();
  }

  function goUpOneFolder() {
    const currentFolder = getCurrentFolder();
    if (!currentFolder.parentId) {
      return;
    }
    closeLibraryEditor();
    libraryRuntime.currentFolderId = currentFolder.parentId;
    refreshLibraryUI();
  }

  function loadQuizById(quizId) {
    clearError();
    closeLibraryEditor();
    const quiz = getQuiz(quizId);
    if (!quiz) {
      showError("This quiz no longer exists.");
      return;
    }
    startQuiz(quiz.questions, getLaunchContextForQuiz(quiz));
  }

  function startQuickieQuizById(quizId) {
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

  // Handles create, rename, and move actions from the inline library editor.
  function saveLibraryEditor() {
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

  function handleLibraryClick(event) {
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

  // Draws the active quiz question and wires answer selection for the current attempt.
  function renderQuestion() {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    quizState.selectedIndex = null;
    quizState.hasAnswered = false;
    quizState.questionStartedAt = Date.now();
    elements.nextBtn.disabled = true;

    elements.progressText.textContent = `Question ${quizState.currentQuestionIndex + 1} of ${quizState.questions.length}`;
    elements.scoreText.textContent = `Score: ${quizState.score}`;
    elements.questionText.textContent = currentQuestion.question;
    elements.optionsContainer.innerHTML = "";

    currentQuestion.options.forEach((optionText, optionIndex) => {
      const optionBtn = document.createElement("button");
      optionBtn.type = "button";
      optionBtn.className = "option-btn";
      optionBtn.textContent = optionText;
      optionBtn.setAttribute("role", "listitem");
      optionBtn.setAttribute("aria-label", `Option ${optionIndex + 1}: ${optionText}`);

      optionBtn.addEventListener("click", function () {
        if (quizState.hasAnswered) {
          return;
        }

        quizState.hasAnswered = true;
        quizState.selectedIndex = optionIndex;

        const allOptionButtons = Array.from(elements.optionsContainer.querySelectorAll(".option-btn"));
        allOptionButtons.forEach((button) => {
          button.disabled = true;
          button.classList.remove("is-correct", "is-wrong", "is-correct-answer");
        });

        const isCorrect = optionIndex === currentQuestion.correctIndex;
        const answeredAt = Date.now();
        if (isCorrect) {
          quizState.score += 1;
          optionBtn.classList.add("is-correct");
          playSound("win");
          triggerFireworks(optionBtn);
        } else {
          optionBtn.classList.add("is-wrong");
          const correctButton = allOptionButtons[currentQuestion.correctIndex];
          if (correctButton) {
            correctButton.classList.add("is-correct-answer");
          }
          playSound("fail");
        }

        recordQuestionAnalytics(currentQuestion, optionIndex, isCorrect, answeredAt);
        elements.scoreText.textContent = `Score: ${quizState.score}`;
        elements.nextBtn.disabled = false;
      });

      elements.optionsContainer.appendChild(optionBtn);
    });
  }

  function startQuiz(questions, launchConfig) {
    resetVictoryFeedback();
    const attemptQuestions = prepareQuizQuestionsForAttempt(questions, launchConfig && launchConfig.questionLimit);
    quizState.questions = attemptQuestions;
    quizState.currentQuestionIndex = 0;
    quizState.selectedIndex = null;
    quizState.hasAnswered = false;
    quizState.score = 0;
    quizState.activeSession = {
      id: nextAnalyticsId("session", "sess"),
      startedAt: Date.now(),
      questionCount: attemptQuestions.length,
      answers: [],
      ...buildQuizLaunchContext(launchConfig)
    };
    quizState.questionStartedAt = 0;
    clearError();
    showScreen("quiz");
    renderQuestion();
  }

  function nextQuestion() {
    if (quizState.selectedIndex === null) {
      return;
    }

    quizState.currentQuestionIndex += 1;
    if (quizState.currentQuestionIndex >= quizState.questions.length) {
      const scorePercent = Math.round(
        (quizState.questions.length ? quizState.score / quizState.questions.length : 0) * 100
      );
      const goalPercent = getGoalPercent();
      completeAnalyticsSession(scorePercent);
      elements.finalScore.textContent = `You scored ${quizState.score} out of ${quizState.questions.length}`;
      elements.scorePercent.textContent = `Percentage: ${scorePercent}%`;
      elements.correctCount.textContent = `Total correct answers: ${quizState.score} | Goal: ${goalPercent}%`;
      showScreen("results");
      if (scorePercent >= goalPercent) {
        playVictoryCelebration();
      } else {
        playLossEffect();
      }
      return;
    }

    renderQuestion();
  }

  function normalizeUploadedQuizName(fileName) {
    const fallback = `Quiz ${Object.keys(libraryRuntime.model.quizzes).length + 1}`;
    const rawName = normalizeEntityName(fileName, fallback);
    return rawName.toLowerCase().endsWith(".json") ? rawName : `${rawName}.json`;
  }

  function normalizeImportPathSegments(relativePath) {
    if (typeof relativePath !== "string") {
      return [];
    }

    return relativePath
      .split(/[\\/]+/)
      .map((segment) => normalizeEntityName(segment, "").trim())
      .filter(Boolean);
  }

  function createFolderRecord(parentFolderId, folderName) {
    const parentFolder = getFolder(parentFolderId);
    const folderId = nextFolderId();
    const now = Date.now();

    libraryRuntime.model.folders[folderId] = {
      id: folderId,
      name: folderName,
      parentId: parentFolder.id,
      childFolderIds: [],
      quizIds: [],
      createdAt: now,
      updatedAt: now
    };

    parentFolder.childFolderIds.push(folderId);
    return libraryRuntime.model.folders[folderId];
  }

  function ensureFolderPath(parentFolderId, segments) {
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

  async function saveUploadedQuizToFolder(folderId, questions, fileName) {
    const initialName = normalizeUploadedQuizName(fileName);
    const uniqueName = ensureUniqueQuizName(folderId, initialName, null);
    return addQuizToFolder(folderId, uniqueName, questions);
  }

  function createImportEntry(file, relativePath) {
    return {
      file,
      relativePath: typeof relativePath === "string" ? relativePath : file.webkitRelativePath || ""
    };
  }

  function createTextImportEntry(fileName, relativePath, content) {
    return createImportEntry(
      {
        name: fileName,
        type: "application/json",
        text: () => Promise.resolve(content)
      },
      relativePath
    );
  }

  function isJsonImportEntry(entry) {
    return entry.file && (entry.file.type === "application/json" || entry.file.name.toLowerCase().endsWith(".json"));
  }

  function isZipImportEntry(entry) {
    return entry.file && (
      entry.file.type === "application/zip" ||
      entry.file.type === "application/x-zip-compressed" ||
      entry.file.name.toLowerCase().endsWith(".zip")
    );
  }

  function getImportEntriesFromFileList(fileList) {
    return Array.from(fileList || [])
      .filter(Boolean)
      .map((file) => createImportEntry(file, file.webkitRelativePath || ""));
  }

  function getZipRootName(fileName) {
    const normalizedName = normalizeEntityName(fileName || "Imported ZIP", "Imported ZIP");
    const rootName = normalizedName.toLowerCase().endsWith(".zip") ? normalizedName.slice(0, -4) : normalizedName;
    return rootName || "Imported ZIP";
  }

  function getUint16(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  function getUint32(bytes, offset) {
    return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
  }

  function findZipEndOfCentralDirectory(bytes) {
    const minimumOffset = Math.max(0, bytes.length - 65557);
    for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
      if (getUint32(bytes, offset) === 0x06054b50) {
        return offset;
      }
    }
    return -1;
  }

  function decodeZipText(bytes) {
    return new TextDecoder("utf-8").decode(bytes);
  }

  async function inflateZipBytes(bytes) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("This browser cannot unpack compressed ZIP files.");
    }

    const formats = ["deflate-raw", "deflate"];
    let lastError = null;
    for (const format of formats) {
      try {
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
        return new Uint8Array(await new Response(stream).arrayBuffer());
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("This ZIP file could not be decompressed.");
  }

  async function readZipEntryBytes(bytes, centralEntry) {
    const localHeaderOffset = centralEntry.localHeaderOffset;
    if (getUint32(bytes, localHeaderOffset) !== 0x04034b50) {
      throw new Error("This ZIP file has an unreadable file header.");
    }

    const localNameLength = getUint16(bytes, localHeaderOffset + 26);
    const localExtraLength = getUint16(bytes, localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedBytes = bytes.slice(dataOffset, dataOffset + centralEntry.compressedSize);

    if (centralEntry.compressionMethod === 0) {
      return compressedBytes;
    }

    if (centralEntry.compressionMethod === 8) {
      return inflateZipBytes(compressedBytes);
    }

    throw new Error("Only stored and deflated ZIP files are supported.");
  }

  async function extractJsonEntriesFromZip(entry) {
    const bytes = new Uint8Array(await entry.file.arrayBuffer());
    const endOffset = findZipEndOfCentralDirectory(bytes);
    if (endOffset < 0) {
      throw new Error("This ZIP file could not be read.");
    }

    const entryCount = getUint16(bytes, endOffset + 10);
    let centralOffset = getUint32(bytes, endOffset + 16);
    const zipRootName = getZipRootName(entry.file.name);
    const extractedEntries = [];

    for (let index = 0; index < entryCount; index += 1) {
      if (getUint32(bytes, centralOffset) !== 0x02014b50) {
        throw new Error("This ZIP file has an unreadable directory.");
      }

      const flags = getUint16(bytes, centralOffset + 8);
      const compressionMethod = getUint16(bytes, centralOffset + 10);
      const compressedSize = getUint32(bytes, centralOffset + 20);
      const nameLength = getUint16(bytes, centralOffset + 28);
      const extraLength = getUint16(bytes, centralOffset + 30);
      const commentLength = getUint16(bytes, centralOffset + 32);
      const localHeaderOffset = getUint32(bytes, centralOffset + 42);
      const nameBytes = bytes.slice(centralOffset + 46, centralOffset + 46 + nameLength);
      const relativeName = decodeZipText(nameBytes).replace(/\\/g, "/");
      centralOffset += 46 + nameLength + extraLength + commentLength;

      if (!relativeName || relativeName.endsWith("/") || !relativeName.toLowerCase().endsWith(".json")) {
        continue;
      }

      if (flags & 1) {
        throw new Error("Encrypted ZIP files are not supported.");
      }

      const entryBytes = await readZipEntryBytes(bytes, {
        compressionMethod,
        compressedSize,
        localHeaderOffset
      });
      const pathSegments = [zipRootName, ...relativeName.split("/")].filter(
        (segment) => segment && segment !== "." && segment !== ".."
      );
      const fileName = pathSegments[pathSegments.length - 1] || "quiz.json";
      extractedEntries.push(createTextImportEntry(fileName, pathSegments.join("/"), decodeZipText(entryBytes)));
    }

    return extractedEntries;
  }

  async function expandZipImportEntries(importEntries) {
    const expandedEntries = [];
    const zipErrors = [];

    for (const entry of importEntries) {
      if (!isZipImportEntry(entry)) {
        expandedEntries.push(entry);
        continue;
      }

      try {
        const zipEntries = await extractJsonEntriesFromZip(entry);
        if (zipEntries.length) {
          expandedEntries.push(...zipEntries);
        } else {
          zipErrors.push({
            fileName: entry.file.name,
            message: "No JSON quiz files were found inside this ZIP."
          });
        }
      } catch (error) {
        zipErrors.push({
          fileName: entry.file.name,
          message: error && error.message ? error.message : "This ZIP file could not be imported."
        });
      }
    }

    return { expandedEntries, zipErrors };
  }

  // Reads dropped files and folders through Chromium's File System Access handles when available.
  async function readDroppedHandle(handle, parentPath) {
    if (!handle) {
      return [];
    }

    if (handle.kind === "file") {
      const file = await handle.getFile().catch(() => null);
      if (!file) {
        return [];
      }

      const nextPath = parentPath ? `${parentPath}/${file.name}` : file.name;
      return [createImportEntry(file, nextPath)];
    }

    if (handle.kind === "directory") {
      const nextPath = parentPath ? `${parentPath}/${handle.name}` : handle.name;
      const nestedEntries = [];

      for await (const childHandle of handle.values()) {
        const childEntries = await readDroppedHandle(childHandle, nextPath);
        nestedEntries.push(...childEntries);
      }

      return nestedEntries;
    }

    return [];
  }

  function readDroppedFile(entry, parentPath) {
    return new Promise((resolve) => {
      entry.file(
        (file) => {
          const nextPath = parentPath ? `${parentPath}/${file.name}` : file.name;
          resolve([createImportEntry(file, nextPath)]);
        },
        () => resolve([])
      );
    });
  }

  function readAllDirectoryEntries(reader) {
    return new Promise((resolve, reject) => {
      const collectedEntries = [];

      function readBatch() {
        reader.readEntries(
          (entries) => {
            if (!entries.length) {
              resolve(collectedEntries);
              return;
            }

            collectedEntries.push(...entries);
            readBatch();
          },
          (error) => reject(error)
        );
      }

      readBatch();
    });
  }

  async function readDroppedEntry(entry, parentPath) {
    if (!entry) {
      return [];
    }

    if (entry.isFile) {
      return readDroppedFile(entry, parentPath);
    }

    if (entry.isDirectory) {
      const nextPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      const reader = entry.createReader();
      const children = await readAllDirectoryEntries(reader).catch(() => []);
      const nestedEntries = [];

      for (const childEntry of children) {
        const childFiles = await readDroppedEntry(childEntry, nextPath);
        nestedEntries.push(...childFiles);
      }

      return nestedEntries;
    }

    return [];
  }

  async function getImportEntriesFromDrop(event) {
    const dataTransfer = event.dataTransfer;
    const items = Array.from((dataTransfer && dataTransfer.items) || []);
    const droppedFiles = Array.from((dataTransfer && dataTransfer.files) || []);
    const entries = [];

    if (items.length) {
      for (const item of items) {
        if (!item || item.kind !== "file") {
          continue;
        }

        if (typeof item.getAsFileSystemHandle === "function") {
          const handle = await item.getAsFileSystemHandle().catch(() => null);
          if (handle) {
            const droppedHandleEntries = await readDroppedHandle(handle, "");
            if (droppedHandleEntries.length) {
              entries.push(...droppedHandleEntries);
              continue;
            }
          }
        }

        const entry = typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
        if (entry) {
          const droppedEntries = await readDroppedEntry(entry, "");
          if (droppedEntries.length) {
            entries.push(...droppedEntries);
            continue;
          }
        }

        const file = item.getAsFile();
        if (file) {
          entries.push(createImportEntry(file, file.name));
        }
      }
    }

    if (!entries.length) {
      return getImportEntriesFromFileList(droppedFiles);
    }

    return entries;
  }

  // Imports one or more uploaded quiz files into the current library folder.
  async function processQuizFiles(fileList) {
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

        showError("No valid quiz JSON files could be imported. Reload the page to ensure the latest app.js changes are active, then try again.");
        return;
      }

      await persistAndRefreshLibrary();
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
      resetUploadInputs();
    }
  }

  async function processQuizFile(file) {
    await processQuizFiles(file ? [file] : []);
  }

  async function onDrop(event) {
    event.preventDefault();
    elements.dropZone.classList.remove("is-dragover");
    const importEntries = await getImportEntriesFromDrop(event);
    await processQuizFiles(importEntries);
  }

  // Chooses the best available storage backend and restores any saved library state.
  async function initializeLibraryStorage() {
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

    setTheme(libraryRuntime.model.settings.theme, false);
    setNotificationVolume(libraryRuntime.model.settings.volume, false);
    setGoalPercent(libraryRuntime.model.settings.goalPercent, false);
    updateLibraryNote();
    refreshLibraryUI();
  }

  function resetQuizState() {
    quizState.questions = [];
    quizState.currentQuestionIndex = 0;
    quizState.selectedIndex = null;
    quizState.score = 0;
    quizState.hasAnswered = false;
    quizState.activeSession = null;
    quizState.questionStartedAt = 0;
    resetUploadInputs();
  }

  // Wires file pickers and makes the whole upload card act like a safe drop target.
  function initializeUploadEvents() {
    let uploadDragDepth = 0;

    elements.chooseFileBtn.addEventListener("click", () => elements.fileInput.click());
    elements.chooseFolderBtn.addEventListener("click", () => elements.folderInput.click());

    elements.fileInput.addEventListener("change", function (event) {
      const file = event.target.files && event.target.files[0];
      processQuizFile(file);
    });

    elements.folderInput.addEventListener("change", function (event) {
      const files = event.target.files || [];
      processQuizFiles(files);
    });

    function handleUploadDragEnter(event) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      uploadDragDepth += 1;
      setUploadDragActive(true);
    }

    function handleUploadDragOver(event) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
      setUploadDragActive(true);
    }

    function handleUploadDragLeave(event) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      uploadDragDepth = Math.max(uploadDragDepth - 1, 0);
      if (!uploadDragDepth) {
        setUploadDragActive(false);
      }
    }

    async function handleUploadDrop(event) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      uploadDragDepth = 0;
      setUploadDragActive(false);
      await onDrop(event);
    }

    [elements.uploadCard].filter(Boolean).forEach((target) => {
      target.addEventListener("dragenter", handleUploadDragEnter);
      target.addEventListener("dragover", handleUploadDragOver);
      target.addEventListener("dragleave", handleUploadDragLeave);
      target.addEventListener("drop", function (event) {
        handleUploadDrop(event).catch(() => {
          showError("That drop could not be imported right now.");
        });
      });
    });

    document.addEventListener("dragover", function (event) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
    });

    document.addEventListener("drop", function (event) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      const dropTarget = event.target instanceof Node ? event.target : null;
      if (elements.uploadCard && dropTarget && elements.uploadCard.contains(dropTarget)) {
        return;
      }

      event.preventDefault();
      uploadDragDepth = 0;
      setUploadDragActive(false);
      showError("Drop quiz files into the upload panel, or use Upload JSON / Open Folder.");
    });

    elements.dropZone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.fileInput.click();
      }
    });
  }

  function initializeActionEvents() {
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

  function initializeAudioUnlockEvents() {
    const unlockAudio = function () {
      primeAudioPlayback();
      document.removeEventListener("pointerdown", unlockAudio, true);
      document.removeEventListener("touchstart", unlockAudio, true);
      document.removeEventListener("keydown", unlockAudio, true);
    };

    document.addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
    document.addEventListener("touchstart", unlockAudio, { capture: true, passive: true });
    document.addEventListener("keydown", unlockAudio, true);
  }

  async function initializeApp() {
    initializeAudioUnlockEvents();
    initializeUploadEvents();
    initializeActionEvents();
    showScreen("upload");
    setTheme(DEFAULT_THEME, false);
    closeAllMiniPopups();
    setNotificationVolume(DEFAULT_VOLUME, false);
    setGoalPercent(DEFAULT_GOAL_PERCENT, false);
    await initializeLibraryStorage();
  }

  initializeApp();
})();
