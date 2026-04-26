import { ROOT_LIBRARY_LABEL } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { appendChildren, createElement } from "../core/utils.js";
import { canGenerateOverview, getQuizTypeLabel } from "./overview-quizzes.js";
import { getCurrentFolder, getFolder, getQuiz } from "../storage/library-model.js";

export function formatCount(count, singularLabel, pluralLabel) {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
}

export function getFolderMetaText(folder) {
  const parts = [];

  if (folder.childFolderIds.length) {
    parts.push(formatCount(folder.childFolderIds.length, "subfolder", "subfolders"));
  }

  if (folder.quizIds.length) {
    parts.push(formatCount(folder.quizIds.length, "quiz file", "quiz files"));
  }

  if (canGenerateOverview(folder.id)) {
    parts.push("overview ready");
  }

  return parts.length ? parts.join(" / ") : "Empty folder";
}

export function getQuizMetaText(quiz) {
  const parts = [formatCount(quiz.questions.length, "question", "questions")];

  if (quiz.kind === "overview") {
    parts.push("mixed review set");
  }

  return parts.join(" / ");
}

export function renderBreadcrumb() {
  elements.libraryBreadcrumb.innerHTML = "";

  const lineage = [];
  let current = getCurrentFolder();
  while (current) {
    lineage.unshift(current);
    current = current.parentId ? getFolder(current.parentId) : null;
  }

  lineage.forEach((folder, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "library-path-btn";
    button.textContent = index === 0 ? ROOT_LIBRARY_LABEL : folder.name;
    button.setAttribute("data-action", "goto-folder");
    button.setAttribute("data-folder-id", folder.id);
    elements.libraryBreadcrumb.appendChild(button);

    if (index < lineage.length - 1) {
      const separator = document.createElement("span");
      separator.className = "library-path-sep";
      separator.textContent = "/";
      elements.libraryBreadcrumb.appendChild(separator);
    }
  });
}

export function createActionButton(config) {
  const button = createElement("button", config.className || "btn btn-secondary saved-item-btn", config.label);
  button.type = "button";
  button.setAttribute("data-action", config.action);
  if (config.folderId) {
    button.setAttribute("data-folder-id", config.folderId);
  }
  if (config.quizId) {
    button.setAttribute("data-quiz-id", config.quizId);
  }
  return button;
}

export function createSavedItemCopy(typeLabel, titleText, metaText) {
  const title = createElement("p", "saved-item-title");
  const typeTag = createElement("span", "saved-item-type", typeLabel);
  title.appendChild(typeTag);
  title.appendChild(document.createTextNode(titleText));

  return appendChildren(createElement("div", "saved-item-copy"), [
    title,
    createElement("p", "saved-item-meta", metaText)
  ]);
}

export function createSavedItemActions(actionConfigs) {
  return appendChildren(
    createElement("div", "saved-item-actions"),
    actionConfigs.map((config) => createActionButton(config))
  );
}

export function createQuizActionMenu(quizId) {
  const menu = createElement("div", "saved-action-menu");
  menu.setAttribute("data-quiz-id", quizId);

  const toggleButton = createActionButton({
    label: "Actions",
    action: "toggle-quiz-menu",
    quizId,
    className: "btn btn-secondary saved-item-btn saved-action-menu-toggle"
  });
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-haspopup", "menu");

  const menuPanel = createElement("div", "saved-action-menu-panel");
  menuPanel.setAttribute("role", "menu");
  appendChildren(menuPanel, [
    createActionButton({ label: "Quickie", action: "quickie-quiz", quizId }),
    createActionButton({ label: "Rename", action: "edit-quiz", quizId }),
    createActionButton({ label: "Move", action: "edit-move-quiz", quizId }),
    createActionButton({
      label: "Delete",
      action: "delete-quiz",
      quizId,
      className: "btn btn-secondary saved-item-btn saved-item-danger-btn"
    })
  ]);

  appendChildren(menu, [toggleButton, menuPanel]);
  return appendChildren(createElement("div", "saved-action-menu-wrap"), [menu]);
}

export function renderLibraryList() {
  elements.savedQuizList.innerHTML = "";
  elements.savedEmpty.textContent = "This folder is empty.";

  const currentFolder = getCurrentFolder();
  const folders = currentFolder.childFolderIds
    .map((folderId) => getFolder(folderId))
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));

  const quizzes = currentFolder.quizIds
    .map((quizId) => getQuiz(quizId))
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));

  if (!folders.length && !quizzes.length) {
    elements.savedEmpty.style.display = "block";
    return;
  }

  elements.savedEmpty.style.display = "none";

  folders.forEach((folder) => {
    const item = createElement("li", "saved-item saved-item-folder");
    const actionConfigs = [
      {
        label: "Open",
        action: "open-folder",
        folderId: folder.id,
        className: "btn btn-secondary saved-item-btn saved-item-main-btn"
      }
    ];

    if (canGenerateOverview(folder.id)) {
      actionConfigs.push({ label: "Overview", action: "overview-folder", folderId: folder.id });
    }

    actionConfigs.push(
      { label: "Rename", action: "edit-folder", folderId: folder.id },
      {
        label: "Delete",
        action: "delete-folder",
        folderId: folder.id,
        className: "btn btn-secondary saved-item-btn saved-item-danger-btn"
      }
    );

    appendChildren(item, [
      createSavedItemCopy("Folder", folder.name, getFolderMetaText(folder)),
      createSavedItemActions(actionConfigs)
    ]);
    elements.savedQuizList.appendChild(item);
  });

  quizzes.forEach((quiz) => {
    const item = createElement("li", "saved-item saved-item-quiz");
    const actions = createElement("div", "saved-item-actions");
    actions.appendChild(
      createActionButton({
        label: "Load",
        action: "load-quiz",
        quizId: quiz.id,
        className: "btn btn-secondary saved-item-btn saved-item-main-btn"
      })
    );
    actions.appendChild(createQuizActionMenu(quiz.id));
    appendChildren(item, [
      createSavedItemCopy(getQuizTypeLabel(quiz), quiz.name, getQuizMetaText(quiz)),
      actions
    ]);
    elements.savedQuizList.appendChild(item);
  });
}

export function refreshLibraryUI() {
  renderBreadcrumb();
  renderLibraryList();
  const currentFolder = getCurrentFolder();
  elements.upFolderBtn.disabled = !currentFolder.parentId;
  elements.overviewFolderBtn.disabled = !canGenerateOverview(currentFolder.id);
}
