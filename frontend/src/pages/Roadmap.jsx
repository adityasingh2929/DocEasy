import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import RoadmapNode from "../components/RoadmapNode";
import Logo from "../components/Logo";
import { TOPICS } from "../data/topics";
import { getProgress as getGlobalProgress } from "../utils/progress";

export { TOPICS };

export const getProgress = () => {
  const globalProgress = getGlobalProgress();
  const mappedProgress = {};
  
  TOPICS.forEach((topic, index) => {
    const isCompleted = 
      (globalProgress.quizScores && globalProgress.quizScores[topic.id]) || 
      (globalProgress.challengesSolved && globalProgress.challengesSolved[topic.id]);
      
    if (isCompleted) {
      mappedProgress[topic.id] = 'completed';
    } else if (index === 0) {
      mappedProgress[topic.id] = 'unlocked';
    } else {
      const prevTopicId = TOPICS[index - 1].id;
      const isPrevCompleted = 
        globalProgress.topicsCompleted?.includes(prevTopicId) || 
        globalProgress.quizScores?.[prevTopicId] || 
        globalProgress.challengesSolved?.[prevTopicId];
      
      mappedProgress[topic.id] = isPrevCompleted ? 'unlocked' : 'locked';
    }
  });
  
  return mappedProgress;
};

export const saveProgress = () => {};

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
