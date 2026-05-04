import { recordQuestionAnalytics } from "../analytics/analytics-recording.js";
import { elements } from "../core/dom.js";
import { quizState } from "../core/state.js";
import { appendChildren, createElement } from "../core/utils.js";
import { playSound } from "../ui/audio.js";
import { triggerFireworks } from "../ui/effects.js";

const FIB_MAX_ATTEMPTS = 2;

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

export function renderMultipleChoiceQuestion(currentQuestion) {
  elements.nextBtn.textContent = "Next Question";
  elements.questionText.textContent = currentQuestion.question;

  currentQuestion.options.forEach((optionText, optionIndex) => {
    const optionBtn = document.createElement("button");
    optionBtn.type = "button";
    optionBtn.className = "option-btn";
    optionBtn.textContent = optionText;
    optionBtn.setAttribute("role", "listitem");
    optionBtn.setAttribute("aria-label", `Option ${optionIndex + 1}: ${optionText}`);

    optionBtn.addEventListener("click", function () {
      if (quizState.hasAnswered) {
        return;
      }

      quizState.hasAnswered = true;
      quizState.selectedIndex = optionIndex;

      const allOptionButtons = Array.from(elements.optionsContainer.querySelectorAll(".option-btn"));
      allOptionButtons.forEach((button) => {
        button.disabled = true;
        button.classList.remove("is-correct", "is-wrong", "is-correct-answer");
      });

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      const answeredAt = Date.now();
      if (isCorrect) {
        quizState.score += 1;
        optionBtn.classList.add("is-correct");
        playSound("win");
        triggerFireworks(optionBtn);
      } else {
        optionBtn.classList.add("is-wrong");
        const correctButton = allOptionButtons[currentQuestion.correctIndex];
        if (correctButton) {
          correctButton.classList.add("is-correct-answer");
        }
        playSound("fail");
      }

      recordQuestionAnalytics(currentQuestion, optionIndex, isCorrect, answeredAt);
      elements.scoreText.textContent = `Score: ${quizState.score}`;
      elements.nextBtn.disabled = false;
    });

    elements.optionsContainer.appendChild(optionBtn);
  });
}

export function renderFillInBlankQuestion(currentQuestion) {
  elements.questionText.textContent = currentQuestion.title || currentQuestion.question;
  elements.optionsContainer.classList.add("options-container-fib");
  elements.nextBtn.textContent = "Submit Answer";

  const state = {
    placements: new Map(),
    selectedWordId: null,
    attempts: 0,
    attemptSummaries: [],
    finalized: false,
    lockedBlankIds: new Set(),
    touchDrag: null,
    lastTouchDragAt: 0
  };

  const wrapper = createElement("div", "fib-question");
  const paragraph = createElement("p", "fib-paragraph");
  const status = createElement("p", "fib-status");
  status.setAttribute("aria-live", "polite");
  const bank = createElement("div", "fib-bank");
  bank.setAttribute("aria-label", "Possible answers");
  const bankGrid = createElement("div", "fib-bank-grid");
  bank.appendChild(bankGrid);
  appendChildren(wrapper, [paragraph, bank, status]);
  elements.optionsContainer.appendChild(wrapper);

  function getWordElement(wordId) {
    return Array.from(wrapper.querySelectorAll("[data-word-id]")).find((element) => element.getAttribute("data-word-id") === wordId) || null;
  }

  function getBlankElement(blankId) {
    return Array.from(wrapper.querySelectorAll("[data-blank-id]")).find((element) => element.getAttribute("data-blank-id") === blankId) || null;
  }

  function setSelectedWord(wordId) {
    state.selectedWordId = state.selectedWordId === wordId ? null : wordId;
    updateFillInBlankUi();
  }

  function clearSubmittedFeedback() {
    if (state.finalized) {
      return;
    }

    wrapper.classList.remove("has-submitted-feedback");
    wrapper.querySelectorAll(".fib-blank:not(.is-locked), .fib-word:not(.is-locked)").forEach((element) => {
      element.classList.remove("is-correct", "is-misplaced", "is-bait", "is-missing");
    });
    status.textContent = "";
  }

  function getFilledBlankIdForWord(wordId) {
    for (const [blankId, placedWordId] of state.placements.entries()) {
      if (placedWordId === wordId) {
        return blankId;
      }
    }
    return null;
  }

  function moveWordToBank(wordId) {
    const currentBlankId = getFilledBlankIdForWord(wordId);
    if (currentBlankId) {
      state.placements.delete(currentBlankId);
    }
    bankGrid.appendChild(getWordElement(wordId));
  }

  function placeWordInBlank(wordId, blankId) {
    if (state.finalized || state.lockedBlankIds.has(blankId)) {
      return;
    }

    const wordElement = getWordElement(wordId);
    const blankElement = getBlankElement(blankId);
    if (!wordElement || !blankElement) {
      return;
    }

    clearSubmittedFeedback();

    const previousBlankId = getFilledBlankIdForWord(wordId);
    const existingWordId = state.placements.get(blankId);
    if (previousBlankId) {
      state.placements.delete(previousBlankId);
    }

    if (existingWordId && existingWordId !== wordId) {
      if (previousBlankId && previousBlankId !== blankId && !state.lockedBlankIds.has(previousBlankId)) {
        state.placements.set(previousBlankId, existingWordId);
        getBlankElement(previousBlankId).appendChild(getWordElement(existingWordId));
      } else {
        moveWordToBank(existingWordId);
      }
    }

    state.placements.set(blankId, wordId);
    blankElement.appendChild(wordElement);
    state.selectedWordId = null;
    updateFillInBlankUi();
  }

  function handleBlankAction(blankId) {
    if (state.finalized || state.lockedBlankIds.has(blankId)) {
      return;
    }

    if (state.selectedWordId) {
      placeWordInBlank(state.selectedWordId, blankId);
      return;
    }

    const wordId = state.placements.get(blankId);
    if (wordId) {
      setSelectedWord(wordId);
    }
  }

  function isReadyToSubmit() {
    return currentQuestion.activeBlanks.every((blank) => state.placements.has(blank.id));
  }

  function buildFillInBlankAttemptSummary(attemptNumber) {
    const results = currentQuestion.activeBlanks.map((blank) => {
      const word = getFillInBlankWordById(currentQuestion, state.placements.get(blank.id));
      const statusName = getFillInBlankWordStatus(word, blank.id);
      return {
        blankId: blank.id,
        selectedAnswer: word ? word.text : "",
        correctAnswer: blank.answer,
        status: statusName,
        isCorrect: statusName === "correct"
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

  function updateFillInBlankUi() {
    currentQuestion.activeBlanks.forEach((blank, blankIndex) => {
      const blankElement = getBlankElement(blank.id);
      if (!blankElement) {
        return;
      }

      const placedWordId = state.placements.get(blank.id);
      const placedWord = getFillInBlankWordById(currentQuestion, placedWordId);
      const isEmpty = !placedWordId;
      blankElement.classList.toggle("is-empty", isEmpty);
      blankElement.classList.toggle("is-filled", !isEmpty);
      blankElement.classList.toggle("is-selected", placedWordId === state.selectedWordId);
      blankElement.classList.toggle("is-target", Boolean(state.selectedWordId) && !state.finalized);
      blankElement.classList.toggle("is-locked", state.lockedBlankIds.has(blank.id));
      blankElement.setAttribute(
        "aria-label",
        isEmpty
          ? `Blank ${blankIndex + 1}${blank.hint ? `, hint: ${blank.hint}` : ""}`
          : `Blank ${blankIndex + 1}, ${placedWord ? placedWord.text : "filled"}`
      );
    });

    currentQuestion.wordBank.forEach((word) => {
      const wordElement = getWordElement(word.id);
      if (!wordElement) {
        return;
      }

      const filledBlankId = getFilledBlankIdForWord(word.id);
      const isLocked = filledBlankId && state.lockedBlankIds.has(filledBlankId);
      wordElement.classList.toggle("is-selected", state.selectedWordId === word.id);
      wordElement.classList.toggle("is-placed", Boolean(filledBlankId));
      wordElement.classList.toggle("is-locked", Boolean(isLocked));
      wordElement.draggable = !state.finalized && !isLocked;
      wordElement.setAttribute("aria-pressed", state.selectedWordId === word.id ? "true" : "false");
    });

    elements.nextBtn.disabled = state.finalized ? false : !isReadyToSubmit();
  }

  function renderFillInBlankFeedback(isFinal) {
    wrapper.classList.add("has-submitted-feedback");
    state.lockedBlankIds.clear();

    currentQuestion.activeBlanks.forEach((blank) => {
      const blankElement = getBlankElement(blank.id);
      const wordId = state.placements.get(blank.id);
      const word = getFillInBlankWordById(currentQuestion, wordId);
      const statusName = getFillInBlankWordStatus(word, blank.id);
      blankElement.classList.remove("is-correct", "is-misplaced", "is-bait", "is-missing");
      blankElement.classList.add(`is-${statusName}`);

      if (statusName === "correct") {
        state.lockedBlankIds.add(blank.id);
      }
    });

    currentQuestion.wordBank.forEach((word) => {
      const wordElement = getWordElement(word.id);
      const blankId = getFilledBlankIdForWord(word.id);
      const statusName = getFillInBlankWordStatus(word, blankId);
      wordElement.classList.remove("is-correct", "is-misplaced", "is-bait", "is-missing");
      if (blankId) {
        wordElement.classList.add(`is-${statusName}`);
      }
    });

    status.textContent = isFinal ? "" : "Try once more.";
    updateFillInBlankUi();
  }

  function submitFillInBlankAnswer() {
    if (state.finalized || !isReadyToSubmit()) {
      updateFillInBlankUi();
      return;
    }

    state.attempts += 1;
    state.selectedWordId = null;
    const attemptSummary = buildFillInBlankAttemptSummary(state.attempts);
    state.attemptSummaries[state.attempts - 1] = attemptSummary;
    const isCorrect = attemptSummary.isCorrect;
    const isFinal = isCorrect || state.attempts >= FIB_MAX_ATTEMPTS;

    renderFillInBlankFeedback(isFinal);

    if (!isFinal) {
      elements.nextBtn.textContent = "Submit Again";
      playSound("fail");
      return;
    }

    state.finalized = true;
    quizState.hasAnswered = true;
    quizState.selectedIndex = 0;
    quizState.submitCurrentAnswer = null;
    elements.nextBtn.textContent = "Next Question";
    elements.nextBtn.disabled = false;

    if (isCorrect) {
      quizState.score += 1;
      playSound("win");
      const firstCorrectBlank = wrapper.querySelector(".fib-blank.is-correct");
      if (firstCorrectBlank) {
        triggerFireworks(firstCorrectBlank);
      }
    } else {
      playSound("fail");
    }

    recordQuestionAnalytics(currentQuestion, null, isCorrect, Date.now(), {
      questionType: "fib",
      selectedOption: buildFillInBlankAnswerSummary(currentQuestion, state.placements),
      correctOption: buildFillInBlankCorrectSummary(currentQuestion),
      attemptCount: state.attempts,
      fibAttempts: state.attemptSummaries.slice()
    });
    elements.scoreText.textContent = `Score: ${quizState.score}`;
    updateFillInBlankUi();
  }

  function clearTouchDragTarget() {
    if (!state.touchDrag || !state.touchDrag.targetElement) {
      return;
    }

    state.touchDrag.targetElement.classList.remove("is-dragover");
    state.touchDrag.targetElement = null;
    state.touchDrag.targetType = null;
    state.touchDrag.targetBlankId = null;
  }

  function getTouchDropTarget(clientX, clientY) {
    const targetElement = document.elementFromPoint(clientX, clientY);
    if (!targetElement || !(targetElement instanceof Element)) {
      return null;
    }

    const blankElement = targetElement.closest(".fib-blank");
    if (blankElement && wrapper.contains(blankElement)) {
      const blankId = blankElement.getAttribute("data-blank-id");
      if (blankId && !state.lockedBlankIds.has(blankId)) {
        return { type: "blank", element: blankElement, blankId };
      }
    }

    const bankElement = targetElement.closest(".fib-bank");
    if (bankElement && bank.contains(bankElement)) {
      return { type: "bank", element: bank };
    }

    return null;
  }

  function createTouchDragGhost(wordButton, clientX, clientY) {
    const ghost = wordButton.cloneNode(true);
    ghost.classList.remove("is-placed", "is-correct", "is-misplaced", "is-bait", "is-locked", "is-touch-origin");
    ghost.classList.add("fib-drag-ghost", "is-selected");
    ghost.removeAttribute("draggable");
    ghost.style.left = `${clientX}px`;
    ghost.style.top = `${clientY}px`;
    document.body.appendChild(ghost);
    return ghost;
  }

  function updateTouchDragGhost(clientX, clientY) {
    if (!state.touchDrag || !state.touchDrag.ghost) {
      return;
    }

    state.touchDrag.ghost.style.left = `${clientX}px`;
    state.touchDrag.ghost.style.top = `${clientY}px`;
  }

  function updateTouchDragTarget(clientX, clientY) {
    if (!state.touchDrag) {
      return;
    }

    const dropTarget = getTouchDropTarget(clientX, clientY);
    if (dropTarget && state.touchDrag.targetElement === dropTarget.element) {
      return;
    }

    clearTouchDragTarget();

    if (!dropTarget) {
      return;
    }

    dropTarget.element.classList.add("is-dragover");
    state.touchDrag.targetElement = dropTarget.element;
    state.touchDrag.targetType = dropTarget.type;
    state.touchDrag.targetBlankId = dropTarget.blankId || null;
  }

  function cleanupTouchDrag() {
    if (!state.touchDrag) {
      return;
    }

    clearTouchDragTarget();
    if (state.touchDrag.ghost) {
      state.touchDrag.ghost.remove();
    }
    if (state.touchDrag.sourceElement) {
      state.touchDrag.sourceElement.classList.remove("is-touch-origin");
    }

    state.touchDrag = null;
    state.selectedWordId = null;
    updateFillInBlankUi();
  }

  function finishTouchDrag(event, shouldDrop) {
    if (!state.touchDrag || event.pointerId !== state.touchDrag.pointerId) {
      return;
    }

    const touchDrag = state.touchDrag;
    const wasActive = touchDrag.active;
    if (wasActive && shouldDrop) {
      const dropTarget = getTouchDropTarget(event.clientX, event.clientY);
      if (dropTarget && dropTarget.type === "blank" && dropTarget.blankId) {
        placeWordInBlank(touchDrag.wordId, dropTarget.blankId);
      } else if (dropTarget && dropTarget.type === "bank") {
        clearSubmittedFeedback();
        moveWordToBank(touchDrag.wordId);
      }
    }

    if (wasActive) {
      state.lastTouchDragAt = Date.now();
      event.preventDefault();
    }

    cleanupTouchDrag();
  }

  function createWordChip(word) {
    const wordButton = createElement("button", "fib-word", word.text);
    wordButton.type = "button";
    wordButton.draggable = true;
    wordButton.setAttribute("data-word-id", word.id);
    wordButton.setAttribute("aria-pressed", "false");
    wordButton.addEventListener("click", function (event) {
      event.stopPropagation();
      if (Date.now() - state.lastTouchDragAt < 220) {
        event.preventDefault();
        return;
      }

      if (state.finalized || wordButton.classList.contains("is-locked")) {
        return;
      }

      if (state.selectedWordId === word.id && getFilledBlankIdForWord(word.id)) {
        clearSubmittedFeedback();
        moveWordToBank(word.id);
        state.selectedWordId = null;
        updateFillInBlankUi();
        return;
      }

      setSelectedWord(word.id);
    });
    wordButton.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" || state.finalized || wordButton.classList.contains("is-locked")) {
        return;
      }

      state.touchDrag = {
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
    });
    wordButton.addEventListener("pointermove", function (event) {
      if (!state.touchDrag || event.pointerId !== state.touchDrag.pointerId) {
        return;
      }

      const deltaX = event.clientX - state.touchDrag.startX;
      const deltaY = event.clientY - state.touchDrag.startY;
      const distance = Math.hypot(deltaX, deltaY);
      if (!state.touchDrag.active && distance < 8) {
        return;
      }

      if (!state.touchDrag.active) {
        clearSubmittedFeedback();
        state.touchDrag.active = true;
        state.selectedWordId = word.id;
        state.touchDrag.ghost = createTouchDragGhost(wordButton, event.clientX, event.clientY);
        wordButton.classList.add("is-touch-origin");
        updateFillInBlankUi();
      }

      event.preventDefault();
      updateTouchDragGhost(event.clientX, event.clientY);
      updateTouchDragTarget(event.clientX, event.clientY);
    });
    wordButton.addEventListener("pointerup", function (event) {
      finishTouchDrag(event, true);
    });
    wordButton.addEventListener("pointercancel", function (event) {
      finishTouchDrag(event, false);
    });
    wordButton.addEventListener("dragstart", function (event) {
      if (state.finalized || wordButton.classList.contains("is-locked")) {
        event.preventDefault();
        return;
      }
      state.selectedWordId = word.id;
      event.dataTransfer.setData("text/plain", word.id);
      event.dataTransfer.effectAllowed = "move";
      window.setTimeout(updateFillInBlankUi, 0);
    });
    wordButton.addEventListener("dragend", function () {
      state.selectedWordId = null;
      updateFillInBlankUi();
    });
    return wordButton;
  }

  function createBlank(blank, blankIndex) {
    const blankButton = createElement("span", "fib-blank is-empty");
    blankButton.setAttribute("role", "button");
    blankButton.setAttribute("tabindex", "0");
    blankButton.setAttribute("data-blank-id", blank.id);
    blankButton.setAttribute("aria-label", `Blank ${blankIndex + 1}${blank.hint ? `, hint: ${blank.hint}` : ""}`);
    blankButton.addEventListener("click", function () {
      handleBlankAction(blank.id);
    });
    blankButton.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handleBlankAction(blank.id);
    });
    blankButton.addEventListener("dragover", function (event) {
      if (state.finalized || state.lockedBlankIds.has(blank.id)) {
        return;
      }
      event.preventDefault();
      blankButton.classList.add("is-dragover");
      event.dataTransfer.dropEffect = "move";
    });
    blankButton.addEventListener("dragleave", function () {
      blankButton.classList.remove("is-dragover");
    });
    blankButton.addEventListener("drop", function (event) {
      event.preventDefault();
      blankButton.classList.remove("is-dragover");
      const wordId = event.dataTransfer.getData("text/plain");
      if (wordId) {
        placeWordInBlank(wordId, blank.id);
      }
    });
    blankButton.appendChild(createElement("span", "fib-blank-label", String(blankIndex + 1)));
    return blankButton;
  }

  function renderParagraph() {
    paragraph.innerHTML = "";
    const activeBlankIds = new Set(currentQuestion.activeBlankIds);
    const blankIndexById = new Map(currentQuestion.activeBlanks.map((blank, index) => [blank.id, index]));
    const placeholderPattern = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let match = placeholderPattern.exec(currentQuestion.paragraph);

    while (match) {
      if (match.index > lastIndex) {
        paragraph.appendChild(document.createTextNode(currentQuestion.paragraph.slice(lastIndex, match.index)));
      }

      const blankId = match[1].trim();
      const blank = getFillInBlankById(currentQuestion, blankId);
      if (blank && activeBlankIds.has(blankId)) {
        paragraph.appendChild(createBlank(blank, blankIndexById.get(blankId)));
      } else {
        const fallbackBlank = currentQuestion.blanks.find((candidate) => candidate.id === blankId);
        paragraph.appendChild(document.createTextNode(fallbackBlank ? fallbackBlank.answer : match[0]));
      }

      lastIndex = match.index + match[0].length;
      match = placeholderPattern.exec(currentQuestion.paragraph);
    }

    if (lastIndex < currentQuestion.paragraph.length) {
      paragraph.appendChild(document.createTextNode(currentQuestion.paragraph.slice(lastIndex)));
    }
  }

  bank.addEventListener("dragover", function (event) {
    event.preventDefault();
    bank.classList.add("is-dragover");
    event.dataTransfer.dropEffect = "move";
  });
  bank.addEventListener("dragleave", function () {
    bank.classList.remove("is-dragover");
  });
  bank.addEventListener("drop", function (event) {
    event.preventDefault();
    bank.classList.remove("is-dragover");
    const wordId = event.dataTransfer.getData("text/plain");
    if (wordId) {
      clearSubmittedFeedback();
      moveWordToBank(wordId);
      state.selectedWordId = null;
      updateFillInBlankUi();
    }
  });

  renderParagraph();
  currentQuestion.wordBank.forEach((word) => {
    bankGrid.appendChild(createWordChip(word));
  });
  quizState.submitCurrentAnswer = submitFillInBlankAnswer;
  updateFillInBlankUi();
}

export function renderQuestion() {
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  quizState.selectedIndex = null;
  quizState.hasAnswered = false;
  quizState.submitCurrentAnswer = null;
  quizState.questionStartedAt = Date.now();
  elements.nextBtn.disabled = true;
  elements.nextBtn.textContent = "Next Question";

  elements.progressText.textContent = `Question ${quizState.currentQuestionIndex + 1} of ${quizState.questions.length}`;
  elements.scoreText.textContent = `Score: ${quizState.score}`;
  elements.questionText.textContent = "";
  elements.optionsContainer.innerHTML = "";
  elements.optionsContainer.className = "options-container";

  if (currentQuestion.type === "fib") {
    renderFillInBlankQuestion(currentQuestion);
    return;
  }

  renderMultipleChoiceQuestion(currentQuestion);
}
