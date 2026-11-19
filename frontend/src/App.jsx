import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import AccountGate from './components/AccountGate';
import ProgressSync from './components/ProgressSync';
import Home from './pages/Home';
import Login from './pages/Login';
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notebook = lazy(() => import('./pages/Notebook'));
const Lesson = lazy(() => import('./pages/Lesson'));
const Documents = lazy(() => import('./pages/Documents'));
const workspace = page => <AccountGate>{page}</AccountGate>;
function TopicLesson() {
  const { topic } = useParams();
  return <Lesson key={topic} />;
}
export default function App() {
  return <BrowserRouter><ProgressSync /><Suspense fallback={<main className="workspace-page" role="status">Opening your workspace…</main>}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={workspace(<Dashboard />)} />
    <Route path="/roadmap/:language" element={workspace(<Roadmap />)} />
    <Route path="/lesson/:topic" element={workspace(<TopicLesson />)} />
    <Route path="/notebook" element={workspace(<Notebook />)} />
    <Route path="/documents" element={workspace(<Documents />)} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes></Suspense></BrowserRouter>;
}
