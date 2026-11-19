import { useEffect, useState } from 'react';
import LearningNav from '../components/LearningNav';
import { documentRequest, uploadFile } from '../config/documents';
import { listDocuments, saveDocument, removeDocument } from '../utils/documentStore';

const button = 'rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed';
const field = 'block w-full rounded-lg border border-slate-300 bg-white p-3 mt-2';

function Exercise({ item, kind, index, onAnswer, answer, submitted }) {
  const [hints, setHints] = useState(0);
  return <article className="rounded-2xl border bg-white p-6 space-y-4">
    <h3 className="font-bold text-lg">{index + 1}. {item.question}</h3>
    {kind === 'quiz' ? <fieldset><legend className="sr-only">Choose an answer for question {index+1}</legend>
      {item.options.map(option => <label key={option} className="flex items-start gap-3 border rounded-lg p-3 mb-2 cursor-pointer">
        <input className="mt-1" type="radio" name={item.id} value={option} checked={answer === option} disabled={submitted} onChange={() => onAnswer(option)} />{option}
      </label>)}
    </fieldset> : <label className="block">Your response<textarea className={field} rows={4} value={answer || ''} onChange={e => onAnswer(e.target.value)} disabled={submitted} /></label>}
    {hints < 2 && <button className="text-blue-900 underline" onClick={() => setHints(hints+1)}>Show {hints ? 'stronger' : 'first'} hint</button>}
    {item.hints.slice(0, hints).map((hint,i) => <p key={i} className="bg-blue-50 rounded-lg p-3">Hint {i+1}: {hint}</p>)}
    {submitted && <div className="rounded-lg bg-slate-50 p-4 space-y-2">
      {kind === 'quiz' && <p className="font-bold">{answer === item.correctAnswer ? 'Correct' : 'Needs revision'}</p>}
      <p><strong>{kind === 'quiz' ? 'Answer' : 'Model response'}:</strong> {item.correctAnswer}</p>
      <p>{item.explanation}</p>
      {kind !== 'quiz' && <><p className="font-semibold">Self-assessment checklist</p><p className="text-sm">Compare your response with these criteria. This is not an automatic grade.</p>{item.rubric.map((criterion,i) => <label key={i} className="flex gap-2"><input type="checkbox" />{criterion}</label>)}</>}
    </div>}
    <details><summary className="cursor-pointer text-blue-900">Verify supporting passages</summary>
      {item.sources.map(source => <blockquote key={source.id} className="border-l-4 border-blue-200 pl-4 my-3 whitespace-pre-wrap text-sm"><strong>{source.page ? `Page ${source.page}` : `Section ${source.section}`} · {source.heading}</strong><p>{source.text}</p></blockquote>)}
    </details>
  </article>;
}

export default function Documents() {
  const [library, setLibrary] = useState([]);
  const [active, setActive] = useState(null);
  const [original, setOriginal] = useState(null);
  const [practice, setPractice] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [focus, setFocus] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [challengeType, setChallengeType] = useState('comprehension');
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [retryAt, setRetryAt] = useState(0);
  useEffect(() => {
    listDocuments().then(setLibrary).catch(e => setError(e.message));
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const expired = active && active.expiresAt * 1000 <= now;
  const retrySeconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  async function run(label, action) {
    setBusy(label); setError(''); setMessage('');
    try { await action(); } catch (e) {
      setError(e.name === 'TimeoutError' ? 'The request timed out. Try again.' : e.message);
      if (e.status === 429) {
        const receivedAt = Date.now();
        setNow(receivedAt); setRetryAt(receivedAt + (e.retryAfter || 60) * 1000);
      }
      if (e.status === 410) setActive(value => value ? { ...value, expiresAt: 0 } : value);
    } finally { setBusy(''); }
  }
  function select(document, file, savedPractice = null, savedAnswers = {}, savedSubmitted = false) {
    setActive(document); setOriginal(file); setPractice(savedPractice); setAnswers(savedAnswers);
    setSubmitted(savedSubmitted); setConsent(false); setFocus(''); setNow(Date.now());
  }
  async function generate(kind) {
    if (busy || retrySeconds) return;
    await run(`Generating ${kind}…`, async () => {
      const result = await documentRequest(`/${active.id}/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ focus, difficulty, count, challengeType }) });
      setPractice(result); setAnswers({}); setSubmitted(false);
    });
  }
  async function persist() {
    await run('Saving on this device…', async () => {
      await saveDocument({ id: active.id, document: active, file: original, practice, answers, submitted });
      setLibrary(await listDocuments()); setMessage('Saved on this device. Use Save again after practising to keep your latest answers.');
    });
  }
  async function remove(record) {
    await run('Deleting…', async () => {
      let serverDeleted = true;
      try { await documentRequest(`/${record.id}`, { method: 'DELETE' }); }
      catch { serverDeleted = false; }
      await removeDocument(record.id);
      setLibrary(await listDocuments());
      if (active?.id === record.id) select(null, null);
      setMessage(serverDeleted ? 'Deleted the temporary server session and saved local copy.' : 'Deleted the local copy. Server deletion could not be confirmed; its temporary session expires automatically within one hour.');
    });
  }
  const complete = practice?.items.every(item => answers[item.id]?.trim());
  return <main className="max-w-6xl mx-auto p-5 md:p-10 text-slate-800">
    <LearningNav />
    <div className="mb-8"><p className="uppercase tracking-widest text-xs font-bold text-blue-700 mb-2">Your material. Your practice.</p><h1 className="text-4xl font-bold mb-3">Study from your documents</h1><p className="text-slate-600 max-w-3xl">Turn notes into source-linked quizzes and challenges. Upload readable text, inspect the extraction, then choose what to practise.</p></div>
    <section className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-6 mb-6">
      <label className="font-bold block">Add study material<input aria-label="Upload study document" type="file" accept=".pdf,.docx,.txt" disabled={!!busy} className="block mt-3 max-w-full" onChange={e => { const file=e.target.files[0]; e.target.value=''; if(file) run('Uploading and extracting text…', async()=>select(await uploadFile(file), file)); }} /></label>
      <p className="text-sm mt-3">Text-based PDF, DOCX or UTF-8 TXT · up to 5 MB · PDFs up to 100 pages. Scanned pages need OCR, which is not supported yet.</p>
      <p className="text-sm mt-2">Uploads are processed on the server. Extracted text expires after one hour or on server restart. Saving a copy on this device is optional and lasts until you delete it.</p>
    </section>
    <div role="status" aria-live="polite" className="mb-4">{busy || message}</div>
    {error && <p role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-5">{error}</p>}
    <div className="grid lg:grid-cols-[250px_1fr] gap-6">
      <aside className="border rounded-2xl bg-white p-5 self-start"><h2 className="font-bold text-lg mb-3">On this device</h2>{!library.length && <p className="text-sm text-slate-500">No saved documents. Upload a file, then choose Save on this device.</p>}
        {library.map(record => <div key={record.id} className="border-t py-3"><button disabled={!!busy} className="text-left font-semibold break-all text-blue-900" onClick={()=>run('Opening saved document…', async()=>{
          select(record.document, record.file, record.practice, record.answers, record.submitted);
          try { setActive(await documentRequest(`/${record.id}`)); } catch(e) { if(e.status===410) setActive({...record.document, expiresAt:0}); else throw e; }
        })}>{record.document.fileName}</button><button className="block text-sm text-red-700 mt-2 underline" disabled={!!busy} onClick={()=>remove(record)}>Delete document</button></div>)}
      </aside>
      <div className="min-w-0 space-y-6">{active ? <>
        <section className="rounded-2xl bg-white border p-6 space-y-4">
          <h2 className="text-2xl font-bold break-all">{active.fileName}</h2>
          <p className="text-sm text-slate-500">{active.chunks.length} extracted passages · {expired ? 'Server session expired' : `Ready · expires ${new Date(active.expiresAt*1000).toLocaleTimeString()}`}</p>
          {active.warnings.map(warning=><p key={warning} className="text-amber-800 text-sm">{warning}</p>)}
          <div className="flex flex-wrap gap-3"><button className={button} disabled={!!busy} onClick={persist}>Save on this device</button><button className="border rounded-xl px-4 py-2" disabled={!!busy} onClick={()=>remove(active)}>Delete document</button>
            {expired && original && <button className={button} disabled={!!busy} onClick={()=>run('Restoring server session…',async()=>{
              const restored=await uploadFile(original);
              await removeDocument(active.id); setLibrary(await listDocuments()); select(restored,original);
              setMessage('New session ready. Save again to retain this session on your device.');
            })}>Re-upload saved file</button>}
          </div>
          <details><summary className="cursor-pointer font-semibold text-blue-900">Inspect extracted text and references</summary><div className="max-h-80 overflow-auto mt-3 space-y-4">{active.chunks.map(chunk=><div key={chunk.id}><h3 className="font-semibold">{chunk.page ? `Page ${chunk.page}` : `Section ${chunk.section}`} · {chunk.heading}</h3><p className="whitespace-pre-wrap text-sm">{chunk.text}</p></div>)}</div></details>
        </section>
        <section className="border rounded-2xl bg-white p-6 space-y-4"><h2 className="text-xl font-bold">Create practice</h2>
          <label className="block">Topic focus (optional)<input className={field} maxLength={300} placeholder="e.g. closures, photosynthesis, chapter vocabulary" value={focus} onChange={e=>setFocus(e.target.value)} /></label>
          <div className="grid sm:grid-cols-3 gap-3"><label>Difficulty<select className={field} value={difficulty} onChange={e=>setDifficulty(e.target.value)}>{['beginner','intermediate','advanced'].map(v=><option key={v}>{v}</option>)}</select></label><label>Quiz questions<select className={field} value={count} onChange={e=>setCount(Number(e.target.value))}>{[1,3,5,10].map(v=><option key={v}>{v}</option>)}</select></label><label>Challenge type<select className={field} value={challengeType} onChange={e=>setChallengeType(e.target.value)}>{['comprehension','scenario','key-term'].map(v=><option key={v}>{v}</option>)}</select></label></div>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={consent} onChange={e=>setConsent(e.target.checked)} />I agree to send selected document passages to the configured AI provider for generation.</label>
          <p className="text-sm text-slate-500">AI-generated practice may contain mistakes. Verify supporting passages. It is separate from your reviewed JavaScript assessments.</p>
          {retrySeconds > 0 && <p role="status" className="text-amber-800">Generation available again in {retrySeconds} seconds.</p>}
          <div className="flex flex-wrap gap-3"><button className={button} disabled={!!busy || expired || !consent || retrySeconds > 0} onClick={()=>generate('quiz')}>Generate quiz</button><button className={button} disabled={!!busy || expired || !consent || retrySeconds > 0} onClick={()=>generate('challenge')}>Generate challenge</button></div>
        </section>
        {practice && <section className="space-y-4"><h2 className="text-xl font-bold">{practice.origin}</h2>{practice.items.map((item,index)=><Exercise key={item.id} {...{item,index,submitted}} kind={practice.kind} answer={answers[item.id]} onAnswer={value=>setAnswers({...answers,[item.id]:value})} />)}
          {!submitted ? <button className={button} disabled={!complete} onClick={()=>setSubmitted(true)}>{practice.kind==='quiz' ? 'Submit quiz' : 'Compare with model response'}</button> : <div role="status" className="bg-blue-50 rounded-xl p-5">{practice.kind==='quiz' ? `Score: ${practice.items.filter(i=>answers[i.id]===i.correctAnswer).length}/${practice.items.length}. Review the feedback and source passages above.` : 'Review the model response and mark the criteria you covered.'}<button className="underline block mt-3" onClick={()=>{setSubmitted(false);setAnswers({});}}>Try again</button></div>}
        </section>}
      </> : <div className="rounded-2xl border bg-white p-10 text-slate-500">Choose a document to begin. Your original lesson progress stays available in the learning navigation.</div>}</div>
    </div>
  </main>;
}
