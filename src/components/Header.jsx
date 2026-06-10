import { supabase } from "../supabase";
import { useSession } from "../hooks/useSession";
import logo from "../assets/thrillylogo.jpg";

export default function Header() {
  const { session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Thrilly" className="h-8" />
      </div>
      <nav className="flex items-center gap-8 text-gray-600 font-medium">
        <a href="/" className="flex items-center gap-1 hover:text-purple-600">🏠 Feed</a>
        <a href="#" className="flex items-center gap-1 hover:text-purple-600">🔍 Zoeken</a>
        <a href="#" className="flex items-center gap-1 hover:text-purple-600">👤 Profiel</a>
      </nav>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
          {session?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
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