import { Link, Navigate, useParams } from 'react-router-dom';
import LearningNav from '../components/LearningNav';
import { TRACKS } from '../data/topics';
import { getRoadmapProgress } from '../utils/progress';
import { useProgress } from '../utils/useProgress';

export default function Roadmap() {
  const { language } = useParams();
  useProgress();
  const track = TRACKS.find(item => item.id === language);
  if (!track) return <Navigate to="/home" replace />;
  const progress = getRoadmapProgress(track.topics);
  const count = Object.values(progress).filter(status => status === 'completed').length;
  return <main className="workspace-page"><LearningNav /><header className="curriculum-header"><div><p className="eyebrow">THE CURRICULUM / {track.title.toUpperCase()}</p><h1>Your {track.title} path.</h1><p>Read the concept, pass the assessment, and solve the challenge to unlock the next lesson.</p></div><div className="course-progress"><strong>{count}<span> / {track.topics.length}</span></strong><p>lessons completed</p><progress value={count} max={track.topics.length} aria-label="Course progress" /></div></header>
    {count === track.topics.length && <section className="completion-banner"><h2>Course complete. Well done.</h2><p>You have completed every lesson in this path. Review your mistakes or begin the other language.</p><Link to="/notebook">Review your learning →</Link></section>}
    <div className="curriculum-list">{track.topics.map((topic,index)=>{const status=progress[topic.id];return <article key={topic.id} className={`curriculum-row ${status}`}><span className="lesson-number">{String(index+1).padStart(2,'0')}</span><div><p className="eyebrow">{status==='completed'?'COMPLETED':status==='locked'?'UP NEXT':'READY TO START'}</p><h2>{topic.title}</h2><p>Concept · 5-question assessment · Code challenge</p></div>{status==='locked'?<span className="locked-label">Complete lesson {index} first</span>:<Link className="lesson-action" to={`/lesson/${topic.id}`}>{status==='completed'?'Review':'Start lesson'} <span>→</span></Link>}</article>;})}</div>
    <p className="curriculum-note">You need 80% on the assessment to unlock its challenge. You can retake assessments and revisit completed lessons at any time.</p>
  </main>;
}
