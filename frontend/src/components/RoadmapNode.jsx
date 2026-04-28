export default function RoadmapNode({ topic, status, onClick }) {
  const isCompleted = status === 'completed';
  const isUnlocked = status === 'unlocked';
  const isLocked = status === 'locked';
  const isClickable = isCompleted || isUnlocked;

  return (
    <div className="relative z-10 flex flex-col items-center mb-12 last:mb-0 group">
      <div
        onClick={() => isClickable && onClick(topic.id)}
        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300
          ${isCompleted ? 'bg-green-600 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer hover:scale-110' : ''}
          ${isUnlocked ? 'bg-blue-600 border-blue-500 cursor-pointer hover:bg-blue-500 hover:scale-110 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}
          ${isLocked ? 'bg-zinc-800 border-zinc-700 opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {isCompleted && (
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isUnlocked && (
          <span className="text-white font-bold tracking-wide">START</span>
        )}
        {isLocked && (
          <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      </div>
      <h2 className={`mt-4 text-xl font-semibold tracking-wide transition-colors duration-300
        ${isCompleted ? 'text-green-400 group-hover:text-green-300' : ''}
        ${isUnlocked ? 'text-blue-400 group-hover:text-blue-300' : ''}
        ${isLocked ? 'text-zinc-500' : ''}
      `}>
        {topic.title}
      </h2>
    </div>
  );
}
