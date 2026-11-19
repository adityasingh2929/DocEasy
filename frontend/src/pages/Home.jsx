import { Link } from 'react-router-dom';
import { TRACKS } from '../data/topics';
import { account } from '../utils/account';
import LearningNav from '../components/LearningNav';

export default function Home() {
  const user = account()?.user;
  return <div className="site-shell">
    <header className="site-header"><Link className="brand" to="/home">DocEasy<span> / learning workspace</span></Link><Link className="header-link" to={user ? '/dashboard' : '/login'}>{user ? 'Open workspace' : 'Sign in'} ↗</Link></header>
    {user && <LearningNav />}
    <main>
      <section className="home-intro"><div><p className="eyebrow">FROM DOCUMENTATION TO UNDERSTANDING</p><h1>Read it.<br />Try it.<br /><em>Know it.</em></h1><p className="intro-copy">A practical path through JavaScript and Python. Short explanations, real examples, and practice that shows you what to work on next.</p><Link className="primary-button" to={user ? '/dashboard' : '/login'}>{user ? 'Continue learning' : 'Start learning'} <span>→</span></Link></div><aside className="lesson-preview"><div className="preview-top"><span>THE LEARNING LOOP</span><span>01 — 04</span></div><h2>Understanding takes practice.</h2><ol>{[['Read the concept','Start with an explanation and a worked example.'],['Check your reasoning','Answer five questions. Aim for at least four correct.'],['Solve the challenge','Trace the code and predict its output.'],['Return to your mistakes','Review what went wrong, then try again.']].map(([title,text],i)=><li key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><div className="preview-foot">Clear steps. Progress you can return to.</div></aside></section>
      <section className="course-section"><div className="section-heading"><div><p className="eyebrow">CHOOSE YOUR PATH</p><h2>Two languages. A solid foundation.</h2></div><span>Built around official documentation</span></div><div className="course-grid">{TRACKS.map((track,i)=><Link className="course-card" key={track.id} to={`/roadmap/${track.id}`}><div className="course-card-top"><span className={`language-mark language-${track.id}`}>{i===0?'JS':'Py'}</span><span>{track.topics.length} lessons · self-paced</span></div><h3>{track.title}</h3><p>{i===0?'From values and functions to asynchronous code, modules, and application structure.':'From your first variables to collections, functions, files, exceptions, and classes.'}</p><div className="course-card-bottom">Explore curriculum <span>↗</span></div></Link>)}</div></section>
      <section className="workspace-section"><p className="eyebrow">YOUR STUDY TOOLKIT</p><h2>Keep the whole learning process together.</h2><div className="toolkit-grid">{[['/notebook','01','A notebook for mistakes','Keep wrong answers, explanations, and retries in one place.'],['/documents','02','Study your own material','Upload PDF, DOCX, or text notes. Read extracted passages and generate practice with AI.'],['/dashboard','03','Progress with context','See completed lessons, assessment results, and the next step in your course.']].map(([url,n,title,text])=><Link key={url} to={url}><span>{n}</span><h3>{title}</h3><p>{text}</p><span aria-hidden="true">→</span></Link>)}</div></section>
    </main><footer className="site-footer"><span className="brand">DocEasy</span><p>Read carefully. Practise deliberately.</p><span>JavaScript / Python</span></footer>
  </div>;
}
