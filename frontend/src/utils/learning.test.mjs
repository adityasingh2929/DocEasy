import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { getProgress, saveProgress, getRoadmapProgress } from './progress.js';
import { gradeOffline, recordAssessment, markReviewed, hasPassedAssessment, dashboardStats, normalizeOutput } from './learning.js';

let saved = null;
globalThis.localStorage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
const reset = () => { saved = null; };
const fixture = correct => ({ id: 'attempt-1', topic: 'variables', score: correct, total: 5,
  percentage: correct * 20, passed: correct >= 4, feedback: Array.from({length: 5}, (_, index) => ({ id: `q${index}`, question: `Question ${index}`, options: ['a','b','c','d'], correctAnswer: 'a', userAnswer: index < correct ? 'a' : 'b', isCorrect: index < correct, explanation: 'Explanation' })) });

test('assessment records and mistakes are saved once even after duplicate responses', () => {
  reset(); recordAssessment(fixture(3)); recordAssessment(fixture(3));
  assert.equal(getProgress().assessments.length, 1);
  assert.equal(getProgress().mistakes.length, 2);
  assert.equal(hasPassedAssessment('variables'), false);
  assert.equal(getRoadmapProgress([{id:'variables'},{id:'data-types'}])['data-types'], 'locked');
});

test('a passing assessment unlocks the challenge but does not complete the lesson', () => {
  reset(); recordAssessment(fixture(4));
  assert.equal(hasPassedAssessment('variables'), true);
  assert.equal(getRoadmapProgress([{id:'variables'},{id:'data-types'}]).variables, 'unlocked');
});

test('marking a mistake reviewed does not alter assessment history', () => {
  reset(); recordAssessment(fixture(4));
  const mistake = getProgress().mistakes[0]; markReviewed(mistake.id, true);
  assert.equal(getProgress().mistakes[0].resolved, true);
  assert.equal(getProgress().assessments[0].score, 4);
});

test('offline grading applies the same eighty-percent threshold', () => {
  const questions = Array.from({length:5},(_,i)=>({id:`q${i}`,correctAnswer:'yes'}));
  const assessment = {id:'offline-1',topic:'variables',questions};
  assert.equal(gradeOffline(assessment,{q0:'yes',q1:'yes',q2:'yes',q3:'yes',q4:'no'}).passed,true);
  assert.equal(gradeOffline(assessment,{q0:'yes',q1:'yes',q2:'yes',q3:'no',q4:'no'}).passed,false);
});

test('dashboard accuracy includes retakes and finds the next unfinished topic', () => {
  reset(); const progress = getProgress(); progress.assessments = [fixture(4),fixture(2)];
  progress.challengesSolved.variables = true; saveProgress(progress);
  const stats = dashboardStats(getProgress(),[{id:'variables'},{id:'data-types'}]);
  assert.equal(stats.accuracy,60); assert.equal(stats.completed,1); assert.equal(stats.next.id,'data-types');
});

test('console output comparison preserves case and normalizes line endings', () => {
  assert.equal(normalizeOutput('  A\r\n B  '),'A\nB');
  assert.notEqual(normalizeOutput('hello'),normalizeOutput('Hello'));
});

test('every reviewed coding challenge produces its stated output', async () => {
  const bank = JSON.parse(await readFile(new URL('../data/practice-bank.json',import.meta.url),'utf8'));
  for (const [topic, group] of Object.entries(bank.topics)) {
    assert.equal(group.questions.length,5);
    for (const question of group.questions) {
      assert.equal(new Set(question.options).size,4);
      assert.ok(question.options.includes(question.correctAnswer));
    }
    for (const exercise of group.challenges) {
      if (exercise.language === 'python') continue; // Executed by backend PythonCurriculumTests.
      const lines=[]; const timers=[];
      vm.runInNewContext(exercise.code,{console:{log:(...values)=>lines.push(values.map(String).join(' '))},setTimeout:fn=>timers.push(fn)},{timeout:200});
      await new Promise(resolve=>setImmediate(resolve));
      timers.forEach(fn=>fn());
      assert.equal(lines.join('\n'),exercise.correctAnswer,topic);
    }
  }
});
