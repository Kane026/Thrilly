import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/layout/PrivateRoute";
import AccountPage from "./pages/AccountPage";
import ParkenPage from "./pages/ParkenPage";
import PublicProfile from "./pages/PublicProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
      <Route path="/parken" element={<PrivateRoute><ParkenPage /></PrivateRoute>} />
      <Route path="/profiel/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
    </Routes>
  );
}