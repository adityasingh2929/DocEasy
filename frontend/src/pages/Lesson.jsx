import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";
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
    
    // Mark current as completed
    progress[topic] = 'completed';
    
    // Unlock next topic if exists
    const currentIndex = TOPICS.findIndex(t => t.id === topic);
    if (currentIndex !== -1 && currentIndex < TOPICS.length - 1) {
      const nextTopicId = TOPICS[currentIndex + 1].id;
      if (progress[nextTopicId] === 'locked') {
        progress[nextTopicId] = 'unlocked';
      }
    }

    // Save and redirect
    saveProgress(progress);
    navigate('/roadmap/javascript');
  };

  // Compute context data for the mock function
  const doubtContextData = {
    topic: topic,
    topicName: topicName,
    activeTab: activeTab,
    quizQuestion: activeTab === 'quiz' ? "What is a closure?" : null,
    userAnswer: activeTab === 'quiz' ? quizOption : (activeTab === 'challenge' ? challengeInput : null)
  };

  // Add a new message to the active tab's history
  const handleAddMessage = (message) => {
    setChatHistory(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], message]
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex flex-col items-center relative">
      <div className="w-full max-w-4xl mt-2 md:mt-6">
        
        {/* Logo */}
        <div className="mb-8 md:mb-12">
          <Logo />
        </div>

        {/* Header containing Breadcrumb and Ask Doubt button */}
        <div className="flex justify-between items-center mb-10">
          <div className="text-zinc-400 font-medium tracking-wide">
            <Link to="/roadmap/javascript" className="hover:text-blue-400 transition-colors">JavaScript</Link>
            <span className="mx-3 text-zinc-600">{'>'}</span>
            <span className="text-zinc-200">{topicName}</span>
          </div>

          <button 
            onClick={() => setIsDoubtPanelOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg border border-zinc-700 transition-all duration-300 flex items-center gap-2 hover:shadow-zinc-700/50"
          >
            Ask Doubt 💬
          </button>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />

        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-8 md:p-12 min-h-[450px] shadow-xl">
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
        </div>
      </div>

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
