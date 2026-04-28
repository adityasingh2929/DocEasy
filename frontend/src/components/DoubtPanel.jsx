import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../config/api";

const API_URL = `${BASE_URL}/doubt`;

export default function DoubtPanel({ isOpen, onClose, contextData, messages, onAddMessage }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll when messages update or panel opens
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", text: input };
    onAddMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: contextData.topic,
          question: input,
          mode: contextData.activeTab,
          currentQuestion: contextData.currentQuestion ?? null,
          options: contextData.options ?? null,
          correctAnswer: contextData.correctAnswer ?? null,
          explanation: contextData.explanation ?? null,
          code: contextData.code ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      onAddMessage({ role: "ai", text: data.answer });
    } catch (err) {
      console.error("[DoubtPanel] API error:", err);
      onAddMessage({ role: "ai", text: "Something went wrong. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] bg-white z-50 flex flex-col shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 text-slate-900 font-semibold flex justify-between items-center bg-white/90">
          <span className="tracking-wide">Ask your doubt</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && !isLoading && (
            <div className="text-center mt-12 px-2">
              <div className="text-4xl mb-4">💡</div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Ask any question about <strong>{contextData.topicName}</strong>. We'll use your
                progress in the <em>{contextData.activeTab}</em> tab to help!
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2.5 rounded-xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#1E3A8A] text-white rounded-br-sm"
                    : "bg-white text-slate-700 rounded-bl-sm border border-slate-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={bottomRef} className="h-px w-full" />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 flex gap-2 bg-white">
          <input
            className="flex-1 p-2.5 rounded-lg bg-slate-50 text-slate-900 text-sm outline-none border border-slate-300 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all placeholder:text-slate-400 disabled:opacity-50"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-white transition-colors flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}