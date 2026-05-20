import { Routes, Route } from "react-router-dom";
import SignupPage from "./SignupPage";
import Home from "./Home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignupPage />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}