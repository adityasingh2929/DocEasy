import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function ConceptTab({ topicName, isCompleted, onComplete }) {
  const { topic } = useParams();
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestIdRef = useRef(0);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Reset fetch guard when topic changes
    hasFetchedRef.current = false;
  }, [topic]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoading(true);
    setError(false);
    
    const currentRequestId = Date.now();
    requestIdRef.current = currentRequestId;

    const fetchConcept = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/concept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic })
        });

        if (!response.ok) throw new Error("Failed");

        const data = await response.json();

        // Ignore stale responses
        if (requestIdRef.current !== currentRequestId) return;

        setExplanation(data.explanation);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConcept();
  }, [topic]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl text-zinc-400 animate-pulse">
          Generating concept explanation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-red-400 mb-4">
          Failed to load concept
        </p>
      </div>
    );
  }

  // Render text cleanly with support for basic paragraphs
  const renderExplanation = () => {
    return explanation.split('\n\n').map((paragraph, idx) => {
      // Basic formatting for bullet points if the LLM outputs them
      const lines = paragraph.split('\n');
      return (
        <div key={idx} className="mb-6 last:mb-0">
          {lines.map((line, lineIdx) => (
            <p key={lineIdx} className="text-zinc-300 text-[16px] leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold mb-8">{topicName}</h2>
      
      <div className="bg-zinc-950 rounded-xl p-8 mb-10 border border-zinc-800/50 shadow-inner overflow-y-auto">
        {renderExplanation()}
      </div>

      <div className="mt-auto pt-4">
        <button 
          onClick={onComplete}
          className={`px-8 py-3.5 rounded-xl font-bold transition-all duration-300
            ${isCompleted 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'}
          `}
        >
          {isCompleted ? '✓ Marked as Complete' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
}
