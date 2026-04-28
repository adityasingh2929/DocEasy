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
        <p className="text-xl text-slate-500">Concept not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold mb-6 text-slate-900">{concept.title}</h2>
      
      <div className="bg-white rounded-xl p-8 mb-10 border border-slate-200 shadow-sm overflow-y-auto flex-1">
        
        {/* Explanation */}
        <p className="text-slate-600 text-[16px] leading-relaxed mb-6">
          {concept.explanation}
        </p>

        {/* Bullet Points */}
        {concept.points && concept.points.length > 0 && (
          <ul className="list-disc list-inside space-y-2 mb-8 text-slate-600 text-[16px]">
            {concept.points.map((point, idx) => (
              <li key={idx} className="leading-relaxed pl-2 marker:text-[#1E3A8A]">
                {point}
              </li>
            ))}
          </ul>
        )}

        {/* Code Example */}
        {concept.example && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 overflow-x-auto shadow-sm">
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
              ? 'bg-green-50 text-green-700 border border-green-200 cursor-default shadow-sm' 
              : 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-md hover:shadow-lg'}
          `}
        >
          {isCompleted ? '✓ Marked as Complete' : 'Mark as Complete'}
        </motion.button>
      </div>
    </div>
  );
}
