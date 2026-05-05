import { elements } from "../core/dom.js";

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

export function closeAllMiniPopups() {
  closeQuizActionMenus();
}

export function handleGlobalPopupClose(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const clickedInsideQuizMenu = Boolean(event.target.closest(".saved-action-menu-wrap"));
  if (!clickedInsideQuizMenu) {
    closeQuizActionMenus();
  }
}
