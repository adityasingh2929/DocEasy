import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="flex flex-col items-center pointer-events-none"
      >
        {/* We use a custom styled version of the Logo here to perfectly control the layout and avoid the built-in subtext/links */}
        <div className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
          <span className="text-slate-900">Doc</span>
          <span className="text-blue-700">Ease</span>
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.0, ease: "easeInOut" }}
        className="text-slate-600 text-lg md:text-xl font-medium tracking-wide mt-2"
      >
        Documentation Made Easy
      </motion.p>
    </div>
  );
}
