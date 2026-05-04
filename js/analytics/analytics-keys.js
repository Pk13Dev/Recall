export function buildQuizAnalyticsKey(session) {
  if (session.quizId) {
    return session.quizId;
  }
  return `${session.source}:${session.folderPath}:${session.quizName}`;
}

export function buildQuestionAnalyticsKey(session, question, questionIndex) {
  const questionId = question && question.id !== undefined && question.id !== null ? String(question.id) : `q-${questionIndex + 1}`;
  const normalizedText =
    typeof question.question === "string"
      ? question.question.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 160)
      : `question-${questionIndex + 1}`;
  return `${buildQuizAnalyticsKey(session)}::${questionId}::${normalizedText}`;
}
