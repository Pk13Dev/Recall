import { recordQuestionAnalytics } from "../analytics/analytics-recording.js";
import { elements } from "../core/dom.js";
import { quizState } from "../core/state.js";
import { playSound } from "../ui/audio.js";
import { triggerFireworks } from "../ui/effects.js";
import { renderFillInBlankQuestion, resetQuizHintButton } from "./fib-renderer.js";

export {
  buildFillInBlankAnswerSummary,
  buildFillInBlankCorrectSummary,
  getFillInBlankById,
  getFillInBlankWordById,
  getFillInBlankWordStatus,
  renderFillInBlankQuestion
} from "./fib-renderer.js";

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

export function renderQuestion() {
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  quizState.selectedIndex = null;
  quizState.hasAnswered = false;
  quizState.submitCurrentAnswer = null;
  quizState.questionStartedAt = Date.now();
  elements.nextBtn.disabled = true;
  elements.nextBtn.textContent = "Next Question";
  resetQuizHintButton();

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
