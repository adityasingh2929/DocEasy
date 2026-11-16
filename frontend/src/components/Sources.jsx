export default function Sources({ sources = [] }) {
  if (!sources.length) return null;
  const unique = [...new Map(sources.filter(source => /^https:\/\/developer\.mozilla\.org\//.test(source.url)).map(source => [source.url, source])).values()];
  if (!unique.length) return null;
  return <aside className="mt-5 border-t border-slate-200 pt-4 text-sm" aria-label="Documentation references">
    <h3 className="font-semibold text-slate-800 mb-2">MDN documentation references</h3>
    <ul className="space-y-1">{unique.map(source => <li key={source.url}><a className="text-blue-800 underline underline-offset-2" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
    {unique.some(source => source.kind === 'mapped topic reference') && <p className="text-xs text-slate-500 mt-2">Topic-level links mapped to the retrieved documentation; these are not exact passage citations.</p>}
  </aside>;
}
