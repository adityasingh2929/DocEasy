import { useState } from 'react';
import { trackHint } from '../utils/learning';

export default function Hints({ hints = [], explanation, attempted = false, onReveal }) {
  const [level, setLevel] = useState(0);
  if (!hints.length) return null;
  const reveal = () => { setLevel(value => value + 1); trackHint(); onReveal?.(); };
  return <section className="my-5 rounded-xl border border-amber-200 bg-amber-50 p-4" aria-label="Progressive hints">
    <p className="text-sm font-semibold text-amber-900">Think it through</p>
    {hints.slice(0, Math.min(level, 2)).map((hint, index) => <p key={index} className="mt-2 text-sm text-slate-700"><strong>Hint {index + 1}:</strong> {hint}</p>)}
    {level < 2 && <button type="button" className="mt-3 text-sm font-bold text-blue-900 underline" onClick={reveal}>{level === 0 ? 'Show a small hint' : 'Show a stronger hint'}</button>}
    {level >= 2 && attempted && explanation && <p className="mt-3 text-sm text-slate-800"><strong>Explanation:</strong> {explanation}</p>}
    {level >= 2 && !attempted && <p className="mt-3 text-xs text-slate-600">Try an answer to unlock the full explanation.</p>}
  </section>;
}
