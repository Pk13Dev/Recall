import { completeAnalyticsSession } from "../analytics/analytics-recording.js";
import { elements } from "../core/dom.js";
import { showScreen } from "../core/screens.js";
import { quizState } from "../core/state.js";
import { playLossEffect, playVictoryCelebration } from "../ui/effects.js";
import { getGoalPercent } from "../ui/settings.js";

export function showQuizResults(scorePercent, goalPercent) {
  elements.finalScore.textContent = `You scored ${quizState.score} out of ${quizState.questions.length}`;
  elements.scorePercent.textContent = `Percentage: ${scorePercent}%`;
  elements.correctCount.textContent = `Total correct answers: ${quizState.score} | Goal: ${goalPercent}%`;
  showScreen("results");

  if (scorePercent >= goalPercent) {
    playVictoryCelebration();
    return;
  }

  playLossEffect();
}

export function finishQuiz() {
  const scorePercent = Math.round(
    (quizState.questions.length ? quizState.score / quizState.questions.length : 0) * 100
  );
  const goalPercent = getGoalPercent();
  completeAnalyticsSession(scorePercent);
  showQuizResults(scorePercent, goalPercent);
}
