import { MAX_OPTIONS_PER_QUESTION, MIN_OPTIONS_PER_QUESTION } from "../core/constants.js";

export function normalizeQuestion(rawQuestion, index) {
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
    question: questionText,
    options,
    correctIndex: rawQuestion.correctIndex
  };
}

export function validateQuizData(rawData) {
  if (typeof rawData !== "object" || rawData === null || Array.isArray(rawData)) {
    throw new Error("Please upload a valid JSON object.");
  }

  if (!Array.isArray(rawData.questions) || rawData.questions.length === 0) {
    throw new Error("Your JSON must include a non-empty questions array.");
  }

  return rawData.questions.map(normalizeQuestion);
}
