import { roundTo } from "../core/utils.js";

export function formatTimestamp(timestamp) {
  const value = Number(timestamp);
  if (!value) {
    return "Unknown time";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch (error) {
    return new Date(value).toLocaleString();
  }
}

export function formatDuration(durationMs) {
  const totalMs = Math.max(Math.round(Number(durationMs) || 0), 0);
  if (totalMs > 0 && totalMs < 1000) {
    return `${totalMs}ms`;
  }

  const totalSeconds = Math.max(Math.round(totalMs / 1000), 0);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${totalMinutes}m`;
}

export function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

export function formatRatioPercent(value, digits) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "\u2014";
  }
  return `${roundTo(amount * 100, digits === undefined ? 0 : digits)}%`;
}

export function formatDecimal(value, digits, suffix) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "\u2014";
  }
  const precision = Number.isInteger(digits) ? digits : 2;
  return `${roundTo(amount, precision)}${suffix || ""}`;
}

export function formatSignedScoreChange(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "\u2014";
  }

  const rounded = roundTo(amount, 0);
  if (rounded > 0) {
    return `+${rounded}%`;
  }
  if (rounded < 0) {
    return `${rounded}%`;
  }
  return "0%";
}

export function formatSignedRatioPercent(value, digits) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "\u2014";
  }

  const rounded = roundTo(amount * 100, digits === undefined ? 0 : digits);
  if (rounded > 0) {
    return `+${rounded}%`;
  }
  if (rounded < 0) {
    return `${rounded}%`;
  }
  return "0%";
}

export function formatTrendSlope(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "\u2014";
  }

  const pointsPerDay = amount * 86400000;
  const rounded = roundTo(pointsPerDay, 1);
  if (rounded > 0) {
    return `+${rounded} pts/day`;
  }
  if (rounded < 0) {
    return `${rounded} pts/day`;
  }
  return "0 pts/day";
}

export function formatMetricText(value, formatter) {
  if (value === null || value === undefined) {
    return "\u2014";
  }
  return typeof formatter === "function" ? formatter(value) : String(value);
}
