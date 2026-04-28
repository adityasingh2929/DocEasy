import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">
        What do you want to learn today?
      </h1>
      
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-stretch">
        {/* Card 1 */}
        <div 
          onClick={() => navigate('/roadmap/javascript')}
          className="flex-1 bg-zinc-800 p-8 rounded-2xl shadow-lg border border-zinc-700 hover:border-zinc-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-center"
        >
          <h2 className="text-3xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">JavaScript</h2>
          <p className="text-zinc-400 text-lg">Learn from MDN docs</p>
        </div>

        {/* Card 2 */}
        <div className="flex-1 bg-zinc-800/50 p-8 rounded-2xl shadow-md border border-zinc-700/50 opacity-60 cursor-not-allowed flex flex-col justify-center">
          <h2 className="text-3xl font-semibold mb-3 text-zinc-300">FastAPI</h2>
          <p className="text-zinc-500 text-lg">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
