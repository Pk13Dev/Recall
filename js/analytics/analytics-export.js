import { createDefaultAnalyticsModel, createDefaultBehaviorStats, createDefaultDropoffStats, createDefaultStreakStats, decorateQuestionStat, decorateQuizStat } from "./analytics-model.js";
import { libraryRuntime } from "../core/state.js";
import { getGoalPercent } from "../ui/settings.js";

const ANALYTICS_EXPORT_VERSION = 1;
const ANALYTICS_EXPORT_TYPE = "recall-analytics-export";

export function normalizeExportText(value, fallback) {
  if (typeof value !== "string") {
    return fallback || "";
  }

  const normalizedValue = value.trim();
  return normalizedValue || (fallback || "");
}

export function normalizeQuestionText(value) {
  return normalizeExportText(value, "Untitled question")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 160);
}

export function buildPortableQuizKey(record) {
  const source = normalizeExportText(record && record.source, "library");
  const folderPath = normalizeExportText(record && (record.folderPath || record.folderName), "Library");
  const quizName = normalizeExportText(record && record.quizName, "Untitled quiz");
  return `${source}::${folderPath}::${quizName}`;
}

export function buildPortableQuestionKey(record) {
  const questionId = record && record.questionId !== undefined && record.questionId !== null
    ? String(record.questionId)
    : normalizeExportText(record && record.questionKey, "question");
  return `${buildPortableQuizKey(record)}::${questionId}::${normalizeQuestionText(record && record.questionText)}`;
}

export function createExportFileName(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `recall-analytics-${year}${month}${day}-${hours}${minutes}${seconds}.json`;
}

export function getExportLocationHint() {
  return "your browser/app download folder (usually Downloads)";
}

export function exportRecentSession(session) {
  return {
    key: buildPortableQuizKey(session),
    source: normalizeExportText(session.source, "library"),
    folderPath: normalizeExportText(session.folderPath || session.folderName, "Library"),
    quizName: normalizeExportText(session.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(session.quizKind, "quiz"),
    startedAt: Number(session.startedAt) || 0,
    completedAt: Number(session.completedAt) || 0,
    durationMs: Number(session.durationMs) || 0,
    questionCount: Number(session.questionCount) || 0,
    correctCount: Number(session.correctCount) || 0,
    wrongCount: Number(session.wrongCount) || 0,
    scorePercent: Number(session.scorePercent) || 0,
    averageAnswerMs: Number(session.averageAnswerMs) || 0,
    questionsPerMinute: Number.isFinite(Number(session.questionsPerMinute)) ? Number(session.questionsPerMinute) : null,
    scoreDelta: Number.isFinite(Number(session.scoreDelta)) ? Number(session.scoreDelta) : null,
    dropoffRate: Number.isFinite(Number(session.dropoffRate)) ? Number(session.dropoffRate) : null
  };
}

export function exportRecentAnswer(answer) {
  return {
    key: buildPortableQuestionKey(answer),
    quizKey: buildPortableQuizKey(answer),
    source: normalizeExportText(answer.source, "library"),
    folderPath: normalizeExportText(answer.folderPath || answer.folderName, "Library"),
    quizName: normalizeExportText(answer.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(answer.quizKind, "quiz"),
    questionId: answer.questionId !== undefined && answer.questionId !== null ? String(answer.questionId) : null,
    questionNumber: Number(answer.questionNumber) || 0,
    questionText: normalizeExportText(answer.questionText, "Untitled question"),
    selectedOption: normalizeExportText(answer.selectedOption, ""),
    correctOption: normalizeExportText(answer.correctOption, ""),
    isCorrect: Boolean(answer.isCorrect),
    answeredAt: Number(answer.answeredAt) || 0,
    elapsedMs: Number(answer.elapsedMs) || 0
  };
}

export function exportQuizStat(stat) {
  const decoratedStat = decorateQuizStat(stat);
  return {
    key: buildPortableQuizKey(decoratedStat),
    source: normalizeExportText(decoratedStat.source, "library"),
    folderPath: normalizeExportText(decoratedStat.folderPath || decoratedStat.folderName, "Library"),
    quizName: normalizeExportText(decoratedStat.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(decoratedStat.quizKind, "quiz"),
    attempts: Number(decoratedStat.attempts) || 0,
    totalQuestions: Number(decoratedStat.totalQuestions) || 0,
    totalCorrect: Number(decoratedStat.totalCorrect) || 0,
    totalTimeMs: Number(decoratedStat.totalTimeMs) || 0,
    averageScorePercent: Number(decoratedStat.averageScorePercent) || 0,
    bestScorePercent: Number(decoratedStat.bestScorePercent) || 0,
    lastScorePercent: Number(decoratedStat.lastScorePercent) || 0,
    firstScorePercent: Number(decoratedStat.firstScorePercent) || 0,
    quizAccuracy: Number.isFinite(Number(decoratedStat.quizAccuracy)) ? Number(decoratedStat.quizAccuracy) : null,
    retentionChange: Number.isFinite(Number(decoratedStat.retentionChange)) ? Number(decoratedStat.retentionChange) : null,
    consistencyScore: Number.isFinite(Number(decoratedStat.consistencyScore)) ? Number(decoratedStat.consistencyScore) : null,
    timePerCorrectMs: Number.isFinite(Number(decoratedStat.timePerCorrectMs)) ? Number(decoratedStat.timePerCorrectMs) : null,
    firstCompletedAt: Number(decoratedStat.firstCompletedAt) || 0,
    lastCompletedAt: Number(decoratedStat.lastCompletedAt) || 0
  };
}

export function exportQuestionStat(stat) {
  const decoratedStat = decorateQuestionStat(stat);
  return {
    key: buildPortableQuestionKey(decoratedStat),
    quizKey: buildPortableQuizKey(decoratedStat),
    source: normalizeExportText(decoratedStat.source, "library"),
    folderPath: normalizeExportText(decoratedStat.folderPath || decoratedStat.folderName, "Library"),
    quizName: normalizeExportText(decoratedStat.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(decoratedStat.quizKind, "quiz"),
    questionId: decoratedStat.questionId !== undefined && decoratedStat.questionId !== null ? String(decoratedStat.questionId) : null,
    questionText: normalizeExportText(decoratedStat.questionText, "Untitled question"),
    attempts: Number(decoratedStat.attempts) || 0,
    correctCount: Number(decoratedStat.correctCount) || 0,
    wrongCount: Number(decoratedStat.wrongCount) || 0,
    averageTimeMs: Number(decoratedStat.averageTimeMs) || 0,
    questionAccuracy: Number.isFinite(Number(decoratedStat.questionAccuracy)) ? Number(decoratedStat.questionAccuracy) : null,
    difficulty: Number.isFinite(Number(decoratedStat.difficulty)) ? Number(decoratedStat.difficulty) : null,
    errorRate: Number.isFinite(Number(decoratedStat.errorRate)) ? Number(decoratedStat.errorRate) : null,
    masteryScore: Number.isFinite(Number(decoratedStat.masteryScore)) ? Number(decoratedStat.masteryScore) : null,
    firstAnsweredAt: Number(decoratedStat.firstAnsweredAt) || 0,
    lastAnsweredAt: Number(decoratedStat.lastAnsweredAt) || 0,
    lastResult: Boolean(decoratedStat.lastResult)
  };
}

export function exportTopicEntries(topicMap) {
  return Object.entries(topicMap || {})
    .map(([key, entry]) => ({
      key,
      label: normalizeExportText(entry && entry.label, key),
      attempts: Number(entry && entry.attempts) || 0,
      totalScorePercent: Number(entry && entry.totalScorePercent) || 0,
      averageScorePercent: Number(entry && entry.averageScorePercent) || 0
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function buildAnalyticsExportData() {
  const analytics = libraryRuntime.model.analytics || createDefaultAnalyticsModel();
  const behaviorStats = analytics.behaviorStats || createDefaultBehaviorStats();
  const streakStats = analytics.streakStats || createDefaultStreakStats();
  const dropoffStats = analytics.dropoffStats || createDefaultDropoffStats();
  const exportedAt = Date.now();

  return {
    type: ANALYTICS_EXPORT_TYPE,
    version: ANALYTICS_EXPORT_VERSION,
    exportedAt,
    exportedAtIso: new Date(exportedAt).toISOString(),
    compatibility: {
      matchingMode: "same-folder-path-and-file-name",
      note: "Designed for libraries with the same quiz files and names on each device."
    },
    settings: {
      goalPercent: getGoalPercent()
    },
    summary: {
      sessionsCompleted: Number(analytics.totals.sessionsCompleted) || 0,
      questionsAnswered: Number(analytics.totals.questionsAnswered) || 0,
      correctAnswers: Number(analytics.totals.correctAnswers) || 0,
      totalStudyTimeMs: Number(analytics.totals.totalTimeMs) || 0
    },
    analytics: {
      recentSessions: (analytics.recentSessions || [])
        .map(exportRecentSession)
        .sort((left, right) => right.completedAt - left.completedAt),
      recentAnswers: (analytics.recentAnswers || [])
        .map(exportRecentAnswer)
        .sort((left, right) => right.answeredAt - left.answeredAt),
      quizStats: Object.values(analytics.quizStats || {})
        .filter(Boolean)
        .map(exportQuizStat)
        .sort((left, right) => left.key.localeCompare(right.key)),
      questionStats: Object.values(analytics.questionStats || {})
        .filter(Boolean)
        .map(exportQuestionStat)
        .sort((left, right) => left.key.localeCompare(right.key)),
      dailyStats: Object.entries(analytics.dailyStats || {})
        .map(([dateKey, day]) => ({
          dateKey,
          studyTimeMs: Number(day.studyTimeMs) || 0,
          sessionsCompleted: Number(day.sessionsCompleted) || 0,
          questionsAnswered: Number(day.questionsAnswered) || 0,
          correctAnswers: Number(day.correctAnswers) || 0
        }))
        .sort((left, right) => left.dateKey.localeCompare(right.dateKey)),
      behavior: {
        thresholdMs: Number(behaviorStats.thresholdMs) || 0,
        guessWrongCount: Number(behaviorStats.guessWrongCount) || 0,
        slowErrorCount: Number(behaviorStats.slowErrorCount) || 0,
        fastCorrectCount: Number(behaviorStats.fastCorrectCount) || 0,
        totalAnswersTracked: Number(behaviorStats.totalAnswersTracked) || 0
      },
      streaks: {
        currentCorrectStreak: Number(streakStats.currentCorrectStreak) || 0,
        bestCorrectStreak: Number(streakStats.bestCorrectStreak) || 0
      },
      dropoff: {
        sessionsTracked: Number(dropoffStats.sessionsTracked) || 0,
        totalDropoff: Number(dropoffStats.totalDropoff) || 0
      },
      topics: {
        folders: exportTopicEntries(analytics.topicStats && analytics.topicStats.byFolder),
        quizKinds: exportTopicEntries(analytics.topicStats && analytics.topicStats.byQuizKind)
      }
    }
  };
}

export function downloadAnalyticsExport() {
  const exportData = buildAnalyticsExportData();
  const exportJson = JSON.stringify(exportData, null, 2);
  const exportBlob = new Blob([exportJson], { type: "application/json" });
  const exportUrl = URL.createObjectURL(exportBlob);
  const fileName = createExportFileName(exportData.exportedAt);
  const downloadLink = document.createElement("a");
  downloadLink.href = exportUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(exportUrl);
  }, 1000);

  return {
    fileName,
    locationHint: getExportLocationHint()
  };
}
