import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import { supabase } from "./supabase";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";
import AccountPage from "./pages/AccountPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
    </Routes>
  );
}