import { MAX_OPTIONS_PER_QUESTION, MIN_OPTIONS_PER_QUESTION } from "../core/constants.js";
import { clamp } from "../core/utils.js";

export const CREATOR_QUESTION_TYPES = {
  multipleChoice: "multiple-choice",
  fib: "fib"
};

let nextQuestionId = 1;

function nextCreatorQuestionId() {
  const questionId = `creator-question-${nextQuestionId}`;
  nextQuestionId += 1;
  return questionId;
}

function createMultipleChoiceQuestion(questionId, questionText) {
  return {
    id: questionId || nextCreatorQuestionId(),
    type: CREATOR_QUESTION_TYPES.multipleChoice,
    question: questionText || "",
    options: Array.from({ length: MIN_OPTIONS_PER_QUESTION }, () => ""),
    correctIndex: 0
  };
}

function createFibBlank(blankId) {
  return {
    id: blankId,
    answer: "",
    acceptedAnswers: "",
    hint: ""
  };
}

function createFibQuestion(questionId, titleText) {
  return {
    id: questionId || nextCreatorQuestionId(),
    type: CREATOR_QUESTION_TYPES.fib,
    title: titleText || "",
    paragraph: "{{b1}}",
    selectionMode: "ordered",
    maxBlanks: 1,
    baitWords: "",
    blanks: [createFibBlank("b1")]
  };
}

function createQuestion() {
  return createMultipleChoiceQuestion();
}

function splitCommaSeparatedText(value) {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getNextBlankId(question) {
  let index = question.blanks.length + 1;
  const usedIds = new Set(question.blanks.map((blank) => blank.id));
  while (usedIds.has(`b${index}`)) {
    index += 1;
  }
  return `b${index}`;
}

function removeBlankPlaceholder(paragraph, blankId) {
  const pattern = new RegExp(`\\s*\\{\\{\\s*${escapeRegExp(blankId)}\\s*\\}\\}`, "g");
  return paragraph.replace(pattern, "").replace(/\s{2,}/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createInitialCreatorState() {
  return {
    quizName: "New Quiz",
    questions: [createQuestion()]
  };
}

export const quizCreatorState = createInitialCreatorState();

export function setCreatorQuizName(name) {
  quizCreatorState.quizName = typeof name === "string" ? name : "";
}

export function addCreatorQuestion() {
  quizCreatorState.questions.push(createQuestion());
}

export function removeCreatorQuestion(questionId) {
  if (quizCreatorState.questions.length <= 1) {
    return false;
  }
  quizCreatorState.questions = quizCreatorState.questions.filter((question) => question.id !== questionId);
  return true;
}

export function getCreatorQuestion(questionId) {
  return quizCreatorState.questions.find((question) => question.id === questionId) || null;
}

export function setCreatorQuestionType(questionId, type) {
  const questionIndex = quizCreatorState.questions.findIndex((question) => question.id === questionId);
  if (questionIndex < 0) {
    return;
  }

  const question = quizCreatorState.questions[questionIndex];
  if (question.type === type) {
    return;
  }

  const preservedText = question.type === CREATOR_QUESTION_TYPES.fib ? question.title : question.question;
  quizCreatorState.questions[questionIndex] =
    type === CREATOR_QUESTION_TYPES.fib
      ? createFibQuestion(question.id, preservedText)
      : createMultipleChoiceQuestion(question.id, preservedText);
}

export function updateCreatorQuestionText(questionId, value) {
  const question = getCreatorQuestion(questionId);
  if (question && question.type === CREATOR_QUESTION_TYPES.multipleChoice) {
    question.question = value;
  }
}

export function updateCreatorOptionText(questionId, optionIndex, value) {
  const question = getCreatorQuestion(questionId);
  if (
    !question ||
    question.type !== CREATOR_QUESTION_TYPES.multipleChoice ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= question.options.length
  ) {
    return;
  }
  question.options[optionIndex] = value;
}

export function setCreatorCorrectIndex(questionId, optionIndex) {
  const question = getCreatorQuestion(questionId);
  if (
    !question ||
    question.type !== CREATOR_QUESTION_TYPES.multipleChoice ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= question.options.length
  ) {
    return;
  }
  question.correctIndex = optionIndex;
}

export function addCreatorOption(questionId) {
  const question = getCreatorQuestion(questionId);
  if (!question || question.type !== CREATOR_QUESTION_TYPES.multipleChoice || question.options.length >= MAX_OPTIONS_PER_QUESTION) {
    return false;
  }
  question.options.push("");
  return true;
}

export function removeCreatorOption(questionId, optionIndex) {
  const question = getCreatorQuestion(questionId);
  if (
    !question ||
    question.type !== CREATOR_QUESTION_TYPES.multipleChoice ||
    question.options.length <= MIN_OPTIONS_PER_QUESTION ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= question.options.length
  ) {
    return false;
  }

  question.options.splice(optionIndex, 1);
  if (question.correctIndex >= question.options.length) {
    question.correctIndex = question.options.length - 1;
  } else if (question.correctIndex > optionIndex) {
    question.correctIndex -= 1;
  }
  return true;
}

export function updateCreatorFibField(questionId, field, value) {
  const question = getCreatorQuestion(questionId);
  if (!question || question.type !== CREATOR_QUESTION_TYPES.fib) {
    return;
  }

  if (field === "title" || field === "paragraph" || field === "baitWords") {
    question[field] = value;
    return;
  }

  if (field === "selectionMode") {
    question.selectionMode = value === "random" ? "random" : "ordered";
    return;
  }

  if (field === "maxBlanks") {
    question.maxBlanks = clamp(Math.round(Number(value)) || 1, 1, Math.max(question.blanks.length, 1));
  }
}

export function updateCreatorFibBlankField(questionId, blankIndex, field, value) {
  const question = getCreatorQuestion(questionId);
  if (
    !question ||
    question.type !== CREATOR_QUESTION_TYPES.fib ||
    !Number.isInteger(blankIndex) ||
    blankIndex < 0 ||
    blankIndex >= question.blanks.length
  ) {
    return;
  }

  const blank = question.blanks[blankIndex];
  if (field === "answer" || field === "acceptedAnswers" || field === "hint") {
    blank[field] = value;
  }
}

export function addCreatorFibBlank(questionId) {
  const question = getCreatorQuestion(questionId);
  if (!question || question.type !== CREATOR_QUESTION_TYPES.fib) {
    return false;
  }

  const blankId = getNextBlankId(question);
  question.blanks.push(createFibBlank(blankId));
  question.maxBlanks = question.blanks.length;
  if (!question.paragraph.includes(`{{${blankId}}}`)) {
    question.paragraph = `${question.paragraph.trim()} {{${blankId}}}`.trim();
  }
  return true;
}

export function removeCreatorFibBlank(questionId, blankIndex) {
  const question = getCreatorQuestion(questionId);
  if (
    !question ||
    question.type !== CREATOR_QUESTION_TYPES.fib ||
    question.blanks.length <= 1 ||
    !Number.isInteger(blankIndex) ||
    blankIndex < 0 ||
    blankIndex >= question.blanks.length
  ) {
    return false;
  }

  const [removedBlank] = question.blanks.splice(blankIndex, 1);
  if (removedBlank) {
    question.paragraph = removeBlankPlaceholder(question.paragraph, removedBlank.id);
  }
  question.maxBlanks = clamp(question.maxBlanks, 1, question.blanks.length);
  return true;
}

export function buildCreatorQuizPayload() {
  return {
    questions: quizCreatorState.questions.map((question, index) => {
      if (question.type === CREATOR_QUESTION_TYPES.fib) {
        return {
          id: `fib-${index + 1}`,
          type: "fib",
          title: question.title.trim(),
          paragraph: question.paragraph.trim(),
          maxBlanks: clamp(Math.round(Number(question.maxBlanks)) || question.blanks.length, 1, question.blanks.length),
          selectionMode: question.selectionMode === "random" ? "random" : "ordered",
          baitWords: splitCommaSeparatedText(question.baitWords),
          blanks: question.blanks.map((blank) => ({
            id: blank.id.trim(),
            answer: blank.answer.trim(),
            acceptedAnswers: splitCommaSeparatedText(blank.acceptedAnswers),
            hint: blank.hint.trim()
          }))
        };
      }

      return {
        id: index + 1,
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        correctIndex: question.correctIndex
      };
    })
  };
}
