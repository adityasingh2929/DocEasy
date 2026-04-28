import { useParams } from "react-router-dom";
import concepts from "../data/concepts.json";
import { motion } from "framer-motion";

export default function ConceptTab({ topicName, isCompleted, onComplete }) {
  const { topic } = useParams();
  
  // Find concept by id
  const concept = concepts.find(c => c.id === topic);

  if (!concept) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-xl text-zinc-400">Concept not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold mb-6 text-white">{concept.title}</h2>
      
      <div className="bg-zinc-950 rounded-xl p-8 mb-10 border border-zinc-800/50 shadow-inner overflow-y-auto flex-1">
        
        {/* Explanation */}
        <p className="text-zinc-300 text-[16px] leading-relaxed mb-6">
          {concept.explanation}
        </p>

        {/* Bullet Points */}
        {concept.points && concept.points.length > 0 && (
          <ul className="list-disc list-inside space-y-2 mb-8 text-zinc-300 text-[16px]">
            {concept.points.map((point, idx) => (
              <li key={idx} className="leading-relaxed pl-2 marker:text-blue-500">
                {point}
              </li>
            ))}
          </ul>
        )}

        {/* Code Example */}
        {concept.example && (
          <div className="bg-[#111] border border-zinc-800/80 rounded-lg p-5 overflow-x-auto shadow-sm">
            <pre className="font-mono text-[14px] leading-relaxed text-blue-300 whitespace-pre">
              {concept.example}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <motion.button 
          whileHover={!isCompleted ? { scale: 1.05 } : {}}
          whileTap={!isCompleted ? { scale: 0.95 } : {}}
          onClick={onComplete}
          className={`px-8 py-3.5 rounded-xl font-bold transition-all duration-300
            ${isCompleted 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'}
          `}
        >
          {isCompleted ? '✓ Marked as Complete' : 'Mark as Complete'}
        </motion.button>
      </div>
    </div>
  );
}
