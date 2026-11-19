import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TOPICS, TRACKS } from '../data/topics.js';
import { getProgress, saveProgress } from './progress.js';

test('every visible lesson has content, five questions, a challenge and official sources', async () => {
  const concepts = JSON.parse(await readFile(new URL('../data/concepts.json', import.meta.url), 'utf8'));
  const bank = JSON.parse(await readFile(new URL('../data/practice-bank.json', import.meta.url), 'utf8'));
  assert.equal(new Set(TOPICS.map(topic => topic.id)).size, TOPICS.length);
  assert.equal(TRACKS.find(track => track.id === 'python').topics.length, 11);
  for (const topic of TOPICS) {
    assert.ok(concepts.find(concept => concept.id === topic.id)?.explanation, topic.id);
    assert.equal(bank.topics[topic.id]?.questions.length, 5, topic.id);
    assert.ok(bank.topics[topic.id].challenges.length, topic.id);
    assert.ok(bank.topics[topic.id].sources.every(source => /^https:\/\/(docs\.python\.org|developer\.mozilla\.org)\//.test(source.url)));
  }
});

test('progress caches remain separate when learners change accounts', () => {
  const values = new Map(); let id = 'learner-one';
  globalThis.localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  globalThis.sessionStorage = { getItem: () => id };
  const first = getProgress(); first.topicsCompleted = ['variables']; saveProgress(first);
  id = 'learner-two'; assert.deepEqual(getProgress().topicsCompleted, []);
  const second = getProgress(); second.topicsCompleted = ['python-basics']; saveProgress(second);
  id = 'learner-one'; assert.deepEqual(getProgress().topicsCompleted, ['variables']);
  delete globalThis.sessionStorage;
});
