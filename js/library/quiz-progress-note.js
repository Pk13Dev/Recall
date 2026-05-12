import { decorateFibStats, decorateQuestionStat, decorateQuizStat } from "../analytics/analytics-model.js";
import { libraryRuntime } from "../core/state.js";
import { normalizeGoalPercent, roundTo, safeDivide } from "../core/utils.js";

const QUIZ_TREND_THRESHOLD = 5;

const PROGRESS_STATES = {
  good: {
    className: "is-good",
    label: "Good progress"
  },
  steady: {
    className: "is-steady",
    label: "Steady progress"
  },
  attention: {
    className: "is-attention",
    label: "Needs attention"
  }
};

function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function formatRatioPercent(value) {
  if (value === null || value === undefined) {
    return "n/a";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "n/a";
  }
  return `${Math.round(amount * 100)}%`;
}

function formatSignedPoints(value) {
  if (value === null || value === undefined) {
    return "trend n/a";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "trend n/a";
  }

  const rounded = roundTo(amount, 0);
  if (rounded > 0) {
    return `+${rounded} pts`;
  }
  if (rounded < 0) {
    return `${rounded} pts`;
  }
  return "0 pts";
}

function averageScores(sessions) {
  if (!sessions.length) {
    return null;
  }

  return safeDivide(
    sessions.reduce((sum, session) => sum + (Number(session.scorePercent) || 0), 0),
    sessions.length,
    null
  );
}

function getQuizSessions(analytics, quizId) {
  return (analytics.recentSessions || [])
    .filter((session) => session && session.quizId === quizId)
    .sort((left, right) => (Number(left.completedAt) || 0) - (Number(right.completedAt) || 0));
}

function calculateRecentTrend(sessions, stat) {
  if (sessions.length >= 4) {
    const recentWindow = sessions.slice(-4);
    const midpoint = Math.ceil(recentWindow.length / 2);
    const earlierAverage = averageScores(recentWindow.slice(0, midpoint));
    const laterAverage = averageScores(recentWindow.slice(midpoint));
    if (Number.isFinite(earlierAverage) && Number.isFinite(laterAverage)) {
      return laterAverage - earlierAverage;
    }
  }

  if (sessions.length >= 2) {
    const previous = sessions[sessions.length - 2];
    const latest = sessions[sessions.length - 1];
    return (Number(latest.scorePercent) || 0) - (Number(previous.scorePercent) || 0);
  }

  const retentionChange = Number(stat.retentionChange);
  return Number.isFinite(retentionChange) && (Number(stat.attempts) || 0) > 1 ? retentionChange : null;
}

function getQuizQuestionStats(analytics, quizId) {
  return Object.values(analytics.questionStats || {})
    .filter((stat) => stat && stat.quizId === quizId)
    .map((stat) => decorateQuestionStat(stat));
}

function summarizeMcqAnalytics(questionStats) {
  const mcqStats = questionStats.filter((stat) => (Number(stat.fibAttempts) || 0) <= 0);
  const attempts = mcqStats.reduce((sum, stat) => sum + (Number(stat.attempts) || 0), 0);
  const correct = mcqStats.reduce((sum, stat) => sum + (Number(stat.correctCount) || 0), 0);

  return {
    attempts,
    correct,
    accuracy: safeDivide(correct, attempts, null)
  };
}

function summarizeFibAnalytics(stat) {
  const fibStats = decorateFibStats(stat.fibStats);
  const solvedQuestions =
    (Number(fibStats.questionsSolvedFirstTry) || 0) + (Number(fibStats.questionsSolvedSecondTry) || 0);

  return {
    attempts: Number(fibStats.questionsAnswered) || 0,
    solveRate: safeDivide(solvedQuestions, fibStats.questionsAnswered, null),
    firstTryAccuracy: fibStats.firstTryAccuracy
  };
}

function getProgressState(stat, trend, mcqSummary, fibSummary, goalPercent) {
  const averageScore = Number(stat.averageScorePercent) || 0;
  const lastScore = Number(stat.lastScorePercent) || 0;
  const lowThreshold = Math.max(45, goalPercent - 25);
  const isDeclining = Number.isFinite(trend) && trend <= -QUIZ_TREND_THRESHOLD;
  const isImproving = Number.isFinite(trend) && trend >= QUIZ_TREND_THRESHOLD;
  const weakMcq = mcqSummary.attempts > 0 && Number.isFinite(mcqSummary.accuracy) && mcqSummary.accuracy < 0.5;
  const weakFib = fibSummary.attempts > 0 && Number.isFinite(fibSummary.solveRate) && fibSummary.solveRate < 0.5;

  if (isDeclining || averageScore < lowThreshold || lastScore < lowThreshold || weakMcq || weakFib) {
    return "attention";
  }

  if (averageScore >= goalPercent || isImproving) {
    return "good";
  }

  return "steady";
}

function buildDetailText(stat, trend, mcqSummary, fibSummary) {
  const parts = [
    `${Number(stat.attempts) || 0} attempt${(Number(stat.attempts) || 0) === 1 ? "" : "s"}`,
    `avg ${formatPercent(stat.averageScorePercent)}`,
    `last ${formatPercent(stat.lastScorePercent)}`,
    formatSignedPoints(trend)
  ];

  if (mcqSummary.attempts > 0) {
    parts.push(`MCQ ${formatRatioPercent(mcqSummary.accuracy)}`);
  }

  if (fibSummary.attempts > 0) {
    parts.push(`FIB solved ${formatRatioPercent(fibSummary.solveRate)}`);
    parts.push(`FIB 1st try ${formatRatioPercent(fibSummary.firstTryAccuracy)}`);
  }

  return parts.join(" / ");
}

export function buildQuizProgressNote(quiz) {
  const analytics = libraryRuntime.model && libraryRuntime.model.analytics;
  const rawStat = analytics && quiz ? analytics.quizStats[quiz.id] : null;
  if (!rawStat || (Number(rawStat.attempts) || 0) <= 0) {
    return null;
  }

  const stat = decorateQuizStat({
    ...rawStat,
    quizId: quiz.id,
    quizName: quiz.name,
    quizKind: quiz.kind || rawStat.quizKind || "quiz",
    folderId: quiz.parentFolderId
  });
  const sessions = getQuizSessions(analytics, quiz.id);
  const questionStats = getQuizQuestionStats(analytics, quiz.id);
  const mcqSummary = summarizeMcqAnalytics(questionStats);
  const fibSummary = summarizeFibAnalytics(stat);
  const goalPercent = normalizeGoalPercent(libraryRuntime.model.settings && libraryRuntime.model.settings.goalPercent);
  const trend = calculateRecentTrend(sessions, stat);
  const state = getProgressState(stat, trend, mcqSummary, fibSummary, goalPercent);
  const config = PROGRESS_STATES[state];
  const detailText = buildDetailText(stat, trend, mcqSummary, fibSummary);

  return {
    state,
    className: config.className,
    label: config.label,
    meta: `Avg ${formatPercent(stat.averageScorePercent)} / ${formatSignedPoints(trend)}`,
    detailText,
    ariaLabel: `${config.label}: ${detailText}`
  };
}
