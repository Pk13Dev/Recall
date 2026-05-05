import { elements } from "../core/dom.js";
import { clearError, showScreen } from "../core/screens.js";
import { validateQuizData } from "../quiz/quiz-validation.js";
import { getCurrentFolder } from "../storage/library-model.js";
import { ensureManagedJsonFileName, ensureUniqueQuizName, normalizeEntityName } from "../storage/naming.js";
import { addQuizToFolder, saveLibraryModel } from "../storage/storage.js";
import { refreshLibraryUI } from "../library/library-renderer.js";
import { closeLibraryEditor } from "../library/library-editor.js";
import {
  addCreatorFibBlank,
  addCreatorOption,
  addCreatorQuestion,
  buildCreatorQuizPayload,
  removeCreatorFibBlank,
  removeCreatorOption,
  removeCreatorQuestion,
  setCreatorCorrectIndex,
  setCreatorQuestionType,
  setCreatorQuizName,
  updateCreatorFibBlankField,
  updateCreatorFibField,
  updateCreatorOptionText,
  updateCreatorQuestionText
} from "./quiz-creator-model.js";
import { renderQuizCreator, setCreatorStatus } from "./quiz-creator-renderer.js";

function getCreatorQuizName() {
  return ensureManagedJsonFileName(normalizeEntityName(elements.creatorNameInput.value, "New Quiz"), "New Quiz.json");
}

function getValidatedCreatorQuestions() {
  const payload = buildCreatorQuizPayload();
  return validateQuizData(payload);
}

function getExportContent() {
  const questions = getValidatedCreatorQuestions();
  return JSON.stringify({ questions }, null, 2);
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function openQuizCreator() {
  clearError();
  closeLibraryEditor();
  setCreatorStatus("");
  renderQuizCreator();
  showScreen("creator");
  elements.creatorNameInput.focus();
}

export function exportCreatorQuizJson() {
  try {
    setCreatorQuizName(elements.creatorNameInput.value);
    const fileName = getCreatorQuizName();
    downloadTextFile(fileName, getExportContent());
    setCreatorStatus(`Exported ${fileName}.`, "success");
  } catch (error) {
    setCreatorStatus(error && error.message ? error.message : "The quiz JSON could not be exported.", "error");
  }
}

export async function saveCreatorQuiz() {
  try {
    setCreatorQuizName(elements.creatorNameInput.value);
    const folder = getCurrentFolder();
    const quizName = ensureUniqueQuizName(folder.id, getCreatorQuizName(), null);
    const questions = getValidatedCreatorQuestions();
    addQuizToFolder(folder.id, quizName, questions);
    await saveLibraryModel();
    refreshLibraryUI();
    setCreatorStatus(`Saved ${quizName} to ${folder.name}.`, "success");
  } catch (error) {
    setCreatorStatus(error && error.message ? error.message : "The quiz could not be saved.", "error");
  }
}

function handleCreatorInput(event) {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  if (event.target === elements.creatorNameInput) {
    setCreatorQuizName(elements.creatorNameInput.value);
    return;
  }

  const field = event.target.getAttribute("data-field");
  const questionId = event.target.getAttribute("data-question-id");
  if (!field || !questionId) {
    return;
  }

  if (field === "question") {
    updateCreatorQuestionText(questionId, event.target.value);
    return;
  }

  if (field === "option") {
    updateCreatorOptionText(questionId, Number(event.target.getAttribute("data-option-index")), event.target.value);
    return;
  }

  if (field === "fib-blank") {
    updateCreatorFibBlankField(
      questionId,
      Number(event.target.getAttribute("data-blank-index")),
      event.target.getAttribute("data-blank-field"),
      event.target.value
    );
    return;
  }

  if (field.startsWith("fib-")) {
    updateCreatorFibField(questionId, field.slice(4), event.target.value);
  }
}

function handleCreatorClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  const action = actionButton.getAttribute("data-action");
  const questionId = actionButton.getAttribute("data-question-id");
  const optionIndex = Number(actionButton.getAttribute("data-option-index"));
  setCreatorStatus("");

  if (action === "add-option" && questionId) {
    addCreatorOption(questionId);
    renderQuizCreator();
    return;
  }

  if (action === "remove-option" && questionId) {
    removeCreatorOption(questionId, optionIndex);
    renderQuizCreator();
    return;
  }

  if (action === "add-blank" && questionId) {
    addCreatorFibBlank(questionId);
    renderQuizCreator();
    return;
  }

  if (action === "remove-blank" && questionId) {
    removeCreatorFibBlank(questionId, Number(actionButton.getAttribute("data-blank-index")));
    renderQuizCreator();
    return;
  }

  if (action === "remove-question" && questionId) {
    removeCreatorQuestion(questionId);
    renderQuizCreator();
  }
}

function handleCreatorChange(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const action = event.target.getAttribute("data-action");
  const field = event.target.getAttribute("data-field");
  const questionId = event.target.getAttribute("data-question-id");
  const optionIndex = Number(event.target.getAttribute("data-option-index"));

  if (action === "set-correct" && questionId) {
    setCreatorCorrectIndex(questionId, optionIndex);
    return;
  }

  if (action === "set-question-type" && questionId) {
    setCreatorQuestionType(questionId, event.target.value);
    renderQuizCreator();
    return;
  }

  if (field === "fib-selectionMode" && questionId) {
    updateCreatorFibField(questionId, "selectionMode", event.target.value);
  }
}

export function initializeQuizCreatorEvents() {
  elements.createQuizBtn.addEventListener("click", openQuizCreator);
  elements.creatorAddQuestionBtn.addEventListener("click", function () {
    setCreatorStatus("");
    addCreatorQuestion();
    renderQuizCreator();
  });
  elements.creatorExportBtn.addEventListener("click", exportCreatorQuizJson);
  elements.creatorSaveBtn.addEventListener("click", function () {
    saveCreatorQuiz().catch(() => {
      setCreatorStatus("The quiz could not be saved.", "error");
    });
  });
  elements.creatorNameInput.addEventListener("input", handleCreatorInput);
  elements.creatorQuestionList.addEventListener("input", handleCreatorInput);
  elements.creatorQuestionList.addEventListener("click", handleCreatorClick);
  elements.creatorQuestionList.addEventListener("change", handleCreatorChange);
}
