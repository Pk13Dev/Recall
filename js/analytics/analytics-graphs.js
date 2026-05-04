import { elements } from "../core/dom.js";
import { clamp, createElement } from "../core/utils.js";

export function createSvgElement(tagName) {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

export function renderAnalyticsScoreGraph(trendSeries) {
  const container = elements.analyticsScoreGraph;
  container.innerHTML = "";

  const chartSeries = trendSeries.slice();
  if (!chartSeries.length) {
    container.appendChild(createElement("p", "analytics-empty-message", "Complete quizzes to see your score trend."));
    return;
  }

  const width = 360;
  const height = 170;
  const paddingLeft = 24;
  const paddingRight = 12;
  const paddingTop = 14;
  const paddingBottom = 28;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const baselineY = paddingTop + innerHeight;
  const scores = chartSeries.map((session) => clamp(Number(session.scorePercent) || 0, 0, 100));
  const rollingScores = chartSeries.map((session) =>
    Number.isFinite(Number(session.rollingAverage)) ? clamp(Number(session.rollingAverage), 0, 100) : null
  );
  const points = scores.map((score, index) => {
    const x =
      chartSeries.length === 1
        ? paddingLeft + innerWidth / 2
        : paddingLeft + (innerWidth * index) / (chartSeries.length - 1);
    const y = baselineY - (score / 100) * innerHeight;
    return { x, y, score };
  });
  const rollingPoints = rollingScores.map((score, index) => {
    if (!Number.isFinite(score)) {
      return null;
    }
    const x =
      chartSeries.length === 1
        ? paddingLeft + innerWidth / 2
        : paddingLeft + (innerWidth * index) / (chartSeries.length - 1);
    const y = baselineY - (score / 100) * innerHeight;
    return { x, y, score };
  });

  const svg = createSvgElement("svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "analytics-line-chart");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Line chart showing score trend and rolling average over recent attempts");

  [0, 50, 100].forEach((tick) => {
    const y = baselineY - (tick / 100) * innerHeight;
    const gridLine = createSvgElement("line");
    gridLine.setAttribute("x1", String(paddingLeft));
    gridLine.setAttribute("y1", String(y));
    gridLine.setAttribute("x2", String(width - paddingRight));
    gridLine.setAttribute("y2", String(y));
    gridLine.setAttribute("class", "analytics-line-chart-grid");
    svg.appendChild(gridLine);

    const label = createSvgElement("text");
    label.setAttribute("x", "2");
    label.setAttribute("y", String(y + 3));
    label.setAttribute("class", "analytics-line-chart-axis");
    label.textContent = `${tick}%`;
    svg.appendChild(label);
  });

  const areaPoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = createSvgElement("polygon");
  area.setAttribute(
    "points",
    `${paddingLeft},${baselineY} ${areaPoints} ${points[points.length - 1].x},${baselineY}`
  );
  area.setAttribute("class", "analytics-line-chart-area");
  svg.appendChild(area);

  const polyline = createSvgElement("polyline");
  polyline.setAttribute("points", areaPoints);
  polyline.setAttribute("class", "analytics-line-chart-line");
  svg.appendChild(polyline);

  const rollingPolyline = createSvgElement("polyline");
  rollingPolyline.setAttribute(
    "points",
    rollingPoints
      .filter(Boolean)
      .map((point) => `${point.x},${point.y}`)
      .join(" ")
  );
  rollingPolyline.setAttribute("class", "analytics-line-chart-line analytics-line-chart-line-secondary");
  svg.appendChild(rollingPolyline);

  points.forEach((point) => {
    const circle = createSvgElement("circle");
    circle.setAttribute("cx", String(point.x));
    circle.setAttribute("cy", String(point.y));
    circle.setAttribute("r", "4");
    circle.setAttribute("class", "analytics-line-chart-point");
    svg.appendChild(circle);
  });

  chartSeries.forEach((session, index) => {
    const label = createSvgElement("text");
    label.setAttribute("x", String(points[index].x));
    label.setAttribute("y", String(height - 8));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "analytics-line-chart-axis");
    label.textContent = String(index + 1);
    svg.appendChild(label);
  });

  container.appendChild(svg);
}

export function renderAnalyticsCoverageGraph(snapshot) {
  const container = elements.analyticsCoverageGraph;
  container.innerHTML = "";

  const bars = [
    { label: "Attempted", value: snapshot.attemptedQuizCount, tone: "default" },
    { label: `${snapshot.goalPercent}%+`, value: snapshot.passedQuizCount, tone: "success" },
    { label: `Below ${snapshot.goalPercent}%`, value: snapshot.needsWorkQuizCount, tone: "danger" },
    { label: "Unattempted", value: snapshot.unattemptedQuizzes.length, tone: "muted" }
  ];
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  const chart = createElement("div", "analytics-bar-chart");
  bars.forEach((bar) => {
    const row = createElement("div", "analytics-bar-row");
    const copy = createElement("div", "analytics-bar-copy");
    copy.appendChild(createElement("span", "analytics-bar-label", bar.label));
    copy.appendChild(createElement("span", "analytics-bar-value", String(bar.value)));
    row.appendChild(copy);

    const track = createElement("div", "analytics-bar-track");
    const fill = createElement("span", `analytics-bar-fill analytics-bar-fill-${bar.tone}`);
    fill.style.width = `${(bar.value / maxValue) * 100}%`;
    track.appendChild(fill);
    row.appendChild(track);
    chart.appendChild(row);
  });

  container.appendChild(chart);
}

export function renderAnalyticsFibSecondTryGraph(fibStats) {
  const container = elements.analyticsFibSecondTryGraph;
  container.innerHTML = "";

  if (!fibStats || (Number(fibStats.questionsAnswered) || 0) <= 0) {
    container.appendChild(createElement("p", "analytics-empty-message", "Answer FIB questions to see retry patterns."));
    return;
  }

  const bars = [
    { label: "1st try right", value: Number(fibStats.firstTryCorrect) || 0, tone: "success" },
    { label: "1st try wrong", value: Number(fibStats.firstTryWrong) || 0, tone: "danger" },
    { label: "2nd try right", value: Number(fibStats.secondTryCorrect) || 0, tone: "success" },
    { label: "2nd try wrong", value: Number(fibStats.secondTryWrong) || 0, tone: "danger" },
    { label: "Fixed on retry", value: Number(fibStats.secondTryImproved) || 0, tone: "default" }
  ];
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);
  const chart = createElement("div", "analytics-bar-chart analytics-bar-chart-fib");

  bars.forEach((bar) => {
    const row = createElement("div", "analytics-bar-row");
    const copy = createElement("div", "analytics-bar-copy");
    copy.appendChild(createElement("span", "analytics-bar-label", bar.label));
    copy.appendChild(createElement("span", "analytics-bar-value", String(bar.value)));
    row.appendChild(copy);

    const track = createElement("div", "analytics-bar-track");
    const fill = createElement("span", `analytics-bar-fill analytics-bar-fill-${bar.tone}`);
    fill.style.width = `${(bar.value / maxValue) * 100}%`;
    track.appendChild(fill);
    row.appendChild(track);
    chart.appendChild(row);
  });

  container.appendChild(chart);
}
