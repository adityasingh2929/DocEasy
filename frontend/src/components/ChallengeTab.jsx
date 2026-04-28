import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getProgress, saveProgress } from "../utils/progress";
import { motion } from "framer-motion";

export default function ChallengeTab({ onChallengeSuccess, onChange }) {
  const { topic } = useParams();

  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  // 🔥 Fix race condition
  const requestIdRef = useRef(0);

  useEffect(() => {
    // Reset state on topic change
    setUserInput("");
    setShowResult(false);
    setIsCorrect(false);
    setIsContinuing(false);
    setError(false);
    setLoading(true);

    const currentRequestId = Date.now();
    requestIdRef.current = currentRequestId;

    const fetchChallenge = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic })
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        // 🚫 Ignore outdated responses
        if (requestIdRef.current !== currentRequestId) return;

        setQuestion(data.question);
        setCode(data.code);
        setCorrectAnswer(data.correctAnswer);
        setExplanation(data.explanation);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [topic]);

  // Sync to parent (for chatbot context)
  useEffect(() => {
    if (onChange) onChange(userInput);
  }, [userInput, onChange]);

  const normalize = (text) => text.trim().toLowerCase();

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const isMatch = normalize(userInput) === normalize(correctAnswer);

    console.log("User:", normalize(userInput));
    console.log("Correct:", normalize(correctAnswer));

    setIsCorrect(isMatch);
    setShowResult(true);

    if (isMatch) {
      const progress = getProgress();
      progress.challengesSolved[topic] = true;
      saveProgress(progress);
    }
  };

  const handleContinue = () => {
    if (isContinuing) return;
    setIsContinuing(true);
    onChallengeSuccess();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl text-slate-500 animate-pulse">
          Generating challenge...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-red-400 mb-4">
          Failed to load challenge
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Coding Challenge</h2>

      <p className="text-slate-600 mb-8 text-lg">{question}</p>

      <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800 font-mono text-[15px] shadow-sm whitespace-pre overflow-x-auto text-blue-300 leading-relaxed">
        {code}
      </div>

      <div className="mb-10">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Your answer..."
          disabled={showResult}
          className="w-full bg-white border border-slate-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 rounded-xl px-5 py-4 text-slate-900 outline-none transition-all font-mono text-lg placeholder:text-slate-400 shadow-sm"
        />
      </div>

      <div className="mt-auto">
        {!showResult ? (
          <motion.button
            whileHover={userInput.trim() ? { scale: 1.05 } : {}}
            whileTap={userInput.trim() ? { scale: 0.95 } : {}}
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="px-8 py-3.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Submit Answer
          </motion.button>
        ) : (
          <div className="space-y-6">
            <div
              className={`p-6 rounded-xl border shadow-sm ${
                isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3
                className={`font-bold text-xl mb-3 ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {isCorrect ? "Great job! ✅" : "Not quite right ❌"}
              </h3>

              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                Correct answer:
                <span className="font-mono text-slate-900 bg-slate-200 px-2 py-1 rounded ml-2">
                  {correctAnswer}
                </span>
              </p>

              {explanation && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-2 font-bold">Explanation</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={!isContinuing ? { scale: 1.05 } : {}}
              whileTap={!isContinuing ? { scale: 0.95 } : {}}
              onClick={handleContinue}
              disabled={isContinuing}
              className="px-8 py-3.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 group"
            >
              {isContinuing ? "Loading..." : (
                <>
                  Continue
                  <span className="text-xl group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}