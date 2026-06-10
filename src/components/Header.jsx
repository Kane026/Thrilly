import { supabase } from "../supabase";

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-xl font-bold text-white">Thrilly</h1>
      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}