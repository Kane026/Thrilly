import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { supabase } from "../supabase";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (data) setProfile(data);
    }

    fetchProfile();
  }, [id]);

  if (!profile) return <p>Profiel laden...</p>;

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-white flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{profile.username}</h1>

      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
      )}

      {profile.bio && <p className="text-gray-300">{profile.bio}</p>}
    </div>
  );
}