import { fireworkColors } from "../core/constants.js";
import { elements, screens } from "../core/dom.js";
import { libraryRuntime } from "../core/state.js";
import { createElement } from "../core/utils.js";
import { playSoundWithRecovery, primeAudioPlayback, resetSoundPlayback, sounds } from "./audio.js";

export function triggerFireworks(targetButton) {
  const rect = targetButton.getBoundingClientRect();
  const burst = document.createElement("div");
  burst.className = "firework-burst";
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;

  for (let i = 0; i < 16; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.25;
    const distance = 36 + Math.random() * 38;
    particle.className = "firework-particle";
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.backgroundColor = fireworkColors[i % fireworkColors.length];
    particle.style.animationDelay = `${Math.random() * 80}ms`;
    burst.appendChild(particle);
  }

  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 900);
}

export function clearConfetti() {
  if (libraryRuntime.confettiTimer) {
    window.clearTimeout(libraryRuntime.confettiTimer);
    libraryRuntime.confettiTimer = null;
  }
  elements.confettiLayer.innerHTML = "";
}

export function triggerVictoryConfetti() {
  clearConfetti();

  const originCard = screens.results.querySelector(".card") || document.querySelector(".app-shell");
  const rect = originCard.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const colors = ["#4e7b72", "#79d6ff", "#ffd166", "#ff7b72", "#8cd9af", "#f4a261"];
  const pieceCount = 110;

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    const spreadX = (Math.random() - 0.5) * window.innerWidth * 1.3;
    const fallY = window.innerHeight * (0.5 + Math.random() * 0.6);
    const rotate = (Math.random() - 0.5) * 1080;
    const delay = Math.random() * 240;
    const duration = 1800 + Math.random() * 1500;

    piece.className = "confetti-piece";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty("--confetti-x", `${spreadX}px`);
    piece.style.setProperty("--confetti-y", `${fallY}px`);
    piece.style.setProperty("--confetti-rotate", `${rotate}deg`);
    piece.style.animationDelay = `${delay}ms`;
    piece.style.animationDuration = `${duration}ms`;
    elements.confettiLayer.appendChild(piece);
  }

  libraryRuntime.confettiTimer = window.setTimeout(() => {
    clearConfetti();
  }, 4200);
}

export function playVictoryCelebration() {
  const victorySound = sounds.victory;
  if (!victorySound) {
    triggerVictoryConfetti();
    return;
  }

  primeAudioPlayback();
  resetVictoryFeedback();

  let hasTriggeredConfetti = false;
  const launchConfetti = function () {
    if (hasTriggeredConfetti) {
      return;
    }
    hasTriggeredConfetti = true;
    libraryRuntime.resultEffectTimer = null;
    triggerVictoryConfetti();
    victorySound.onended = null;
  };

  resetSoundPlayback(victorySound);
  victorySound.onended = launchConfetti;
  victorySound.play().catch(() => {
    launchConfetti();
  });

  libraryRuntime.resultEffectTimer = window.setTimeout(launchConfetti, 1400);
}

export function triggerLossEffect() {
  clearConfetti();
  const colors = ["#7f8ea3", "#90a0b7", "#6d7f95", "#8aa3b8", "#9aa7b4"];
  const pieceCount = 84;

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    const startX = Math.random() * window.innerWidth;
    const startY = -24 - Math.random() * (window.innerHeight * 0.2);
    const driftX = (Math.random() - 0.5) * 180;
    const driftY = window.innerHeight * (0.92 + Math.random() * 0.28);
    const rotate = (Math.random() - 0.5) * 160;
    const delay = Math.random() * 260;
    const duration = 2200 + Math.random() * 1200;

    piece.className = "confetti-piece confetti-piece-sad";
    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty("--confetti-x", `${driftX}px`);
    piece.style.setProperty("--confetti-y", `${driftY}px`);
    piece.style.setProperty("--confetti-rotate", `${rotate}deg`);
    piece.style.animationDelay = `${delay}ms`;
    piece.style.animationDuration = `${duration}ms`;
    elements.confettiLayer.appendChild(piece);
  }

  libraryRuntime.confettiTimer = window.setTimeout(() => {
    clearConfetti();
  }, 4300);
}

export function playLossEffect() {
  resetVictoryFeedback();
  triggerLossEffect();
  playSoundWithRecovery("loser", "fail");
}

export function resetVictoryFeedback() {
  if (libraryRuntime.resultEffectTimer) {
    window.clearTimeout(libraryRuntime.resultEffectTimer);
    libraryRuntime.resultEffectTimer = null;
  }
  clearConfetti();
  sounds.victory.onended = null;
  sounds.loser.onended = null;
  sounds.victory.pause();
  sounds.victory.currentTime = 0;
  sounds.loser.pause();
  sounds.loser.currentTime = 0;
}
