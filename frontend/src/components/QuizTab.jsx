import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Assessment from './Assessment';
import AIQuiz from './AIQuiz';
export default function QuizTab({ onComplete, onContext, allowAI }) {
  const { topic } = useParams();
  const [mode, setMode] = useState('reviewed');
  return <div><div className="flex flex-wrap gap-3 mb-6"><button onClick={() => setMode('reviewed')} aria-pressed={mode === 'reviewed'} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${mode === 'reviewed' ? 'bg-blue-900 text-white' : 'bg-white'}`}>Reviewed assessment</button>{allowAI && <button onClick={() => setMode('ai')} aria-pressed={mode === 'ai'} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${mode === 'ai' ? 'bg-blue-900 text-white' : 'bg-white'}`}>Optional AI practice</button>}</div>{mode === 'reviewed' ? <Assessment topic={topic} onComplete={onComplete} onContext={onContext} /> : <AIQuiz topic={topic} onContext={onContext} />}</div>;
}
