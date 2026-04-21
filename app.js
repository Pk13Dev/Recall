(function () {
  const screens = {
    upload: document.getElementById("upload-screen"),
    quiz: document.getElementById("quiz-screen"),
    results: document.getElementById("results-screen"),
    analytics: document.getElementById("analytics-screen")
  };

  const elements = {
    dropZone: document.getElementById("drop-zone"),
    chooseFileBtn: document.getElementById("choose-file-btn"),
    chooseFolderBtn: document.getElementById("choose-folder-btn"),
    fileInput: document.getElementById("file-input"),
    folderInput: document.getElementById("folder-input"),
    demoBtn: document.getElementById("demo-btn"),
    overviewFolderBtn: document.getElementById("overview-folder-btn"),
    projectLibraryBtn: document.getElementById("project-library-btn"),
    analyticsOpenBtn: document.getElementById("analytics-open-btn"),
    newFolderBtn: document.getElementById("new-folder-btn"),
    upFolderBtn: document.getElementById("up-folder-btn"),
    themeToggleBtn: document.getElementById("theme-toggle-btn"),
    themePopup: document.getElementById("theme-popup"),
    themeValue: document.getElementById("theme-value"),
    themeOptions: document.getElementById("theme-options"),
    soundToggleBtn: document.getElementById("sound-toggle-btn"),
    soundPopup: document.getElementById("sound-popup"),
    volumeControl: document.getElementById("volume-control"),
    volumeValue: document.getElementById("volume-value"),
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
    analyticsSummaryCopy: document.getElementById("analytics-summary-copy"),
    analyticsEmpty: document.getElementById("analytics-empty"),
    analyticsContent: document.getElementById("analytics-content"),
    analyticsTotalSessions: document.getElementById("analytics-total-sessions"),
    analyticsAverageScore: document.getElementById("analytics-average-score"),
    analyticsCorrectRate: document.getElementById("analytics-correct-rate"),
    analyticsQuestionVolume: document.getElementById("analytics-question-volume"),
    analyticsStudyTime: document.getElementById("analytics-study-time"),
    analyticsSessionList: document.getElementById("analytics-session-list"),
    analyticsQuizList: document.getElementById("analytics-quiz-list"),
    analyticsQuestionList: document.getElementById("analytics-question-list"),
    analyticsAnswerList: document.getElementById("analytics-answer-list"),
    confettiLayer: document.getElementById("confetti-layer"),
    folderDeleteModal: document.getElementById("folder-delete-modal"),
    folderDeleteMessage: document.getElementById("folder-delete-message"),
    folderDeleteContents: document.getElementById("folder-delete-contents"),
    folderDeleteConfirmBtn: document.getElementById("folder-delete-confirm-btn"),
    folderDeleteCancelBtn: document.getElementById("folder-delete-cancel-btn")
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
          "Java Serialized Output Namespace"
        ],
        correctIndex: 0
      },
      {
        id: 2,
        question: "Which index points to the first element in an array?",
        options: ["1", "-1", "0", "2"],
        correctIndex: 2
      },
      {
        id: 3,
        question: "Which value type is valid in JSON?",
        options: ["undefined", "function", "symbol", "string"],
        correctIndex: 3
      }
    ]
  };

  const DEFAULT_VOLUME = 0.75;
  const DEFAULT_THEME = "light";
  const THEMES = ["light", "dark", "neon", "vibrant"];
  const THEME_LABELS = {
    light: "Light",
    dark: "Dark",
    neon: "Neon",
    vibrant: "Vibrant"
  };
  const LIBARRAY_DIRECTORY = "libarray";
  const LEGACY_LIBRARY_DIRECTORY = "libaray";
  const LIBRARY_MODEL_FILE = "library-model.json";
  const LIBRARY_MODEL_KEY = "recall::libarray::library-model";
  const LEGACY_LIBRARY_MODEL_KEY = "recall::libaray::library-model";
  const LEGACY_LOCAL_PREFIX = "libaray::";
  const PROJECT_LIBRARY_QUIZZES_DIRECTORY = "quizzes";
  const PROJECT_HANDLE_DB_NAME = "recall-project-handles";
  const PROJECT_HANDLE_STORE = "handles";
  const PROJECT_HANDLE_KEY = "libarray-project-directory";
  const MAX_RECENT_ANALYTIC_SESSIONS = 180;
  const MAX_RECENT_ANALYTIC_ANSWERS = 2000;
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
    projectDirectoryHandle: null,
    model: null,
    currentFolderId: "root",
    saveTimer: null,
    activeTheme: DEFAULT_THEME,
    loadedFromLegacyStorage: false,
    editor: {
      mode: null,
      entityId: null
    },
    pendingFolderDeleteId: null,
    confettiTimer: null,
    resultEffectTimer: null
  };

  const sounds = {
    win: new Audio("./win.mp3"),
    fail: new Audio("./fail.mp3"),
    victory: new Audio("./Victory.mp3"),
    loser: new Audio("./Loser.mp3")
  };

  Object.values(sounds).forEach((audio) => {
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
  });

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
    screens[name].classList.add("is-active");
  }

  function clearError() {
    elements.errorMessage.textContent = "";
  }

  function showError(message) {
    elements.errorMessage.textContent = message;
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

  function supportsProjectLibraryFolder() {
    return typeof window.showDirectoryPicker === "function";
  }

  function getProjectLibrarySupportMessage() {
    if (supportsProjectLibraryFolder()) {
      return "";
    }

    if (typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent || "")) {
      return "Direct libarray syncing needs a Chromium-based browser such as Chrome or Edge. Firefox does not expose the folder-write API used here.";
    }

    if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
      return "Direct libarray syncing needs a secure browser context. Open RECALL through localhost or another secure context that allows folder access.";
    }

    return "This browser does not expose the folder-write API needed for direct libarray syncing. Chrome or Edge is the safest option here.";
  }

  function supportsProjectHandlePersistence() {
    return typeof indexedDB !== "undefined";
  }

  // Opens the small IndexedDB store that remembers an approved physical libarray folder.
  function openProjectHandleDatabase() {
    if (!supportsProjectHandlePersistence()) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(PROJECT_HANDLE_DB_NAME, 1);
        request.onupgradeneeded = function () {
          const database = request.result;
          if (!database.objectStoreNames.contains(PROJECT_HANDLE_STORE)) {
            database.createObjectStore(PROJECT_HANDLE_STORE);
          }
        };
        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function () {
          resolve(null);
        };
      } catch (error) {
        resolve(null);
      }
    });
  }

  // Runs a single request against the stored project-folder handle database.
  function runProjectHandleRequest(mode, createRequest) {
    return openProjectHandleDatabase().then((database) => {
      if (!database) {
        return null;
      }

      return new Promise((resolve) => {
        try {
          const transaction = database.transaction(PROJECT_HANDLE_STORE, mode);
          const request = createRequest(transaction.objectStore(PROJECT_HANDLE_STORE));
          request.onsuccess = function () {
            resolve(request.result ?? null);
          };
          request.onerror = function () {
            resolve(null);
          };
          transaction.oncomplete = function () {
            database.close();
          };
          transaction.onerror = function () {
            database.close();
          };
        } catch (error) {
          database.close();
          resolve(null);
        }
      });
    });
  }

  function readStoredProjectDirectoryHandle() {
    return runProjectHandleRequest("readonly", (store) => store.get(PROJECT_HANDLE_KEY));
  }

  function persistProjectDirectoryHandle(handle) {
    return runProjectHandleRequest("readwrite", (store) => store.put(handle, PROJECT_HANDLE_KEY));
  }

  async function clearStoredProjectDirectoryHandle() {
    await runProjectHandleRequest("readwrite", (store) => store.delete(PROJECT_HANDLE_KEY));
  }

  async function restoreProjectLibraryHandle() {
    if (!supportsProjectLibraryFolder()) {
      return false;
    }

    const storedHandle = await readStoredProjectDirectoryHandle();
    if (!storedHandle || storedHandle.kind !== "directory") {
      return false;
    }

    if (storedHandle.name.toLowerCase() !== LIBARRAY_DIRECTORY) {
      await clearStoredProjectDirectoryHandle();
      return false;
    }

    try {
      const permissionState =
        typeof storedHandle.queryPermission === "function"
          ? await storedHandle.queryPermission({ mode: "readwrite" })
          : "prompt";

      if (permissionState !== "granted") {
        return false;
      }

      libraryRuntime.projectDirectoryHandle = storedHandle;
      return true;
    } catch (error) {
      await clearStoredProjectDirectoryHandle();
      return false;
    }
  }

  function refreshProjectLibraryButton() {
    if (!elements.projectLibraryBtn) {
      return;
    }

    const supported = supportsProjectLibraryFolder();
    if (libraryRuntime.projectDirectoryHandle) {
      elements.projectLibraryBtn.textContent = "libarray Connected";
      elements.projectLibraryBtn.title = "The project libarray folder is connected for this session.";
      return;
    }

    elements.projectLibraryBtn.textContent = "Connect libarray";
    elements.projectLibraryBtn.title = supported
      ? "Connect the physical libarray folder in the project directory."
      : getProjectLibrarySupportMessage();
  }

  function updateLibraryNote() {
    if (libraryRuntime.projectDirectoryHandle) {
      setLibraryNote("Connected to physical project folder: libarray. Uploaded quizzes now sync automatically to libarray/quizzes and libarray/library-model.json.");
      return;
    }

    if (!supportsProjectLibraryFolder()) {
      setLibraryNote(`${getProjectLibrarySupportMessage()} RECALL will keep saving to browser-local storage in this setup.`);
      return;
    }

    if (libraryRuntime.mode === "opfs") {
      setLibraryNote("Library is stored locally in browser-managed storage. Connect the project libarray folder once to sync future uploads there automatically when permission is available.");
      return;
    }

    if (libraryRuntime.mode === "localStorage") {
      setLibraryNote("Library is stored locally in this browser. Connect the project libarray folder once to sync future uploads there automatically when permission is available.");
      return;
    }

    setLibraryNote("Storage is temporary in this tab. Connect the project libarray folder or keep this tab open.");
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

  function shuffleQuestionOptions(question) {
    const indexedOptions = question.options.map((option, index) => ({
      option,
      originalIndex: index
    }));

    for (let index = indexedOptions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = indexedOptions[index];
      indexedOptions[index] = indexedOptions[swapIndex];
      indexedOptions[swapIndex] = temp;
    }

    return {
      id: question.id,
      question: question.question,
      options: indexedOptions.map((entry) => entry.option),
      correctIndex: indexedOptions.findIndex((entry) => entry.originalIndex === question.correctIndex)
    };
  }

  function prepareQuizQuestionsForAttempt(questions) {
    return cloneQuestions(questions).map(shuffleQuestionOptions);
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

  function playSound(type) {
    const sound = sounds[type];
    if (!sound) {
      return;
    }
    sound.currentTime = 0;
    sound.play().catch(() => {});
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
      showError("The libarray root folder cannot be removed.");
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

    victorySound.currentTime = 0;
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

    const loserSound = sounds.loser;
    if (!loserSound) {
      return;
    }

    loserSound.currentTime = 0;
    loserSound.play().catch(() => {});
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

    if (!Array.isArray(rawQuestion.options) || rawQuestion.options.length !== 4) {
      throw new Error(`Question ${index + 1} must include exactly 4 options.`);
    }

    const options = [];
    for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
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
      rawQuestion.correctIndex > 3
    ) {
      throw new Error(`Question ${index + 1} must have a correctIndex of 0, 1, 2, or 3.`);
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
      questionStats: {}
    };
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
        .map((entry) => ({ ...entry }))
        .slice(0, MAX_RECENT_ANALYTIC_SESSIONS);
    }

    if (Array.isArray(rawAnalytics.recentAnswers)) {
      analytics.recentAnswers = rawAnalytics.recentAnswers
        .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
        .map((entry) => ({ ...entry }))
        .slice(0, MAX_RECENT_ANALYTIC_ANSWERS);
    }

    if (rawAnalytics.quizStats && typeof rawAnalytics.quizStats === "object" && !Array.isArray(rawAnalytics.quizStats)) {
      Object.entries(rawAnalytics.quizStats).forEach(([key, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return;
        }
        analytics.quizStats[key] = { ...value };
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
        analytics.questionStats[key] = { ...value };
      });
    }

    return analytics;
  }

  function createDefaultLibraryModel() {
    const now = Date.now();
    return {
      version: 3,
      rootFolderId: "root",
      folders: {
        root: {
          id: "root",
          name: LIBARRAY_DIRECTORY,
          parentId: null,
          childFolderIds: [],
          quizIds: [],
          createdAt: now,
          updatedAt: now
        }
      },
      quizzes: {},
      counters: { folder: 0, quiz: 0 },
      settings: { volume: DEFAULT_VOLUME, theme: DEFAULT_THEME },
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

    model.folders.root.name = LIBARRAY_DIRECTORY;

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

  async function clearDirectoryContents(directoryHandle) {
    for await (const [entryName, entryHandle] of directoryHandle.entries()) {
      await directoryHandle.removeEntry(entryName, { recursive: entryHandle.kind === "directory" });
    }
  }

  async function writeProjectLibraryFolder(folderId, directoryHandle) {
    const folder = getFolder(folderId);
    if (!folder) {
      return;
    }

    const usedNames = new Set();
    const childFolders = folder.childFolderIds
      .map((childFolderId) => getFolder(childFolderId))
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name));
    const childQuizzes = folder.quizIds
      .map((quizId) => getQuiz(quizId))
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const childFolder of childFolders) {
      const directoryName = ensureUniqueManagedEntryName(
        sanitizeManagedEntryName(childFolder.name, `folder-${childFolder.id}`),
        usedNames
      );
      const childDirectoryHandle = await directoryHandle.getDirectoryHandle(directoryName, { create: true });
      await writeProjectLibraryFolder(childFolder.id, childDirectoryHandle);
    }

    for (const quiz of childQuizzes) {
      const fileName = ensureUniqueManagedEntryName(
        ensureManagedJsonFileName(quiz.name, `${quiz.id}.json`),
        usedNames
      );
      const payload = JSON.stringify({ questions: cloneQuestions(quiz.questions) }, null, 2);
      await writeTextFileToDirectory(directoryHandle, fileName, payload);
    }
  }

  // Mirrors the virtual library model into the physical libarray folder when connected.
  async function syncProjectLibraryFolder() {
    if (!libraryRuntime.projectDirectoryHandle || !libraryRuntime.model) {
      return;
    }

    await writeTextFileToDirectory(
      libraryRuntime.projectDirectoryHandle,
      LIBRARY_MODEL_FILE,
      JSON.stringify(libraryRuntime.model, null, 2)
    );

    const quizzesDirectoryHandle = await libraryRuntime.projectDirectoryHandle.getDirectoryHandle(
      PROJECT_LIBRARY_QUIZZES_DIRECTORY,
      { create: true }
    );
    await clearDirectoryContents(quizzesDirectoryHandle);
    await writeProjectLibraryFolder("root", quizzesDirectoryHandle);
  }

  async function readLibraryModelFromStorage() {
    if (libraryRuntime.projectDirectoryHandle) {
      const projectPayload = await readTextFileFromDirectory(libraryRuntime.projectDirectoryHandle, LIBRARY_MODEL_FILE);
      if (projectPayload) {
        libraryRuntime.loadedFromLegacyStorage = false;
        return safeJsonParse(projectPayload, null);
      }
    }

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

    if (libraryRuntime.projectDirectoryHandle) {
      try {
        await syncProjectLibraryFolder();
      } catch (error) {
        libraryRuntime.projectDirectoryHandle = null;
        clearStoredProjectDirectoryHandle().catch(() => {});
        refreshProjectLibraryButton();
        updateLibraryNote();
      }
    }
  }

  // Prompts the user for the real libarray folder and binds future syncs to it.
  async function connectProjectLibraryFolder() {
    clearError();

    if (!supportsProjectLibraryFolder()) {
      showError(getProjectLibrarySupportMessage());
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      if (!directoryHandle) {
        return;
      }

      if (directoryHandle.name.toLowerCase() !== LIBARRAY_DIRECTORY) {
        showError(`Select the "${LIBARRAY_DIRECTORY}" folder in the project directory.`);
        return;
      }

      libraryRuntime.projectDirectoryHandle = directoryHandle;
      await persistProjectDirectoryHandle(directoryHandle);
      refreshProjectLibraryButton();

      const projectPayload = await readTextFileFromDirectory(directoryHandle, LIBRARY_MODEL_FILE);
      if (projectPayload) {
        const externalModel = safeJsonParse(projectPayload, null);
        if (externalModel) {
          libraryRuntime.model = normalizeLibraryModel(externalModel);
          libraryRuntime.currentFolderId = libraryRuntime.model.rootFolderId;
          setTheme(libraryRuntime.model.settings.theme, false);
          setNotificationVolume(libraryRuntime.model.settings.volume, false);
        }
      }

      await saveLibraryModel();
      refreshLibraryUI();
      updateLibraryNote();
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
      libraryRuntime.projectDirectoryHandle = null;
      refreshProjectLibraryButton();
      updateLibraryNote();
      showError("Could not connect the project libarray folder.");
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

    session.answers.push(attempt);
    analytics.totals.questionsAnswered += 1;
    if (isCorrect) {
      analytics.totals.correctAnswers += 1;
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
      lastAnsweredAt: 0,
      lastResult: "wrong",
      lastSelectedOption: "",
      correctOption: currentQuestion.options[currentQuestion.correctIndex]
    };

    questionStat.attempts += 1;
    if (isCorrect) {
      questionStat.correctCount += 1;
    } else {
      questionStat.wrongCount += 1;
    }
    questionStat.totalTimeMs += elapsedMs;
    questionStat.averageTimeMs = Math.round(questionStat.totalTimeMs / questionStat.attempts);
    questionStat.lastAnsweredAt = answeredAt;
    questionStat.lastResult = isCorrect ? "correct" : "wrong";
    questionStat.lastSelectedOption = currentQuestion.options[selectedIndex];
    questionStat.correctOption = currentQuestion.options[currentQuestion.correctIndex];
    analytics.questionStats[questionKey] = questionStat;

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
        : 0
    };

    pushLimitedEntry(analytics.recentSessions, summary, MAX_RECENT_ANALYTIC_SESSIONS);
    analytics.totals.sessionsCompleted += 1;
    analytics.totals.totalTimeMs += durationMs;
    analytics.totals.totalScorePercent += scorePercent;

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
    quizStat.lastCompletedAt = completedAt;
    quizStat.lastScorePercent = scorePercent;
    analytics.quizStats[quizKey] = quizStat;

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
      option.textContent = `${prefix}${folder.id === "root" ? LIBARRAY_DIRECTORY : folder.name}`;
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
      elements.libraryEditorSubtitle.textContent = `Inside ${currentFolder.id === "root" ? LIBARRAY_DIRECTORY : currentFolder.name}`;
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
      button.textContent = index === 0 ? LIBARRAY_DIRECTORY : folder.name;
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
      appendChildren(item, [
        createSavedItemCopy(getQuizTypeLabel(quiz), quiz.name, getQuizMetaText(quiz)),
        createSavedItemActions([
          {
            label: "Load",
            action: "load-quiz",
            quizId: quiz.id,
            className: "btn btn-secondary saved-item-btn saved-item-main-btn"
          },
          { label: "Rename", action: "edit-quiz", quizId: quiz.id },
          { label: "Move", action: "edit-move-quiz", quizId: quiz.id }
        ])
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

  function createAnalyticsEmptyMessage(message) {
    return createElement("p", "analytics-empty-message", message);
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
    return appendChildren(createElement("div", "analytics-row-copy"), [
      createElement("p", "analytics-row-title", titleText),
      createElement("p", "analytics-row-meta", metaText),
      createElement("p", "analytics-row-detail", detailText)
    ]);
  }

  function createAnalyticsScoreChip(text) {
    return createElement("div", "analytics-score-chip", text);
  }

  function createAnalyticsAnswerBadge(isCorrect) {
    return createElement(
      "span",
      `analytics-answer-badge ${isCorrect ? "is-correct" : "is-wrong"}`,
      isCorrect ? "Right" : "Wrong"
    );
  }

  // Produces sorted analytics collections that are ready to render into the dashboard.
  function getAnalyticsSnapshot() {
    const analytics = libraryRuntime.model.analytics || createDefaultAnalyticsModel();
    const recentSessions = analytics.recentSessions
      .slice()
      .sort((left, right) => (Number(right.completedAt) || 0) - (Number(left.completedAt) || 0));
    const recentAnswers = analytics.recentAnswers
      .slice()
      .sort((left, right) => (Number(right.answeredAt) || 0) - (Number(left.answeredAt) || 0));
    const quizStats = Object.values(analytics.quizStats || {})
      .filter(Boolean)
      .sort(
        (left, right) =>
          (Number(right.lastCompletedAt) || 0) - (Number(left.lastCompletedAt) || 0) ||
          (Number(right.attempts) || 0) - (Number(left.attempts) || 0)
      );
    const questionStats = Object.values(analytics.questionStats || {})
      .filter(Boolean)
      .sort((left, right) => {
        const rightWrong = Number(right.wrongCount) || 0;
        const leftWrong = Number(left.wrongCount) || 0;
        if (rightWrong !== leftWrong) {
          return rightWrong - leftWrong;
        }

        const leftAccuracy = (Number(left.correctCount) || 0) / Math.max(Number(left.attempts) || 0, 1);
        const rightAccuracy = (Number(right.correctCount) || 0) / Math.max(Number(right.attempts) || 0, 1);
        if (leftAccuracy !== rightAccuracy) {
          return leftAccuracy - rightAccuracy;
        }

        return (Number(right.lastAnsweredAt) || 0) - (Number(left.lastAnsweredAt) || 0);
      });

    return {
      totals: analytics.totals,
      recentSessions,
      recentAnswers,
      quizStats,
      questionStats
    };
  }

  function renderAnalyticsSessions(sessions) {
    renderCollection(
      elements.analyticsSessionList,
      sessions,
      "No completed quiz sessions yet.",
      8,
      (session) =>
        appendChildren(createElement("article", "analytics-row"), [
          createAnalyticsRowCopy(
            session.quizName || "Untitled quiz",
            `${session.folderPath || "/"} / ${formatTimestamp(session.completedAt)} / ${formatDuration(session.durationMs)}`,
            `${session.correctCount || 0}/${session.questionCount || 0} correct`
          ),
          createAnalyticsScoreChip(formatPercent(session.scorePercent))
        ])
    );
  }

  function renderAnalyticsQuizzes(quizStats) {
    renderCollection(
      elements.analyticsQuizList,
      quizStats,
      "Quiz performance will appear after you finish a quiz.",
      10,
      (stat) =>
        appendChildren(createElement("article", "analytics-row"), [
          createAnalyticsRowCopy(
            stat.quizName || "Untitled quiz",
            `${stat.folderPath || "/"} / ${stat.attempts || 0} attempt${(stat.attempts || 0) === 1 ? "" : "s"}`,
            `Best ${formatPercent(stat.bestScorePercent)} / Last ${formatPercent(stat.lastScorePercent)} / ${
              stat.totalCorrect || 0
            }/${stat.totalQuestions || 0} correct`
          ),
          createAnalyticsScoreChip(formatPercent(stat.averageScorePercent))
        ])
    );
  }

  function renderAnalyticsQuestions(questionStats) {
    renderCollection(
      elements.analyticsQuestionList,
      questionStats,
      "Question breakdown will appear after your first answers.",
      12,
      (stat) => {
        const attempts = Number(stat.attempts) || 0;
        const correctCount = Number(stat.correctCount) || 0;
        const wrongCount = Number(stat.wrongCount) || 0;
        const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 0;

        return appendChildren(createElement("article", "analytics-row analytics-row-stacked"), [
          createElement("p", "analytics-row-title", stat.questionText || "Untitled question"),
          createElement("p", "analytics-row-meta", `${stat.quizName || "Unknown quiz"} / ${stat.folderPath || "/"}`),
          createElement(
            "p",
            "analytics-row-detail",
            `Accuracy ${accuracy}% / Right ${correctCount} / Wrong ${wrongCount} / Avg ${formatDuration(stat.averageTimeMs)}`
          )
        ]);
      }
    );
  }

  function renderAnalyticsAnswers(answers) {
    renderCollection(
      elements.analyticsAnswerList,
      answers,
      "Recent answers will show up here.",
      18,
      (answer) => {
        const detailText = answer.isCorrect
          ? `Correct. Took ${formatDuration(answer.elapsedMs)}.`
          : `Selected "${answer.selectedOption || "Unknown"}". Correct answer: "${answer.correctOption || "Unknown"}". Took ${formatDuration(answer.elapsedMs)}.`;

        return appendChildren(createElement("article", "analytics-row analytics-row-answer"), [
          createAnalyticsRowCopy(
            answer.questionText || "Untitled question",
            `${answer.quizName || "Unknown quiz"} / ${answer.folderPath || "/"} / ${formatTimestamp(answer.answeredAt)}`,
            detailText
          ),
          createAnalyticsAnswerBadge(answer.isCorrect)
        ]);
      }
    );
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
      elements.analyticsSummaryCopy.textContent =
        "Track scores, timings, question accuracy, and recent answers across your saved quizzes.";
      return;
    }

    const totalSessions = Number(totals.sessionsCompleted) || 0;
    const totalQuestions = Number(totals.questionsAnswered) || 0;
    const totalCorrect = Number(totals.correctAnswers) || 0;
    const averageScore = totalSessions ? Math.round((Number(totals.totalScorePercent) || 0) / totalSessions) : 0;
    const correctRate = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    elements.analyticsSummaryCopy.textContent = `Tracking ${totalQuestions} answers across ${totalSessions} completed quiz runs.`;
    elements.analyticsTotalSessions.textContent = String(totalSessions);
    elements.analyticsAverageScore.textContent = formatPercent(averageScore);
    elements.analyticsCorrectRate.textContent = formatPercent(correctRate);
    elements.analyticsQuestionVolume.textContent = String(totalQuestions);
    elements.analyticsStudyTime.textContent = formatDuration(totals.totalTimeMs);

    renderAnalyticsSessions(snapshot.recentSessions);
    renderAnalyticsQuizzes(snapshot.quizStats);
    renderAnalyticsQuestions(snapshot.questionStats);
    renderAnalyticsAnswers(snapshot.recentAnswers);
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

  function setSoundPopupOpen(isOpen) {
    const open = Boolean(isOpen);
    elements.soundPopup.classList.toggle("is-open", open);
    elements.soundToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setThemePopupOpen(isOpen) {
    const open = Boolean(isOpen);
    elements.themePopup.classList.toggle("is-open", open);
    elements.themeToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAllMiniPopups() {
    setSoundPopupOpen(false);
    setThemePopupOpen(false);
  }

  function handleGlobalPopupClose(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const clickedInsideSoundToggle = elements.soundToggleBtn.contains(event.target);
    const clickedInsideSoundPopup = elements.soundPopup.contains(event.target);
    const clickedInsideThemeToggle = elements.themeToggleBtn.contains(event.target);
    const clickedInsideThemePopup = elements.themePopup.contains(event.target);

    if (!clickedInsideSoundToggle && !clickedInsideSoundPopup) {
      setSoundPopupOpen(false);
    }
    if (!clickedInsideThemeToggle && !clickedInsideThemePopup) {
      setThemePopupOpen(false);
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
        showError("The libarray root folder cannot be renamed.");
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

    if (action === "edit-quiz" && quizId) {
      openLibraryEditor("rename-quiz", quizId);
      return;
    }

    if (action === "edit-move-quiz" && quizId) {
      openLibraryEditor("move-quiz", quizId);
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
    quizState.questions = prepareQuizQuestionsForAttempt(questions);
    quizState.currentQuestionIndex = 0;
    quizState.selectedIndex = null;
    quizState.hasAnswered = false;
    quizState.score = 0;
    quizState.activeSession = {
      id: nextAnalyticsId("session", "sess"),
      startedAt: Date.now(),
      questionCount: questions.length,
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
      const scoreRatio = quizState.questions.length ? quizState.score / quizState.questions.length : 0;
      const scorePercent = Math.round(scoreRatio * 100);
      completeAnalyticsSession(scorePercent);
      elements.finalScore.textContent = `You scored ${quizState.score} out of ${quizState.questions.length}`;
      elements.scorePercent.textContent = `Percentage: ${scorePercent}%`;
      elements.correctCount.textContent = `Total correct answers: ${quizState.score}`;
      showScreen("results");
      if (scoreRatio > 0.7) {
        playVictoryCelebration();
      } else if (scoreRatio < 0.7) {
        playLossEffect();
      } else {
        resetVictoryFeedback();
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

  function getImportEntriesFromFileList(fileList) {
    return Array.from(fileList || [])
      .filter(Boolean)
      .map((file) => createImportEntry(file, file.webkitRelativePath || ""));
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
    const items = Array.from((event.dataTransfer && event.dataTransfer.items) || []);
    const entries = [];

    if (items.length) {
      for (const item of items) {
        if (!item || item.kind !== "file") {
          continue;
        }

        const entry = typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
        if (entry) {
          const droppedEntries = await readDroppedEntry(entry, "");
          entries.push(...droppedEntries);
          continue;
        }

        const file = item.getAsFile();
        if (file) {
          entries.push(createImportEntry(file, file.name));
        }
      }
    }

    if (!entries.length) {
      return getImportEntriesFromFileList((event.dataTransfer && event.dataTransfer.files) || []);
    }

    return entries;
  }

  // Imports one or more uploaded quiz files into the current library folder.
  async function processQuizFiles(fileList) {
    clearError();

    const importEntries = Array.isArray(fileList) && fileList.length && fileList[0] && fileList[0].file
      ? fileList
      : getImportEntriesFromFileList(fileList);

    if (!importEntries.length) {
      showError("No files selected. Please choose at least one JSON file.");
      return;
    }

    const jsonEntries = importEntries.filter(
      (entry) => entry.file && (entry.file.type === "application/json" || entry.file.name.toLowerCase().endsWith(".json"))
    );

    if (!jsonEntries.length) {
      showError("No JSON quizzes were found in that selection.");
      return;
    }

    const currentFolder = getCurrentFolder();
    let importedCount = 0;
    let ignoredCount = importEntries.length - jsonEntries.length;
    let firstImportedQuestions = null;
    let firstImportedQuiz = null;
    let firstImportedFolderId = currentFolder.id;

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
        ignoredCount += 1;
      }
    }

    if (!importedCount) {
      showError("No valid quiz JSON files could be imported.");
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
    if (ignoredCount > 0) {
      showError(`Imported ${importedCount} quiz file(s). Ignored ${ignoredCount} unsupported or invalid file(s).`);
      return;
    }

    clearError();
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
        libraryRuntime.directoryHandle = await rootDirectory.getDirectoryHandle(LIBARRAY_DIRECTORY, { create: true });
        try {
          libraryRuntime.legacyDirectoryHandle = await rootDirectory.getDirectoryHandle(LEGACY_LIBRARY_DIRECTORY, {
            create: false
          });
        } catch (error) {
          libraryRuntime.legacyDirectoryHandle = null;
        }
        libraryRuntime.mode = "opfs";
      } catch (error) {
        libraryRuntime.mode = "memory";
      }
    }

    if (libraryRuntime.mode !== "opfs" && supportsLocalStorage()) {
      libraryRuntime.mode = "localStorage";
    }

    await restoreProjectLibraryHandle();

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
    refreshProjectLibraryButton();
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
    elements.fileInput.value = "";
    elements.folderInput.value = "";
  }

  function initializeUploadEvents() {
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

    elements.dropZone.addEventListener("dragover", function (event) {
      event.preventDefault();
      elements.dropZone.classList.add("is-dragover");
    });

    elements.dropZone.addEventListener("dragleave", function () {
      elements.dropZone.classList.remove("is-dragover");
    });

    elements.dropZone.addEventListener("drop", onDrop);

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
      resetVictoryFeedback();
      resetQuizState();
      clearError();
      showScreen("upload");
    });

    elements.overviewFolderBtn.addEventListener("click", createOverviewForCurrentFolder);
    elements.projectLibraryBtn.addEventListener("click", function () {
      connectProjectLibraryFolder().catch(() => {
        showError("Could not connect the project libarray folder.");
      });
    });
    elements.analyticsOpenBtn.addEventListener("click", openAnalyticsScreen);
    elements.resultsAnalyticsBtn.addEventListener("click", openAnalyticsScreen);
    elements.analyticsBackBtn.addEventListener("click", function () {
      showScreen("upload");
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

    elements.themeToggleBtn.addEventListener("click", function () {
      const isOpen = elements.themePopup.classList.contains("is-open");
      setThemePopupOpen(!isOpen);
      if (!isOpen) {
        setSoundPopupOpen(false);
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
      }
    });

    document.addEventListener("click", handleGlobalPopupClose);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeAllMiniPopups();
        closeFolderDeleteModal();
      }
    });
  }

  async function initializeApp() {
    initializeUploadEvents();
    initializeActionEvents();
    showScreen("upload");
    setTheme(DEFAULT_THEME, false);
    closeAllMiniPopups();
    setNotificationVolume(DEFAULT_VOLUME, false);
    await initializeLibraryStorage();
  }

  initializeApp();
})();
