import { elements, screens } from "./dom.js";
import { libraryRuntime } from "./state.js";

export function getActiveScreenName() {
  const activeEntry = Object.entries(screens).find(([, screen]) => screen.classList.contains("is-active"));
  return activeEntry ? activeEntry[0] : null;
}

export function showScreen(name) {
  const previousScreenName = getActiveScreenName();
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));

  if (name === "settings" && previousScreenName && previousScreenName !== "settings") {
    libraryRuntime.lastNonSettingsScreen = previousScreenName;
  }

  if (name !== "guide" && name !== "settings") {
    libraryRuntime.lastNonGuideScreen = name;
  }
  screens[name].classList.add("is-active");
}

export function clearError() {
  elements.errorMessage.textContent = "";
}

export function showError(message) {
  elements.errorMessage.textContent = message;
}
