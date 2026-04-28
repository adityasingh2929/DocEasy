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
        <p className="text-xl text-zinc-400 animate-pulse">
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
      <h2 className="text-2xl font-bold mb-6">Coding Challenge</h2>

      <p className="text-zinc-300 mb-8 text-lg">{question}</p>

      <div className="bg-zinc-950 rounded-xl p-6 mb-8 border border-zinc-800/50 font-mono text-[15px] shadow-inner whitespace-pre overflow-x-auto text-zinc-300 leading-relaxed">
        {code}
      </div>

      <div className="mb-10">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Your answer..."
          disabled={showResult}
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl px-5 py-4 text-white outline-none transition-all font-mono text-lg"
        />
      </div>

      <div className="mt-auto">
        {!showResult ? (
          <motion.button
            whileHover={userInput.trim() ? { scale: 1.05 } : {}}
            whileTap={userInput.trim() ? { scale: 0.95 } : {}}
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-colors"
          >
            Submit Answer
          </motion.button>
        ) : (
          <div className="space-y-6">
            <div
              className={`p-6 rounded-xl border ${
                isCorrect
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <h3
                className={`font-bold text-xl mb-3 ${
                  isCorrect ? "text-green-400" : "text-red-400"
                }`}
              >
                {isCorrect ? "Great job! ✅" : "Not quite right ❌"}
              </h3>

              <p className="text-zinc-300 text-lg leading-relaxed mb-4">
                Correct answer:
                <span className="font-mono text-zinc-100 bg-zinc-900 px-2 py-1 rounded ml-2">
                  {correctAnswer}
                </span>
              </p>

              {explanation && (
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700/50">
                  <h4 className="text-sm text-zinc-400 uppercase tracking-wider mb-2 font-bold">Explanation</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={!isContinuing ? { scale: 1.05 } : {}}
              whileTap={!isContinuing ? { scale: 0.95 } : {}}
              onClick={handleContinue}
              disabled={isContinuing}
              className="px-8 py-3.5 bg-zinc-100 hover:bg-white disabled:bg-zinc-500 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 group"
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