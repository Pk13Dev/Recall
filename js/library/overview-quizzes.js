import { clearError, showError } from "../core/screens.js";
import { shuffleList } from "../core/utils.js";
import { getLaunchContextForQuiz, startQuiz } from "../quiz/quiz-runtime.js";
import { getFolder, getQuiz } from "../storage/library-model.js";
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

export function createOverviewQuestions(sourceQuizzes) {
  const selectedQuestions = sourceQuizzes.map((quiz) => {
    const randomIndex = Math.floor(Math.random() * quiz.questions.length);
    const question = quiz.questions[randomIndex];
    return {
      question: question.question,
      options: [...question.options],
      correctIndex: question.correctIndex
    };
  });

  return shuffleList(selectedQuestions).map((question, index) => ({
    id: index + 1,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex
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
