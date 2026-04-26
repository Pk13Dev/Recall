import { createDefaultAnalyticsModel, createDefaultBehaviorStats, decorateQuestionStat, decorateQuizStat, getConsistencyFromStdDev, getRegressionSlope, getStdDevFromMoments, getVarianceFromMoments } from "./analytics-model.js";
import { ANALYTICS_ROLLING_WINDOW } from "../core/constants.js";
import { libraryRuntime } from "../core/state.js";
import { safeDivide } from "../core/utils.js";
import { getGoalPercent } from "../ui/settings.js";

export function buildRollingAverageSeries(sessions, windowSize) {
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

export function buildDailyMetrics(dailyStats) {
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

export function buildTopicMetrics(topicMap) {
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

export function getAnalyticsSnapshot() {
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
