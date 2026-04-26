import { DEFAULT_GOAL_PERCENT } from "./constants.js";

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeGoalPercent(value) {
  const goal = Math.round(Number(value));
  if (!Number.isFinite(goal)) {
    return DEFAULT_GOAL_PERCENT;
  }
  return clamp(goal, 0, 100);
}

export function safeDivide(numerator, denominator, fallback) {
  const top = Number(numerator);
  const bottom = Number(denominator);
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom === 0) {
    return fallback === undefined ? 0 : fallback;
  }
  return top / bottom;
}

export function roundTo(value, digits) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }

  const precision = Number.isInteger(digits) ? Math.max(digits, 0) : 0;
  const multiplier = 10 ** precision;
  return Math.round(amount * multiplier) / multiplier;
}

export function safeJsonParse(text, fallbackValue) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return fallbackValue;
  }
}

export function supportsLocalStorage() {
  try {
    const probeKey = "__recall_probe__";
    localStorage.setItem(probeKey, probeKey);
    localStorage.removeItem(probeKey);
    return true;
  } catch (error) {
    return false;
  }
}

export function shuffleList(items) {
  const nextItems = items.slice();
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = nextItems[index];
    nextItems[index] = nextItems[swapIndex];
    nextItems[swapIndex] = temp;
  }
  return nextItems;
}

export function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

export function appendChildren(parent, children) {
  children.filter(Boolean).forEach((child) => parent.appendChild(child));
  return parent;
}

export function cloneQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    question: question.question,
    options: [...question.options],
    correctIndex: question.correctIndex
  }));
}
