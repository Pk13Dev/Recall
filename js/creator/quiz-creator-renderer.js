import { MAX_OPTIONS_PER_QUESTION, MIN_OPTIONS_PER_QUESTION } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { appendChildren, createElement } from "../core/utils.js";
import { CREATOR_QUESTION_TYPES, quizCreatorState } from "./quiz-creator-model.js";

function createCreatorLabel(labelText, control, className) {
  const label = createElement("label", className || "quiz-creator-field");
  const labelCopy = createElement("span", "library-field-label", labelText);
  return appendChildren(label, [labelCopy, control]);
}

function createCreatorInput(config) {
  const input = document.createElement("input");
  input.className = config.className || "library-input";
  input.type = config.type || "text";
  input.value = config.value || "";
  if (config.maxLength) {
    input.maxLength = config.maxLength;
  }
  if (config.min !== undefined) {
    input.min = String(config.min);
  }
  if (config.max !== undefined) {
    input.max = String(config.max);
  }
  if (config.placeholder) {
    input.placeholder = config.placeholder;
  }
  if (config.readOnly) {
    input.readOnly = true;
  }
  Object.entries(config.attributes || {}).forEach(([name, value]) => {
    input.setAttribute(name, value);
  });
  return input;
}

function createCreatorTextArea(config) {
  const textarea = createElement("textarea", config.className || "library-input quiz-creator-question-input");
  textarea.rows = config.rows || 3;
  textarea.maxLength = config.maxLength || 500;
  textarea.placeholder = config.placeholder || "";
  textarea.value = config.value || "";
  Object.entries(config.attributes || {}).forEach(([name, value]) => {
    textarea.setAttribute(name, value);
  });
  return textarea;
}

function createQuestionTypeSelect(question) {
  const select = document.createElement("select");
  select.className = "library-select quiz-creator-type-select";
  select.setAttribute("data-action", "set-question-type");
  select.setAttribute("data-question-id", question.id);
  [
    { value: CREATOR_QUESTION_TYPES.multipleChoice, label: "Multiple Choice" },
    { value: CREATOR_QUESTION_TYPES.fib, label: "Fill in the Blank" }
  ].forEach((typeOption) => {
    const option = document.createElement("option");
    option.value = typeOption.value;
    option.textContent = typeOption.label;
    option.selected = question.type === typeOption.value;
    select.appendChild(option);
  });
  return createCreatorLabel("Type", select, "quiz-creator-field quiz-creator-type-field");
}

function createMultipleChoiceQuestionTextArea(question, questionNumber) {
  return createCreatorTextArea({
    placeholder: "Question text",
    value: question.question,
    attributes: {
      "data-field": "question",
      "data-question-id": question.id,
      "aria-label": `Question ${questionNumber} text`
    }
  });
}

function createOptionRow(question, questionNumber, optionText, optionIndex) {
  const row = createElement("div", "quiz-creator-option-row");
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = `creator-correct-${question.id}`;
  radio.checked = question.correctIndex === optionIndex;
  radio.className = "quiz-creator-radio";
  radio.setAttribute("data-action", "set-correct");
  radio.setAttribute("data-question-id", question.id);
  radio.setAttribute("data-option-index", String(optionIndex));
  radio.setAttribute("aria-label", `Mark option ${optionIndex + 1} as correct for question ${questionNumber}`);

  const input = createCreatorInput({
    className: "library-input quiz-creator-option-input",
    value: optionText,
    maxLength: 220,
    placeholder: `Option ${optionIndex + 1}`,
    attributes: {
      "data-field": "option",
      "data-question-id": question.id,
      "data-option-index": String(optionIndex),
      "aria-label": `Question ${questionNumber}, option ${optionIndex + 1}`
    }
  });

  const removeButton = createElement("button", "btn btn-secondary btn-compact quiz-creator-remove-option-btn", "Remove");
  removeButton.type = "button";
  removeButton.disabled = question.options.length <= MIN_OPTIONS_PER_QUESTION;
  removeButton.setAttribute("data-action", "remove-option");
  removeButton.setAttribute("data-question-id", question.id);
  removeButton.setAttribute("data-option-index", String(optionIndex));
  removeButton.setAttribute("aria-label", `Remove option ${optionIndex + 1} from question ${questionNumber}`);

  return appendChildren(row, [radio, input, removeButton]);
}

function createMultipleChoiceEditor(question, questionNumber) {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(createCreatorLabel("Question", createMultipleChoiceQuestionTextArea(question, questionNumber)));

  const options = createElement("div", "quiz-creator-options");
  question.options.forEach((optionText, optionIndex) => {
    options.appendChild(createOptionRow(question, questionNumber, optionText, optionIndex));
  });
  fragment.appendChild(options);

  const addOptionButton = createElement("button", "btn btn-secondary btn-compact quiz-creator-add-option-btn", "Add Option");
  addOptionButton.type = "button";
  addOptionButton.disabled = question.options.length >= MAX_OPTIONS_PER_QUESTION;
  addOptionButton.setAttribute("data-action", "add-option");
  addOptionButton.setAttribute("data-question-id", question.id);
  fragment.appendChild(addOptionButton);
  return fragment;
}

function createFibSettings(question) {
  const selectionMode = document.createElement("select");
  selectionMode.className = "library-select";
  selectionMode.setAttribute("data-field", "fib-selectionMode");
  selectionMode.setAttribute("data-question-id", question.id);
  [
    { value: "ordered", label: "Ordered" },
    { value: "random", label: "Random" }
  ].forEach((selectionOption) => {
    const option = document.createElement("option");
    option.value = selectionOption.value;
    option.textContent = selectionOption.label;
    option.selected = question.selectionMode === selectionOption.value;
    selectionMode.appendChild(option);
  });

  const maxBlanks = createCreatorInput({
    type: "number",
    value: String(question.maxBlanks),
    min: 1,
    max: question.blanks.length,
    attributes: {
      "data-field": "fib-maxBlanks",
      "data-question-id": question.id
    }
  });

  return appendChildren(createElement("div", "quiz-creator-fib-settings"), [
    createCreatorLabel("Selection", selectionMode),
    createCreatorLabel("Max blanks", maxBlanks)
  ]);
}

function createFibBlankRow(question, questionNumber, blank, blankIndex) {
  const row = createElement("div", "quiz-creator-fib-blank-row");
  const title = createElement("p", "quiz-creator-fib-blank-title", `Blank ${blankIndex + 1}`);

  const idInput = createCreatorInput({
    value: blank.id,
    maxLength: 40,
    placeholder: "b1",
    readOnly: true,
    attributes: {
      "data-question-id": question.id,
      "data-blank-index": String(blankIndex),
      "aria-label": `Question ${questionNumber}, blank ${blankIndex + 1} id`
    }
  });

  const answerInput = createCreatorInput({
    value: blank.answer,
    maxLength: 160,
    placeholder: "Answer",
    attributes: {
      "data-field": "fib-blank",
      "data-blank-field": "answer",
      "data-question-id": question.id,
      "data-blank-index": String(blankIndex),
      "aria-label": `Question ${questionNumber}, blank ${blankIndex + 1} answer`
    }
  });

  const acceptedInput = createCreatorInput({
    value: blank.acceptedAnswers,
    maxLength: 260,
    placeholder: "answer, alternate answer",
    attributes: {
      "data-field": "fib-blank",
      "data-blank-field": "acceptedAnswers",
      "data-question-id": question.id,
      "data-blank-index": String(blankIndex),
      "aria-label": `Question ${questionNumber}, blank ${blankIndex + 1} accepted answers`
    }
  });

  const hintInput = createCreatorInput({
    value: blank.hint,
    maxLength: 220,
    placeholder: "Hint",
    attributes: {
      "data-field": "fib-blank",
      "data-blank-field": "hint",
      "data-question-id": question.id,
      "data-blank-index": String(blankIndex),
      "aria-label": `Question ${questionNumber}, blank ${blankIndex + 1} hint`
    }
  });

  const removeButton = createElement("button", "btn btn-secondary btn-compact quiz-creator-remove-blank-btn", "Remove Blank");
  removeButton.type = "button";
  removeButton.disabled = question.blanks.length <= 1;
  removeButton.setAttribute("data-action", "remove-blank");
  removeButton.setAttribute("data-question-id", question.id);
  removeButton.setAttribute("data-blank-index", String(blankIndex));

  return appendChildren(row, [
    title,
    createCreatorLabel("ID", idInput, "quiz-creator-field quiz-creator-mini-field"),
    createCreatorLabel("Answer", answerInput, "quiz-creator-field quiz-creator-mini-field"),
    createCreatorLabel("Accepted answers", acceptedInput, "quiz-creator-field quiz-creator-wide-field"),
    createCreatorLabel("Hint", hintInput, "quiz-creator-field quiz-creator-wide-field"),
    removeButton
  ]);
}

function createFibEditor(question, questionNumber) {
  const fragment = document.createDocumentFragment();
  const titleInput = createCreatorInput({
    value: question.title,
    maxLength: 220,
    placeholder: "Question title",
    attributes: {
      "data-field": "fib-title",
      "data-question-id": question.id,
      "aria-label": `Question ${questionNumber} FIB title`
    }
  });
  fragment.appendChild(createCreatorLabel("Title", titleInput));

  const paragraphInput = createCreatorTextArea({
    placeholder: "The answer goes in {{b1}}.",
    value: question.paragraph,
    rows: 4,
    maxLength: 900,
    attributes: {
      "data-field": "fib-paragraph",
      "data-question-id": question.id,
      "aria-label": `Question ${questionNumber} FIB paragraph`
    }
  });
  fragment.appendChild(createCreatorLabel("Paragraph", paragraphInput));
  fragment.appendChild(createFibSettings(question));

  const blanks = createElement("div", "quiz-creator-fib-blanks");
  question.blanks.forEach((blank, blankIndex) => {
    blanks.appendChild(createFibBlankRow(question, questionNumber, blank, blankIndex));
  });
  fragment.appendChild(blanks);

  const baitWords = createCreatorInput({
    value: question.baitWords,
    maxLength: 260,
    placeholder: "decoy, wrong answer",
    attributes: {
      "data-field": "fib-baitWords",
      "data-question-id": question.id
    }
  });
  fragment.appendChild(createCreatorLabel("Bait words", baitWords));

  const addBlankButton = createElement("button", "btn btn-secondary btn-compact quiz-creator-add-blank-btn", "Add Blank");
  addBlankButton.type = "button";
  addBlankButton.setAttribute("data-action", "add-blank");
  addBlankButton.setAttribute("data-question-id", question.id);
  fragment.appendChild(addBlankButton);
  return fragment;
}

function createQuestionCard(question, index) {
  const questionNumber = index + 1;
  const card = createElement("article", "quiz-creator-question-card");
  card.setAttribute("data-question-id", question.id);

  const eyebrow = createElement("p", "quiz-creator-question-kicker", `Question ${questionNumber}`);
  const removeButton = createElement("button", "btn btn-secondary btn-compact quiz-creator-remove-question-btn", "Remove Question");
  removeButton.type = "button";
  removeButton.disabled = quizCreatorState.questions.length <= 1;
  removeButton.setAttribute("data-action", "remove-question");
  removeButton.setAttribute("data-question-id", question.id);

  const tools = appendChildren(createElement("div", "quiz-creator-question-tools"), [createQuestionTypeSelect(question), removeButton]);
  const header = appendChildren(createElement("div", "quiz-creator-question-header"), [eyebrow, tools]);

  appendChildren(card, [header]);
  card.appendChild(
    question.type === CREATOR_QUESTION_TYPES.fib
      ? createFibEditor(question, questionNumber)
      : createMultipleChoiceEditor(question, questionNumber)
  );
  return card;
}

export function renderQuizCreator() {
  elements.creatorNameInput.value = quizCreatorState.quizName;
  elements.creatorQuestionList.innerHTML = "";
  quizCreatorState.questions.forEach((question, index) => {
    elements.creatorQuestionList.appendChild(createQuestionCard(question, index));
  });
}

export function setCreatorStatus(message, statusType) {
  elements.creatorStatus.textContent = message || "";
  elements.creatorStatus.classList.toggle("is-error", statusType === "error");
  elements.creatorStatus.classList.toggle("is-success", statusType === "success");
}
