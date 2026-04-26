import { nextAnalyticsId } from "../analytics/analytics-recording.js";
import { DISPLAY_OPTION_COUNT, MAX_QUESTIONS_PER_ATTEMPT } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { clearError, showScreen } from "../core/screens.js";
import { quizState } from "../core/state.js";
import { cloneQuestions, shuffleList } from "../core/utils.js";
import { renderQuestion } from "./quiz-renderer.js";
import { getFolder, getFolderPath } from "../storage/library-model.js";
import { normalizeEntityName } from "../storage/naming.js";
import { resetVictoryFeedback } from "../ui/effects.js";
import { finishQuiz } from "./quiz-results.js";

export function selectQuestionOptionsForAttempt(question) {
  const correctOption = question.options[question.correctIndex];
  const incorrectOptions = question.options.filter((option, index) => index !== question.correctIndex);
  const selectedIncorrectOptions = shuffleList(incorrectOptions).slice(0, DISPLAY_OPTION_COUNT - 1);
  const attemptOptions = shuffleList([correctOption, ...selectedIncorrectOptions]);

  return {
    id: question.id,
    question: question.question,
    options: attemptOptions,
    correctIndex: attemptOptions.indexOf(correctOption)
  };
}

export function prepareQuizQuestionsForAttempt(questions, questionLimit) {
  const maxQuestions = Number.isInteger(questionLimit) && questionLimit > 0
    ? questionLimit
    : MAX_QUESTIONS_PER_ATTEMPT;

  return shuffleList(cloneQuestions(questions))
    .slice(0, maxQuestions)
    .map(selectQuestionOptionsForAttempt);
}

export function buildQuizLaunchContext(config) {
  const source = config && typeof config.source === "string" ? config.source : "library";
  const folder = config && typeof config.folderId === "string" ? getFolder(config.folderId) : null;

  return {
    source,
    quizId: config && typeof config.quizId === "string" ? config.quizId : null,
    quizName: normalizeEntityName(config && config.quizName, source === "demo" ? "Demo Quiz" : "Quiz"),
    quizKind: config && typeof config.quizKind === "string" ? config.quizKind : source === "demo" ? "demo" : "quiz",
    folderId: folder ? folder.id : null,
    folderName: folder ? folder.name : source === "demo" ? "Demo" : "Library",
    folderPath: folder ? getFolderPath(folder.id) : source === "demo" ? "/demo" : "/"
  };
}

export function getLaunchContextForQuiz(quiz) {
  return buildQuizLaunchContext({
    source: "library",
    quizId: quiz.id,
    quizName: quiz.name,
    quizKind: quiz.kind || "quiz",
    folderId: quiz.parentFolderId
  });
}

export function startQuiz(questions, launchConfig) {
  resetVictoryFeedback();
  const attemptQuestions = prepareQuizQuestionsForAttempt(questions, launchConfig && launchConfig.questionLimit);
  quizState.questions = attemptQuestions;
  quizState.currentQuestionIndex = 0;
  quizState.selectedIndex = null;
  quizState.hasAnswered = false;
  quizState.score = 0;
  quizState.activeSession = {
    id: nextAnalyticsId("session", "sess"),
    startedAt: Date.now(),
    questionCount: attemptQuestions.length,
    answers: [],
    ...buildQuizLaunchContext(launchConfig)
  };
  quizState.questionStartedAt = 0;
  clearError();
  showScreen("quiz");
  renderQuestion();
}

export function nextQuestion() {
  if (quizState.selectedIndex === null) {
    return;
  }

  quizState.currentQuestionIndex += 1;
  if (quizState.currentQuestionIndex >= quizState.questions.length) {
    finishQuiz();
    return;
  }

  renderQuestion();
}

export function resetQuizState() {
  quizState.questions = [];
  quizState.currentQuestionIndex = 0;
  quizState.selectedIndex = null;
  quizState.score = 0;
  quizState.hasAnswered = false;
  quizState.activeSession = null;
  quizState.questionStartedAt = 0;
  elements.fileInput.value = "";
  elements.folderInput.value = "";
}
