import { ANALYTICS_BEHAVIOR_THRESHOLD_MS, MAX_RECENT_ANALYTIC_ANSWERS, MAX_RECENT_ANALYTIC_SESSIONS } from "../core/constants.js";
import { roundTo, safeDivide } from "../core/utils.js";

export function createDefaultDailyStat() {
  return {
    studyTimeMs: 0,
    sessionsCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0
  };
}

export function createDefaultBehaviorStats() {
  return {
    thresholdMs: ANALYTICS_BEHAVIOR_THRESHOLD_MS,
    guessWrongCount: 0,
    slowErrorCount: 0,
    fastCorrectCount: 0,
    totalAnswersTracked: 0
  };
}

export function createDefaultScoreMoments() {
  return { count: 0, mean: 0, m2: 0 };
}

export function createDefaultTrendRegression() {
  return { count: 0, sumX: 0, sumY: 0, sumXY: 0, sumX2: 0 };
}

export function createDefaultStreakStats() {
  return { currentCorrectStreak: 0, bestCorrectStreak: 0 };
}

export function createDefaultDropoffStats() {
  return { sessionsTracked: 0, totalDropoff: 0 };
}

export function createDefaultFibStats() {
  return {
    questionsAnswered: 0,
    questionsSolvedFirstTry: 0,
    questionsSolvedSecondTry: 0,
    questionsMissedAfterSecondTry: 0,
    secondTryQuestions: 0,
    firstTryBlanks: 0,
    firstTryCorrect: 0,
    firstTryWrong: 0,
    secondTryBlanks: 0,
    secondTryCorrect: 0,
    secondTryWrong: 0,
    secondTryImproved: 0,
    misplacedCount: 0,
    baitCount: 0,
    missingCount: 0
  };
}

export function createDefaultTopicEntry(label) {
  return {
    label: label || "Unknown",
    attempts: 0,
    totalScorePercent: 0,
    averageScorePercent: 0
  };
}

export function normalizeBooleanResult(value, fallback) {
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

export function getLocalDateKey(timestamp) {
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

export function ensureDailyStatBucket(analytics, dateKey) {
  if (!analytics.dailyStats[dateKey]) {
    analytics.dailyStats[dateKey] = createDefaultDailyStat();
  }
  return analytics.dailyStats[dateKey];
}

export function updateRunningMoments(moments, value) {
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

export function getVarianceFromMoments(moments) {
  if (!moments || (Number(moments.count) || 0) <= 0) {
    return null;
  }
  return safeDivide(Number(moments.m2) || 0, Number(moments.count) || 0, null);
}

export function getStdDevFromMoments(moments) {
  const variance = getVarianceFromMoments(moments);
  return Number.isFinite(variance) ? Math.sqrt(Math.max(variance, 0)) : null;
}

export function getConsistencyFromStdDev(stdDev) {
  const amount = Number(stdDev);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return safeDivide(1, 1 + amount, null);
}

export function updateRegressionTotals(regression, timestamp, scorePercent) {
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

export function getRegressionSlope(regression) {
  if (!regression || (Number(regression.count) || 0) < 2) {
    return null;
  }

  const count = Number(regression.count) || 0;
  const numerator = count * (Number(regression.sumXY) || 0) - (Number(regression.sumX) || 0) * (Number(regression.sumY) || 0);
  const denominator = count * (Number(regression.sumX2) || 0) - (Number(regression.sumX) || 0) ** 2;
  return safeDivide(numerator, denominator, null);
}

export function calculateQuestionMastery(accuracyRatio, averageTimeMs) {
  const accuracy = Number(accuracyRatio);
  const averageTime = Number(averageTimeMs);
  if (!Number.isFinite(accuracy) || !Number.isFinite(averageTime)) {
    return null;
  }

  const denominator = Math.max(Math.log(averageTime + 1), 1);
  return safeDivide(accuracy, denominator, null);
}

export function normalizeFibAttemptSummary(rawAttempt, index) {
  const attempt = rawAttempt && typeof rawAttempt === "object" && !Array.isArray(rawAttempt) ? rawAttempt : {};
  const totalBlanks = Math.max(Number(attempt.totalBlanks) || 0, 0);
  const correctCount = Math.max(Number(attempt.correctCount) || 0, 0);
  const wrongCount = Math.max(
    Number(attempt.wrongCount) || Math.max(totalBlanks - correctCount, 0),
    0
  );
  const results = Array.isArray(attempt.results)
    ? attempt.results
        .filter((result) => result && typeof result === "object" && !Array.isArray(result))
        .map((result) => ({
          blankId: result.blankId !== undefined && result.blankId !== null ? String(result.blankId) : "",
          selectedAnswer: typeof result.selectedAnswer === "string" ? result.selectedAnswer : "",
          correctAnswer: typeof result.correctAnswer === "string" ? result.correctAnswer : "",
          status: typeof result.status === "string" ? result.status : "",
          isCorrect: Boolean(result.isCorrect)
        }))
    : [];

  return {
    attemptNumber: Number.isInteger(Number(attempt.attemptNumber)) ? Math.max(Number(attempt.attemptNumber), 1) : index + 1,
    totalBlanks,
    correctCount,
    wrongCount,
    misplacedCount: Math.max(Number(attempt.misplacedCount) || 0, 0),
    baitCount: Math.max(Number(attempt.baitCount) || 0, 0),
    missingCount: Math.max(Number(attempt.missingCount) || 0, 0),
    isCorrect: Boolean(attempt.isCorrect || (totalBlanks > 0 && correctCount >= totalBlanks)),
    results
  };
}

export function summarizeFibAttempts(rawAttempts) {
  const attempts = Array.isArray(rawAttempts)
    ? rawAttempts.map(normalizeFibAttemptSummary).filter((attempt) => attempt.totalBlanks > 0)
    : [];
  const firstAttempt = attempts[0] || null;
  const secondAttempt = attempts[1] || null;
  const firstTryCorrect = firstAttempt ? firstAttempt.correctCount : 0;
  const secondTryCorrect = secondAttempt ? secondAttempt.correctCount : 0;

  return {
    attempts,
    questionsAnswered: firstAttempt ? 1 : 0,
    questionsSolvedFirstTry: firstAttempt && firstAttempt.isCorrect ? 1 : 0,
    questionsSolvedSecondTry: firstAttempt && !firstAttempt.isCorrect && secondAttempt && secondAttempt.isCorrect ? 1 : 0,
    questionsMissedAfterSecondTry: firstAttempt && !firstAttempt.isCorrect && (!secondAttempt || !secondAttempt.isCorrect) ? 1 : 0,
    secondTryQuestions: secondAttempt ? 1 : 0,
    firstTryBlanks: firstAttempt ? firstAttempt.totalBlanks : 0,
    firstTryCorrect,
    firstTryWrong: firstAttempt ? firstAttempt.wrongCount : 0,
    secondTryBlanks: secondAttempt ? secondAttempt.totalBlanks : 0,
    secondTryCorrect,
    secondTryWrong: secondAttempt ? secondAttempt.wrongCount : 0,
    secondTryImproved: secondAttempt ? Math.max(secondTryCorrect - firstTryCorrect, 0) : 0,
    misplacedCount: attempts.reduce((sum, attempt) => sum + attempt.misplacedCount, 0),
    baitCount: attempts.reduce((sum, attempt) => sum + attempt.baitCount, 0),
    missingCount: attempts.reduce((sum, attempt) => sum + attempt.missingCount, 0)
  };
}

export function accumulateFibStats(targetStats, sourceStats) {
  const target = targetStats || createDefaultFibStats();
  const source = sourceStats || createDefaultFibStats();
  Object.keys(createDefaultFibStats()).forEach((key) => {
    target[key] = (Number(target[key]) || 0) + (Number(source[key]) || 0);
  });
  return target;
}

export function decorateFibStats(rawStats) {
  const stats = {
    ...createDefaultFibStats(),
    ...(rawStats && typeof rawStats === "object" && !Array.isArray(rawStats) ? rawStats : {})
  };
  Object.keys(createDefaultFibStats()).forEach((key) => {
    stats[key] = Number(stats[key]) || 0;
  });
  stats.firstTryAccuracy = safeDivide(stats.firstTryCorrect, stats.firstTryBlanks, null);
  stats.secondTryAccuracy = safeDivide(stats.secondTryCorrect, stats.secondTryBlanks, null);
  stats.secondTryUseRate = safeDivide(stats.secondTryQuestions, stats.questionsAnswered, null);
  stats.secondTryFixRate = safeDivide(stats.questionsSolvedSecondTry, stats.secondTryQuestions, null);
  stats.secondTryBlankFixRate = safeDivide(stats.secondTryImproved, stats.secondTryBlanks, null);
  return stats;
}

export function calculateHalfAccuracy(answers, startIndex, endIndex) {
  const subset = answers.slice(startIndex, endIndex);
  if (!subset.length) {
    return null;
  }
  const correctCount = subset.reduce((sum, answer) => sum + (answer && answer.isCorrect ? 1 : 0), 0);
  return safeDivide(correctCount, subset.length, null);
}

export function calculateSessionDropoff(answers) {
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

export function normalizeTopicEntry(rawEntry, fallbackLabel) {
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

export function normalizeTopicMap(rawMap) {
  const normalized = {};
  if (!rawMap || typeof rawMap !== "object" || Array.isArray(rawMap)) {
    return normalized;
  }

  Object.entries(rawMap).forEach(([key, value]) => {
    normalized[key] = normalizeTopicEntry(value, key);
  });
  return normalized;
}

export function ensureTopicEntry(topicMap, key, label) {
  if (!topicMap[key]) {
    topicMap[key] = createDefaultTopicEntry(label);
  } else if (!topicMap[key].label && label) {
    topicMap[key].label = label;
  }
  return topicMap[key];
}

export function updateTopicEntry(entry, scorePercent) {
  entry.attempts += 1;
  entry.totalScorePercent += Number(scorePercent) || 0;
  entry.averageScorePercent = roundTo(safeDivide(entry.totalScorePercent, entry.attempts, 0), 1);
}

export function decorateQuestionStat(rawStat) {
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
  stat.fibAttempts = Number(stat.fibAttempts) || 0;
  stat.fibQuestionsSolvedFirstTry = Number(stat.fibQuestionsSolvedFirstTry) || 0;
  stat.fibQuestionsSolvedSecondTry = Number(stat.fibQuestionsSolvedSecondTry) || 0;
  stat.fibQuestionsMissedAfterSecondTry = Number(stat.fibQuestionsMissedAfterSecondTry) || 0;
  stat.fibSecondTryQuestions = Number(stat.fibSecondTryQuestions) || 0;
  stat.fibFirstTryBlanks = Number(stat.fibFirstTryBlanks) || 0;
  stat.fibFirstTryCorrect = Number(stat.fibFirstTryCorrect) || 0;
  stat.fibFirstTryWrong = Number(stat.fibFirstTryWrong) || 0;
  stat.fibSecondTryBlanks = Number(stat.fibSecondTryBlanks) || 0;
  stat.fibSecondTryCorrect = Number(stat.fibSecondTryCorrect) || 0;
  stat.fibSecondTryWrong = Number(stat.fibSecondTryWrong) || 0;
  stat.fibSecondTryImproved = Number(stat.fibSecondTryImproved) || 0;
  stat.fibMisplacedCount = Number(stat.fibMisplacedCount) || 0;
  stat.fibBaitCount = Number(stat.fibBaitCount) || 0;
  stat.fibMissingCount = Number(stat.fibMissingCount) || 0;
  stat.fibFirstTryAccuracy = safeDivide(stat.fibFirstTryCorrect, stat.fibFirstTryBlanks, null);
  stat.fibSecondTryAccuracy = safeDivide(stat.fibSecondTryCorrect, stat.fibSecondTryBlanks, null);
  stat.fibSecondTryFixRate = safeDivide(stat.fibQuestionsSolvedSecondTry, stat.fibSecondTryQuestions, null);
  stat.questionAccuracy = safeDivide(stat.correctCount, stat.attempts, null);
  stat.difficulty = stat.attempts ? 1 - stat.questionAccuracy : null;
  stat.errorRate = safeDivide(stat.wrongCount, stat.attempts, null);
  stat.masteryScore = calculateQuestionMastery(stat.questionAccuracy, stat.averageTimeMs);
  return stat;
}

export function decorateQuizStat(rawStat) {
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
  stat.fibStats = decorateFibStats(stat.fibStats);
  return stat;
}

export function createDefaultAnalyticsModel() {
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
    fibStats: createDefaultFibStats(),
    topicStats: {
      byFolder: {},
      byQuizKind: {}
    }
  };
}

export function seedAnalyticsFromHistory(analytics) {
  const shouldSeedBehavior = (Number(analytics.behaviorStats.totalAnswersTracked) || 0) <= 0;
  const shouldSeedStreak = (Number(analytics.streakStats.bestCorrectStreak) || 0) <= 0;
  const shouldSeedDaily = Object.keys(analytics.dailyStats).length === 0;
  const shouldSeedMoments = (Number(analytics.scoreMoments.count) || 0) <= 0;
  const shouldSeedRegression = (Number(analytics.trendRegression.count) || 0) <= 0;
  const shouldSeedTopics =
    !Object.keys(analytics.topicStats.byFolder).length && !Object.keys(analytics.topicStats.byQuizKind).length;
  const shouldSeedDropoff = (Number(analytics.dropoffStats.sessionsTracked) || 0) <= 0;
  const shouldSeedFib = (Number(analytics.fibStats.questionsAnswered) || 0) <= 0;
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

      if (shouldSeedFib) {
        accumulateFibStats(analytics.fibStats, summarizeFibAttempts(answer.fibAttempts));
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

export function normalizeAnalyticsModel(rawAnalytics) {
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
        dropoffRate: Number.isFinite(Number(entry.dropoffRate)) ? Number(entry.dropoffRate) : null,
        fibStats: decorateFibStats(entry.fibStats)
      }))
      .slice(0, MAX_RECENT_ANALYTIC_SESSIONS);
  }

  if (Array.isArray(rawAnalytics.recentAnswers)) {
    analytics.recentAnswers = rawAnalytics.recentAnswers
      .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
      .map((entry) => {
        const fibSummary = summarizeFibAttempts(entry.fibAttempts);
        return {
          ...entry,
          answeredAt: Number(entry.answeredAt) || 0,
          elapsedMs: Number(entry.elapsedMs) || 0,
          attemptCount: Number(entry.attemptCount) || 1,
          fibAttempts: fibSummary.attempts,
          fibFirstTryCorrectCount: Number(entry.fibFirstTryCorrectCount) || fibSummary.firstTryCorrect,
          fibFirstTryWrongCount: Number(entry.fibFirstTryWrongCount) || fibSummary.firstTryWrong,
          fibSecondTryCorrectCount: Number(entry.fibSecondTryCorrectCount) || fibSummary.secondTryCorrect,
          fibSecondTryWrongCount: Number(entry.fibSecondTryWrongCount) || fibSummary.secondTryWrong,
          fibSecondTryImprovedCount: Number(entry.fibSecondTryImprovedCount) || fibSummary.secondTryImproved,
          fibMisplacedCount: Number(entry.fibMisplacedCount) || fibSummary.misplacedCount,
          fibBaitCount: Number(entry.fibBaitCount) || fibSummary.baitCount,
          fibMissingCount: Number(entry.fibMissingCount) || fibSummary.missingCount,
          isCorrect: Boolean(entry.isCorrect)
        };
      })
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

  if (rawAnalytics.fibStats && typeof rawAnalytics.fibStats === "object" && !Array.isArray(rawAnalytics.fibStats)) {
    analytics.fibStats = decorateFibStats(rawAnalytics.fibStats);
  }

  if (rawAnalytics.topicStats && typeof rawAnalytics.topicStats === "object" && !Array.isArray(rawAnalytics.topicStats)) {
    analytics.topicStats.byFolder = normalizeTopicMap(rawAnalytics.topicStats.byFolder);
    analytics.topicStats.byQuizKind = normalizeTopicMap(rawAnalytics.topicStats.byQuizKind);
  }

  seedAnalyticsFromHistory(analytics);
  return analytics;
}
