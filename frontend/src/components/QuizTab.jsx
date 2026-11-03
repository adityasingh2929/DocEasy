import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProgress, saveProgress } from "../utils/progress";
import { motion } from "framer-motion";
import { postJSON } from "../config/api";

export default function QuizTab({ onComplete, onContext }) {
  const { topic } = useParams();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    (async () => {
      await Promise.resolve();
      if (!active) return;
    setLoading(true);
    setError(false);
    setSelectedOption(null); setIsSubmitted(false);
    setIsCorrect(false);
    setIsContinuing(false);
      try {
        const data = await postJSON("/quiz", { topic }, controller.signal);
        if (!active) return;
        if (!Array.isArray(data.options) || data.options.length !== 4 || new Set(data.options).size !== 4 || !data.options.every(opt => typeof opt === "string" && opt.trim())) throw new Error("Invalid quiz");
        const answerIndex = data.options.indexOf(data.correctAnswer);
        if (answerIndex < 0) throw new Error("Invalid quiz answer");
        setQuestion(data.question);
        setOptions(data.options);
        setCorrectAnswer(answerIndex);
        setExplanation(data.explanation || "");
        onContext?.({ currentQuestion: data.question, options: data.options, correctAnswer: data.correctAnswer, explanation: data.explanation });
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; controller.abort(); };
    // Context is published only when a new question arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, attempt]);



  const handleSubmit = () => {
    if (!isSubmitted && selectedOption !== null) {
      const correct = selectedOption === correctAnswer;
      setIsCorrect(correct);
      setIsSubmitted(true);

      if (correct) {
        const progress = getProgress();
        progress.quizScores[topic] = 1;
        saveProgress(progress);
      }
    }
  };

  const handleContinue = () => {
    if (isContinuing) return;
    setIsContinuing(true);
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl text-slate-500 animate-pulse">
          Generating quiz...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p role="alert" className="text-xl text-red-400 mb-4">
          Could not load quiz. The server may be waking up. Please try again.
        </p>
        <button onClick={() => setAttempt(value => value + 1)} className="px-6 py-3 bg-blue-900 text-white rounded-xl">Try again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Knowledge Check</h2>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <p className="text-xl text-slate-900 font-medium">{question}</p>
      </div>

      <div className="space-y-4 mb-10">
        {options.map((opt, index) => {
          const isCorrectOption = index === correctAnswer;
          const isSelected = selectedOption === index;

          let optStyle =
            "border-slate-200 hover:border-[#1E3A8A] bg-white shadow-sm text-slate-700";

          if (!isSubmitted) {
            if (isSelected)
              optStyle =
                "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] shadow-md";
          } else {
            if (isCorrectOption) {
              optStyle =
                "border-green-500 bg-green-50 text-green-700 shadow-sm";
            } else if (isSelected && !isCorrectOption) {
              optStyle =
                "border-red-500 bg-red-50 text-red-700 shadow-sm";
            } else {
              optStyle =
                "border-slate-200 bg-slate-50 text-slate-400 shadow-none opacity-60";
            }
          }

          return (
            <motion.button
              type="button"
              disabled={isSubmitted}
              aria-pressed={isSelected}
              key={index}
              whileHover={!isSubmitted ? { scale: 1.02, y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              onClick={() =>
                !isSubmitted && setSelectedOption(index)
              }
              className={`w-full text-left p-5 border rounded-xl transition-all flex items-center gap-5 ${
                !isSubmitted ? "cursor-pointer" : ""
              } ${optStyle}`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-current" : "border-slate-300"
                }`}
              >
                {isSelected && (
                  <div className="w-3 h-3 rounded-full bg-current"></div>
                )}
              </div>

              <span className="text-lg">{opt}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto">
        {!isSubmitted ? (
          <motion.button
            whileHover={selectedOption !== null ? { scale: 1.05 } : {}}
            whileTap={selectedOption !== null ? { scale: 0.95 } : {}}
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-8 py-3.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md transition-colors"
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
                {isCorrect ? "Correct ✅" : "Wrong ❌"}
              </h3>

              {!isCorrect && options[correctAnswer] && (
                <p className="text-slate-600 mb-2">
                  Correct answer:{" "}
                  <span className="font-semibold text-slate-900">
                    {options[correctAnswer]}
                  </span>
                </p>
              )}
            </div>

            {explanation && (
              <p className="text-slate-600 text-lg leading-relaxed">
                <span className="font-bold text-slate-900">Explanation: </span>
                {explanation}
              </p>
            )}

            <motion.button
              whileHover={!isContinuing ? { scale: 1.05 } : {}}
              whileTap={!isContinuing ? { scale: 0.95 } : {}}
              onClick={isCorrect ? handleContinue : () => { setIsSubmitted(false); setSelectedOption(null); }}
              disabled={isContinuing}
              className="px-8 py-3.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {isContinuing ? "Loading..." : isCorrect ? "Continue →" : "Try again"}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
