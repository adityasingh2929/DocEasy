import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Roadmap from "./pages/Roadmap";
import Lesson from "./pages/Lesson";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmap/javascript" element={<Roadmap />} />
        <Route path="/lesson/:topic" element={<Lesson />} />
      </Routes>
    </BrowserRouter>
  );
}