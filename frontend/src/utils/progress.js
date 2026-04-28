const PROGRESS_KEY = 'docs_made_easy_progress';

const DEFAULT_PROGRESS = {
  topicsCompleted: [],
  quizScores: {},
  challengesSolved: {}
};

export const getProgress = () => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : DEFAULT_PROGRESS;
  } catch (error) {
    console.error('Failed to read progress from localStorage:', error);
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = (progress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress to localStorage:', error);
  }
};
