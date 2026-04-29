import { nextAnalyticsId } from "../analytics/analytics-recording.js";
import { DISPLAY_OPTION_COUNT, MAX_QUESTIONS_PER_ATTEMPT } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { clearError, showScreen } from "../core/screens.js";
import { quizState } from "../core/state.js";
import { normalizeComparableText, cloneQuestions, shuffleList } from "../core/utils.js";
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
    type: "multiple-choice",
    question: question.question,
    options: attemptOptions,
    correctIndex: attemptOptions.indexOf(correctOption)
  };
}

export function fillInBlankAcceptsAnswer(blank, answerText) {
  const normalizedAnswer = normalizeComparableText(answerText);
  return blank.acceptedAnswers.some((acceptedAnswer) => normalizeComparableText(acceptedAnswer) === normalizedAnswer);
}

export function getFillInBlankActiveBlanks(question) {
  const maxBlanks = Number.isInteger(question.maxBlanks) && question.maxBlanks > 0
    ? Math.min(question.maxBlanks, question.blanks.length)
    : question.blanks.length;
  const candidateBlanks = question.selectionMode === "random" ? shuffleList(question.blanks) : question.blanks.slice();
  const selectedBlankIds = new Set(candidateBlanks.slice(0, maxBlanks).map((blank) => blank.id));

  return question.blanks.filter((blank) => selectedBlankIds.has(blank.id)).map((blank) => ({
    id: blank.id,
    answer: blank.answer,
    acceptedAnswers: [...blank.acceptedAnswers],
    hint: blank.hint
  }));
}

export function getFillInBlankExtraWords(question, requiredWords) {
  const requiredCounts = requiredWords.reduce((counts, word) => {
    const key = normalizeComparableText(word);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const usedExtraKeys = new Set();

  return [...question.wordBank, ...question.baitWords].filter((word) => {
    const key = normalizeComparableText(word);
    if (!key) {
      return false;
    }

    if (requiredCounts[key]) {
      requiredCounts[key] -= 1;
      return false;
    }

    if (usedExtraKeys.has(key)) {
      return false;
    }

    usedExtraKeys.add(key);
    return true;
  });
}

export function selectFillInBlankWordsForAttempt(question, activeBlanks) {
  const requiredWords = activeBlanks.map((blank) => blank.answer);
  const extraWords = getFillInBlankExtraWords(question, requiredWords);

  return shuffleList([...requiredWords, ...extraWords]).map((word, index) => {
    const acceptedBlankIds = activeBlanks
      .filter((blank) => fillInBlankAcceptsAnswer(blank, word))
      .map((blank) => blank.id);

    return {
      id: `fib-word-${index + 1}`,
      text: word,
      acceptedBlankIds,
      isBait: acceptedBlankIds.length === 0
    };
  });
}

export function selectFillInBlankForAttempt(question) {
  const activeBlanks = getFillInBlankActiveBlanks(question);

  return {
    id: question.id,
    type: "fib",
    question: question.question,
    title: question.title,
    paragraph: question.paragraph,
    maxBlanks: question.maxBlanks,
    selectionMode: question.selectionMode,
    blanks: question.blanks.map((blank) => ({
      id: blank.id,
      answer: blank.answer,
      acceptedAnswers: [...blank.acceptedAnswers],
      hint: blank.hint
    })),
    activeBlanks,
    activeBlankIds: activeBlanks.map((blank) => blank.id),
    wordBank: selectFillInBlankWordsForAttempt(question, activeBlanks)
  };
}

export function selectQuestionForAttempt(question) {
  if (question && question.type === "fib") {
    return selectFillInBlankForAttempt(question);
  }

  return selectQuestionOptionsForAttempt(question);
}

export function prepareQuizQuestionsForAttempt(questions, questionLimit) {
  const maxQuestions = Number.isInteger(questionLimit) && questionLimit > 0
    ? questionLimit
    : MAX_QUESTIONS_PER_ATTEMPT;

  return shuffleList(cloneQuestions(questions))
    .slice(0, maxQuestions)
    .map(selectQuestionForAttempt);
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
  quizState.submitCurrentAnswer = null;
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
  if (!quizState.hasAnswered && typeof quizState.submitCurrentAnswer === "function") {
    quizState.submitCurrentAnswer();
    return;
  }

  if (!quizState.hasAnswered && quizState.selectedIndex === null) {
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
  quizState.submitCurrentAnswer = null;
  quizState.activeSession = null;
  quizState.questionStartedAt = 0;
  elements.fileInput.value = "";
  elements.folderInput.value = "";
}
