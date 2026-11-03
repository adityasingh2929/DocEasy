import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postJSON } from "../config/api";


export default function DoubtPanel({ isOpen, onClose, contextData, messages, onAddMessage }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = event => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Auto scroll when messages update or panel opens
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const tabId = contextData.activeTab;

    const userMsg = { role: "user", text: input };
    onAddMessage(userMsg, tabId);
    setInput("");
    setIsLoading(true);

    try {
      const data = await postJSON("/doubt", {
          topic: contextData.topic,
          question: input,
          mode: contextData.activeTab,
          currentQuestion: contextData.currentQuestion ?? null,
          options: contextData.options ?? null,
          correctAnswer: contextData.correctAnswer ?? null,
          explanation: contextData.explanation ?? null,
          code: contextData.code ?? null,
      }, controller.signal);
      if (!controller.signal.aborted) onAddMessage({ role: "ai", text: data.answer }, tabId);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("[DoubtPanel] API error:", err);
      onAddMessage({ role: "ai", text: "The tutor is temporarily unavailable. Please try again." }, tabId);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
      requestRef.current = null;
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
        role="dialog"
        aria-modal={isOpen || undefined}
        aria-label="Ask your doubt"
        inert={!isOpen}
        className={`fixed top-0 right-0 h-full w-[min(100vw,360px)] bg-white z-50 flex flex-col shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 text-slate-900 font-semibold flex justify-between items-center bg-white/90">
          <span className="tracking-wide">Ask your doubt</span>
          <button
            aria-label="Close tutor"
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
                className={`px-4 py-2.5 rounded-xl max-w-[85%] whitespace-pre-wrap break-words text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#1E3A8A] text-white rounded-br-sm"
                    : "bg-white text-slate-700 rounded-bl-sm border border-slate-200"
                }`}
              >
                {msg.role === "user" ? msg.text : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml
                    disallowedElements={["img"]}
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0 whitespace-normal">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-3 whitespace-normal">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 whitespace-normal">{children}</ol>,
                      pre: ({ children }) => <pre className="overflow-x-auto bg-slate-900 text-blue-100 p-3 rounded-lg my-3 text-xs whitespace-pre">{children}</pre>,
                      code: ({ children }) => <code className="font-mono break-words">{children}</code>,
                      table: ({ children }) => <div className="overflow-x-auto my-3"><table className="border-collapse text-xs whitespace-normal">{children}</table></div>,
                      th: ({ children }) => <th className="border border-slate-300 p-2 text-left">{children}</th>,
                      td: ({ children }) => <td className="border border-slate-300 p-2">{children}</td>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-800 underline">{children}</a>,
                    }}
                  >{msg.text}</ReactMarkdown>
                )}
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
            aria-label="Your question"
            className="min-w-0 flex-1 p-2.5 rounded-lg bg-slate-50 text-slate-900 text-sm outline-none border border-slate-300 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all placeholder:text-slate-400 disabled:opacity-50"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />

          <button
            aria-label="Send question"
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
