export default function ProgressBar({ progressPercentage }) {
  return (
    <div className="w-full max-w-2xl mb-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">JavaScript Roadmap</h1>
      <div className="w-full bg-zinc-800 rounded-full h-4 mb-3 shadow-inner">
        <div 
          className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-zinc-400 text-right text-sm font-medium">{Math.round(progressPercentage)}% Completed</p>
    </div>
  );
}
