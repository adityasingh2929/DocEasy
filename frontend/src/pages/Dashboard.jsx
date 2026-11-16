import { Link } from 'react-router-dom';
import LearningNav from '../components/LearningNav';
import { TOPICS } from '../data/topics';
import { useProgress } from '../utils/useProgress';
import { dashboardStats } from '../utils/learning';

export default function Dashboard() {
  const progress = useProgress();
  const stats = dashboardStats(progress, TOPICS);
  return <main className="min-h-screen max-w-6xl mx-auto p-6 md:p-12 text-slate-900">
    <LearningNav />
    <p className="text-blue-800 text-sm font-bold uppercase tracking-widest">Your learning space</p>
    <h1 className="text-4xl font-bold mt-3 mb-3">A little progress, every session.</h1>
    <p className="text-slate-600 mb-8">Your progress is saved in this browser. Reviewed practice works without an AI key.</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[[`${stats.completed}/${TOPICS.length}`, 'Topics completed'],[stats.accuracy === null ? '—' : `${stats.accuracy}%`, 'Assessment accuracy'],[stats.challenges, 'Challenges solved'],[stats.mistakes, 'Mistakes to revise']].map(([value, label]) => <div key={label} className="bg-white p-5 border border-slate-200 rounded-2xl"><p className="text-3xl font-bold text-blue-900">{value}</p><p className="text-sm text-slate-500 mt-2">{label}</p></div>)}
    </div>
    <section className="bg-blue-900 text-white rounded-2xl p-7 mb-8">
      <h2 className="text-2xl font-bold">{stats.next ? `Up next: ${stats.next.title}` : 'You completed the roadmap'}</h2>
      <p className="text-blue-100 my-3">{stats.next ? 'Read, practise, pass the five-question assessment, then solve the challenge.' : 'Revisit a topic or revise your mistake notebook to strengthen your understanding.'}</p>
      <Link className="inline-block bg-white text-blue-900 px-5 py-3 rounded-xl font-bold" to={stats.next ? `/lesson/${stats.next.id}` : '/notebook'}>{stats.next ? 'Continue learning' : 'Review mistakes'}</Link>
    </section>
    <div className="grid md:grid-cols-2 gap-6">
      <section className="bg-white rounded-2xl border p-6"><h2 className="text-xl font-bold mb-4">Topic progress</h2><ul className="space-y-3">{TOPICS.map(topic => <li key={topic.id} className="flex justify-between gap-4 text-sm"><span>{topic.title}</span><span className="text-slate-500">{progress.challengesSolved[topic.id] || progress.topicsCompleted.includes(topic.id) ? 'Completed' : progress.conceptsRead[topic.id] ? 'In progress' : 'Not started'}</span></li>)}</ul></section>
      <section className="bg-white rounded-2xl border p-6"><h2 className="text-xl font-bold mb-4">Recent assessments</h2>{!progress.assessments.length ? <p className="text-slate-500">Your first assessment result will appear here.</p> : <ul className="space-y-4">{progress.assessments.slice(-6).reverse().map(attempt => <li key={attempt.id} className="text-sm border-b pb-3"><p className="font-semibold">{TOPICS.find(topic => topic.id === attempt.topic)?.title} · {attempt.score}/{attempt.total}</p><p className="text-slate-500">{attempt.passed ? 'Passed' : 'Keep practising'} · {new Date(attempt.completedAt).toLocaleDateString()} · {attempt.grading === 'browser' ? 'Offline grading' : 'Server grading'}</p></li>)}</ul>}<p className="text-xs text-slate-500 mt-4">Accuracy uses all scored assessment questions, including retakes. Hints used: {progress.hintsUsed}.</p></section>
    </div>
  </main>;
}
