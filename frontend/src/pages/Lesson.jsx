import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConceptTab from "../components/ConceptTab";
import QuizTab from "../components/QuizTab";
import ChallengeTab from "../components/ChallengeTab";
import DoubtPanel from "../components/DoubtPanel";
import Logo from "../components/Logo";
import { TOPICS, getProgress, saveProgress } from "./Roadmap";

export default function Lesson() {
  const { topic } = useParams();
  const navigate = useNavigate();
  
  const topicName = topic 
    ? topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : 'Topic';

  const [activeTab, setActiveTab] = useState('concept');
  const [conceptCompleted, setConceptCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Lifted state for context awareness in DoubtPanel
  const [quizOption, setQuizOption] = useState(null);
  const [challengeInput, setChallengeInput] = useState('');
  const [isDoubtPanelOpen, setIsDoubtPanelOpen] = useState(false);

  // Per-tab chat memory
  const [chatHistory, setChatHistory] = useState({
    concept: [],
    quiz: [],
    challenge: []
  });

  const tabs = [
    { id: 'concept', label: 'Concept', locked: false },
    { id: 'quiz', label: 'Quiz', locked: !conceptCompleted },
    { id: 'challenge', label: 'Challenge', locked: !quizCompleted },
  ];

  const handleTabClick = (tabId, locked) => {
    if (!locked) {
      setActiveTab(tabId);
    }
  };

  const handleChallengeSuccess = () => {
    const progress = getProgress();
    
    // Mark current as completed using legacy mapping fallback just in case
    // Though new utils/progress saves automatically, we preserve legacy flow
    progress[topic] = 'completed';
    
    const currentIndex = TOPICS.findIndex(t => t.id === topic);
    if (currentIndex !== -1 && currentIndex < TOPICS.length - 1) {
      const nextTopicId = TOPICS[currentIndex + 1].id;
      if (progress[nextTopicId] === 'locked') {
        progress[nextTopicId] = 'unlocked';
      }
    }

    saveProgress(progress);
    navigate('/roadmap/javascript');
  };

  const doubtContextData = {
    topic: topic,
    topicName: topicName,
    activeTab: activeTab,
    quizQuestion: activeTab === 'quiz' ? "What is a closure?" : null,
    userAnswer: activeTab === 'quiz' ? quizOption : (activeTab === 'challenge' ? challengeInput : null)
  };

  const handleAddMessage = (message) => {
    setChatHistory(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], message]
    }));
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [topic]);

  return (
    <div className="min-h-screen bg-[#0B1020] text-white p-6 md:p-10 flex flex-col items-center relative overflow-x-hidden selection:bg-blue-500/30">
      <div className="w-full max-w-5xl mt-2 md:mt-4 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="flex flex-col">
            {/* Breadcrumbs */}
            <div className="text-zinc-400 font-medium tracking-wide mb-4 flex items-center text-sm md:text-sm">
              <Link to="/roadmap/javascript" className="hover:text-white transition-colors bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/50 backdrop-blur-sm">
                Roadmap
              </Link>
              <span className="mx-3 text-zinc-600">{'>'}</span>
              <span className="text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                {topicName}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{topicName}</h1>
          </div>
          
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            <Logo />
          </div>
        </div>

        {/* Custom Animated Tabs */}
        <div className="w-full flex space-x-2 mb-8 bg-zinc-900/40 p-2 rounded-2xl border border-zinc-800/50 backdrop-blur-sm self-start overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.locked)}
                className={`relative px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-colors duration-300 flex items-center gap-2 whitespace-nowrap
                  ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}
                  ${tab.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-zinc-800/50'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="lessonTabIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 tracking-wide">
                  {tab.label}
                  {tab.locked && (
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area with Framer Motion Fade/Slide */}
        <div className="w-full relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#0e1324] border border-zinc-800 rounded-[2rem] p-6 md:p-12 min-h-[500px] shadow-2xl relative w-full"
            >
              {activeTab === 'concept' && (
                <ConceptTab 
                  topicName={topicName} 
                  isCompleted={conceptCompleted} 
                  onComplete={() => {
                    setConceptCompleted(true);
                    setActiveTab('quiz');
                  }} 
                />
              )}
              
              {activeTab === 'quiz' && (
                <QuizTab 
                  key={`${topic}-quiz`}
                  isCompleted={false}
                  onComplete={() => {
                    setQuizCompleted(true);
                    setActiveTab('challenge');
                  }}
                  onChange={(opt) => setQuizOption(opt)}
                />
              )}
              
              {activeTab === 'challenge' && (
                <ChallengeTab 
                  onChallengeSuccess={handleChallengeSuccess}
                  onChange={(ans) => setChallengeInput(ans)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Ask Doubt Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => setIsDoubtPanelOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/30 transition-colors z-40 group flex items-center justify-center cursor-pointer"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        
        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-zinc-800 text-white text-sm font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700 shadow-2xl tracking-wide">
          Ask Tutor
        </span>
      </motion.button>

      {/* Render the actual panel off-canvas */}
      <DoubtPanel 
        isOpen={isDoubtPanelOpen} 
        onClose={() => setIsDoubtPanelOpen(false)} 
        contextData={doubtContextData} 
        messages={chatHistory[activeTab]}
        onAddMessage={handleAddMessage}
      />
    </div>
  );
}
