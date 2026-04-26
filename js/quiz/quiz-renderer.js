import { recordQuestionAnalytics } from "../analytics/analytics-recording.js";
import { elements } from "../core/dom.js";
import { quizState } from "../core/state.js";
import { createElement } from "../core/utils.js";
import { playSound } from "../ui/audio.js";
import { triggerFireworks } from "../ui/effects.js";

export function renderQuestion() {
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  quizState.selectedIndex = null;
  quizState.hasAnswered = false;
  quizState.questionStartedAt = Date.now();
  elements.nextBtn.disabled = true;

  elements.progressText.textContent = `Question ${quizState.currentQuestionIndex + 1} of ${quizState.questions.length}`;
  elements.scoreText.textContent = `Score: ${quizState.score}`;
  elements.questionText.textContent = currentQuestion.question;
  elements.optionsContainer.innerHTML = "";

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
