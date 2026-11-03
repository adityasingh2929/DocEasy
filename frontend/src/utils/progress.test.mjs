import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgress, saveProgress, getRoadmapProgress } from './progress.js';

let saved;
globalThis.localStorage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
const topics = [{ id: 'variables' }, { id: 'data-types' }];

test('missing, malformed, and partial stored progress remain usable', () => {
  for (const value of [undefined, 'null', '{', '{"quizScores":null}']) {
    saved = value;
    assert.deepEqual(getProgress().challengesSolved, {});
  }
  saved = undefined;
  getProgress().topicsCompleted.push('variables');
  assert.deepEqual(getProgress().topicsCompleted, []);
});

test('quiz success alone does not complete the lesson or unlock the next one', () => {
  saveProgress({ ...getProgress(), quizScores: { variables: 1 } });
  assert.deepEqual(getRoadmapProgress(topics), { variables: 'unlocked', 'data-types': 'locked' });
});

test('solving a challenge completes the lesson and unlocks the next one', () => {
  saveProgress({ ...getProgress(), challengesSolved: { variables: true } });
  assert.deepEqual(getRoadmapProgress(topics), { variables: 'completed', 'data-types': 'unlocked' });
});
