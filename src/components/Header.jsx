import { supabase } from "../supabase";
import { useSession } from "../hooks/useSession";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/thrillylogo.jpg";
import defaultAvatar from "../assets/default-avatar.png";

export default function Header() {
  const { session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!session?.sub) return;
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", session.sub)
        .single();
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    };
    fetchAvatar();
  }, [session]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Thrilly" className="h-8" />
      </div>
      <nav className="flex items-center gap-8 text-gray-600 font-medium">
        <a href="/" className="flex items-center gap-1 hover:text-purple-600">🏠 Feed</a>
        <a href="#" className="flex items-center gap-1 hover:text-purple-600">🔍 Zoeken</a>
        <button onClick={() => navigate("/account")} className="flex items-center gap-1 hover:text-purple-600">👤 Profiel</button>
      </nav>
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl || defaultAvatar}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover cursor-pointer"
          onClick={() => navigate("/account")}
        />
        <span className="text-gray-700 text-sm">{session?.email}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100"
        >
          ↪ Logout
        </button>
      </div>
    </header>
  );
}