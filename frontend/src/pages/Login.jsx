import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../utils/account';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await signIn(mode, Object.fromEntries(new FormData(event.currentTarget))); navigate('/dashboard', { replace: true }); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="account-page">
    <section className="account-story"><Link to="/home" className="brand">DocEasy<span> / learning workspace</span></Link><div><p className="eyebrow">READ. REASON. BUILD.</p><h1>Make the docs<br />make sense.</h1><p>A focused place to learn JavaScript and Python, practise what you read, and understand your mistakes.</p></div><p>One account. Your own learning history.</p></section>
    <section className="account-form"><p className="eyebrow">YOUR WORKSPACE</p><h2>{mode === 'login' ? 'Welcome back.' : 'Start your next chapter.'}</h2><p>{mode === 'login' ? 'Sign in to continue where you left off.' : 'Create an account to keep your progress together.'}</p>
      <form onSubmit={submit}>
        {mode === 'register' && <label>Your name<input name="name" autoComplete="name" maxLength={80} required /></label>}
        <label>Email address<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>
        <label>Password<input type="password" name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={10} maxLength={128} required /></label>
        {mode === 'register' && <p className="text-sm">Use at least 10 characters.</p>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary-button" disabled={busy}>{busy ? 'Connecting…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
      </form>
      <button className="text-button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}</button>
    </section>
  </main>;
}
