import { recordQuestionAnalytics } from "../analytics/analytics-recording.js";
import { elements } from "../core/dom.js";
import { quizState } from "../core/state.js";
import { appendChildren, createElement } from "../core/utils.js";
import { playSound } from "../ui/audio.js";
import { triggerFireworks } from "../ui/effects.js";

const FIB_MAX_ATTEMPTS = 2;
const TOUCH_DRAG_CLICK_SUPPRESSION_MS = 220;
const TOUCH_DRAG_START_DISTANCE = 8;
const SUCCESS_FIREWORK_STAGGER_MS = 90;
const PLACEHOLDER_PATTERN = /\{\{([^}]+)\}\}/g;
const FIB_FEEDBACK_CLASSES = ["is-correct", "is-misplaced", "is-bait", "is-missing"];
const FIB_TOUCH_GHOST_RESET_CLASSES = [...FIB_FEEDBACK_CLASSES, "is-placed", "is-locked", "is-touch-origin"];

export function getFillInBlankById(question, blankId) {
  return question.activeBlanks.find((blank) => blank.id === blankId) || null;
}

export function getFillInBlankWordById(question, wordId) {
  return question.wordBank.find((word) => word.id === wordId) || null;
}

export function getFillInBlankWordStatus(word, blankId) {
  if (!word || !blankId) {
    return "missing";
  }

  if (word.acceptedBlankIds.includes(blankId)) {
    return "correct";
  }

  return word.isBait ? "bait" : "misplaced";
}

export function buildFillInBlankAnswerSummary(question, placements) {
  return question.activeBlanks
    .map((blank) => {
      const word = getFillInBlankWordById(question, placements.get(blank.id));
      return `${blank.id}: ${word ? word.text : "[empty]"}`;
    })
    .join("; ");
}

export function buildFillInBlankCorrectSummary(question) {
  return question.activeBlanks.map((blank) => `${blank.id}: ${blank.answer}`).join("; ");
}

function createFillInBlankState() {
  return {
    placements: new Map(),
    selectedWordId: null,
    attempts: 0,
    attemptSummaries: [],
    finalized: false,
    lockedBlankIds: new Set(),
    touchDrag: null,
    lastTouchDragAt: 0
  };
}

function createFillInBlankLayout() {
  const wrapper = createElement("div", "fib-question");
  const paragraph = createElement("p", "fib-paragraph");
  const status = createElement("p", "fib-status");
  const bank = createElement("div", "fib-bank");
  const bankGrid = createElement("div", "fib-bank-grid");

  status.setAttribute("aria-live", "polite");
  bank.setAttribute("aria-label", "Possible answers");
  bank.appendChild(bankGrid);
  appendChildren(wrapper, [paragraph, bank, status]);

  return { wrapper, paragraph, status, bank, bankGrid };
}

function hasFillInBlankHints(question) {
  return question.activeBlanks.some((blank) => typeof blank.hint === "string" && blank.hint.trim());
}

function resetHintButton(wrapper, hasQuestionHints) {
  const hintButton = elements.hintBtn;
  const actionRow = hintButton ? hintButton.parentElement : null;
  if (!hintButton || !actionRow) {
    return;
  }

  hintButton.onclick = null;
  hintButton.hidden = !hasQuestionHints;
  hintButton.disabled = !hasQuestionHints;
  hintButton.textContent = "Hint?";
  hintButton.classList.remove("is-active");
  hintButton.setAttribute("aria-pressed", "false");
  actionRow.classList.toggle("has-hint", hasQuestionHints);

  if (wrapper) {
    wrapper.classList.remove("is-hinting");
  }
}

function configureHintButton(wrapper, hasQuestionHints) {
  resetHintButton(wrapper, hasQuestionHints);

  if (!hasQuestionHints || !elements.hintBtn) {
    return;
  }

  elements.hintBtn.onclick = function () {
    wrapper.classList.add("is-hinting");
    elements.hintBtn.classList.add("is-active");
    elements.hintBtn.setAttribute("aria-pressed", "true");
  };
}

function clearFillInBlankStatus(element) {
  element.classList.remove(...FIB_FEEDBACK_CLASSES);
}

function getFilledBlankId(placements, wordId) {
  for (const [blankId, placedWordId] of placements.entries()) {
    if (placedWordId === wordId) {
      return blankId;
    }
  }
  return null;
}

function getBlankAriaLabel(blank, blankIndex, placedWord) {
  if (!placedWord) {
    return `Blank ${blankIndex + 1}${blank.hint ? `, hint: ${blank.hint}` : ""}`;
  }

  return `Blank ${blankIndex + 1}, ${placedWord.text}`;
}

function buildFillInBlankAttemptSummary(question, placements, attemptNumber) {
  const results = question.activeBlanks.map((blank) => {
    const word = getFillInBlankWordById(question, placements.get(blank.id));
    const status = getFillInBlankWordStatus(word, blank.id);

    return {
      blankId: blank.id,
      selectedAnswer: word ? word.text : "",
      correctAnswer: blank.answer,
      status,
      isCorrect: status === "correct"
    };
  });
  const correctCount = results.filter((result) => result.isCorrect).length;

  return {
    attemptNumber,
    totalBlanks: results.length,
    correctCount,
    wrongCount: Math.max(results.length - correctCount, 0),
    misplacedCount: results.filter((result) => result.status === "misplaced").length,
    baitCount: results.filter((result) => result.status === "bait").length,
    missingCount: results.filter((result) => result.status === "missing").length,
    isCorrect: correctCount === results.length,
    results
  };
}

function createTouchDragGhost(wordButton, clientX, clientY) {
  const ghost = wordButton.cloneNode(true);
  ghost.classList.remove(...FIB_TOUCH_GHOST_RESET_CLASSES);
  ghost.classList.add("fib-drag-ghost", "is-selected");
  ghost.removeAttribute("draggable");
  ghost.style.left = `${clientX}px`;
  ghost.style.top = `${clientY}px`;
  document.body.appendChild(ghost);
  return ghost;
}

export function resetQuizHintButton() {
  resetHintButton(null, false);
}

export function renderFillInBlankQuestion(currentQuestion) {
  const renderer = new FillInBlankRenderer(currentQuestion);
  renderer.mount();
}

class FillInBlankRenderer {
  constructor(question) {
    this.question = question;
    this.state = createFillInBlankState();
    this.dom = createFillInBlankLayout();
    this.wordElementsById = new Map();
    this.blankElementsById = new Map();
  }

  mount() {
    elements.questionText.textContent = this.question.title || this.question.question;
    elements.optionsContainer.classList.add("options-container-fib");
    elements.nextBtn.textContent = "Submit Answer";
    elements.optionsContainer.appendChild(this.dom.wrapper);

    this.renderParagraph();
    this.bindBankDropTarget();
    this.renderWordBank();
    configureHintButton(this.dom.wrapper, hasFillInBlankHints(this.question));

    quizState.submitCurrentAnswer = () => this.submitAnswer();
    this.syncUi();
  }

  renderWordBank() {
    this.question.wordBank.forEach((word) => {
      this.dom.bankGrid.appendChild(this.createWordChip(word));
    });
  }

  getWordElement(wordId) {
    return this.wordElementsById.get(wordId) || null;
  }

  getBlankElement(blankId) {
    return this.blankElementsById.get(blankId) || null;
  }

  getFilledBlankIdForWord(wordId) {
    return getFilledBlankId(this.state.placements, wordId);
  }

  setSelectedWord(wordId) {
    this.state.selectedWordId = this.state.selectedWordId === wordId ? null : wordId;
    this.syncUi();
  }

  clearSubmittedFeedback() {
    if (this.state.finalized) {
      return;
    }

    this.dom.wrapper.classList.remove("has-submitted-feedback");
    this.dom.wrapper.querySelectorAll(".fib-blank:not(.is-locked), .fib-word:not(.is-locked)").forEach(clearFillInBlankStatus);
    this.dom.status.textContent = "";
  }

  moveWordToBank(wordId) {
    const currentBlankId = this.getFilledBlankIdForWord(wordId);
    if (currentBlankId) {
      if (this.state.lockedBlankIds.has(currentBlankId)) {
        return false;
      }
      this.state.placements.delete(currentBlankId);
    }

    const wordElement = this.getWordElement(wordId);
    if (wordElement) {
      this.dom.bankGrid.appendChild(wordElement);
    }
    return true;
  }

  placeWordInBlank(wordId, blankId) {
    if (this.state.finalized || this.state.lockedBlankIds.has(blankId)) {
      return;
    }

    const wordElement = this.getWordElement(wordId);
    const blankElement = this.getBlankElement(blankId);
    if (!wordElement || !blankElement) {
      return;
    }

    const previousBlankId = this.getFilledBlankIdForWord(wordId);
    const existingWordId = this.state.placements.get(blankId);
    if (previousBlankId && this.state.lockedBlankIds.has(previousBlankId)) {
      return;
    }

    if (existingWordId && existingWordId !== wordId) {
      return;
    }

    this.clearSubmittedFeedback();

    if (previousBlankId) {
      this.state.placements.delete(previousBlankId);
    }

    this.state.placements.set(blankId, wordId);
    blankElement.appendChild(wordElement);
    this.state.selectedWordId = null;
    this.syncUi();
  }

  handleBlankAction(blankId) {
    if (this.state.finalized || this.state.lockedBlankIds.has(blankId)) {
      return;
    }

    if (this.state.selectedWordId) {
      this.placeWordInBlank(this.state.selectedWordId, blankId);
      return;
    }

    const wordId = this.state.placements.get(blankId);
    if (wordId) {
      this.setSelectedWord(wordId);
    }
  }

  isReadyToSubmit() {
    return this.question.activeBlanks.every((blank) => this.state.placements.has(blank.id));
  }

  syncUi() {
    this.question.activeBlanks.forEach((blank, blankIndex) => {
      const blankElement = this.getBlankElement(blank.id);
      if (!blankElement) {
        return;
      }

      const placedWordId = this.state.placements.get(blank.id);
      const placedWord = getFillInBlankWordById(this.question, placedWordId);
      const isEmpty = !placedWordId;

      blankElement.classList.toggle("is-empty", isEmpty);
      blankElement.classList.toggle("is-filled", !isEmpty);
      blankElement.classList.toggle("is-selected", placedWordId === this.state.selectedWordId);
      blankElement.classList.toggle("is-target", Boolean(this.state.selectedWordId) && !this.state.finalized);
      blankElement.classList.toggle("is-locked", this.state.lockedBlankIds.has(blank.id));
      blankElement.setAttribute("aria-label", getBlankAriaLabel(blank, blankIndex, placedWord));
    });

    this.question.wordBank.forEach((word) => {
      const wordElement = this.getWordElement(word.id);
      if (!wordElement) {
        return;
      }

      const filledBlankId = this.getFilledBlankIdForWord(word.id);
      const isLocked = filledBlankId && this.state.lockedBlankIds.has(filledBlankId);
      wordElement.classList.toggle("is-selected", this.state.selectedWordId === word.id);
      wordElement.classList.toggle("is-placed", Boolean(filledBlankId));
      wordElement.classList.toggle("is-locked", Boolean(isLocked));
      wordElement.draggable = !this.state.finalized && !isLocked;
      wordElement.setAttribute("aria-pressed", this.state.selectedWordId === word.id ? "true" : "false");
    });

    elements.nextBtn.disabled = this.state.finalized ? false : !this.isReadyToSubmit();
  }

  renderFeedback(isFinal) {
    this.dom.wrapper.classList.add("has-submitted-feedback");
    this.state.lockedBlankIds.clear();

    this.question.activeBlanks.forEach((blank) => {
      const blankElement = this.getBlankElement(blank.id);
      const word = getFillInBlankWordById(this.question, this.state.placements.get(blank.id));
      const status = getFillInBlankWordStatus(word, blank.id);
      if (!blankElement) {
        return;
      }

      clearFillInBlankStatus(blankElement);
      blankElement.classList.add(`is-${status}`);

      if (status === "correct") {
        this.state.lockedBlankIds.add(blank.id);
      }
    });

    this.question.wordBank.forEach((word) => {
      const wordElement = this.getWordElement(word.id);
      const blankId = this.getFilledBlankIdForWord(word.id);
      const status = getFillInBlankWordStatus(word, blankId);
      if (!wordElement) {
        return;
      }

      clearFillInBlankStatus(wordElement);
      if (blankId) {
        wordElement.classList.add(`is-${status}`);
      }
    });

    this.dom.status.textContent = isFinal ? "" : "Try once more.";
    this.syncUi();
  }

  submitAnswer() {
    if (this.state.finalized || !this.isReadyToSubmit()) {
      this.syncUi();
      return;
    }

    this.state.attempts += 1;
    this.state.selectedWordId = null;

    const attemptSummary = buildFillInBlankAttemptSummary(this.question, this.state.placements, this.state.attempts);
    this.state.attemptSummaries[this.state.attempts - 1] = attemptSummary;

    const isCorrect = attemptSummary.isCorrect;
    const isFinal = isCorrect || this.state.attempts >= FIB_MAX_ATTEMPTS;
    this.renderFeedback(isFinal);

    if (!isFinal) {
      elements.nextBtn.textContent = "Submit Again";
      playSound("fail");
      return;
    }

    this.finalizeAnswer(isCorrect);
  }

  finalizeAnswer(isCorrect) {
    this.state.finalized = true;
    quizState.hasAnswered = true;
    quizState.selectedIndex = 0;
    quizState.submitCurrentAnswer = null;
    elements.nextBtn.textContent = "Next Question";
    elements.nextBtn.disabled = false;

    if (isCorrect) {
      quizState.score += 1;
      playSound("win");
      this.triggerSuccessEffects();
    } else {
      playSound("fail");
    }

    recordQuestionAnalytics(this.question, null, isCorrect, Date.now(), {
      questionType: "fib",
      selectedOption: buildFillInBlankAnswerSummary(this.question, this.state.placements),
      correctOption: buildFillInBlankCorrectSummary(this.question),
      attemptCount: this.state.attempts,
      fibAttempts: this.state.attemptSummaries.slice()
    });
    elements.scoreText.textContent = `Score: ${quizState.score}`;
    this.syncUi();
  }

  triggerSuccessEffects() {
    Array.from(this.dom.wrapper.querySelectorAll(".fib-blank.is-correct")).forEach((blankElement, index) => {
      window.setTimeout(() => triggerFireworks(blankElement), index * SUCCESS_FIREWORK_STAGGER_MS);
    });
  }

  clearTouchDragTarget() {
    const touchDrag = this.state.touchDrag;
    if (!touchDrag || !touchDrag.targetElement) {
      return;
    }

    touchDrag.targetElement.classList.remove("is-dragover");
    touchDrag.targetElement = null;
    touchDrag.targetType = null;
    touchDrag.targetBlankId = null;
  }

  getTouchDropTarget(clientX, clientY) {
    const targetElement = document.elementFromPoint(clientX, clientY);
    if (!targetElement || !(targetElement instanceof Element)) {
      return null;
    }

    const blankElement = targetElement.closest(".fib-blank");
    if (blankElement && this.dom.wrapper.contains(blankElement)) {
      const blankId = blankElement.getAttribute("data-blank-id");
      if (blankId && !this.state.lockedBlankIds.has(blankId)) {
        return { type: "blank", element: blankElement, blankId };
      }
    }

    const bankElement = targetElement.closest(".fib-bank");
    if (bankElement && this.dom.bank.contains(bankElement)) {
      return { type: "bank", element: this.dom.bank };
    }

    return null;
  }

  updateTouchDragGhost(clientX, clientY) {
    const touchDrag = this.state.touchDrag;
    if (!touchDrag || !touchDrag.ghost) {
      return;
    }

    touchDrag.ghost.style.left = `${clientX}px`;
    touchDrag.ghost.style.top = `${clientY}px`;
  }

  updateTouchDragTarget(clientX, clientY) {
    const touchDrag = this.state.touchDrag;
    if (!touchDrag) {
      return;
    }

    const dropTarget = this.getTouchDropTarget(clientX, clientY);
    if (dropTarget && touchDrag.targetElement === dropTarget.element) {
      return;
    }

    this.clearTouchDragTarget();

    if (!dropTarget) {
      return;
    }

    dropTarget.element.classList.add("is-dragover");
    touchDrag.targetElement = dropTarget.element;
    touchDrag.targetType = dropTarget.type;
    touchDrag.targetBlankId = dropTarget.blankId || null;
  }

  cleanupTouchDrag() {
    const touchDrag = this.state.touchDrag;
    if (!touchDrag) {
      return;
    }

    this.clearTouchDragTarget();
    if (touchDrag.ghost) {
      touchDrag.ghost.remove();
    }
    if (touchDrag.sourceElement) {
      touchDrag.sourceElement.classList.remove("is-touch-origin");
    }

    this.state.touchDrag = null;
    this.state.selectedWordId = null;
    this.syncUi();
  }

  finishTouchDrag(event, shouldDrop) {
    const touchDrag = this.state.touchDrag;
    if (!touchDrag || event.pointerId !== touchDrag.pointerId) {
      return;
    }

    if (touchDrag.active && shouldDrop) {
      const dropTarget = this.getTouchDropTarget(event.clientX, event.clientY);
      if (dropTarget && dropTarget.type === "blank" && dropTarget.blankId) {
        this.placeWordInBlank(touchDrag.wordId, dropTarget.blankId);
      } else if (dropTarget && dropTarget.type === "bank") {
        this.clearSubmittedFeedback();
        this.moveWordToBank(touchDrag.wordId);
      }
    }

    if (touchDrag.active) {
      this.state.lastTouchDragAt = Date.now();
      event.preventDefault();
    }

    this.cleanupTouchDrag();
  }

  handleWordClick(event, word, wordButton) {
    event.stopPropagation();
    if (Date.now() - this.state.lastTouchDragAt < TOUCH_DRAG_CLICK_SUPPRESSION_MS) {
      event.preventDefault();
      return;
    }

    if (this.state.finalized || wordButton.classList.contains("is-locked")) {
      return;
    }

    if (this.state.selectedWordId === word.id && this.getFilledBlankIdForWord(word.id)) {
      this.clearSubmittedFeedback();
      this.moveWordToBank(word.id);
      this.state.selectedWordId = null;
      this.syncUi();
      return;
    }

    this.setSelectedWord(word.id);
  }

  startTouchDrag(event, word, wordButton) {
    if (event.pointerType === "mouse" || this.state.finalized || wordButton.classList.contains("is-locked")) {
      return;
    }

    this.state.touchDrag = {
      wordId: word.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      ghost: null,
      sourceElement: wordButton,
      targetElement: null,
      targetType: null,
      targetBlankId: null
    };

    if (typeof wordButton.setPointerCapture === "function") {
      wordButton.setPointerCapture(event.pointerId);
    }
  }

  handleTouchDragMove(event, word, wordButton) {
    const touchDrag = this.state.touchDrag;
    if (!touchDrag || event.pointerId !== touchDrag.pointerId) {
      return;
    }

    const deltaX = event.clientX - touchDrag.startX;
    const deltaY = event.clientY - touchDrag.startY;
    if (!touchDrag.active && Math.hypot(deltaX, deltaY) < TOUCH_DRAG_START_DISTANCE) {
      return;
    }

    if (!touchDrag.active) {
      this.clearSubmittedFeedback();
      touchDrag.active = true;
      this.state.selectedWordId = word.id;
      touchDrag.ghost = createTouchDragGhost(wordButton, event.clientX, event.clientY);
      wordButton.classList.add("is-touch-origin");
      this.syncUi();
    }

    event.preventDefault();
    this.updateTouchDragGhost(event.clientX, event.clientY);
    this.updateTouchDragTarget(event.clientX, event.clientY);
  }

  handleNativeDragStart(event, word, wordButton) {
    if (this.state.finalized || wordButton.classList.contains("is-locked")) {
      event.preventDefault();
      return;
    }

    if (!event.dataTransfer) {
      return;
    }

    this.state.selectedWordId = word.id;
    event.dataTransfer.setData("text/plain", word.id);
    event.dataTransfer.effectAllowed = "move";
    window.setTimeout(() => this.syncUi(), 0);
  }

  createWordChip(word) {
    const wordButton = createElement("button", "fib-word", word.text);
    wordButton.type = "button";
    wordButton.draggable = true;
    wordButton.setAttribute("data-word-id", word.id);
    wordButton.setAttribute("aria-pressed", "false");

    wordButton.addEventListener("click", (event) => this.handleWordClick(event, word, wordButton));
    wordButton.addEventListener("pointerdown", (event) => this.startTouchDrag(event, word, wordButton));
    wordButton.addEventListener("pointermove", (event) => this.handleTouchDragMove(event, word, wordButton));
    wordButton.addEventListener("pointerup", (event) => this.finishTouchDrag(event, true));
    wordButton.addEventListener("pointercancel", (event) => this.finishTouchDrag(event, false));
    wordButton.addEventListener("dragstart", (event) => this.handleNativeDragStart(event, word, wordButton));
    wordButton.addEventListener("dragend", () => {
      this.state.selectedWordId = null;
      this.syncUi();
    });

    this.wordElementsById.set(word.id, wordButton);
    return wordButton;
  }

  createBlank(blank, blankIndex) {
    const blankButton = createElement("span", "fib-blank is-empty");
    blankButton.setAttribute("role", "button");
    blankButton.setAttribute("tabindex", "0");
    blankButton.setAttribute("data-blank-id", blank.id);
    blankButton.setAttribute("aria-label", getBlankAriaLabel(blank, blankIndex, null));

    if (blank.hint) {
      blankButton.setAttribute("data-hint", blank.hint);
    }

    blankButton.addEventListener("click", () => this.handleBlankAction(blank.id));
    blankButton.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      this.handleBlankAction(blank.id);
    });
    blankButton.addEventListener("dragover", (event) => {
      if (this.state.finalized || this.state.lockedBlankIds.has(blank.id)) {
        return;
      }
      event.preventDefault();
      blankButton.classList.add("is-dragover");
      event.dataTransfer.dropEffect = "move";
    });
    blankButton.addEventListener("dragleave", () => {
      blankButton.classList.remove("is-dragover");
    });
    blankButton.addEventListener("drop", (event) => {
      event.preventDefault();
      blankButton.classList.remove("is-dragover");
      const wordId = event.dataTransfer.getData("text/plain");
      if (wordId) {
        this.placeWordInBlank(wordId, blank.id);
      }
    });

    blankButton.appendChild(createElement("span", "fib-blank-label", String(blankIndex + 1)));
    this.blankElementsById.set(blank.id, blankButton);
    return blankButton;
  }

  renderParagraph() {
    this.dom.paragraph.replaceChildren();

    const activeBlankIds = new Set(this.question.activeBlankIds);
    const blankIndexById = new Map(this.question.activeBlanks.map((blank, index) => [blank.id, index]));
    const placeholderPattern = new RegExp(PLACEHOLDER_PATTERN);
    let lastIndex = 0;
    let match = placeholderPattern.exec(this.question.paragraph);

    while (match) {
      if (match.index > lastIndex) {
        this.dom.paragraph.appendChild(document.createTextNode(this.question.paragraph.slice(lastIndex, match.index)));
      }

      const blankId = match[1].trim();
      const blank = getFillInBlankById(this.question, blankId);
      if (blank && activeBlankIds.has(blankId)) {
        this.dom.paragraph.appendChild(this.createBlank(blank, blankIndexById.get(blankId) ?? 0));
      } else {
        const fallbackBlank = this.question.blanks.find((candidate) => candidate.id === blankId);
        this.dom.paragraph.appendChild(document.createTextNode(fallbackBlank ? fallbackBlank.answer : match[0]));
      }

      lastIndex = match.index + match[0].length;
      match = placeholderPattern.exec(this.question.paragraph);
    }

    if (lastIndex < this.question.paragraph.length) {
      this.dom.paragraph.appendChild(document.createTextNode(this.question.paragraph.slice(lastIndex)));
    }
  }

  bindBankDropTarget() {
    this.dom.bank.addEventListener("dragover", (event) => {
      event.preventDefault();
      this.dom.bank.classList.add("is-dragover");
      event.dataTransfer.dropEffect = "move";
    });
    this.dom.bank.addEventListener("dragleave", () => {
      this.dom.bank.classList.remove("is-dragover");
    });
    this.dom.bank.addEventListener("drop", (event) => {
      event.preventDefault();
      this.dom.bank.classList.remove("is-dragover");
      const wordId = event.dataTransfer.getData("text/plain");
      if (!wordId) {
        return;
      }

      this.clearSubmittedFeedback();
      this.moveWordToBank(wordId);
      this.state.selectedWordId = null;
      this.syncUi();
    });
  }
}
