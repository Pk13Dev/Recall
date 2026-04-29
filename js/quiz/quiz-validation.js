import { MAX_OPTIONS_PER_QUESTION, MIN_OPTIONS_PER_QUESTION } from "../core/constants.js";
import { normalizeComparableText } from "../core/utils.js";

export function normalizeTextList(values, label, questionLabel) {
  if (!Array.isArray(values)) {
    return [];
  }

  const normalizedValues = [];
  values.forEach((value, valueIndex) => {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`${questionLabel}, ${label} ${valueIndex + 1} must be non-empty text.`);
    }

    const trimmedValue = value.trim();
    if (!normalizedValues.some((existingValue) => normalizeComparableText(existingValue) === normalizeComparableText(trimmedValue))) {
      normalizedValues.push(trimmedValue);
    }
  });

  return normalizedValues;
}

export function normalizeMultipleChoiceQuestion(rawQuestion, index) {
  if (typeof rawQuestion !== "object" || rawQuestion === null) {
    throw new Error(`Question ${index + 1} is not a valid object.`);
  }

  const questionText = typeof rawQuestion.question === "string" ? rawQuestion.question.trim() : "";
  if (!questionText) {
    throw new Error(`Question ${index + 1} is missing question text.`);
  }

  if (
    !Array.isArray(rawQuestion.options) ||
    rawQuestion.options.length < MIN_OPTIONS_PER_QUESTION ||
    rawQuestion.options.length > MAX_OPTIONS_PER_QUESTION
  ) {
    throw new Error(
      `Question ${index + 1} must include between ${MIN_OPTIONS_PER_QUESTION} and ${MAX_OPTIONS_PER_QUESTION} options.`
    );
  }

  const options = [];
  for (let optionIndex = 0; optionIndex < rawQuestion.options.length; optionIndex += 1) {
    const option = rawQuestion.options[optionIndex];
    if (typeof option !== "string" || !option.trim()) {
      throw new Error(`Question ${index + 1}, option ${optionIndex + 1} must be non-empty text.`);
    }
    options.push(option.trim());
  }

  if (
    typeof rawQuestion.correctIndex !== "number" ||
    !Number.isInteger(rawQuestion.correctIndex) ||
    rawQuestion.correctIndex < 0 ||
    rawQuestion.correctIndex >= options.length
  ) {
    throw new Error(`Question ${index + 1} must have a correctIndex between 0 and ${options.length - 1}.`);
  }

  if (!options[rawQuestion.correctIndex]) {
    throw new Error(`Question ${index + 1} has an invalid correct answer reference.`);
  }

  if ("correctAnswer" in rawQuestion && rawQuestion.correctAnswer !== options[rawQuestion.correctIndex]) {
    throw new Error(`Question ${index + 1} has a correct answer that does not match correctIndex.`);
  }

  return {
    id: rawQuestion.id ?? index + 1,
    type: "multiple-choice",
    question: questionText,
    options,
    correctIndex: rawQuestion.correctIndex
  };
}

export function isFillInTheBlankQuestion(rawQuestion) {
  return Boolean(
    rawQuestion &&
      typeof rawQuestion === "object" &&
      (rawQuestion.type === "fib" ||
        rawQuestion.type === "fill-in-the-blank" ||
        (typeof rawQuestion.paragraph === "string" && Array.isArray(rawQuestion.blanks)))
  );
}

export function normalizeFillInTheBlank(rawQuestion, index) {
  if (typeof rawQuestion !== "object" || rawQuestion === null) {
    throw new Error(`FIB ${index + 1} is not a valid object.`);
  }

  const questionLabel = `FIB ${index + 1}`;
  const paragraph = typeof rawQuestion.paragraph === "string" ? rawQuestion.paragraph.trim() : "";
  if (!paragraph) {
    throw new Error(`${questionLabel} is missing paragraph text.`);
  }

  if (!Array.isArray(rawQuestion.blanks) || rawQuestion.blanks.length === 0) {
    throw new Error(`${questionLabel} must include at least one blank.`);
  }

  const title = typeof rawQuestion.title === "string" && rawQuestion.title.trim()
    ? rawQuestion.title.trim()
    : `Fill in the blanks ${index + 1}`;
  const seenBlankIds = new Set();
  const blanks = rawQuestion.blanks.map((rawBlank, blankIndex) => {
    if (!rawBlank || typeof rawBlank !== "object" || Array.isArray(rawBlank)) {
      throw new Error(`${questionLabel}, blank ${blankIndex + 1} is not a valid object.`);
    }

    const blankId = typeof rawBlank.id === "string" ? rawBlank.id.trim() : "";
    if (!blankId) {
      throw new Error(`${questionLabel}, blank ${blankIndex + 1} is missing an id.`);
    }

    if (seenBlankIds.has(blankId)) {
      throw new Error(`${questionLabel} has a duplicate blank id: ${blankId}.`);
    }
    seenBlankIds.add(blankId);

    const answer = typeof rawBlank.answer === "string" ? rawBlank.answer.trim() : "";
    if (!answer) {
      throw new Error(`${questionLabel}, blank ${blankIndex + 1} is missing an answer.`);
    }

    const acceptedAnswers = normalizeTextList(rawBlank.acceptedAnswers, "accepted answer", questionLabel);
    if (!acceptedAnswers.some((acceptedAnswer) => normalizeComparableText(acceptedAnswer) === normalizeComparableText(answer))) {
      acceptedAnswers.unshift(answer);
    }

    if (!paragraph.includes(`{{${blankId}}}`)) {
      throw new Error(`${questionLabel} paragraph is missing placeholder {{${blankId}}}.`);
    }

    return {
      id: blankId,
      answer,
      acceptedAnswers,
      hint: typeof rawBlank.hint === "string" ? rawBlank.hint.trim() : ""
    };
  });

  const maxBlanks = Number.isInteger(rawQuestion.maxBlanks) && rawQuestion.maxBlanks > 0
    ? Math.min(rawQuestion.maxBlanks, blanks.length)
    : blanks.length;
  const selectionMode = rawQuestion.selectionMode === "random" ? "random" : "ordered";
  const wordBank = normalizeTextList(
    rawQuestion.wordBank || rawQuestion.options || rawQuestion.choices || rawQuestion.possibleAnswers,
    "word bank item",
    questionLabel
  );
  const baitWords = normalizeTextList(rawQuestion.baitWords || rawQuestion.distractors || rawQuestion.decoys, "bait word", questionLabel);

  return {
    id: rawQuestion.id ?? `fib-${index + 1}`,
    type: "fib",
    question: title,
    title,
    paragraph,
    maxBlanks,
    selectionMode,
    blanks,
    wordBank,
    baitWords
  };
}

export function normalizeQuestion(rawQuestion, index) {
  if (isFillInTheBlankQuestion(rawQuestion)) {
    return normalizeFillInTheBlank(rawQuestion, index);
  }

  return normalizeMultipleChoiceQuestion(rawQuestion, index);
}

export function validateQuizData(rawData) {
  if (typeof rawData !== "object" || rawData === null || Array.isArray(rawData)) {
    throw new Error("Please upload a valid JSON object.");
  }

  const questions = [];
  if (Array.isArray(rawData.questions)) {
    rawData.questions.forEach((rawQuestion) => {
      questions.push(normalizeQuestion(rawQuestion, questions.length));
    });
  }

  if (Array.isArray(rawData.fillInTheBlanks)) {
    rawData.fillInTheBlanks.forEach((rawQuestion) => {
      questions.push(normalizeFillInTheBlank(rawQuestion, questions.length));
    });
  }

  if (questions.length === 0) {
    throw new Error("Your JSON must include a non-empty questions array or fillInTheBlanks array.");
  }

  return questions;
}
