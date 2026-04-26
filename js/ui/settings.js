import { DEFAULT_GOAL_PERCENT, DEFAULT_THEME, THEME_LABELS, THEMES } from "../core/constants.js";
import { elements, screens } from "../core/dom.js";
import { libraryRuntime, quizState } from "../core/state.js";
import { clamp, normalizeGoalPercent } from "../core/utils.js";
import { scheduleLibrarySave } from "../storage/storage.js";
import { sounds } from "./audio.js";

export function isValidTheme(themeName) {
  return THEMES.includes(themeName);
}

export function formatThemeName(themeName) {
  return THEME_LABELS[themeName] || THEME_LABELS.light;
}

export function setLibraryNote(message) {
  elements.libraryNote.textContent = message;
}

export function updateLibraryNote() {
  if (libraryRuntime.mode === "opfs" || libraryRuntime.mode === "localStorage") {
    setLibraryNote("Storage: Browser only");
    return;
  }

  setLibraryNote("Storage: Temporary tab session");
}

export function setTheme(themeName, shouldPersist) {
  const nextTheme = isValidTheme(themeName) ? themeName : DEFAULT_THEME;
  libraryRuntime.activeTheme = nextTheme;

  document.body.classList.remove("theme-light", "theme-dark", "theme-neon", "theme-vibrant");
  document.body.classList.add(`theme-${nextTheme}`);
  elements.themeValue.textContent = formatThemeName(nextTheme);

  const themeButtons = Array.from(elements.themeOptions.querySelectorAll("[data-theme]"));
  themeButtons.forEach((button) => {
    const isActive = button.getAttribute("data-theme") === nextTheme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (libraryRuntime.model) {
    libraryRuntime.model.settings.theme = nextTheme;
    if (shouldPersist) {
      scheduleLibrarySave();
    }
  }
}

export function setGoalPercent(goalPercent, shouldPersist) {
  const nextGoal = normalizeGoalPercent(goalPercent);
  elements.goalControl.value = String(nextGoal);
  elements.goalValue.textContent = `${nextGoal}%`;

  if (libraryRuntime.model) {
    libraryRuntime.model.settings.goalPercent = nextGoal;
    if (shouldPersist) {
      scheduleLibrarySave();
    }
  }

  if (screens.results.classList.contains("is-active") && quizState.questions.length) {
    elements.correctCount.textContent = `Total correct answers: ${quizState.score} | Goal: ${nextGoal}%`;
  }

  if (screens.analytics.classList.contains("is-active")) {
    import("../analytics/analytics-renderer.js")
      .then(({ renderAnalyticsScreen }) => renderAnalyticsScreen())
      .catch((error) => {
        console.error("Could not refresh analytics after goal update.", error);
      });
  }
}

export function getGoalPercent() {
  if (!libraryRuntime.model || !libraryRuntime.model.settings) {
    return DEFAULT_GOAL_PERCENT;
  }
  return normalizeGoalPercent(libraryRuntime.model.settings.goalPercent);
}

export function setNotificationVolume(volume, shouldPersist) {
  const nextVolume = clamp(Number(volume), 0, 1);
  Object.values(sounds).forEach((audio) => {
    audio.volume = nextVolume;
  });

  const percent = Math.round(nextVolume * 100);
  elements.volumeControl.value = String(percent);
  elements.volumeValue.textContent = `${percent}%`;

  if (libraryRuntime.model) {
    libraryRuntime.model.settings.volume = nextVolume;
    if (shouldPersist) {
      scheduleLibrarySave();
    }
  }
}
