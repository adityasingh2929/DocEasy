import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { account, accountRequest } from '../utils/account';

export default function AccountGate({ children }) {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!account()) return;
    let active = true;
    accountRequest('/me').then(() => { if (active) setStatus('ready'); }).catch(err => { if (active) { setError(err.message); setStatus('error'); } });
    return () => { active = false; };
  }, [retry]);
  if (!account()) return <Navigate to="/login" replace />;
  if (status === 'ready') return children;
  return <main className="max-w-lg mx-auto p-12"><h1 className="text-2xl font-bold">{status === 'checking' ? 'Opening your workspace…' : 'Could not open your workspace'}</h1>{error && <><p role="alert" className="my-6">{error}</p><button onClick={() => { setStatus('checking'); setRetry(value => value + 1); }}>Retry connection</button><a className="block mt-4 underline" href="/login">Sign in again</a></>}</main>;
}
