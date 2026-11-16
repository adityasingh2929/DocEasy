import bank from '../data/practice-bank.json' with { type: 'json' };
import { getProgress, saveProgress } from './progress.js';

export const PASS_PERCENT = 80;
export const hasPassedAssessment = topic => {
  const progress = getProgress();
  return Boolean(progress.challengesSolved[topic]) || progress.assessments.some(attempt => attempt.topic === topic && attempt.passed);
};
export function recordAssessment(result) {
  const progress = getProgress();
  if (progress.assessments.some(item => item.id === result.id)) return;
  progress.assessments.push({ ...result, completedAt: new Date().toISOString() });
  progress.quizScores[result.topic] = Math.max(progress.quizScores[result.topic] || 0, result.percentage);
  for (const question of result.feedback.filter(item => !item.isCorrect)) {
    progress.mistakes.push({ ...question, id: `${result.id}:${question.id}`, topic: result.topic,
      kind: 'quiz', createdAt: new Date().toISOString(), resolved: false });
  }
  delete progress.assessmentDrafts[result.topic];
  saveProgress(progress);
}
export function recordChallenge(topic, exercise, userAnswer, correct, assisted) {
  const progress = getProgress();
  progress.challengeAttempts.push({ topic, correct, assisted, createdAt: new Date().toISOString() });
  if (correct) progress.challengesSolved[topic] = true;
  else progress.mistakes.push({ ...exercise, id: crypto.randomUUID(), topic, kind: 'challenge', userAnswer,
    createdAt: new Date().toISOString(), resolved: false });
  saveProgress(progress);
}
export function markReviewed(id, resolved) {
  const progress = getProgress();
  progress.mistakes = progress.mistakes.map(item => item.id === id ? { ...item, resolved } : item);
  saveProgress(progress);
}
export function trackHint() {
  const progress = getProgress();
  progress.hintsUsed += 1;
  saveProgress(progress);
}
export const normalizeOutput = value => String(value).trim().replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).join('\n');
export function offlineAssessment(topic) {
  const questions = bank.topics[topic].questions;
  return { id: `offline-${crypto.randomUUID()}`, topic, questions, passPercent: PASS_PERCENT,
    origin: 'reviewed', grading: 'browser', expiresAt: null };
}
export function gradeOffline(assessment, answers) {
  const feedback = assessment.questions.map(question => ({ ...question, userAnswer: answers[question.id],
    isCorrect: question.correctAnswer === answers[question.id] }));
  const score = feedback.filter(item => item.isCorrect).length;
  const percentage = Math.round(score / feedback.length * 100);
  return { ...assessment, questions: undefined, feedback, score, total: feedback.length, percentage,
    passed: percentage >= PASS_PERCENT };
}
export function dashboardStats(progress, topics) {
  const correct = progress.assessments.reduce((sum, item) => sum + item.score, 0);
  const total = progress.assessments.reduce((sum, item) => sum + item.total, 0);
  const completed = topics.filter(topic => progress.challengesSolved[topic.id] || progress.topicsCompleted.includes(topic.id)).length;
  return { completed, accuracy: total ? Math.round(correct / total * 100) : null,
    challenges: Object.values(progress.challengesSolved).filter(Boolean).length,
    mistakes: progress.mistakes.filter(item => !item.resolved).length,
    next: topics.find(topic => !progress.challengesSolved[topic.id] && !progress.topicsCompleted.includes(topic.id)) || null };
}
