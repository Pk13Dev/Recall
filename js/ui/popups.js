import { elements } from "../core/dom.js";
import { clamp } from "../core/utils.js";

export function closeQuizActionMenus(activeQuizId) {
  const activeId = typeof activeQuizId === "string" ? activeQuizId : null;
  const menus = Array.from(elements.savedQuizList.querySelectorAll(".saved-action-menu"));
  menus.forEach((menu) => {
    const quizId = menu.getAttribute("data-quiz-id");
    const shouldOpen = Boolean(activeId && quizId === activeId);
    menu.classList.toggle("is-open", shouldOpen);

    const toggleButton = menu.querySelector(".saved-action-menu-toggle");
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }
  });
}

export function positionPopupWithinViewport(triggerButton, popup) {
  if (!triggerButton || !popup || !popup.classList.contains("is-open")) {
    return;
  }

  popup.style.left = "";
  popup.style.right = "0";
  popup.style.top = "";

  const triggerRect = triggerButton.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const parentRect = popup.offsetParent ? popup.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
  const viewportPadding = 10;
  const verticalGap = 8;

  const preferredLeft = triggerRect.right - popupRect.width;
  const clampedLeft = clamp(
    preferredLeft,
    viewportPadding,
    Math.max(viewportPadding, viewportWidth - popupRect.width - viewportPadding)
  );

  let popupTop = triggerRect.bottom + verticalGap;
  if (popupTop + popupRect.height > viewportHeight - viewportPadding) {
    popupTop = Math.max(viewportPadding, triggerRect.top - popupRect.height - verticalGap);
  }

  popup.style.left = `${Math.round(clampedLeft - parentRect.left)}px`;
  popup.style.right = "auto";
  popup.style.top = `${Math.round(popupTop - parentRect.top)}px`;
}

export function repositionOpenMiniPopups() {
  positionPopupWithinViewport(elements.soundToggleBtn, elements.soundPopup);
  positionPopupWithinViewport(elements.themeToggleBtn, elements.themePopup);
  positionPopupWithinViewport(elements.goalToggleBtn, elements.goalPopup);
}

export function setSoundPopupOpen(isOpen) {
  const open = Boolean(isOpen);
  elements.soundPopup.classList.toggle("is-open", open);
  elements.soundToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    window.requestAnimationFrame(repositionOpenMiniPopups);
  }
}

export function setThemePopupOpen(isOpen) {
  const open = Boolean(isOpen);
  elements.themePopup.classList.toggle("is-open", open);
  elements.themeToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    window.requestAnimationFrame(repositionOpenMiniPopups);
  }
}

export function setGoalPopupOpen(isOpen) {
  const open = Boolean(isOpen);
  elements.goalPopup.classList.toggle("is-open", open);
  elements.goalToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    window.requestAnimationFrame(repositionOpenMiniPopups);
  }
}

export function closeAllMiniPopups() {
  closeQuizActionMenus();
  setSoundPopupOpen(false);
  setThemePopupOpen(false);
  setGoalPopupOpen(false);
}

export function handleGlobalPopupClose(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const clickedInsideSoundToggle = elements.soundToggleBtn.contains(event.target);
  const clickedInsideSoundPopup = elements.soundPopup.contains(event.target);
  const clickedInsideThemeToggle = elements.themeToggleBtn.contains(event.target);
  const clickedInsideThemePopup = elements.themePopup.contains(event.target);
  const clickedInsideGoalToggle = elements.goalToggleBtn.contains(event.target);
  const clickedInsideGoalPopup = elements.goalPopup.contains(event.target);
  const clickedInsideQuizMenu = Boolean(event.target.closest(".saved-action-menu-wrap"));

  if (!clickedInsideSoundToggle && !clickedInsideSoundPopup) {
    setSoundPopupOpen(false);
  }
  if (!clickedInsideThemeToggle && !clickedInsideThemePopup) {
    setThemePopupOpen(false);
  }
  if (!clickedInsideGoalToggle && !clickedInsideGoalPopup) {
    setGoalPopupOpen(false);
  }
  if (!clickedInsideQuizMenu) {
    closeQuizActionMenus();
  }
}
