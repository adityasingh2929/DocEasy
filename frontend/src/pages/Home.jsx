import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1020] text-white flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Navbar space / Logo could go here if needed, but App uses global routing without shared nav */}
      <div className="h-20 flex items-center px-8 w-full max-w-7xl mx-auto pt-6">
        <div className="text-2xl font-bold tracking-tight">
          <span className="text-white">Doc</span>
          <span className="text-blue-500">Ease</span>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center mt-16 md:mt-24 mb-32 px-4"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Documentation <br className="md:hidden" /> Made <span className="text-blue-500">Easy</span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl font-medium leading-relaxed">
          Learn JavaScript the way companies expect you to. Strictly grounded in official MDN documentation.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/roadmap/javascript')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-colors text-lg flex items-center gap-2 group"
        >
          Start Learning
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </motion.button>
      </motion.div>

      {/* Features Comparison Section */}
      <div className="max-w-6xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-32 relative">
        
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Generic LLMs (Left) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 md:p-10 flex flex-col gap-5 shadow-xl relative z-10"
        >
          <h2 className="text-2xl font-bold text-zinc-400 mb-4">Generic Chatbots</h2>
          
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-zinc-300 flex items-start gap-4 transition-colors hover:bg-red-500/10">
            <span className="text-2xl mt-0.5 opacity-90">❌</span>
            <p className="leading-relaxed">Hallucinates external APIs and logic that don't exist in the official documentation.</p>
          </div>
          
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-zinc-300 flex items-start gap-4 transition-colors hover:bg-red-500/10">
            <span className="text-2xl mt-0.5 opacity-90">❌</span>
            <p className="leading-relaxed">Hands you the raw answers without actually teaching you the underlying concept.</p>
          </div>
          
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-zinc-300 flex items-start gap-4 transition-colors hover:bg-red-500/10">
            <span className="text-2xl mt-0.5 opacity-90">❌</span>
            <p className="leading-relaxed">Completely loses context of your current progress and learning journey.</p>
          </div>
        </motion.div>

        {/* Our System (Right) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-blue-900/20 backdrop-blur-md border border-blue-500/30 rounded-3xl p-8 md:p-10 flex flex-col gap-5 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden z-10"
        >
          {/* Subtle Glass glare effect */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-400/5 to-transparent pointer-events-none rounded-t-3xl"></div>
          
          <h2 className="text-2xl font-bold text-blue-400 mb-4 z-10 flex items-center gap-3">
            Our System
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs uppercase tracking-wider border border-blue-500/30">RAG Powered</span>
          </h2>
          
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-zinc-200 flex items-start gap-4 z-10 transition-colors hover:bg-green-500/10">
            <span className="text-2xl mt-0.5 opacity-90">✅</span>
            <p className="leading-relaxed">100% strictly grounded in the official MDN Web Documentation database.</p>
          </div>
          
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-zinc-200 flex items-start gap-4 z-10 transition-colors hover:bg-green-500/10">
            <span className="text-2xl mt-0.5 opacity-90">✅</span>
            <p className="leading-relaxed">Acts as a tutor, forcing you to think and practice through curated challenges.</p>
          </div>
          
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-zinc-200 flex items-start gap-4 z-10 transition-colors hover:bg-green-500/10">
            <span className="text-2xl mt-0.5 opacity-90">✅</span>
            <p className="leading-relaxed">Maintains absolute context of the specific quiz or challenge you are currently viewing.</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center pb-32 px-4 flex flex-col items-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Ready to master JavaScript?</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/roadmap/javascript')}
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-4 px-10 rounded-2xl shadow-xl transition-all duration-300 text-lg flex items-center gap-2 group"
        >
          Start Your Roadmap
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </motion.button>
      </motion.div>
      
    </div>
  );
}
