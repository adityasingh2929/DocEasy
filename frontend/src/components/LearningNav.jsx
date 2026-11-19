import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { account, signOut } from '../utils/account';
export default function LearningNav() {
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function logout() { setBusy(true); try { await signOut(); } catch(err) {setError(err.message);setBusy(false);} }
  return <><nav aria-label="Learning navigation" className="learning-nav"><NavLink className="nav-brand" to="/home">DocEasy</NavLink><div className="nav-links">{[['/dashboard','Overview'],['/roadmap/javascript','JavaScript'],['/roadmap/python','Python'],['/documents','Documents'],['/notebook','Mistakes']].map(([url,label])=><NavLink key={url} to={url} className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}</div><div className="nav-account"><span>{account()?.user?.name}</span><button disabled={busy} onClick={logout}>{busy?'Signing out…':'Sign out'}</button></div></nav>{error&&<p role="alert" className="form-error">{error}</p>}</>;
}
