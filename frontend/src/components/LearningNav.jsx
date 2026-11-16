import { NavLink } from 'react-router-dom';

export default function LearningNav() {
  return <nav aria-label="Learning navigation" className="flex flex-wrap gap-2 mb-8 text-sm font-semibold">
    {[[ '/home', 'Home' ],[ '/dashboard', 'Dashboard' ],[ '/roadmap/javascript', 'Roadmap' ],[ '/notebook', 'Mistake notebook' ]].map(([url, label]) =>
      <NavLink key={url} to={url} className={({isActive}) => `rounded-lg px-4 py-2 border ${isActive ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-800'}`}>{label}</NavLink>)}
  </nav>;
}
