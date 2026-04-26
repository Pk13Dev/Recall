import { DEFAULT_THEME } from "./constants.js";

export const quizState = {
  questions: [],
  currentQuestionIndex: 0,
  selectedIndex: null,
  score: 0,
  hasAnswered: false,
  activeSession: null,
  questionStartedAt: 0
};

export const libraryRuntime = {
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

export const audioRuntime = {
  isPrimed: false
};
