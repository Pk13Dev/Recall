import { formatDecimal, formatDuration, formatMetricText, formatPercent, formatRatioPercent, formatSignedRatioPercent, formatSignedScoreChange, formatTimestamp, formatTrendSlope } from "./analytics-formatters.js";
import { downloadAnalyticsExport } from "./analytics-export.js";
import { renderAnalyticsCoverageGraph, renderAnalyticsFibSecondTryGraph, renderAnalyticsScoreGraph } from "./analytics-graphs.js";
import { createDefaultAnalyticsModel } from "./analytics-model.js";
import { getAnalyticsSnapshot } from "./analytics-snapshot.js";
import { elements } from "../core/dom.js";
import { clearError, showError, showScreen } from "../core/screens.js";
import { appendChildren, createElement } from "../core/utils.js";
import { closeLibraryEditor } from "../library/library-editor.js";
import { resetVictoryFeedback } from "../ui/effects.js";

const ANALYTICS_EXPORT_BUTTON_ID = "analytics-export-btn";
const ANALYTICS_EXPORT_STATUS_ID = "analytics-export-status";

export function ensureAnalyticsExportStatus(actionsContainer) {
  const existingStatus = document.getElementById(ANALYTICS_EXPORT_STATUS_ID);
  if (existingStatus) {
    return existingStatus;
  }

  const exportStatus = createElement("p", "helper-text", "");
  exportStatus.id = ANALYTICS_EXPORT_STATUS_ID;
  exportStatus.hidden = true;
  actionsContainer.appendChild(exportStatus);
  return exportStatus;
}

export function ensureAnalyticsExportButton() {
  const actionsContainer = elements.analyticsBackBtn && elements.analyticsBackBtn.parentElement;
  if (!actionsContainer) {
    return null;
  }

  const exportStatus = ensureAnalyticsExportStatus(actionsContainer);

  const existingButton = document.getElementById(ANALYTICS_EXPORT_BUTTON_ID);
  if (existingButton) {
    return existingButton;
  }

  const exportButton = createElement("button", "btn btn-secondary btn-compact", "Export Data");
  exportButton.id = ANALYTICS_EXPORT_BUTTON_ID;
  exportButton.type = "button";
  exportButton.addEventListener("click", function () {
    try {
      const exportResult = downloadAnalyticsExport();
      exportStatus.textContent = `Saved ${exportResult.fileName} to ${exportResult.locationHint}.`;
      exportStatus.hidden = false;
    } catch (error) {
      showError(error && error.message ? error.message : "Analytics data could not be exported.");
      return;
    }

    const originalLabel = exportButton.textContent;
    exportButton.textContent = "Exported";
    window.setTimeout(() => {
      exportButton.textContent = originalLabel;
    }, 1600);
  });

  actionsContainer.insertBefore(exportButton, elements.analyticsBackBtn);
  return exportButton;
}

export function createAnalyticsEmptyMessage(message) {
  return createElement("p", "analytics-empty-message", message);
}

export function renderCollection(container, items, emptyMessage, limit, buildItem) {
  container.innerHTML = "";
  if (!items.length) {
    container.appendChild(createAnalyticsEmptyMessage(emptyMessage));
    return;
  }

  items.slice(0, limit).forEach((item) => {
    container.appendChild(buildItem(item));
  });
}

export function createAnalyticsRowCopy(titleText, metaText, detailText) {
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

export function createAnalyticsScoreChip(text, className) {
  return createElement("div", className || "analytics-score-chip", text);
}

export function createAnalyticsAnswerBadge(isCorrect) {
  return createElement(
    "span",
    `analytics-answer-badge ${isCorrect ? "is-correct" : "is-wrong"}`,
    isCorrect ? "Right" : "Wrong"
  );
}

export function createAnalyticsMiniCopy(titleText, metaText) {
  const copy = createElement("div", "analytics-mini-copy");
  copy.appendChild(createElement("p", "analytics-mini-title", titleText));
  if (metaText) {
    copy.appendChild(createElement("p", "analytics-mini-meta", metaText));
  }
  return copy;
}

export function createAnalyticsMiniRow(titleText, metaText, chipText, chipClassName) {
  const row = createElement("article", "analytics-mini-row");
  row.appendChild(createAnalyticsMiniCopy(titleText, metaText));
  if (chipText) {
    row.appendChild(createAnalyticsScoreChip(chipText, chipClassName));
  }
  return row;
}

export function createAnalyticsPerformanceStat(labelText, valueText, noteText) {
  return appendChildren(createElement("article", "analytics-performance-stat"), [
    createElement("p", "analytics-performance-stat-label", labelText),
    createElement("h4", "analytics-performance-stat-value", valueText),
    createElement("p", "analytics-performance-stat-note", noteText)
  ]);
}

export function createAnalyticsPerformanceGroup(titleText, items, emptyMessage, buildItem) {
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

export function renderAnalyticsSessions(sessions) {
  renderCollection(
    elements.analyticsSessionList,
    sessions,
    "No completed quiz sessions yet.",
    4,
    (session) => {
      const fibStats = session.fibStats || {};
      const fibMeta = (Number(fibStats.questionsAnswered) || 0) > 0
        ? ` \u2022 FIB 1st ${fibStats.firstTryCorrect}/${fibStats.firstTryBlanks}, 2nd ${fibStats.secondTryCorrect}/${fibStats.secondTryBlanks}`
        : "";

      return appendChildren(createElement("article", "analytics-row analytics-row-compact"), [
        createAnalyticsRowCopy(
          session.quizName || "Untitled quiz",
          `${session.correctCount || 0}/${session.questionCount || 0} correct \u2022 ${formatDuration(session.durationMs)}`,
          `Delta ${formatMetricText(session.scoreDelta, formatSignedScoreChange)} \u2022 ${formatMetricText(
            session.questionsPerMinute,
            (value) => formatDecimal(value, 1, " qpm")
          )} \u2022 Drop-off ${formatMetricText(session.dropoffRate, formatSignedRatioPercent)}${fibMeta}`
        ),
        createAnalyticsScoreChip(formatPercent(session.scorePercent))
      ]);
    }
  );
}

export function renderAnalyticsQuizzes(snapshot) {
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

export function renderAnalyticsQuestions(questionStats) {
  renderCollection(
    elements.analyticsQuestionList,
    questionStats,
    "Question-level trends will appear here.",
    4,
    (stat) =>
      {
        const fibDetail = (Number(stat.fibAttempts) || 0) > 0
          ? ` \u2022 FIB 1st ${stat.fibFirstTryCorrect}/${stat.fibFirstTryBlanks} \u2022 2nd ${stat.fibSecondTryCorrect}/${stat.fibSecondTryBlanks}`
          : "";
        return appendChildren(createElement("article", "analytics-row analytics-row-compact"), [
          createAnalyticsRowCopy(
            stat.questionText || "Untitled question",
            stat.quizName || "Unknown quiz",
            `Accuracy ${formatRatioPercent(stat.questionAccuracy)} \u2022 Difficulty ${formatRatioPercent(
              stat.difficulty
            )} \u2022 Avg ${formatDuration(stat.averageTimeMs)} \u2022 Mastery ${formatDecimal(stat.masteryScore, 2)}${fibDetail}`
          ),
          createAnalyticsScoreChip(stat.lastResult ? "Last: Right" : "Last: Wrong")
        ]);
      }
  );
}

export function formatFibAnswerDetail(answer) {
  if (!answer || answer.questionType !== "fib") {
    return "";
  }

  const firstText = `First try: ${Number(answer.fibFirstTryCorrectCount) || 0} right, ${
    Number(answer.fibFirstTryWrongCount) || 0
  } wrong`;
  if ((Number(answer.fibSecondTryCorrectCount) || 0) <= 0 && (Number(answer.fibSecondTryWrongCount) || 0) <= 0) {
    return `${firstText}.`;
  }

  return `${firstText}. Second try: ${Number(answer.fibSecondTryCorrectCount) || 0} right, ${
    Number(answer.fibSecondTryWrongCount) || 0
  } wrong; ${Number(answer.fibSecondTryImprovedCount) || 0} fixed.`;
}

export function renderAnalyticsFib(snapshot) {
  const container = elements.analyticsFibList;
  container.innerHTML = "";

  const fibStats = snapshot.fibStats;
  if (!fibStats || (Number(fibStats.questionsAnswered) || 0) <= 0) {
    container.appendChild(createAnalyticsEmptyMessage("FIB retry patterns will appear after fill-in-the-blank answers."));
    return;
  }

  const summaryGrid = createElement("div", "analytics-performance-stat-grid");
  summaryGrid.appendChild(
    createAnalyticsPerformanceStat("FIB Questions", String(fibStats.questionsAnswered), "Completed fill-in-the-blank prompts")
  );
  summaryGrid.appendChild(
    createAnalyticsPerformanceStat(
      "1st Try",
      formatRatioPercent(fibStats.firstTryAccuracy),
      `${fibStats.firstTryCorrect}/${fibStats.firstTryBlanks} blanks right`
    )
  );
  summaryGrid.appendChild(
    createAnalyticsPerformanceStat(
      "2nd Try",
      formatRatioPercent(fibStats.secondTryAccuracy),
      `${fibStats.secondTryCorrect}/${fibStats.secondTryBlanks} retry blanks right`
    )
  );
  summaryGrid.appendChild(
    createAnalyticsPerformanceStat(
      "Retry Saves",
      String(fibStats.secondTryImproved),
      `${fibStats.questionsSolvedSecondTry} question${fibStats.questionsSolvedSecondTry === 1 ? "" : "s"} recovered`
    )
  );
  container.appendChild(summaryGrid);

  const list = createElement("div", "analytics-list analytics-list-compact");
  if (!snapshot.topFibTroubleQuestions.length) {
    list.appendChild(createAnalyticsEmptyMessage("No difficult FIB questions yet."));
  } else {
    snapshot.topFibTroubleQuestions.forEach((stat) => {
      list.appendChild(
        createAnalyticsMiniRow(
          stat.questionText || "Untitled FIB",
          `1st try ${stat.fibFirstTryCorrect}/${stat.fibFirstTryBlanks} right \u2022 2nd try ${stat.fibSecondTryCorrect}/${stat.fibSecondTryBlanks} right`,
          `${stat.fibFirstTryWrong} missed`
        )
      );
    });
  }
  container.appendChild(list);
}

export function renderAnalyticsAnswers(answers) {
  renderCollection(
    elements.analyticsAnswerList,
    answers,
    "Recent answers will show up here.",
    4,
    (answer) => {
      const fibDetailText = formatFibAnswerDetail(answer);
      const detailText = fibDetailText || (answer.isCorrect
        ? `Correct in ${formatDuration(answer.elapsedMs)}.`
        : `Picked "${answer.selectedOption || "Unknown"}". Correct: "${answer.correctOption || "Unknown"}".`);

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

export function renderAnalyticsBehavior(snapshot) {
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

export function renderAnalyticsTime(snapshot) {
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

export function renderAnalyticsTopics(snapshot) {
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

export function renderAnalyticsScreen() {
  ensureAnalyticsExportButton();
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
  renderAnalyticsFib(snapshot);
  renderAnalyticsTime(snapshot);
  renderAnalyticsTopics(snapshot);
  renderAnalyticsScoreGraph(snapshot.trendSeries);
  renderAnalyticsCoverageGraph(snapshot);
  renderAnalyticsFibSecondTryGraph(snapshot.fibStats);
}

export function openAnalyticsScreen() {
  closeLibraryEditor();
  clearError();
  resetVictoryFeedback();
  renderAnalyticsScreen();
  showScreen("analytics");
}
