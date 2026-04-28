import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Roadmap from "./pages/Roadmap";
import Lesson from "./pages/Lesson";

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full min-h-screen bg-[#F8FAFC]"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/roadmap/javascript" element={<PageWrapper><Roadmap /></PageWrapper>} />
        <Route path="/lesson/:topic" element={<PageWrapper><Lesson /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}