import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getProgress, saveProgress } from "../utils/progress";

export default function QuizTab({ isCompleted, onComplete, onChange }) {
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

  // 🔥 FIX 1: prevent stale overwrite
  const requestIdRef = useRef(0);

  // 🔥 FIX 2: prevent multiple fetches
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setIsContinuing(false);
    setError(false);
    setLoading(true);

    const currentRequestId = Date.now();
    requestIdRef.current = currentRequestId;

    const fetchQuiz = async () => {
      console.log("Fetching quiz for topic:", topic);

      try {
        const response = await fetch("http://127.0.0.1:8000/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic })
        });

        if (!response.ok) throw new Error("Failed");

        const data = await response.json();

        // 🚫 Ignore stale response
        if (requestIdRef.current !== currentRequestId) return;

        setQuestion(data.question);

        const cleanText = (text) =>
          typeof text === "string"
            ? text.replace(/<[^>]+>\s*/, "")
            : text;

        const cleanedOptions = data.options.map(cleanText);
        setOptions(cleanedOptions);

        const cleanedCorrect = cleanText(data.correctAnswer);

        let correctIdx = cleanedOptions.indexOf(cleanedCorrect);

        if (correctIdx === -1) {
          const letters =
            typeof data.correctAnswer === "string"
              ? data.correctAnswer.replace(/[^A-D]/g, "")
              : "";

          if (letters.length > 0) {
            correctIdx = letters.charCodeAt(0) - 65;
          } else {
            correctIdx = 0;
          }
        }

        setCorrectAnswer(correctIdx);
        setExplanation(data.explanation || "");
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [topic]);

  // 🔥 Reset fetch guard when topic changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [topic]);

  // Sync to parent
  useEffect(() => {
    if (onChange) onChange(selectedOption);
  }, [selectedOption, onChange]);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      const correct = selectedOption === correctAnswer;
      setIsCorrect(correct);
      setIsSubmitted(true);

      if (correct) {
        const progress = getProgress();
        progress.quizScores[topic] = (progress.quizScores[topic] || 0) + 1;
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
        <p className="text-xl text-zinc-400 animate-pulse">
          Generating quiz...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-red-400 mb-4">
          Failed to load quiz
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>

      <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700/50 mb-8">
        <p className="text-xl text-zinc-100 font-medium">{question}</p>
      </div>

      <div className="space-y-4 mb-10">
        {options.map((opt, index) => {
          const isCorrectOption = index === correctAnswer;
          const isSelected = selectedOption === index;

          let optStyle =
            "border-zinc-700/60 hover:border-zinc-500 bg-zinc-800/30";

          if (!isSubmitted) {
            if (isSelected)
              optStyle =
                "border-blue-500 bg-blue-500/10 text-blue-400";
          } else {
            if (isCorrectOption) {
              optStyle =
                "border-green-500 bg-green-500/10 text-green-400";
            } else if (isSelected && !isCorrectOption) {
              optStyle =
                "border-red-500 bg-red-500/10 text-red-400";
            } else {
              optStyle =
                "border-zinc-800 bg-zinc-900/30 text-zinc-600";
            }
          }

          return (
            <div
              key={index}
              onClick={() =>
                !isSubmitted && setSelectedOption(index)
              }
              className={`p-5 border rounded-xl transition-all flex items-center gap-5 ${
                !isSubmitted ? "cursor-pointer" : ""
              } ${optStyle}`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-current" : "border-zinc-600"
                }`}
              >
                {isSelected && (
                  <div className="w-3 h-3 rounded-full bg-current"></div>
                )}
              </div>

              <span className="text-lg">{opt}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold rounded-xl"
          >
            Submit Answer
          </button>
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
                {isCorrect ? "Correct ✅" : "Wrong ❌"}
              </h3>

              {!isCorrect && options[correctAnswer] && (
                <p className="text-zinc-300 mb-2">
                  Correct answer:{" "}
                  <span className="font-semibold">
                    {options[correctAnswer]}
                  </span>
                </p>
              )}
            </div>

            {explanation && (
              <p className="text-zinc-300 text-lg leading-relaxed">
                <span className="font-bold text-zinc-100">Explanation: </span>
                {explanation}
              </p>
            )}

            <button
              onClick={handleContinue}
              disabled={isContinuing}
              className="px-8 py-3.5 bg-zinc-100 hover:bg-white disabled:bg-zinc-500 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-xl"
            >
              {isContinuing ? "Loading..." : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}