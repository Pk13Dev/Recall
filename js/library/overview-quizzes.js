import { buildQuestionAnalyticsKey } from "../analytics/analytics-keys.js";
import { decorateQuestionStat } from "../analytics/analytics-model.js";
import { clearError, showError } from "../core/screens.js";
import { libraryRuntime } from "../core/state.js";
import { shuffleList } from "../core/utils.js";
import { getLaunchContextForQuiz, startQuiz } from "../quiz/quiz-runtime.js";
import { getFolder, getFolderPath, getQuiz } from "../storage/library-model.js";
import { ensureUniqueQuizName, normalizeEntityName } from "../storage/naming.js";
import { addQuizRecord, saveLibraryModel } from "../storage/storage.js";

export function getQuizTypeLabel(quiz) {
  return quiz.kind === "overview" ? "Overview" : "Quiz";
}

export function getEligibleOverviewSourceQuizzes(folderId) {
  const folder = getFolder(folderId);
  if (!folder || folder.childFolderIds.length > 0) {
    return [];
  }

  return folder.quizIds
    .map((quizId) => getQuiz(quizId))
    .filter((quiz) => quiz && quiz.kind !== "overview");
}

export function canGenerateOverview(folderId) {
  return getEligibleOverviewSourceQuizzes(folderId).length > 0;
}

function getSourceQuizAnalyticsSession(quiz) {
  const folder = getFolder(quiz.parentFolderId);
  return {
    source: "library",
    quizId: quiz.id,
    quizName: quiz.name,
    quizKind: quiz.kind || "quiz",
    folderId: folder ? folder.id : null,
    folderName: folder ? folder.name : "Library",
    folderPath: folder ? getFolderPath(folder.id) : "/"
  };
}

export function buildOverviewSourceQuestionKey(quiz, question, questionIndex) {
  return buildQuestionAnalyticsKey(getSourceQuizAnalyticsSession(quiz), question, questionIndex);
}

function getOverviewQuestionStat(quiz, question, questionIndex) {
  const questionKey = buildOverviewSourceQuestionKey(quiz, question, questionIndex);
  const rawStat = libraryRuntime.model && libraryRuntime.model.analytics
    ? libraryRuntime.model.analytics.questionStats[questionKey]
    : null;
  return rawStat ? decorateQuestionStat(rawStat) : null;
}

function createOverviewQuestionCandidate(quiz, question, questionIndex) {
  const stat = getOverviewQuestionStat(quiz, question, questionIndex);
  return {
    quiz,
    question,
    questionIndex,
    attempts: stat ? Number(stat.attempts) || 0 : 0,
    correctCount: stat ? Number(stat.correctCount) || 0 : 0,
    wrongCount: stat ? Number(stat.wrongCount) || 0 : 0,
    lastAnsweredAt: stat ? Number(stat.lastAnsweredAt) || 0 : 0
  };
}

function hasRepeatedFailures(candidate) {
  return candidate.wrongCount >= 2 && candidate.wrongCount >= candidate.correctCount;
}

function hasMixedHistory(candidate) {
  return candidate.correctCount > 0 && candidate.wrongCount > 0;
}

function comparePriorityFlag(leftValue, rightValue) {
  if (leftValue === rightValue) {
    return 0;
  }
  return leftValue ? -1 : 1;
}

export function compareOverviewQuestionCandidates(left, right) {
  const unattemptedGap = comparePriorityFlag(left.attempts === 0, right.attempts === 0);
  if (unattemptedGap !== 0 || left.attempts === 0 || right.attempts === 0) {
    return unattemptedGap;
  }

  const repeatedFailureGap = comparePriorityFlag(hasRepeatedFailures(left), hasRepeatedFailures(right));
  if (repeatedFailureGap !== 0) {
    return repeatedFailureGap;
  }

  if (hasRepeatedFailures(left) && hasRepeatedFailures(right)) {
    const wrongGap = right.wrongCount - left.wrongCount;
    if (wrongGap !== 0) {
      return wrongGap;
    }

    const correctGap = left.correctCount - right.correctCount;
    if (correctGap !== 0) {
      return correctGap;
    }
  }

  const attemptsGap = left.attempts - right.attempts;
  if (attemptsGap !== 0) {
    return attemptsGap;
  }

  const mixedHistoryGap = comparePriorityFlag(hasMixedHistory(left), hasMixedHistory(right));
  if (mixedHistoryGap !== 0) {
    return mixedHistoryGap;
  }

  const correctLeadGap = (left.correctCount - left.wrongCount) - (right.correctCount - right.wrongCount);
  if (correctLeadGap !== 0) {
    return correctLeadGap;
  }

  const wrongGap = right.wrongCount - left.wrongCount;
  if (wrongGap !== 0) {
    return wrongGap;
  }

  return left.lastAnsweredAt - right.lastAnsweredAt;
}

function selectOverviewQuestionForQuiz(quiz) {
  const candidates = quiz.questions.map((question, index) => createOverviewQuestionCandidate(quiz, question, index));
  const sortedCandidates = candidates.slice().sort(compareOverviewQuestionCandidates);
  const highestPriority = sortedCandidates[0];
  const tiedCandidates = sortedCandidates.filter(
    (candidate) => compareOverviewQuestionCandidates(candidate, highestPriority) === 0
  );
  return shuffleList(tiedCandidates)[0];
}

function createOverviewQuestionFromCandidate(candidate) {
  const question = candidate.question;
  return {
    id: question.id,
    question: question.question,
    options: [...question.options],
    correctIndex: question.correctIndex,
    sourceQuizId: candidate.quiz.id,
    sourceQuestionId: question.id,
    sourceQuestionIndex: candidate.questionIndex
  };
}

export function createOverviewQuestions(sourceQuizzes) {
  const selectedQuestions = sourceQuizzes
    .map(selectOverviewQuestionForQuiz)
    .filter(Boolean)
    .map(createOverviewQuestionFromCandidate);

  return shuffleList(selectedQuestions).map((question, index) => ({
    id: index + 1,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    sourceQuizId: question.sourceQuizId,
    sourceQuestionId: question.sourceQuestionId,
    sourceQuestionIndex: question.sourceQuestionIndex
  }));
}

export async function generateOverviewQuizForFolder(folderId, shouldStartQuiz) {
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

  await saveLibraryModel();
  const { refreshLibraryUI } = await import("./library-renderer.js");
  refreshLibraryUI();

  if (shouldStartQuiz) {
    startQuiz(overviewQuiz.questions, getLaunchContextForQuiz(overviewQuiz));
  }
}
