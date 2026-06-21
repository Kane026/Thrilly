import { useState, useEffect } from "react";
import { supabase } from '../supabase';
import { useSession } from "../hooks/useSession";

export default function Profile() {
  const { session, loading: sessionLoading } = useSession();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [image, setImage] = useState(null);

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.sub)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username ?? '');
      setBio(data.bio ?? '');
      setIsPrivate(data.is_private ?? false);
    }
  }

  useEffect(() => {
    if (!session) return;
    fetchProfile();
  }, [session]);

  async function updateProfile() {
    const { error } = await supabase
      .from('profiles')
      .update({ username, bio, is_private: isPrivate })
      .eq('user_id', session.sub);

    if (!error) fetchProfile();
  }

  async function uploadAvatar() {
    if (!image) return;

    const fileName = `${session.sub}-${Date.now()}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, image);

    if (error) {
      console.error("Upload failed:", error.message);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('user_id', session.sub);

    fetchProfile();
  }

  if (sessionLoading) return <p>Laden...</p>;
  if (!session) return <p>Niet ingelogd.</p>;
  if (!profile) return <p>Profiel laden...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profiel</h1>

      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-6" />
      )}

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Gebruikersnaam</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white rounded-lg p-3 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            className="w-full bg-white rounded-lg p-3 text-gray-800 resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4"
          />
          Profiel privé maken
        </label>

        <button
          onClick={updateProfile}
          className="mt-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold"
        >
          Opslaan
        </button>
      </div>

      <hr className="mb-6" />

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">Profielfoto uploaden</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          onClick={uploadAvatar}
          className="mt-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold"
        >
          Foto uploaden
        </button>
      </div>
    </div>
  );
}