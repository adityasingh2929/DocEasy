const PROGRESS_KEY = "docs_made_easy_progress";
const emptyProgress = () => ({ topicsCompleted: [], conceptsRead: {}, quizScores: {}, challengesSolved: {} });
export const getProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
    const progress = emptyProgress();
    if (!saved || typeof saved !== "object") return progress;
    for (const key of ["conceptsRead", "quizScores", "challengesSolved"]) {
      if (saved[key] && typeof saved[key] === "object" && !Array.isArray(saved[key])) progress[key] = saved[key];
    }
    progress.topicsCompleted = Array.isArray(saved.topicsCompleted) ? saved.topicsCompleted : [];
    return progress;
  } catch { return emptyProgress(); }
};
export const saveProgress = (progress) => {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }
  catch (error) { console.error("Could not save progress:", error); }
};
export const getRoadmapProgress = (topics) => {
  const progress = getProgress();
  const completed = (id) => Boolean(progress.challengesSolved[id]) || progress.topicsCompleted.includes(id);
  return Object.fromEntries(topics.map((topic, index) => [topic.id,
    completed(topic.id) ? "completed" : index === 0 || completed(topics[index - 1].id) ? "unlocked" : "locked"
  ]));
};
