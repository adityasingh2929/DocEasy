const PROGRESS_KEY = 'docs_made_easy_progress';
const emptyProgress = () => ({ topicsCompleted: [], conceptsRead: {}, quizScores: {}, challengesSolved: {}, assessments: [], assessmentDrafts: {}, mistakes: [], challengeAttempts: [], hintsUsed: 0 });
export const getProgress = () => {
  const progress = emptyProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return progress;
    for (const key of ['conceptsRead', 'quizScores', 'challengesSolved', 'assessmentDrafts']) {
      if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) progress[key] = saved[key];
    }
    for (const key of ['topicsCompleted', 'assessments', 'mistakes', 'challengeAttempts']) {
      if (Array.isArray(saved[key])) progress[key] = saved[key];
    }
    progress.hintsUsed = Number.isFinite(saved.hintsUsed) ? Math.max(0, saved.hintsUsed) : 0;
  } catch { /* A damaged record should not prevent learning. */ }
  return progress;
};
export const saveProgress = progress => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('doceasy-progress'));
    return true;
  } catch (error) { console.error('Could not save progress:', error); return false; }
};
export const getRoadmapProgress = topics => {
  const progress = getProgress();
  const completed = id => Boolean(progress.challengesSolved[id]) || progress.topicsCompleted.includes(id);
  return Object.fromEntries(topics.map((topic, index) => [topic.id, completed(topic.id) ? 'completed' : index === 0 || completed(topics[index - 1].id) ? 'unlocked' : 'locked']));
};

export const resetProgress = () => saveProgress(emptyProgress());
