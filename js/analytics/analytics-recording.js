import { accumulateFibStats, calculateQuestionMastery, calculateSessionDropoff, createDefaultFibStats, decorateFibStats, decorateQuestionStat, decorateQuizStat, ensureDailyStatBucket, ensureTopicEntry, getConsistencyFromStdDev, getLocalDateKey, summarizeFibAttempts, updateRegressionTotals, updateRunningMoments, updateTopicEntry } from "./analytics-model.js";
import { MAX_RECENT_ANALYTIC_ANSWERS, MAX_RECENT_ANALYTIC_SESSIONS } from "../core/constants.js";
import { libraryRuntime, quizState } from "../core/state.js";
import { safeDivide } from "../core/utils.js";
import { scheduleLibrarySave } from "../storage/storage.js";

export function nextAnalyticsId(counterKey, prefix) {
  const analytics = libraryRuntime.model.analytics;
  analytics.counters[counterKey] += 1;
  return `${prefix}-${analytics.counters[counterKey]}`;
}

export function pushLimitedEntry(list, entry, maxItems) {
  list.unshift(entry);
  if (list.length > maxItems) {
    list.length = maxItems;
  }
}

export function buildQuizAnalyticsKey(session) {
  if (session.quizId) {
    return session.quizId;
  }
  return `${session.source}:${session.folderPath}:${session.quizName}`;
}

export function buildQuestionAnalyticsKey(session, question, questionIndex) {
  const questionId = question && question.id !== undefined && question.id !== null ? String(question.id) : `q-${questionIndex + 1}`;
  const normalizedText =
    typeof question.question === "string"
      ? question.question.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 160)
      : `question-${questionIndex + 1}`;
  return `${buildQuizAnalyticsKey(session)}::${questionId}::${normalizedText}`;
}

export function summarizeSessionFibAnswers(answers) {
  const stats = createDefaultFibStats();
  (Array.isArray(answers) ? answers : []).forEach((answer) => {
    accumulateFibStats(stats, summarizeFibAttempts(answer && answer.fibAttempts));
  });
  return decorateFibStats(stats);
}

export function recordQuestionAnalytics(currentQuestion, selectedIndex, isCorrect, answeredAt, answerDetails) {
  if (!libraryRuntime.model || !quizState.activeSession) {
    return;
  }

  const analytics = libraryRuntime.model.analytics;
  const elapsedMs = Math.max(answeredAt - (quizState.questionStartedAt || answeredAt), 0);
  const session = quizState.activeSession;
  const questionNumber = quizState.currentQuestionIndex + 1;
  const questionKey = buildQuestionAnalyticsKey(session, currentQuestion, quizState.currentQuestionIndex);
  const questionType = answerDetails && answerDetails.questionType ? answerDetails.questionType : currentQuestion.type || "multiple-choice";
  const fibSummary = summarizeFibAttempts(answerDetails && answerDetails.fibAttempts);
  const selectedOption =
    answerDetails && typeof answerDetails.selectedOption === "string"
      ? answerDetails.selectedOption
      : currentQuestion.options[selectedIndex];
  const correctOption =
    answerDetails && typeof answerDetails.correctOption === "string"
      ? answerDetails.correctOption
      : currentQuestion.options[currentQuestion.correctIndex];
  const correctIndex =
    questionType === "fib"
      ? null
      : currentQuestion.correctIndex;
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
    questionType,
    selectedIndex,
    selectedOption,
    correctIndex,
    correctOption,
    attemptCount: answerDetails && Number.isInteger(answerDetails.attemptCount) ? answerDetails.attemptCount : 1,
    fibAttempts: fibSummary.attempts,
    fibFirstTryCorrectCount: fibSummary.firstTryCorrect,
    fibFirstTryWrongCount: fibSummary.firstTryWrong,
    fibSecondTryCorrectCount: fibSummary.secondTryCorrect,
    fibSecondTryWrongCount: fibSummary.secondTryWrong,
    fibSecondTryImprovedCount: fibSummary.secondTryImproved,
    fibMisplacedCount: fibSummary.misplacedCount,
    fibBaitCount: fibSummary.baitCount,
    fibMissingCount: fibSummary.missingCount,
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
  if (fibSummary.questionsAnswered) {
    analytics.fibStats = accumulateFibStats(analytics.fibStats || createDefaultFibStats(), fibSummary);
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
    correctOption,
    fastWrongCount: 0,
    slowWrongCount: 0,
    fastCorrectCount: 0,
    fibAttempts: 0,
    fibQuestionsSolvedFirstTry: 0,
    fibQuestionsSolvedSecondTry: 0,
    fibQuestionsMissedAfterSecondTry: 0,
    fibSecondTryQuestions: 0,
    fibFirstTryBlanks: 0,
    fibFirstTryCorrect: 0,
    fibFirstTryWrong: 0,
    fibSecondTryBlanks: 0,
    fibSecondTryCorrect: 0,
    fibSecondTryWrong: 0,
    fibSecondTryImproved: 0,
    fibMisplacedCount: 0,
    fibBaitCount: 0,
    fibMissingCount: 0
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
  questionStat.lastSelectedOption = selectedOption;
  questionStat.correctOption = correctOption;
  if (!isCorrect && isFastAnswer) {
    questionStat.fastWrongCount += 1;
  }
  if (!isCorrect && isSlowAnswer) {
    questionStat.slowWrongCount += 1;
  }
  if (isCorrect && isFastAnswer) {
    questionStat.fastCorrectCount += 1;
  }
  if (fibSummary.questionsAnswered) {
    questionStat.fibAttempts = (Number(questionStat.fibAttempts) || 0) + fibSummary.questionsAnswered;
    questionStat.fibQuestionsSolvedFirstTry =
      (Number(questionStat.fibQuestionsSolvedFirstTry) || 0) + fibSummary.questionsSolvedFirstTry;
    questionStat.fibQuestionsSolvedSecondTry =
      (Number(questionStat.fibQuestionsSolvedSecondTry) || 0) + fibSummary.questionsSolvedSecondTry;
    questionStat.fibQuestionsMissedAfterSecondTry =
      (Number(questionStat.fibQuestionsMissedAfterSecondTry) || 0) + fibSummary.questionsMissedAfterSecondTry;
    questionStat.fibSecondTryQuestions = (Number(questionStat.fibSecondTryQuestions) || 0) + fibSummary.secondTryQuestions;
    questionStat.fibFirstTryBlanks = (Number(questionStat.fibFirstTryBlanks) || 0) + fibSummary.firstTryBlanks;
    questionStat.fibFirstTryCorrect = (Number(questionStat.fibFirstTryCorrect) || 0) + fibSummary.firstTryCorrect;
    questionStat.fibFirstTryWrong = (Number(questionStat.fibFirstTryWrong) || 0) + fibSummary.firstTryWrong;
    questionStat.fibSecondTryBlanks = (Number(questionStat.fibSecondTryBlanks) || 0) + fibSummary.secondTryBlanks;
    questionStat.fibSecondTryCorrect = (Number(questionStat.fibSecondTryCorrect) || 0) + fibSummary.secondTryCorrect;
    questionStat.fibSecondTryWrong = (Number(questionStat.fibSecondTryWrong) || 0) + fibSummary.secondTryWrong;
    questionStat.fibSecondTryImproved = (Number(questionStat.fibSecondTryImproved) || 0) + fibSummary.secondTryImproved;
    questionStat.fibMisplacedCount = (Number(questionStat.fibMisplacedCount) || 0) + fibSummary.misplacedCount;
    questionStat.fibBaitCount = (Number(questionStat.fibBaitCount) || 0) + fibSummary.baitCount;
    questionStat.fibMissingCount = (Number(questionStat.fibMissingCount) || 0) + fibSummary.missingCount;
  }
  analytics.questionStats[questionKey] = decorateQuestionStat(questionStat);

  scheduleLibrarySave();
}

export function completeAnalyticsSession(scorePercent) {
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
  const sessionFibStats = summarizeSessionFibAnswers(session.answers);
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
    dropoffRate: dropoff.dropoffRate,
    fibStats: sessionFibStats,
    fibQuestionCount: sessionFibStats.questionsAnswered,
    fibFirstTryCorrect: sessionFibStats.firstTryCorrect,
    fibFirstTryWrong: sessionFibStats.firstTryWrong,
    fibSecondTryCorrect: sessionFibStats.secondTryCorrect,
    fibSecondTryWrong: sessionFibStats.secondTryWrong
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
    fibStats: createDefaultFibStats(),
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
  quizStat.fibStats = accumulateFibStats(quizStat.fibStats || createDefaultFibStats(), sessionFibStats);
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
