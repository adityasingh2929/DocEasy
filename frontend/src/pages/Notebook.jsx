import { useState } from 'react';
import { Link } from 'react-router-dom';
import LearningNav from '../components/LearningNav';
import Sources from '../components/Sources';
import { TOPICS } from '../data/topics';
import { useProgress } from '../utils/useProgress';
import { markReviewed, normalizeOutput } from '../utils/learning';

function Mistake({ item }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const retry = () => {
    const correct = item.kind === 'challenge' ? normalizeOutput(answer) === normalizeOutput(item.correctAnswer) : answer === item.correctAnswer;
    setFeedback(correct ? 'Correct. This mistake is now marked as reviewed.' : 'Not quite. Try the hints from the lesson or review the explanation.');
    if (correct) markReviewed(item.id, true);
  };
  return <article className="bg-white border border-slate-200 rounded-2xl p-6">
    <div className="flex flex-wrap justify-between gap-3 mb-3"><p className="text-sm text-blue-800 font-semibold">{TOPICS.find(topic => topic.id === item.topic)?.title} · {item.kind}</p><span className="text-xs text-slate-500">{item.resolved ? 'Reviewed' : 'Needs revision'}</span></div>
    <h2 className="font-semibold text-lg whitespace-pre-wrap">{item.question}</h2>
    {item.code && <pre className="overflow-x-auto bg-slate-900 text-blue-100 p-4 rounded-lg my-4 text-sm">{item.code}</pre>}
    <p className="text-sm text-slate-500 mt-3 whitespace-pre-wrap">Your previous answer: {item.userAnswer}</p>
    <label className="block text-sm font-semibold mt-4" htmlFor={`retry-${item.id}`}>Try again</label>
    {item.kind === 'quiz' ? <select id={`retry-${item.id}`} value={answer} onChange={event => setAnswer(event.target.value)} className="w-full border rounded-lg p-3 mt-2"><option value="">Choose an answer</option>{item.options?.map(option => <option key={option}>{option}</option>)}</select> : <textarea id={`retry-${item.id}`} value={answer} onChange={event => setAnswer(event.target.value)} className="w-full border rounded-lg p-3 mt-2 font-mono" rows={3} />}
    <div className="flex flex-wrap gap-4 mt-4"><button disabled={!answer.trim()} onClick={retry} className="bg-blue-900 disabled:bg-slate-300 text-white rounded-lg px-4 py-2">Check answer</button><button onClick={() => setShowAnswer(value => !value)} className="text-blue-900 underline">{showAnswer ? 'Hide explanation' : 'Review explanation'}</button><button onClick={() => markReviewed(item.id, !item.resolved)} className="text-slate-600 underline">{item.resolved ? 'Mark for revision' : 'Mark reviewed'}</button></div>
    {feedback && <p role="status" className="text-sm mt-4">{feedback}</p>}
    {showAnswer && <div className="bg-slate-50 p-4 rounded-lg mt-4"><p className="font-mono whitespace-pre-wrap">Correct answer: {item.correctAnswer}</p><p className="text-sm mt-2">{item.explanation}</p><Sources sources={item.sources} /></div>}
    <Link to={`/lesson/${item.topic}`} className="inline-block mt-4 text-sm text-blue-800 underline">Revisit lesson</Link>
  </article>;
}

export default function Notebook() {
  const progress = useProgress();
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState('open');
  const items = progress.mistakes.filter(item => (topic === 'all' || item.topic === topic) && (status === 'all' || (status === 'reviewed' ? item.resolved : !item.resolved))).slice().reverse();
  return <main className="min-h-screen max-w-5xl mx-auto p-6 md:p-12 text-slate-900"><LearningNav /><h1 className="text-4xl font-bold mb-3">Mistake notebook</h1><p className="text-slate-600 mb-7">Save the lesson from each mistake. Retry here without affecting assessment scores.</p>
    <div className="flex flex-wrap gap-4 mb-7"><label className="text-sm">Topic<select aria-label="Filter mistakes by topic" value={topic} onChange={event => setTopic(event.target.value)} className="block border p-2 mt-1 rounded-lg"><option value="all">All topics</option>{TOPICS.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label className="text-sm">Status<select aria-label="Filter mistakes by status" value={status} onChange={event => setStatus(event.target.value)} className="block border p-2 mt-1 rounded-lg"><option value="open">Needs revision</option><option value="reviewed">Reviewed</option><option value="all">All mistakes</option></select></label></div>
    <div className="space-y-5">{items.map(item => <Mistake key={item.id} item={item} />)}{!items.length && <div className="bg-white border rounded-2xl p-8 text-slate-500">No mistakes match this view. Incorrect assessment and challenge answers will appear here automatically.</div>}</div>
  </main>;
}
