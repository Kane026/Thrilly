import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import defaultAvatar from "../assets/default-avatar.png";

export default function Post({ user_id, content, date, onDelete, currentUserId, imageUrl }) {
  const [profile, setProfile] = useState(null);

  // Haal de username en avatar op van de poster
  useEffect(() => {
    if (!user_id) return;
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", user_id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user_id]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        {/* Profielfoto of standaard avatar */}
        <img
          src={profile?.avatar_url || defaultAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          {/* Username of fallback */}
          <p className="font-semibold text-gray-800 text-sm">
            {profile?.username || "Gebruiker"}
          </p>
          <p className="text-xs text-gray-400">{new Date(date).toLocaleDateString("nl-NL")}</p>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{content}</p>

      {imageUrl && (
        <img src={imageUrl} alt="post afbeelding" className="mt-3 rounded-lg w-full object-cover" />
      )}

      {currentUserId === user_id && (
        <button onClick={onDelete} className="mt-3 text-red-400 text-xs hover:text-red-600">
          Verwijderen
        </button>
      )}
    </div>
  );
}