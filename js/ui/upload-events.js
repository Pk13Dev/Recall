import { elements } from "../core/dom.js";
import { showError } from "../core/screens.js";
import { getImportEntriesFromDrop } from "../import/drag-drop.js";
import { processQuizFile, processQuizFiles } from "../import/import-processing.js";

export function hasDraggedFiles(event) {
  const types = Array.from((event.dataTransfer && event.dataTransfer.types) || []);
  return types.includes("Files");
}

export function setUploadDragActive(isActive) {
  elements.dropZone.classList.toggle("is-dragover", isActive);
  if (elements.uploadCard) {
    elements.uploadCard.classList.toggle("is-dragover", isActive);
  }
}

export function resetUploadInputs() {
  elements.fileInput.value = "";
  elements.folderInput.value = "";
}

export function initializeUploadEvents() {
  let uploadDragDepth = 0;

  elements.chooseFileBtn.addEventListener("click", () => elements.fileInput.click());
  elements.chooseFolderBtn.addEventListener("click", () => elements.folderInput.click());

  elements.fileInput.addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    processQuizFile(file);
  });

  elements.folderInput.addEventListener("change", function (event) {
    const files = event.target.files || [];
    processQuizFiles(files);
  });

  function handleUploadDragEnter(event) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    uploadDragDepth += 1;
    setUploadDragActive(true);
  }

  function handleUploadDragOver(event) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    setUploadDragActive(true);
  }

  function handleUploadDragLeave(event) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    uploadDragDepth = Math.max(uploadDragDepth - 1, 0);
    if (!uploadDragDepth) {
      setUploadDragActive(false);
    }
  }

  async function handleUploadDrop(event) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    uploadDragDepth = 0;
    setUploadDragActive(false);
    await onDrop(event);
  }

  [elements.uploadCard].filter(Boolean).forEach((target) => {
    target.addEventListener("dragenter", handleUploadDragEnter);
    target.addEventListener("dragover", handleUploadDragOver);
    target.addEventListener("dragleave", handleUploadDragLeave);
    target.addEventListener("drop", function (event) {
      handleUploadDrop(event).catch(() => {
        showError("That drop could not be imported right now.");
      });
    });
  });

  document.addEventListener("dragover", function (event) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
  });

  document.addEventListener("drop", function (event) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    const dropTarget = event.target instanceof Node ? event.target : null;
    if (elements.uploadCard && dropTarget && elements.uploadCard.contains(dropTarget)) {
      return;
    }

    event.preventDefault();
    uploadDragDepth = 0;
    setUploadDragActive(false);
    showError("Drop quiz files into the upload panel, or use Upload JSON / Open Folder.");
  });

  elements.dropZone.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });
}

export async function onDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove("is-dragover");
  const importEntries = await getImportEntriesFromDrop(event);
  await processQuizFiles(importEntries);
}
