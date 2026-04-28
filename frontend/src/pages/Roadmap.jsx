import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import RoadmapNode from "../components/RoadmapNode";
import Logo from "../components/Logo";

export const TOPICS = [
  { id: 'variables', title: 'Variables' },
  { id: 'data-types', title: 'Data Types' },
  { id: 'functions', title: 'Functions' },
  { id: 'closures', title: 'Closures' }
];

export const getProgress = () => {
  const saved = localStorage.getItem('js_roadmap_progress');
  if (saved) return JSON.parse(saved);
  // Default values to structure if none exist
  return {
    "variables": "completed",
    "data-types": "unlocked",
    "functions": "locked",
    "closures": "locked"
  };
};

export const saveProgress = (progress) => {
  localStorage.setItem('js_roadmap_progress', JSON.stringify(progress));
};

export default function Roadmap() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null; // Prevent flash before state is mounted

  const completedCount = Object.values(progress).filter(status => status === 'completed').length;
  const progressPercentage = (completedCount / TOPICS.length) * 100;

  const handleNodeClick = (id) => {
    navigate(`/lesson/${id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center py-16 px-6 relative">
      <div className="absolute top-6 left-6 md:top-8 md:left-12">
        <Logo />
      </div>
      <ProgressBar progressPercentage={progressPercentage} />

      {/* Roadmap layout */}
      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Vertical Line */}
        <div className="absolute top-0 bottom-0 w-1 bg-zinc-800 z-0 rounded-full"></div>

        {TOPICS.map((topic) => (
          <RoadmapNode 
            key={topic.id} 
            topic={topic} 
            status={progress[topic.id]} 
            onClick={handleNodeClick} 
          />
        ))}
      </div>
    </div>
  );
}
