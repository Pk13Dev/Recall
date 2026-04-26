import { createDefaultAnalyticsModel, normalizeAnalyticsModel } from "../analytics/analytics-model.js";
import { DEFAULT_GOAL_PERCENT, DEFAULT_THEME, DEFAULT_VOLUME, ROOT_LIBRARY_LABEL, THEMES } from "../core/constants.js";
import { libraryRuntime } from "../core/state.js";
import { clamp, normalizeGoalPercent } from "../core/utils.js";
import { validateQuizData } from "../quiz/quiz-validation.js";

export function createDefaultLibraryModel() {
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

export function normalizeLibraryModel(rawModel) {
  const model = createDefaultLibraryModel();
  if (!rawModel || typeof rawModel !== "object" || Array.isArray(rawModel)) {
    return model;
  }

  if (rawModel.settings && typeof rawModel.settings === "object") {
    const volume = Number(rawModel.settings.volume);
    if (Number.isFinite(volume)) {
      model.settings.volume = clamp(volume, 0, 1);
    }

      if (typeof rawModel.settings.theme === "string" && THEMES.includes(rawModel.settings.theme)) {
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

export function getFolder(folderId) {
  return libraryRuntime.model.folders[folderId] || null;
}

export function getQuiz(quizId) {
  return libraryRuntime.model.quizzes[quizId] || null;
}

export function getCurrentFolder() {
  const folder = getFolder(libraryRuntime.currentFolderId);
  if (folder) {
    return folder;
  }
  libraryRuntime.currentFolderId = libraryRuntime.model.rootFolderId;
  return getFolder(libraryRuntime.currentFolderId);
}

export function nextFolderId() {
  libraryRuntime.model.counters.folder += 1;
  return `fld-${libraryRuntime.model.counters.folder}`;
}

export function nextQuizId() {
  libraryRuntime.model.counters.quiz += 1;
  return `qz-${libraryRuntime.model.counters.quiz}`;
}

export function createFolderRecord(parentFolderId, folderName) {
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

export function getFolderPath(folderId) {
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

export function getAllFolderPaths() {
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

export function getFolderDepth(folderId) {
  let depth = 0;
  let current = getFolder(folderId);
  while (current && current.parentId) {
    depth += 1;
    current = getFolder(current.parentId);
  }
  return depth;
}
