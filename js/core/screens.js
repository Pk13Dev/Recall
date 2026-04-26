import { elements, screens } from "./dom.js";
import { libraryRuntime } from "./state.js";

export function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  if (name !== "guide") {
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
