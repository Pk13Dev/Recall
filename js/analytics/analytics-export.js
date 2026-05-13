import { createDefaultAnalyticsModel, createDefaultBehaviorStats, createDefaultDropoffStats, createDefaultFibStats, createDefaultStreakStats, decorateFibStats, decorateQuestionStat, decorateQuizStat } from "./analytics-model.js";
import { getAnalyticsSnapshot } from "./analytics-snapshot.js";
import { libraryRuntime } from "../core/state.js";
import { normalizeGoalPercent } from "../core/utils.js";
import { getFolder, getFolderPath } from "../storage/library-model.js";

const ANALYTICS_EXPORT_VERSION = 3;
const ANALYTICS_EXPORT_TYPE = "recall-analytics-export";
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_VERSION_NEEDED = 20;
let crc32Table = null;

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
  return createAnalyticsExportFileName(timestamp, "json");
}

export function createAnalyticsExportBaseName(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `recall-analytics-export-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function createAnalyticsExportFileName(timestamp, extension) {
  return `${createAnalyticsExportBaseName(timestamp)}.${extension || "json"}`;
}

export function getExportLocationHint() {
  return "your browser/app download folder (usually Downloads)";
}

export function getExportGoalPercent() {
  return normalizeGoalPercent(libraryRuntime.model && libraryRuntime.model.settings
    ? libraryRuntime.model.settings.goalPercent
    : undefined);
}

export function exportRecentSession(session) {
  return {
    key: buildPortableQuizKey(session),
    id: normalizeExportText(session && session.id, ""),
    source: normalizeExportText(session.source, "library"),
    quizId: session && session.quizId !== undefined && session.quizId !== null ? String(session.quizId) : "",
    folderId: session && session.folderId !== undefined && session.folderId !== null ? String(session.folderId) : "",
    folderName: normalizeExportText(session && session.folderName, ""),
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
    efficiency: Number.isFinite(Number(session.efficiency)) ? Number(session.efficiency) : null,
    questionsPerMinute: Number.isFinite(Number(session.questionsPerMinute)) ? Number(session.questionsPerMinute) : null,
    scoreDelta: Number.isFinite(Number(session.scoreDelta)) ? Number(session.scoreDelta) : null,
    firstHalfAccuracy: Number.isFinite(Number(session.firstHalfAccuracy)) ? Number(session.firstHalfAccuracy) : null,
    secondHalfAccuracy: Number.isFinite(Number(session.secondHalfAccuracy)) ? Number(session.secondHalfAccuracy) : null,
    dropoffRate: Number.isFinite(Number(session.dropoffRate)) ? Number(session.dropoffRate) : null,
    fibStats: exportFibStats(session.fibStats),
    fibQuestionCount: Number(session.fibQuestionCount) || 0,
    fibFirstTryCorrect: Number(session.fibFirstTryCorrect) || 0,
    fibFirstTryWrong: Number(session.fibFirstTryWrong) || 0,
    fibSecondTryCorrect: Number(session.fibSecondTryCorrect) || 0,
    fibSecondTryWrong: Number(session.fibSecondTryWrong) || 0
  };
}

export function exportFibAttemptSummary(attempt) {
  return {
    attemptNumber: Number(attempt && attempt.attemptNumber) || 0,
    totalBlanks: Number(attempt && attempt.totalBlanks) || 0,
    correctCount: Number(attempt && attempt.correctCount) || 0,
    wrongCount: Number(attempt && attempt.wrongCount) || 0,
    misplacedCount: Number(attempt && attempt.misplacedCount) || 0,
    baitCount: Number(attempt && attempt.baitCount) || 0,
    missingCount: Number(attempt && attempt.missingCount) || 0,
    isCorrect: Boolean(attempt && attempt.isCorrect),
    results: Array.isArray(attempt && attempt.results)
      ? attempt.results.map(exportFibAttemptResult)
      : []
  };
}

export function exportFibAttemptResult(result) {
  return {
    blankId: result && result.blankId !== undefined && result.blankId !== null ? String(result.blankId) : "",
    selectedAnswer: normalizeExportText(result && result.selectedAnswer, ""),
    correctAnswer: normalizeExportText(result && result.correctAnswer, ""),
    status: normalizeExportText(result && result.status, ""),
    isCorrect: Boolean(result && result.isCorrect)
  };
}

export function exportRecentAnswer(answer) {
  return {
    key: buildPortableQuestionKey(answer),
    quizKey: buildPortableQuizKey(answer),
    id: normalizeExportText(answer && answer.id, ""),
    sessionId: normalizeExportText(answer && answer.sessionId, ""),
    source: normalizeExportText(answer.source, "library"),
    quizId: answer && answer.quizId !== undefined && answer.quizId !== null ? String(answer.quizId) : "",
    folderId: answer && answer.folderId !== undefined && answer.folderId !== null ? String(answer.folderId) : "",
    folderName: normalizeExportText(answer && answer.folderName, ""),
    folderPath: normalizeExportText(answer.folderPath || answer.folderName, "Library"),
    quizName: normalizeExportText(answer.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(answer.quizKind, "quiz"),
    questionId: answer.questionId !== undefined && answer.questionId !== null ? String(answer.questionId) : null,
    questionNumber: Number(answer.questionNumber) || 0,
    questionText: normalizeExportText(answer.questionText, "Untitled question"),
    selectedIndex: Number.isFinite(Number(answer.selectedIndex)) ? Number(answer.selectedIndex) : null,
    selectedOption: normalizeExportText(answer.selectedOption, ""),
    correctIndex: Number.isFinite(Number(answer.correctIndex)) ? Number(answer.correctIndex) : null,
    correctOption: normalizeExportText(answer.correctOption, ""),
    questionType: normalizeExportText(answer.questionType, "multiple-choice"),
    attemptCount: Number(answer.attemptCount) || 1,
    fibAttempts: Array.isArray(answer.fibAttempts) ? answer.fibAttempts.map(exportFibAttemptSummary) : [],
    fibFirstTryCorrectCount: Number(answer.fibFirstTryCorrectCount) || 0,
    fibFirstTryWrongCount: Number(answer.fibFirstTryWrongCount) || 0,
    fibSecondTryCorrectCount: Number(answer.fibSecondTryCorrectCount) || 0,
    fibSecondTryWrongCount: Number(answer.fibSecondTryWrongCount) || 0,
    fibSecondTryImprovedCount: Number(answer.fibSecondTryImprovedCount) || 0,
    fibMisplacedCount: Number(answer.fibMisplacedCount) || 0,
    fibBaitCount: Number(answer.fibBaitCount) || 0,
    fibMissingCount: Number(answer.fibMissingCount) || 0,
    isCorrect: Boolean(answer.isCorrect),
    answeredAt: Number(answer.answeredAt) || 0,
    elapsedMs: Number(answer.elapsedMs) || 0
  };
}

export function exportFibStats(stats) {
  const decoratedStats = decorateFibStats(stats || createDefaultFibStats());
  return {
    questionsAnswered: decoratedStats.questionsAnswered,
    questionsSolvedFirstTry: decoratedStats.questionsSolvedFirstTry,
    questionsSolvedSecondTry: decoratedStats.questionsSolvedSecondTry,
    questionsMissedAfterSecondTry: decoratedStats.questionsMissedAfterSecondTry,
    secondTryQuestions: decoratedStats.secondTryQuestions,
    firstTryBlanks: decoratedStats.firstTryBlanks,
    firstTryCorrect: decoratedStats.firstTryCorrect,
    firstTryWrong: decoratedStats.firstTryWrong,
    secondTryBlanks: decoratedStats.secondTryBlanks,
    secondTryCorrect: decoratedStats.secondTryCorrect,
    secondTryWrong: decoratedStats.secondTryWrong,
    secondTryImproved: decoratedStats.secondTryImproved,
    misplacedCount: decoratedStats.misplacedCount,
    baitCount: decoratedStats.baitCount,
    missingCount: decoratedStats.missingCount,
    firstTryAccuracy: Number.isFinite(Number(decoratedStats.firstTryAccuracy)) ? decoratedStats.firstTryAccuracy : null,
    secondTryAccuracy: Number.isFinite(Number(decoratedStats.secondTryAccuracy)) ? decoratedStats.secondTryAccuracy : null,
    secondTryUseRate: Number.isFinite(Number(decoratedStats.secondTryUseRate)) ? decoratedStats.secondTryUseRate : null,
    secondTryFixRate: Number.isFinite(Number(decoratedStats.secondTryFixRate)) ? decoratedStats.secondTryFixRate : null,
    secondTryBlankFixRate: Number.isFinite(Number(decoratedStats.secondTryBlankFixRate)) ? decoratedStats.secondTryBlankFixRate : null
  };
}

export function exportQuizStat(stat) {
  const decoratedStat = decorateQuizStat(stat);
  return {
    key: buildPortableQuizKey(decoratedStat),
    quizKey: normalizeExportText(decoratedStat.quizKey, ""),
    source: normalizeExportText(decoratedStat.source, "library"),
    quizId: decoratedStat.quizId !== undefined && decoratedStat.quizId !== null ? String(decoratedStat.quizId) : "",
    folderId: decoratedStat.folderId !== undefined && decoratedStat.folderId !== null ? String(decoratedStat.folderId) : "",
    folderName: normalizeExportText(decoratedStat.folderName, ""),
    folderPath: normalizeExportText(decoratedStat.folderPath || decoratedStat.folderName, "Library"),
    quizName: normalizeExportText(decoratedStat.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(decoratedStat.quizKind, "quiz"),
    attempts: Number(decoratedStat.attempts) || 0,
    totalQuestions: Number(decoratedStat.totalQuestions) || 0,
    totalCorrect: Number(decoratedStat.totalCorrect) || 0,
    totalTimeMs: Number(decoratedStat.totalTimeMs) || 0,
    totalScorePercent: Number(decoratedStat.totalScorePercent) || 0,
    averageScorePercent: Number(decoratedStat.averageScorePercent) || 0,
    bestScorePercent: Number(decoratedStat.bestScorePercent) || 0,
    lastScorePercent: Number(decoratedStat.lastScorePercent) || 0,
    firstScorePercent: Number(decoratedStat.firstScorePercent) || 0,
    scoreMean: Number.isFinite(Number(decoratedStat.scoreMean)) ? Number(decoratedStat.scoreMean) : null,
    scoreM2: Number.isFinite(Number(decoratedStat.scoreM2)) ? Number(decoratedStat.scoreM2) : null,
    scoreVariance: Number.isFinite(Number(decoratedStat.scoreVariance)) ? Number(decoratedStat.scoreVariance) : null,
    scoreStdDev: Number.isFinite(Number(decoratedStat.scoreStdDev)) ? Number(decoratedStat.scoreStdDev) : null,
    quizAccuracy: Number.isFinite(Number(decoratedStat.quizAccuracy)) ? Number(decoratedStat.quizAccuracy) : null,
    retentionChange: Number.isFinite(Number(decoratedStat.retentionChange)) ? Number(decoratedStat.retentionChange) : null,
    consistencyScore: Number.isFinite(Number(decoratedStat.consistencyScore)) ? Number(decoratedStat.consistencyScore) : null,
    timePerCorrectMs: Number.isFinite(Number(decoratedStat.timePerCorrectMs)) ? Number(decoratedStat.timePerCorrectMs) : null,
    fibStats: exportFibStats(decoratedStat.fibStats),
    firstCompletedAt: Number(decoratedStat.firstCompletedAt) || 0,
    lastCompletedAt: Number(decoratedStat.lastCompletedAt) || 0
  };
}

export function exportQuestionStat(stat) {
  const decoratedStat = decorateQuestionStat(stat);
  return {
    key: buildPortableQuestionKey(decoratedStat),
    quizKey: buildPortableQuizKey(decoratedStat),
    questionKey: normalizeExportText(decoratedStat.questionKey, ""),
    source: normalizeExportText(decoratedStat.source, "library"),
    quizId: decoratedStat.quizId !== undefined && decoratedStat.quizId !== null ? String(decoratedStat.quizId) : "",
    folderId: decoratedStat.folderId !== undefined && decoratedStat.folderId !== null ? String(decoratedStat.folderId) : "",
    folderName: normalizeExportText(decoratedStat.folderName, ""),
    folderPath: normalizeExportText(decoratedStat.folderPath || decoratedStat.folderName, "Library"),
    quizName: normalizeExportText(decoratedStat.quizName, "Untitled quiz"),
    quizKind: normalizeExportText(decoratedStat.quizKind, "quiz"),
    questionId: decoratedStat.questionId !== undefined && decoratedStat.questionId !== null ? String(decoratedStat.questionId) : null,
    questionText: normalizeExportText(decoratedStat.questionText, "Untitled question"),
    attempts: Number(decoratedStat.attempts) || 0,
    correctCount: Number(decoratedStat.correctCount) || 0,
    wrongCount: Number(decoratedStat.wrongCount) || 0,
    totalTimeMs: Number(decoratedStat.totalTimeMs) || 0,
    averageTimeMs: Number(decoratedStat.averageTimeMs) || 0,
    questionAccuracy: Number.isFinite(Number(decoratedStat.questionAccuracy)) ? Number(decoratedStat.questionAccuracy) : null,
    difficulty: Number.isFinite(Number(decoratedStat.difficulty)) ? Number(decoratedStat.difficulty) : null,
    errorRate: Number.isFinite(Number(decoratedStat.errorRate)) ? Number(decoratedStat.errorRate) : null,
    masteryScore: Number.isFinite(Number(decoratedStat.masteryScore)) ? Number(decoratedStat.masteryScore) : null,
    lastSelectedOption: normalizeExportText(decoratedStat.lastSelectedOption, ""),
    correctOption: normalizeExportText(decoratedStat.correctOption, ""),
    fastWrongCount: Number(decoratedStat.fastWrongCount) || 0,
    slowWrongCount: Number(decoratedStat.slowWrongCount) || 0,
    fastCorrectCount: Number(decoratedStat.fastCorrectCount) || 0,
    fibAttempts: Number(decoratedStat.fibAttempts) || 0,
    fibQuestionsSolvedFirstTry: Number(decoratedStat.fibQuestionsSolvedFirstTry) || 0,
    fibQuestionsSolvedSecondTry: Number(decoratedStat.fibQuestionsSolvedSecondTry) || 0,
    fibQuestionsMissedAfterSecondTry: Number(decoratedStat.fibQuestionsMissedAfterSecondTry) || 0,
    fibSecondTryQuestions: Number(decoratedStat.fibSecondTryQuestions) || 0,
    fibFirstTryBlanks: Number(decoratedStat.fibFirstTryBlanks) || 0,
    fibFirstTryCorrect: Number(decoratedStat.fibFirstTryCorrect) || 0,
    fibFirstTryWrong: Number(decoratedStat.fibFirstTryWrong) || 0,
    fibSecondTryBlanks: Number(decoratedStat.fibSecondTryBlanks) || 0,
    fibSecondTryCorrect: Number(decoratedStat.fibSecondTryCorrect) || 0,
    fibSecondTryWrong: Number(decoratedStat.fibSecondTryWrong) || 0,
    fibSecondTryImproved: Number(decoratedStat.fibSecondTryImproved) || 0,
    fibMisplacedCount: Number(decoratedStat.fibMisplacedCount) || 0,
    fibBaitCount: Number(decoratedStat.fibBaitCount) || 0,
    fibMissingCount: Number(decoratedStat.fibMissingCount) || 0,
    fibFirstTryAccuracy: Number.isFinite(Number(decoratedStat.fibFirstTryAccuracy)) ? decoratedStat.fibFirstTryAccuracy : null,
    fibSecondTryAccuracy: Number.isFinite(Number(decoratedStat.fibSecondTryAccuracy)) ? decoratedStat.fibSecondTryAccuracy : null,
    fibSecondTryFixRate: Number.isFinite(Number(decoratedStat.fibSecondTryFixRate)) ? decoratedStat.fibSecondTryFixRate : null,
    firstAnsweredAt: Number(decoratedStat.firstAnsweredAt) || 0,
    lastAnsweredAt: Number(decoratedStat.lastAnsweredAt) || 0,
    firstResult: Boolean(decoratedStat.firstResult),
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
  const fibStats = analytics.fibStats || createDefaultFibStats();
  const snapshot = getAnalyticsSnapshot();
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
      goalPercent: getExportGoalPercent()
    },
    summary: {
      sessionsCompleted: Number(analytics.totals.sessionsCompleted) || 0,
      questionsAnswered: Number(analytics.totals.questionsAnswered) || 0,
      correctAnswers: Number(analytics.totals.correctAnswers) || 0,
      totalStudyTimeMs: Number(analytics.totals.totalTimeMs) || 0
    },
    analysis: {
      globalMetrics: snapshot.globalMetrics,
      behaviorSummary: snapshot.behaviorSummary,
      timeSummary: snapshot.timeSummary,
      coverage: {
        goalPercent: Number(snapshot.goalPercent) || 0,
        attemptedQuizCount: Number(snapshot.attemptedQuizCount) || 0,
        passedQuizCount: Number(snapshot.passedQuizCount) || 0,
        needsWorkQuizCount: Number(snapshot.needsWorkQuizCount) || 0,
        unattemptedQuizCount: snapshot.unattemptedQuizzes.length
      },
      trendSeries: snapshot.trendSeries.map(exportTrendPoint),
      dailyMetrics: snapshot.dailyMetrics,
      topicMetrics: snapshot.topicMetrics,
      topPerformers: snapshot.topPerformers.map(exportQuizStat),
      leastPerformers: snapshot.leastPerformers.map(exportQuizStat),
      mostConsistentQuizzes: snapshot.mostConsistentQuizzes.map(exportQuizStat),
      topFibTroubleQuestions: snapshot.topFibTroubleQuestions.map(exportQuestionStat),
      mostIncorrectQuestions: snapshot.mostIncorrectQuestions.map(exportQuestionStat),
      attemptedLibraryQuizStats: snapshot.attemptedLibraryQuizStats.map(exportQuizStat),
      unattemptedQuizzes: snapshot.unattemptedQuizzes.map(exportLibraryQuizSummary)
    },
    analytics: {
      counters: {
        sessions: Number(analytics.counters && analytics.counters.session) || 0,
        answers: Number(analytics.counters && analytics.counters.answer) || 0
      },
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
      scoreMoments: {
        count: Number(analytics.scoreMoments && analytics.scoreMoments.count) || 0,
        mean: Number(analytics.scoreMoments && analytics.scoreMoments.mean) || 0,
        m2: Number(analytics.scoreMoments && analytics.scoreMoments.m2) || 0
      },
      trendRegression: {
        count: Number(analytics.trendRegression && analytics.trendRegression.count) || 0,
        sumX: Number(analytics.trendRegression && analytics.trendRegression.sumX) || 0,
        sumY: Number(analytics.trendRegression && analytics.trendRegression.sumY) || 0,
        sumXY: Number(analytics.trendRegression && analytics.trendRegression.sumXY) || 0,
        sumX2: Number(analytics.trendRegression && analytics.trendRegression.sumX2) || 0
      },
      streaks: {
        currentCorrectStreak: Number(streakStats.currentCorrectStreak) || 0,
        bestCorrectStreak: Number(streakStats.bestCorrectStreak) || 0
      },
      dropoff: {
        sessionsTracked: Number(dropoffStats.sessionsTracked) || 0,
        totalDropoff: Number(dropoffStats.totalDropoff) || 0
      },
      fib: exportFibStats(fibStats),
      topics: {
        folders: exportTopicEntries(analytics.topicStats && analytics.topicStats.byFolder),
        quizKinds: exportTopicEntries(analytics.topicStats && analytics.topicStats.byQuizKind)
      }
    }
  };
}

export function exportTrendPoint(point) {
  return {
    key: buildPortableQuizKey(point),
    source: normalizeExportText(point && point.source, "library"),
    folderPath: normalizeExportText(point && (point.folderPath || point.folderName), "Library"),
    quizName: normalizeExportText(point && point.quizName, "Untitled quiz"),
    completedAt: Number(point && point.completedAt) || 0,
    scorePercent: Number(point && point.scorePercent) || 0,
    rollingAverage: Number.isFinite(Number(point && point.rollingAverage)) ? Number(point.rollingAverage) : null
  };
}

export function exportLibraryQuizSummary(quiz) {
  const folderId = quiz && quiz.parentFolderId !== undefined && quiz.parentFolderId !== null ? String(quiz.parentFolderId) : "";
  const folder = folderId ? getFolder(folderId) : null;

  return {
    quizId: quiz && quiz.id !== undefined && quiz.id !== null ? String(quiz.id) : "",
    quizName: normalizeExportText(quiz && quiz.name, "Untitled quiz"),
    quizKind: normalizeExportText(quiz && quiz.kind, "quiz"),
    folderId,
    folderName: normalizeExportText(folder && folder.name, ""),
    folderPath: folderId ? getFolderPath(folderId) : "",
    questionCount: Array.isArray(quiz && quiz.questions) ? quiz.questions.length : 0,
    sourceQuizIds: Array.isArray(quiz && quiz.sourceQuizIds) ? quiz.sourceQuizIds.join("; ") : "",
    createdAt: Number(quiz && quiz.createdAt) || 0,
    updatedAt: Number(quiz && quiz.updatedAt) || 0
  };
}

export function getFiniteNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function roundExportNumber(value, digits) {
  const amount = getFiniteNumber(value);
  if (amount === null) {
    return "";
  }

  const precision = Number.isInteger(digits) ? Math.max(digits, 0) : 2;
  const multiplier = 10 ** precision;
  return Math.round(amount * multiplier) / multiplier;
}

export function millisecondsToSeconds(value) {
  const amount = getFiniteNumber(value);
  return amount === null ? "" : roundExportNumber(amount / 1000, 3);
}

export function ratioToPercent(value) {
  const amount = getFiniteNumber(value);
  return amount === null ? "" : roundExportNumber(amount * 100, 2);
}

export function timestampToIso(value) {
  const amount = getFiniteNumber(value);
  if (!amount) {
    return "";
  }

  try {
    return new Date(amount).toISOString();
  } catch (error) {
    return "";
  }
}

export function stringifyCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

export function escapeCsvCell(value) {
  const text = stringifyCsvValue(value);
  if (!/[",\r\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, "\"\"")}"`;
}

export function stringifyCsvRows(rows) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n") + "\r\n";
}

export function tableToCsv(columns, rows) {
  return stringifyCsvRows([columns, ...rows.map((row) => columns.map((column) => row[column]))]);
}

export function createCsvFile(path, description, columns, rows) {
  return {
    path,
    description,
    columns,
    rowCount: rows.length,
    content: tableToCsv(columns, rows)
  };
}

export function getExportedSessions(exportData) {
  return (exportData.analytics && exportData.analytics.recentSessions) || [];
}

export function getExportedAnswers(exportData) {
  return (exportData.analytics && exportData.analytics.recentAnswers) || [];
}

export function getExportedQuizStats(exportData) {
  return (exportData.analytics && exportData.analytics.quizStats) || [];
}

export function getExportedQuestionStats(exportData) {
  return (exportData.analytics && exportData.analytics.questionStats) || [];
}

export function buildRankMap(items) {
  const ranks = new Map();
  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const key = item && item.key ? String(item.key) : "";
    if (key && !ranks.has(key)) {
      ranks.set(key, index + 1);
    }
  });
  return ranks;
}

export function getRank(ranks, key) {
  return key && ranks.has(key) ? ranks.get(key) : "";
}

export function createFibStatColumns(prefix) {
  return [
    `${prefix}questions_answered`,
    `${prefix}questions_solved_first_try`,
    `${prefix}questions_solved_second_try`,
    `${prefix}questions_missed_after_second_try`,
    `${prefix}second_try_questions`,
    `${prefix}first_try_blanks`,
    `${prefix}first_try_correct`,
    `${prefix}first_try_wrong`,
    `${prefix}second_try_blanks`,
    `${prefix}second_try_correct`,
    `${prefix}second_try_wrong`,
    `${prefix}second_try_improved`,
    `${prefix}misplaced_count`,
    `${prefix}bait_count`,
    `${prefix}missing_count`,
    `${prefix}first_try_accuracy_pct`,
    `${prefix}second_try_accuracy_pct`,
    `${prefix}second_try_use_rate_pct`,
    `${prefix}second_try_fix_rate_pct`,
    `${prefix}second_try_blank_fix_rate_pct`
  ];
}

export function createFibStatCells(stats, prefix) {
  const fibStats = stats || {};
  return {
    [`${prefix}questions_answered`]: Number(fibStats.questionsAnswered) || 0,
    [`${prefix}questions_solved_first_try`]: Number(fibStats.questionsSolvedFirstTry) || 0,
    [`${prefix}questions_solved_second_try`]: Number(fibStats.questionsSolvedSecondTry) || 0,
    [`${prefix}questions_missed_after_second_try`]: Number(fibStats.questionsMissedAfterSecondTry) || 0,
    [`${prefix}second_try_questions`]: Number(fibStats.secondTryQuestions) || 0,
    [`${prefix}first_try_blanks`]: Number(fibStats.firstTryBlanks) || 0,
    [`${prefix}first_try_correct`]: Number(fibStats.firstTryCorrect) || 0,
    [`${prefix}first_try_wrong`]: Number(fibStats.firstTryWrong) || 0,
    [`${prefix}second_try_blanks`]: Number(fibStats.secondTryBlanks) || 0,
    [`${prefix}second_try_correct`]: Number(fibStats.secondTryCorrect) || 0,
    [`${prefix}second_try_wrong`]: Number(fibStats.secondTryWrong) || 0,
    [`${prefix}second_try_improved`]: Number(fibStats.secondTryImproved) || 0,
    [`${prefix}misplaced_count`]: Number(fibStats.misplacedCount) || 0,
    [`${prefix}bait_count`]: Number(fibStats.baitCount) || 0,
    [`${prefix}missing_count`]: Number(fibStats.missingCount) || 0,
    [`${prefix}first_try_accuracy_pct`]: ratioToPercent(fibStats.firstTryAccuracy),
    [`${prefix}second_try_accuracy_pct`]: ratioToPercent(fibStats.secondTryAccuracy),
    [`${prefix}second_try_use_rate_pct`]: ratioToPercent(fibStats.secondTryUseRate),
    [`${prefix}second_try_fix_rate_pct`]: ratioToPercent(fibStats.secondTryFixRate),
    [`${prefix}second_try_blank_fix_rate_pct`]: ratioToPercent(fibStats.secondTryBlankFixRate)
  };
}

export function createSummaryFile(exportData) {
  const summary = exportData.summary || {};
  const metrics = (exportData.analysis && exportData.analysis.globalMetrics) || {};
  const behavior = (exportData.analysis && exportData.analysis.behaviorSummary) || {};
  const coverage = (exportData.analysis && exportData.analysis.coverage) || {};
  const columns = [
    "exported_at_ms",
    "exported_at_iso",
    "export_version",
    "goal_pct",
    "sessions_completed",
    "questions_answered",
    "correct_answers",
    "accuracy_pct",
    "total_study_s",
    "avg_score_pct",
    "avg_answer_s",
    "questions_per_minute",
    "current_streak",
    "best_streak",
    "guess_rate_pct",
    "slow_error_rate_pct",
    "fast_correct_rate_pct",
    "avg_dropoff_pct",
    "attempted_quiz_count",
    "passed_quiz_count",
    "needs_work_quiz_count",
    "unattempted_quiz_count",
    ...createFibStatColumns("fib_")
  ];
  const rows = [
    {
      exported_at_ms: exportData.exportedAt,
      exported_at_iso: exportData.exportedAtIso,
      export_version: exportData.version,
      goal_pct: Number(exportData.settings && exportData.settings.goalPercent) || 0,
      sessions_completed: Number(summary.sessionsCompleted) || 0,
      questions_answered: Number(summary.questionsAnswered) || 0,
      correct_answers: Number(summary.correctAnswers) || 0,
      accuracy_pct: ratioToPercent(metrics.accuracy),
      total_study_s: millisecondsToSeconds(summary.totalStudyTimeMs),
      avg_score_pct: roundExportNumber(metrics.averageScore, 2),
      avg_answer_s: millisecondsToSeconds(metrics.averageAnswerMs),
      questions_per_minute: roundExportNumber(metrics.questionsPerMinute, 3),
      current_streak: Number(behavior.currentStreak) || 0,
      best_streak: Number(behavior.bestStreak) || 0,
      guess_rate_pct: ratioToPercent(behavior.guessRate),
      slow_error_rate_pct: ratioToPercent(behavior.slowErrorRate),
      fast_correct_rate_pct: ratioToPercent(behavior.fastCorrectRate),
      avg_dropoff_pct: ratioToPercent(behavior.averageDropoff),
      attempted_quiz_count: Number(coverage.attemptedQuizCount) || 0,
      passed_quiz_count: Number(coverage.passedQuizCount) || 0,
      needs_work_quiz_count: Number(coverage.needsWorkQuizCount) || 0,
      unattempted_quiz_count: Number(coverage.unattemptedQuizCount) || 0,
      ...createFibStatCells((exportData.analytics && exportData.analytics.fib) || {}, "fib_")
    }
  ];

  return createCsvFile("csv/01_summary.csv", "One-row overview of the export and global analytics totals.", columns, rows);
}

export function createDailyMetricsFile(exportData) {
  const columns = ["date_key", "study_time_s", "sessions_completed", "questions_answered", "correct_answers", "accuracy_pct"];
  const rows = ((exportData.analytics && exportData.analytics.dailyStats) || []).map((day) => ({
    date_key: day.dateKey,
    study_time_s: millisecondsToSeconds(day.studyTimeMs),
    sessions_completed: Number(day.sessionsCompleted) || 0,
    questions_answered: Number(day.questionsAnswered) || 0,
    correct_answers: Number(day.correctAnswers) || 0,
    accuracy_pct: ratioToPercent((Number(day.correctAnswers) || 0) / (Number(day.questionsAnswered) || 0))
  }));

  return createCsvFile("csv/02_daily_metrics.csv", "One row per tracked study day.", columns, rows);
}

export function createSessionsFile(exportData) {
  const columns = [
    "session_id",
    "quiz_key",
    "source",
    "quiz_id",
    "folder_id",
    "folder_name",
    "folder_path",
    "quiz_name",
    "quiz_kind",
    "started_at_ms",
    "started_at_iso",
    "completed_at_ms",
    "completed_at_iso",
    "duration_s",
    "question_count",
    "correct_count",
    "wrong_count",
    "score_pct",
    "avg_answer_s",
    "questions_per_minute",
    "score_delta_pct",
    "first_half_accuracy_pct",
    "second_half_accuracy_pct",
    "dropoff_pct",
    "fib_question_count",
    "fib_first_try_correct",
    "fib_first_try_wrong",
    "fib_second_try_correct",
    "fib_second_try_wrong"
  ];
  const rows = getExportedSessions(exportData).map((session) => ({
    session_id: session.id,
    quiz_key: session.key,
    source: session.source,
    quiz_id: session.quizId,
    folder_id: session.folderId,
    folder_name: session.folderName,
    folder_path: session.folderPath,
    quiz_name: session.quizName,
    quiz_kind: session.quizKind,
    started_at_ms: session.startedAt,
    started_at_iso: timestampToIso(session.startedAt),
    completed_at_ms: session.completedAt,
    completed_at_iso: timestampToIso(session.completedAt),
    duration_s: millisecondsToSeconds(session.durationMs),
    question_count: Number(session.questionCount) || 0,
    correct_count: Number(session.correctCount) || 0,
    wrong_count: Number(session.wrongCount) || 0,
    score_pct: roundExportNumber(session.scorePercent, 2),
    avg_answer_s: millisecondsToSeconds(session.averageAnswerMs),
    questions_per_minute: roundExportNumber(session.questionsPerMinute, 3),
    score_delta_pct: roundExportNumber(session.scoreDelta, 2),
    first_half_accuracy_pct: ratioToPercent(session.firstHalfAccuracy),
    second_half_accuracy_pct: ratioToPercent(session.secondHalfAccuracy),
    dropoff_pct: ratioToPercent(session.dropoffRate),
    fib_question_count: Number(session.fibQuestionCount) || 0,
    fib_first_try_correct: Number(session.fibFirstTryCorrect) || 0,
    fib_first_try_wrong: Number(session.fibFirstTryWrong) || 0,
    fib_second_try_correct: Number(session.fibSecondTryCorrect) || 0,
    fib_second_try_wrong: Number(session.fibSecondTryWrong) || 0
  }));

  return createCsvFile("csv/03_sessions.csv", "One row per stored quiz session.", columns, rows);
}

export function createAnswersFile(exportData) {
  const columns = [
    "answer_id",
    "session_id",
    "quiz_key",
    "question_key",
    "source",
    "quiz_id",
    "folder_id",
    "folder_name",
    "folder_path",
    "quiz_name",
    "quiz_kind",
    "question_id",
    "question_number",
    "question_type",
    "question_text",
    "selected_index",
    "selected_option",
    "correct_index",
    "correct_option",
    "attempt_count",
    "is_correct",
    "answered_at_ms",
    "answered_at_iso",
    "elapsed_s",
    "fib_first_try_correct_count",
    "fib_first_try_wrong_count",
    "fib_second_try_correct_count",
    "fib_second_try_wrong_count",
    "fib_second_try_improved_count",
    "fib_misplaced_count",
    "fib_bait_count",
    "fib_missing_count"
  ];
  const rows = getExportedAnswers(exportData).map((answer) => ({
    answer_id: answer.id,
    session_id: answer.sessionId,
    quiz_key: answer.quizKey,
    question_key: answer.key,
    source: answer.source,
    quiz_id: answer.quizId,
    folder_id: answer.folderId,
    folder_name: answer.folderName,
    folder_path: answer.folderPath,
    quiz_name: answer.quizName,
    quiz_kind: answer.quizKind,
    question_id: answer.questionId,
    question_number: Number(answer.questionNumber) || 0,
    question_type: answer.questionType,
    question_text: answer.questionText,
    selected_index: answer.selectedIndex,
    selected_option: answer.selectedOption,
    correct_index: answer.correctIndex,
    correct_option: answer.correctOption,
    attempt_count: Number(answer.attemptCount) || 0,
    is_correct: Boolean(answer.isCorrect),
    answered_at_ms: answer.answeredAt,
    answered_at_iso: timestampToIso(answer.answeredAt),
    elapsed_s: millisecondsToSeconds(answer.elapsedMs),
    fib_first_try_correct_count: Number(answer.fibFirstTryCorrectCount) || 0,
    fib_first_try_wrong_count: Number(answer.fibFirstTryWrongCount) || 0,
    fib_second_try_correct_count: Number(answer.fibSecondTryCorrectCount) || 0,
    fib_second_try_wrong_count: Number(answer.fibSecondTryWrongCount) || 0,
    fib_second_try_improved_count: Number(answer.fibSecondTryImprovedCount) || 0,
    fib_misplaced_count: Number(answer.fibMisplacedCount) || 0,
    fib_bait_count: Number(answer.fibBaitCount) || 0,
    fib_missing_count: Number(answer.fibMissingCount) || 0
  }));

  return createCsvFile("csv/04_answers.csv", "One row per stored answered question.", columns, rows);
}

export function createQuizStatsFile(exportData) {
  const analysis = exportData.analysis || {};
  const topRanks = buildRankMap(analysis.topPerformers);
  const leastRanks = buildRankMap(analysis.leastPerformers);
  const consistencyRanks = buildRankMap(analysis.mostConsistentQuizzes);
  const columns = [
    "quiz_key",
    "stored_quiz_key",
    "source",
    "quiz_id",
    "folder_id",
    "folder_name",
    "folder_path",
    "quiz_name",
    "quiz_kind",
    "attempts",
    "total_questions",
    "total_correct",
    "accuracy_pct",
    "total_time_s",
    "total_score_pct",
    "avg_score_pct",
    "best_score_pct",
    "first_score_pct",
    "last_score_pct",
    "retention_change_pct",
    "score_mean_pct",
    "score_std_dev_pct",
    "consistency_pct",
    "time_per_correct_s",
    "first_completed_at_ms",
    "first_completed_at_iso",
    "last_completed_at_ms",
    "last_completed_at_iso",
    "rank_top_performer",
    "rank_least_performer",
    "rank_consistency",
    ...createFibStatColumns("fib_")
  ];
  const rows = getExportedQuizStats(exportData).map((stat) => ({
    quiz_key: stat.key,
    stored_quiz_key: stat.quizKey,
    source: stat.source,
    quiz_id: stat.quizId,
    folder_id: stat.folderId,
    folder_name: stat.folderName,
    folder_path: stat.folderPath,
    quiz_name: stat.quizName,
    quiz_kind: stat.quizKind,
    attempts: Number(stat.attempts) || 0,
    total_questions: Number(stat.totalQuestions) || 0,
    total_correct: Number(stat.totalCorrect) || 0,
    accuracy_pct: ratioToPercent(stat.quizAccuracy),
    total_time_s: millisecondsToSeconds(stat.totalTimeMs),
    total_score_pct: roundExportNumber(stat.totalScorePercent, 2),
    avg_score_pct: roundExportNumber(stat.averageScorePercent, 2),
    best_score_pct: roundExportNumber(stat.bestScorePercent, 2),
    first_score_pct: roundExportNumber(stat.firstScorePercent, 2),
    last_score_pct: roundExportNumber(stat.lastScorePercent, 2),
    retention_change_pct: roundExportNumber(stat.retentionChange, 2),
    score_mean_pct: roundExportNumber(stat.scoreMean, 2),
    score_std_dev_pct: roundExportNumber(stat.scoreStdDev, 2),
    consistency_pct: ratioToPercent(stat.consistencyScore),
    time_per_correct_s: millisecondsToSeconds(stat.timePerCorrectMs),
    first_completed_at_ms: stat.firstCompletedAt,
    first_completed_at_iso: timestampToIso(stat.firstCompletedAt),
    last_completed_at_ms: stat.lastCompletedAt,
    last_completed_at_iso: timestampToIso(stat.lastCompletedAt),
    rank_top_performer: getRank(topRanks, stat.key),
    rank_least_performer: getRank(leastRanks, stat.key),
    rank_consistency: getRank(consistencyRanks, stat.key),
    ...createFibStatCells(stat.fibStats, "fib_")
  }));

  return createCsvFile("csv/05_quiz_stats.csv", "One row per stored quiz aggregate.", columns, rows);
}

export function createQuestionStatsFile(exportData) {
  const analysis = exportData.analysis || {};
  const incorrectRanks = buildRankMap(analysis.mostIncorrectQuestions);
  const fibTroubleRanks = buildRankMap(analysis.topFibTroubleQuestions);
  const columns = [
    "question_key",
    "stored_question_key",
    "quiz_key",
    "source",
    "quiz_id",
    "folder_id",
    "folder_name",
    "folder_path",
    "quiz_name",
    "quiz_kind",
    "question_id",
    "question_text",
    "attempts",
    "correct_count",
    "wrong_count",
    "accuracy_pct",
    "difficulty_pct",
    "error_rate_pct",
    "total_time_s",
    "avg_time_s",
    "mastery_score",
    "last_selected_option",
    "correct_option",
    "fast_wrong_count",
    "slow_wrong_count",
    "fast_correct_count",
    "first_answered_at_ms",
    "first_answered_at_iso",
    "last_answered_at_ms",
    "last_answered_at_iso",
    "first_result",
    "last_result",
    "rank_most_incorrect",
    "rank_fib_trouble",
    "fib_attempts",
    "fib_questions_solved_first_try",
    "fib_questions_solved_second_try",
    "fib_questions_missed_after_second_try",
    "fib_second_try_questions",
    "fib_first_try_blanks",
    "fib_first_try_correct",
    "fib_first_try_wrong",
    "fib_second_try_blanks",
    "fib_second_try_correct",
    "fib_second_try_wrong",
    "fib_second_try_improved",
    "fib_misplaced_count",
    "fib_bait_count",
    "fib_missing_count",
    "fib_first_try_accuracy_pct",
    "fib_second_try_accuracy_pct",
    "fib_second_try_fix_rate_pct"
  ];
  const rows = getExportedQuestionStats(exportData).map((stat) => ({
    question_key: stat.key,
    stored_question_key: stat.questionKey,
    quiz_key: stat.quizKey,
    source: stat.source,
    quiz_id: stat.quizId,
    folder_id: stat.folderId,
    folder_name: stat.folderName,
    folder_path: stat.folderPath,
    quiz_name: stat.quizName,
    quiz_kind: stat.quizKind,
    question_id: stat.questionId,
    question_text: stat.questionText,
    attempts: Number(stat.attempts) || 0,
    correct_count: Number(stat.correctCount) || 0,
    wrong_count: Number(stat.wrongCount) || 0,
    accuracy_pct: ratioToPercent(stat.questionAccuracy),
    difficulty_pct: ratioToPercent(stat.difficulty),
    error_rate_pct: ratioToPercent(stat.errorRate),
    total_time_s: millisecondsToSeconds(stat.totalTimeMs),
    avg_time_s: millisecondsToSeconds(stat.averageTimeMs),
    mastery_score: roundExportNumber(stat.masteryScore, 6),
    last_selected_option: stat.lastSelectedOption,
    correct_option: stat.correctOption,
    fast_wrong_count: Number(stat.fastWrongCount) || 0,
    slow_wrong_count: Number(stat.slowWrongCount) || 0,
    fast_correct_count: Number(stat.fastCorrectCount) || 0,
    first_answered_at_ms: stat.firstAnsweredAt,
    first_answered_at_iso: timestampToIso(stat.firstAnsweredAt),
    last_answered_at_ms: stat.lastAnsweredAt,
    last_answered_at_iso: timestampToIso(stat.lastAnsweredAt),
    first_result: Boolean(stat.firstResult),
    last_result: Boolean(stat.lastResult),
    rank_most_incorrect: getRank(incorrectRanks, stat.key),
    rank_fib_trouble: getRank(fibTroubleRanks, stat.key),
    fib_attempts: Number(stat.fibAttempts) || 0,
    fib_questions_solved_first_try: Number(stat.fibQuestionsSolvedFirstTry) || 0,
    fib_questions_solved_second_try: Number(stat.fibQuestionsSolvedSecondTry) || 0,
    fib_questions_missed_after_second_try: Number(stat.fibQuestionsMissedAfterSecondTry) || 0,
    fib_second_try_questions: Number(stat.fibSecondTryQuestions) || 0,
    fib_first_try_blanks: Number(stat.fibFirstTryBlanks) || 0,
    fib_first_try_correct: Number(stat.fibFirstTryCorrect) || 0,
    fib_first_try_wrong: Number(stat.fibFirstTryWrong) || 0,
    fib_second_try_blanks: Number(stat.fibSecondTryBlanks) || 0,
    fib_second_try_correct: Number(stat.fibSecondTryCorrect) || 0,
    fib_second_try_wrong: Number(stat.fibSecondTryWrong) || 0,
    fib_second_try_improved: Number(stat.fibSecondTryImproved) || 0,
    fib_misplaced_count: Number(stat.fibMisplacedCount) || 0,
    fib_bait_count: Number(stat.fibBaitCount) || 0,
    fib_missing_count: Number(stat.fibMissingCount) || 0,
    fib_first_try_accuracy_pct: ratioToPercent(stat.fibFirstTryAccuracy),
    fib_second_try_accuracy_pct: ratioToPercent(stat.fibSecondTryAccuracy),
    fib_second_try_fix_rate_pct: ratioToPercent(stat.fibSecondTryFixRate)
  }));

  return createCsvFile("csv/06_question_stats.csv", "One row per stored question aggregate.", columns, rows);
}

export function createTopicStatsFile(exportData) {
  const columns = ["topic_type", "topic_key", "label", "attempts", "total_score_pct", "avg_score_pct"];
  const topics = (exportData.analytics && exportData.analytics.topics) || {};
  const rows = [
    ...((topics.folders || []).map((topic) => ({ ...topic, topicType: "folder" }))),
    ...((topics.quizKinds || []).map((topic) => ({ ...topic, topicType: "quiz_kind" })))
  ].map((topic) => ({
    topic_type: topic.topicType,
    topic_key: topic.key,
    label: topic.label,
    attempts: Number(topic.attempts) || 0,
    total_score_pct: roundExportNumber(topic.totalScorePercent, 2),
    avg_score_pct: roundExportNumber(topic.averageScorePercent, 2)
  }));

  return createCsvFile("csv/07_topic_stats.csv", "One row per folder or quiz-kind topic aggregate.", columns, rows);
}

export function createUnattemptedQuizzesFile(exportData) {
  const columns = [
    "quiz_id",
    "quiz_name",
    "quiz_kind",
    "folder_id",
    "folder_name",
    "folder_path",
    "question_count",
    "source_quiz_ids",
    "created_at_ms",
    "created_at_iso",
    "updated_at_ms",
    "updated_at_iso"
  ];
  const rows = (((exportData.analysis || {}).unattemptedQuizzes) || []).map((quiz) => ({
    quiz_id: quiz.quizId,
    quiz_name: quiz.quizName,
    quiz_kind: quiz.quizKind,
    folder_id: quiz.folderId,
    folder_name: quiz.folderName,
    folder_path: quiz.folderPath,
    question_count: Number(quiz.questionCount) || 0,
    source_quiz_ids: quiz.sourceQuizIds,
    created_at_ms: quiz.createdAt,
    created_at_iso: timestampToIso(quiz.createdAt),
    updated_at_ms: quiz.updatedAt,
    updated_at_iso: timestampToIso(quiz.updatedAt)
  }));

  return createCsvFile("csv/08_unattempted_quizzes.csv", "One row per library quiz with no tracked attempts.", columns, rows);
}

export function createFibAttemptsFile(exportData) {
  const columns = [
    "answer_id",
    "session_id",
    "quiz_key",
    "question_key",
    "question_id",
    "question_text",
    "attempt_number",
    "total_blanks",
    "correct_count",
    "wrong_count",
    "misplaced_count",
    "bait_count",
    "missing_count",
    "is_correct"
  ];
  const rows = [];
  getExportedAnswers(exportData).forEach((answer) => {
    (answer.fibAttempts || []).forEach((attempt) => {
      rows.push({
        answer_id: answer.id,
        session_id: answer.sessionId,
        quiz_key: answer.quizKey,
        question_key: answer.key,
        question_id: answer.questionId,
        question_text: answer.questionText,
        attempt_number: Number(attempt.attemptNumber) || 0,
        total_blanks: Number(attempt.totalBlanks) || 0,
        correct_count: Number(attempt.correctCount) || 0,
        wrong_count: Number(attempt.wrongCount) || 0,
        misplaced_count: Number(attempt.misplacedCount) || 0,
        bait_count: Number(attempt.baitCount) || 0,
        missing_count: Number(attempt.missingCount) || 0,
        is_correct: Boolean(attempt.isCorrect)
      });
    });
  });

  return createCsvFile("csv/09_fib_attempts.csv", "One row per fill-in-the-blank attempt.", columns, rows);
}

export function createFibBlankResultsFile(exportData) {
  const columns = [
    "answer_id",
    "session_id",
    "quiz_key",
    "question_key",
    "question_id",
    "attempt_number",
    "blank_id",
    "selected_answer",
    "correct_answer",
    "status",
    "is_correct"
  ];
  const rows = [];
  getExportedAnswers(exportData).forEach((answer) => {
    (answer.fibAttempts || []).forEach((attempt) => {
      (attempt.results || []).forEach((result) => {
        rows.push({
          answer_id: answer.id,
          session_id: answer.sessionId,
          quiz_key: answer.quizKey,
          question_key: answer.key,
          question_id: answer.questionId,
          attempt_number: Number(attempt.attemptNumber) || 0,
          blank_id: result.blankId,
          selected_answer: result.selectedAnswer,
          correct_answer: result.correctAnswer,
          status: result.status,
          is_correct: Boolean(result.isCorrect)
        });
      });
    });
  });

  return createCsvFile("csv/10_fib_blank_results.csv", "One row per individual fill-in-the-blank blank result.", columns, rows);
}

export function createInsightsFile(exportData) {
  const columns = ["view_name", "rank", "entity_type", "entity_key", "label", "metric_name", "metric_value"];
  const analysis = exportData.analysis || {};
  const views = [
    ["top_performers", "quiz", analysis.topPerformers, "avg_score_pct", (item) => item.averageScorePercent, (item) => item.quizName],
    ["least_performers", "quiz", analysis.leastPerformers, "avg_score_pct", (item) => item.averageScorePercent, (item) => item.quizName],
    [
      "most_consistent_quizzes",
      "quiz",
      analysis.mostConsistentQuizzes,
      "consistency_pct",
      (item) => ratioToPercent(item.consistencyScore),
      (item) => item.quizName
    ],
    [
      "most_incorrect_questions",
      "question",
      analysis.mostIncorrectQuestions,
      "wrong_count",
      (item) => item.wrongCount,
      (item) => item.questionText
    ],
    [
      "top_fib_trouble_questions",
      "question",
      analysis.topFibTroubleQuestions,
      "fib_first_try_wrong",
      (item) => item.fibFirstTryWrong,
      (item) => item.questionText
    ]
  ];
  const rows = [];

  views.forEach(([viewName, entityType, items, metricName, getMetricValue, getLabel]) => {
    (items || []).forEach((item, index) => {
      rows.push({
        view_name: viewName,
        rank: index + 1,
        entity_type: entityType,
        entity_key: item.key,
        label: getLabel(item),
        metric_name: metricName,
        metric_value: getMetricValue(item)
      });
    });
  });

  return createCsvFile("csv/11_insights.csv", "Lightweight ranked views without duplicating full aggregate tables.", columns, rows);
}

export function createReadmeFile(csvFiles) {
  const columns = ["file", "row_entity", "rows", "notes"];
  const rows = csvFiles.map((file) => ({
    file: file.path,
    row_entity: file.description.split(".")[0],
    rows: file.rowCount,
    notes: file.description
  }));

  return createCsvFile("csv/00_readme.csv", "Index of CSV files included in this export.", columns, rows);
}

export function createAnalyticsCsvFiles(exportData) {
  const tableFiles = [
    createSummaryFile(exportData),
    createDailyMetricsFile(exportData),
    createSessionsFile(exportData),
    createAnswersFile(exportData),
    createQuizStatsFile(exportData),
    createQuestionStatsFile(exportData),
    createTopicStatsFile(exportData),
    createUnattemptedQuizzesFile(exportData),
    createFibAttemptsFile(exportData),
    createFibBlankResultsFile(exportData),
    createInsightsFile(exportData)
  ];

  return [createReadmeFile(tableFiles), ...tableFiles];
}

export function createAnalyticsCsvManifest(exportData, csvFiles) {
  return {
    type: `${ANALYTICS_EXPORT_TYPE}-csv-archive`,
    version: exportData.version,
    exportedAt: exportData.exportedAt,
    exportedAtIso: exportData.exportedAtIso,
    compatibility: exportData.compatibility,
    notes: [
      "CSV files are split by row entity so one row represents one real thing.",
      "Raw stored history is limited to the recent sessions and answers retained by the app.",
      "Percent columns use 0-100 values. Seconds columns are converted from stored millisecond values."
    ],
    files: csvFiles.map((file) => ({
      path: file.path,
      description: file.description,
      rows: file.rowCount,
      columns: file.columns
    }))
  };
}

export function buildAnalyticsCsvArchiveFiles(exportData, baseName) {
  const csvFiles = createAnalyticsCsvFiles(exportData);
  const manifest = createAnalyticsCsvManifest(exportData, csvFiles);
  const root = baseName || createAnalyticsExportBaseName(exportData.exportedAt);

  return [
    {
      path: `${root}/manifest.json`,
      content: JSON.stringify(manifest, null, 2)
    },
    ...csvFiles.map((file) => ({
      path: `${root}/${file.path}`,
      content: file.content
    }))
  ];
}

export function getCrc32Table() {
  if (crc32Table) {
    return crc32Table;
  }

  crc32Table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crc32Table[index] = value >>> 0;
  }

  return crc32Table;
}

export function calculateCrc32(bytes) {
  const table = getCrc32Table();
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = table[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function writeUint16(bytes, offset, value) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
}

export function writeUint32(bytes, offset, value) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

export function getZipDateParts(timestamp) {
  const date = new Date(timestamp || Date.now());
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

export function createZipArchive(files, timestamp) {
  const encoder = new TextEncoder();
  const chunks = [];
  const centralChunks = [];
  const { dosTime, dosDate } = getZipDateParts(timestamp);
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path.replace(/\\/g, "/"));
    const contentBytes = encoder.encode(file.content);
    const crc = calculateCrc32(contentBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const centralHeader = new Uint8Array(46 + nameBytes.length);

    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, ZIP_VERSION_NEEDED);
    writeUint16(localHeader, 6, ZIP_UTF8_FLAG);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, dosTime);
    writeUint16(localHeader, 12, dosDate);
    writeUint32(localHeader, 14, crc);
    writeUint32(localHeader, 18, contentBytes.length);
    writeUint32(localHeader, 22, contentBytes.length);
    writeUint16(localHeader, 26, nameBytes.length);
    localHeader.set(nameBytes, 30);

    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, ZIP_VERSION_NEEDED);
    writeUint16(centralHeader, 6, ZIP_VERSION_NEEDED);
    writeUint16(centralHeader, 8, ZIP_UTF8_FLAG);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, dosTime);
    writeUint16(centralHeader, 14, dosDate);
    writeUint32(centralHeader, 16, crc);
    writeUint32(centralHeader, 20, contentBytes.length);
    writeUint32(centralHeader, 24, contentBytes.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    chunks.push(localHeader, contentBytes);
    centralChunks.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  });

  const centralOffset = offset;
  const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const endHeader = new Uint8Array(22);

  writeUint32(endHeader, 0, 0x06054b50);
  writeUint16(endHeader, 8, files.length);
  writeUint16(endHeader, 10, files.length);
  writeUint32(endHeader, 12, centralSize);
  writeUint32(endHeader, 16, centralOffset);

  return new Blob([...chunks, ...centralChunks, endHeader], { type: "application/zip" });
}

export function downloadBlobExport(fileName, blob) {
  const exportUrl = URL.createObjectURL(blob);
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

export function downloadTextExport(fileName, content, mimeType) {
  return downloadBlobExport(fileName, new Blob([content], { type: mimeType }));
}

export function downloadAnalyticsExport() {
  const exportData = buildAnalyticsExportData();
  return downloadTextExport(
    createExportFileName(exportData.exportedAt),
    JSON.stringify(exportData, null, 2),
    "application/json"
  );
}

export function downloadAnalyticsCsvExport() {
  const exportData = buildAnalyticsExportData();
  const baseName = createAnalyticsExportBaseName(exportData.exportedAt);
  return downloadBlobExport(
    `${baseName}.zip`,
    createZipArchive(buildAnalyticsCsvArchiveFiles(exportData, baseName), exportData.exportedAt)
  );
}
