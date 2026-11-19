import { useEffect, useState } from 'react';
import { postJSON } from '../config/api';
import { getProgress, saveProgress } from '../utils/progress';
import { offlineAssessment, gradeOffline, recordAssessment } from '../utils/learning';
import Hints from './Hints';
import Sources from './Sources';

export default function Assessment({ topic, onComplete, onContext }) {
  const [draft, setDraft] = useState(() => getProgress().assessmentDrafts[topic] || null);
  const [result, setResult] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const question = draft?.assessment.questions[index];
  const feedback = result?.feedback[index];
  useEffect(() => {
    onContext?.(question ? { currentQuestion: question.question, options: question.options,
      correctAnswer: feedback?.correctAnswer || null, explanation: feedback?.explanation || null } : {});
  }, [question, feedback, onContext]);
  const persist = next => {
    setDraft(next);
    const progress = getProgress();
    progress.assessmentDrafts[topic] = next;
    if (!saveProgress(progress)) setWarning('Browser storage is unavailable. This attempt may not survive a refresh.');
  };
  const start = async () => {
    setLoading(true); setError(''); setWarning(''); setResult(null); setIndex(0);
    let assessment;
    try { assessment = await postJSON('/assessments', { topic }); }
    catch { assessment = offlineAssessment(topic); setWarning('Backend unavailable. Using the same reviewed bank with browser grading.'); }
    persist({ assessment, answers: {} });
    setLoading(false);
  };
  const submit = async () => {
    if (loading || !draft || Object.keys(draft.answers).length !== draft.assessment.questions.length) return;
    setLoading(true); setError('');
    try {
      const data = draft.assessment.grading === 'browser' ? gradeOffline(draft.assessment, draft.answers) : await postJSON(`/assessments/${draft.assessment.id}/submit`, { answers: draft.assessment.questions.map(item => ({ questionId: item.id, answer: draft.answers[item.id] })) });
      recordAssessment(data); setResult(data); setIndex(0);
    } catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  };
  if (!draft) return <section><h2 className="text-2xl font-bold mb-3">Five questions. One clear checkpoint.</h2><p className="text-slate-600 mb-5">Answer all five reviewed questions. Score at least 4/5 (80%) to unlock the coding challenge. Your result and mistakes are saved to your account.</p><button onClick={start} disabled={loading} className="bg-blue-900 text-white rounded-xl px-6 py-3">{loading ? 'Preparing...' : 'Start assessment'}</button></section>;
  return <section>
    <div className="flex flex-wrap justify-between gap-3 mb-4"><h2 className="text-2xl font-bold">Knowledge assessment</h2><span className="text-sm text-slate-500">Reviewed bank · {draft.assessment.grading === 'browser' ? 'Offline grading' : 'Server grading'}</span></div>
    {warning && <p role="status" className="bg-amber-50 text-amber-900 rounded-lg p-3 text-sm mb-4">{warning}</p>}
    {result && <div role="status" className={`rounded-xl border p-5 mb-6 ${result.passed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}><h3 className="font-bold text-xl">{result.passed ? 'Assessment passed' : 'Keep practising'} · {result.score}/{result.total} ({result.percentage}%)</h3><p className="mt-2 text-sm">{result.passed ? 'You can continue to the coding challenge.' : 'You need 80%. Review the explanations or your mistake notebook, then retake.'}</p></div>}
    <div className="flex flex-wrap gap-2 mb-5" aria-label="Question navigation">{draft.assessment.questions.map((item, i) => <button key={item.id} aria-label={`Question ${i + 1}${draft.answers[item.id] ? ', answered' : ''}`} aria-current={i === index ? 'step' : undefined} onClick={() => setIndex(i)} className={`w-10 h-10 rounded-full border font-bold ${i === index ? 'bg-blue-900 text-white' : draft.answers[item.id] ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>{i + 1}</button>)}</div>
    <p className="text-sm text-slate-500 mb-2">Question {index + 1} of 5</p><h3 className="text-xl font-semibold whitespace-pre-wrap mb-5">{question.question}</h3>
    <div className="space-y-3">{question.options.map(option => <button key={option} disabled={loading || Boolean(result)} aria-pressed={draft.answers[question.id] === option} onClick={() => persist({ ...draft, answers: { ...draft.answers, [question.id]: option } })} className={`w-full text-left border rounded-xl p-4 ${result && option === feedback.correctAnswer ? 'border-green-500 bg-green-50' : draft.answers[question.id] === option ? 'border-blue-900 bg-blue-50' : 'border-slate-200'}`}>{option}</button>)}</div>
    <Hints key={`${draft.assessment.id}-${question.id}`} hints={question.hints} attempted={Boolean(result)} explanation={feedback?.explanation} />
    {feedback && <div className="bg-slate-50 rounded-xl p-4 text-sm"><p className="font-bold">{feedback.isCorrect ? 'Correct' : `Correct answer: ${feedback.correctAnswer}`}</p><p className="mt-2">{feedback.explanation}</p></div>}
    <Sources sources={question.sources} />
    {error && <p role="alert" className="text-red-700 mt-4">{error} You can start a new assessment below.</p>}
    <div className="flex flex-wrap gap-3 mt-6">
      <button disabled={index === 0} onClick={() => setIndex(value => value - 1)} className="border rounded-lg px-4 py-2 disabled:opacity-40">Previous</button>
      {index < 4 && <button onClick={() => setIndex(value => value + 1)} className="border rounded-lg px-4 py-2">Next question</button>}
      {!result && <button disabled={loading || Object.keys(draft.answers).length !== 5} onClick={submit} className="bg-blue-900 disabled:bg-slate-300 text-white rounded-lg px-4 py-2">{loading ? 'Checking...' : `Submit assessment (${Object.keys(draft.answers).length}/5 answered)`}</button>}
      {result?.passed && <button onClick={onComplete} className="bg-blue-900 text-white rounded-lg px-4 py-2">Continue to challenge</button>}
      <button disabled={loading} onClick={start} className="text-blue-900 underline px-2">{result ? 'Retake assessment' : 'Start a new assessment'}</button>
    </div>
  </section>;
}
