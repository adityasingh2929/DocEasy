import { useEffect, useState } from 'react';
import { postJSON } from '../config/api';
import Sources from './Sources';
import { getProgress, saveProgress } from '../utils/progress';

export default function AIQuiz({ topic, onContext }) {
  const [exercise, setExercise] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { onContext?.(exercise ? { currentQuestion: exercise.question, options: exercise.options, correctAnswer: submitted ? exercise.correctAnswer : null, explanation: submitted ? exercise.explanation : null } : {}); }, [exercise, submitted, onContext]);
  const generate = async () => {
    setLoading(true); setError(''); setExercise(null); setAnswer(''); setSubmitted(false);
    try {
      const data = await postJSON('/quiz', { topic });
      if (!Array.isArray(data.options) || data.options.length !== 4 || !data.options.includes(data.correctAnswer)) throw new Error('Invalid generated question. Try again.');
      setExercise(data);
    } catch { setError('AI practice is unavailable. The reviewed assessment works without an AI key.'); }
    finally { setLoading(false); }
  };
  const submit = () => {
    if (!answer || submitted) return;
    setSubmitted(true);
    if (answer !== exercise.correctAnswer) {
      const progress = getProgress();
      progress.mistakes.push({ ...exercise, id: crypto.randomUUID(), topic, kind: 'quiz', userAnswer: answer, createdAt: new Date().toISOString(), resolved: false });
      saveProgress(progress);
    }
  };
  return <section><h2 className="text-2xl font-bold">AI practice</h2><p className="text-slate-600 my-3">Optional, unscored practice. AI answers can be wrong; check the references. Passing the reviewed assessment unlocks the challenge.</p><button disabled={loading} onClick={generate} className="bg-blue-900 text-white rounded-xl px-5 py-3 disabled:opacity-50">{loading ? 'Generating...' : exercise ? 'Generate another question' : 'Generate a question'}</button>{error && <p role="alert" className="text-red-700 mt-4">{error}</p>}{exercise && <div className="mt-6"><p className="whitespace-pre-wrap font-semibold text-lg mb-4">{exercise.question}</p><div className="space-y-3">{exercise.options.map(option => <button key={option} disabled={submitted} aria-pressed={answer === option} onClick={() => setAnswer(option)} className={`block w-full text-left border rounded-xl p-4 ${answer === option ? 'border-blue-800 bg-blue-50' : 'border-slate-200'}`}>{option}</button>)}</div><button disabled={!answer || submitted} onClick={submit} className="mt-5 bg-blue-900 text-white rounded-xl px-5 py-3 disabled:bg-slate-300">Check practice answer</button>{submitted && <p role="status" className="mt-4">{answer === exercise.correctAnswer ? 'Correct.' : `Correct answer: ${exercise.correctAnswer}`} {exercise.explanation}</p>}<Sources sources={exercise.sources} /></div>}</section>;
}
