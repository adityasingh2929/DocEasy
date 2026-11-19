import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getJSON, postJSON } from '../config/api';
import bank from '../data/practice-bank.json';
import { recordChallenge, normalizeOutput } from '../utils/learning';
import Hints from './Hints';
import Sources from './Sources';

export default function ChallengeTab({ onChallengeSuccess, onContext, allowAI }) {
  const { topic } = useParams();
  const [mode, setMode] = useState('reviewed');
  const [attempt, setAttempt] = useState(0);
  const [exercise, setExercise] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);
  const [assisted, setAssisted] = useState(false);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    (async () => {
      await Promise.resolve(); if (!active) return;
      setLoading(true); setError(''); setNotice(''); setResult(null); setAnswer(''); setAssisted(false); setExercise(null);
      try {
        let data;
        if (mode === 'ai') data = await postJSON('/challenge', { topic }, controller.signal);
        else {
          try { data = await getJSON(`/practice/${topic}/challenge`, controller.signal); }
          catch (failure) {
            if (controller.signal.aborted) throw failure;
            data = bank.topics[topic].challenges[0];
            if (active) setNotice('Using the bundled reviewed challenge. The backend is unavailable.');
          }
        }
        if (!active) return;
        if (![data.question, data.code, data.correctAnswer, data.explanation].every(value => typeof value === 'string' && value.trim())) throw new Error('Invalid exercise');
        setExercise({ ...data, id: data.id || crypto.randomUUID() });
      } catch { if (active) setError('Could not generate AI practice. Switch to the reviewed challenge or try again.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [topic, mode, attempt]);
  useEffect(() => { onContext?.(exercise ? { currentQuestion: exercise.question, code: exercise.code, correctAnswer: result !== null ? exercise.correctAnswer : null, explanation: result !== null ? exercise.explanation : null } : {}); }, [exercise, result, onContext]);
  const submit = () => {
    if (!answer.trim() || result !== null) return;
    const correct = normalizeOutput(answer) === normalizeOutput(exercise.correctAnswer);
    setResult(correct); recordChallenge(topic, exercise, answer, correct, assisted);
  };
  return <section>
    <div className="flex flex-wrap gap-3 mb-6">{(allowAI ? ['reviewed', 'ai'] : ['reviewed']).map(value => <button key={value} onClick={() => setMode(value)} aria-pressed={mode === value} className={`border rounded-lg px-4 py-2 text-sm font-semibold ${mode === value ? 'bg-blue-900 text-white' : 'bg-white'}`}>{value === 'reviewed' ? 'Reviewed challenge' : 'Optional AI challenge'}</button>)}</div>
    <h2 className="text-2xl font-bold mb-4">Coding challenge</h2>
    {notice && <p className="bg-amber-50 p-3 rounded-lg text-sm mb-4">{notice}</p>}
    {loading && <p role="status" className="text-slate-500 py-8">{mode === 'ai' ? 'Generating AI practice...' : 'Loading reviewed practice...'}</p>}
    {error && <div role="alert"><p className="text-red-700 mb-4">{error}</p><button onClick={() => setAttempt(value => value + 1)} className="underline text-blue-900">Try again</button></div>}
    {!loading && exercise && <div><p className="text-slate-600 mb-4">{exercise.question}</p><pre className="bg-slate-900 text-blue-100 rounded-xl p-5 overflow-x-auto text-sm mb-5">{exercise.code}</pre>
      <label htmlFor="challenge-output" className="text-sm font-semibold">Predicted console output</label><textarea id="challenge-output" rows={4} disabled={result !== null} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Enter each output line" className="w-full border rounded-xl p-4 mt-2 font-mono" />
      <Hints key={exercise.id} hints={exercise.hints || ['Trace the code one statement at a time.', 'Track the current bindings, function calls, and any queued asynchronous work.']} explanation={exercise.explanation} attempted={result !== null} onReveal={() => setAssisted(true)} />
      {result === null ? <button disabled={!answer.trim()} onClick={submit} className="bg-blue-900 text-white rounded-xl px-6 py-3 disabled:bg-slate-300">Submit answer</button> : <div className={`border rounded-xl p-5 ${result ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}><h3 role="status" className="text-xl font-bold">{result ? 'Correct - challenge solved' : 'Not quite - try again'}</h3><p className="text-sm mt-3">Correct output:</p><pre className="font-mono whitespace-pre-wrap my-3">{exercise.correctAnswer}</pre><p className="text-sm">{exercise.explanation}</p><button onClick={result ? onChallengeSuccess : () => { setResult(null); setAnswer(''); }} className="bg-blue-900 text-white px-5 py-3 rounded-lg mt-4">{result ? 'Complete lesson' : 'Try again'}</button></div>}
      <Sources sources={exercise.sources} />
      {mode === 'ai' && <p className="text-xs text-slate-500 mt-3">AI-generated content can be inaccurate. Check the documentation references.</p>}
    </div>}
  </section>;
}
