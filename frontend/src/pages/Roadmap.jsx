import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import { TOPICS } from "../data/topics";
import { getProgress as getGlobalProgress } from "../utils/progress";

export { TOPICS };

// Dynamically map the single source of truth progress to Roadmap's legacy flat format
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

// Ignore manual legacy saves, rely on QuizTab and ChallengeTab's internal global saves
export const saveProgress = () => {};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export default function Roadmap() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(getProgress());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!progress) return null;

  const completedCount = Object.values(progress).filter(status => status === 'completed').length;
  const progressPercentage = Math.round((completedCount / TOPICS.length) * 100);

  const handleNodeClick = (id, status) => {
    if (status !== 'locked') {
      navigate(`/lesson/${id}`);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress?")) {
      localStorage.removeItem("docs_made_easy_progress");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center py-16 px-4 md:px-6 relative overflow-x-hidden selection:bg-blue-500/30">
      
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
        <Logo />
      </div>

      {/* Header & Animated Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-12 md:mt-4 mb-20 text-center z-10 w-full max-w-xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-slate-900">
          Your Journey
        </h1>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md backdrop-blur-sm">
          <div className="flex justify-between items-end mb-4">
            <span className="text-slate-600 font-medium tracking-wide">Course Progress</span>
            <span className="text-3xl font-bold text-blue-700">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="bg-blue-600 h-full rounded-full shadow-sm relative"
            >
              {/* Highlight inside progress bar */}
              <div className="absolute inset-0 bg-white/20 w-full h-1/2"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Roadmap Layout */}
      <div className="relative w-full max-w-lg flex flex-col items-center pb-32">
        
        {/* Vertical Growing Line */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute top-0 w-1.5 bg-slate-200 z-0 left-1/2 -translate-x-1/2 rounded-full"
        />

        {/* Nodes */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full relative z-10 flex flex-col items-center gap-16 md:gap-20"
        >
          {TOPICS.map((topic) => {
            const status = progress[topic.id];
            const isCompleted = status === 'completed';
            const isUnlocked = status === 'unlocked';
            const isLocked = status === 'locked';

            return (
              <motion.div 
                key={topic.id}
                variants={itemVariants}
                className="relative flex flex-col items-center group w-full"
              >
                {/* Node Circle */}
                <motion.div
                  whileHover={!isLocked ? { scale: 1.15 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={() => handleNodeClick(topic.id, status)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-4 shadow-md transition-all duration-300 z-10 relative
                    ${isCompleted ? 'bg-green-100 border-green-500 cursor-pointer text-green-600' : ''}
                    ${isUnlocked ? 'bg-blue-100 border-blue-500 cursor-pointer text-blue-700' : ''}
                    ${isLocked ? 'bg-slate-100 border-slate-300 cursor-not-allowed opacity-60 text-slate-400' : ''}
                  `}
                >
                  {/* Pulse effect for current (unlocked) node */}
                  {isUnlocked && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20 z-0"></span>
                  )}

                  {/* Icons */}
                  <div className="z-10 relative">
                    {isCompleted && (
                      <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isUnlocked && (
                      <span className="font-black tracking-wider text-sm md:text-base">START</span>
                    )}
                    {isLocked && (
                      <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </motion.div>

                {/* Node Title */}
                <div className={`mt-4 md:mt-5 text-center transition-colors duration-300 bg-white/90 backdrop-blur-md px-5 py-1.5 rounded-full border border-slate-200 shadow-sm
                  ${isCompleted ? 'text-green-700 font-bold' : ''}
                  ${isUnlocked ? 'text-blue-700 font-bold' : ''}
                  ${isLocked ? 'text-slate-500 font-medium' : ''}
                `}>
                  <h2 className="text-lg md:text-xl tracking-wide">{topic.title}</h2>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>

      {/* Reset Progress Button */}
      <div className="mt-16 mb-8 z-10 relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetProgress}
          className="px-6 py-2.5 border border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors bg-white shadow-sm"
        >
          Reset Progress
        </motion.button>
      </div>
    </div>
  );
}
