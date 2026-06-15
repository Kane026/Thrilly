import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import ParkButton from "../components/ParkButton";
import AvatarUpload from "../components/AvatarUpload";

// Lijst van beschikbare parken
const PARKEN = ["Efteling", "Disneyland Paris", "Europa-Park", "Phantasialand", "Walibi Holland", "Toverland"];

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gevolgdeParken, setGevolgdeParken] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Haal de ingelogde gebruiker en zijn profiel op bij het laden
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setEmail(user.email);

      // Haal het profiel op uit de profiles tabel
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setUsername(data.username || "");
          setGevolgdeParken(data.gevolgde_parken || []);
          setAvatarUrl(data.avatar_url || "");
        }
      });
    });
  }, []);

  // Voeg een park toe of verwijder het uit de gevolgde parken lijst
  const togglePark = (park) =>
    setGevolgdeParken((prev) =>
      prev.includes(park) ? prev.filter((p) => p !== park) : [...prev, park]
    );

  // Sla alle profielwijzigingen op
  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      let newAvatarUrl = avatarUrl;

      // Upload nieuwe profielfoto als die geselecteerd is
      if (avatarFile) {
        const path = `${user.id}.${avatarFile.name.split(".").pop()}`;
        await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        // Cache-buster zodat de nieuwe foto direct zichtbaar is
        newAvatarUrl = data.publicUrl + "?t=" + Date.now();
      }

      // Update email als die gewijzigd is
      if (email !== user.email) await supabase.auth.updateUser({ email });

      // Sla username, avatar en parken op in de profiles tabel
      const { error } = await supabase.from("profiles").upsert(
        { user_id: user.id, username, avatar_url: newAvatarUrl, gevolgde_parken: gevolgdeParken },
        { onConflict: "user_id" }
      );

      if (error) throw error;
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setMessage("✅ Opgeslagen!");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
    setLoading(false);
  };

  // Verwijder de profielfoto en zet avatar_url op null in de database
  const handleDeleteAvatar = async () => {
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setAvatarUrl("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-8">

        {/* Profiel kaart met avatar en statistieken */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar upload component */}
            <AvatarUpload
              avatarUrl={avatarUrl}
              onFileChange={(e) => setAvatarFile(e.target.files[0])}
              onDelete={handleDeleteAvatar}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{username || "Gebruiker"}</h1>
              <p className="text-gray-500">{email}</p>
            </div>
          </div>

          {/* Statistieken rij */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <StatCard label="Parken Gevolgd" value={gevolgdeParken.length} color="purple" />
            <StatCard label="Posts" value={0} color="pink" />
            <StatCard label="Reacties" value={0} color="blue" />
          </div>
        </div>

        {/* Instellingen kaart voor username en email */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Instellingen</h2>
          {[
            { label: "Username", value: username, setter: setUsername, type: "text" },
            { label: "Email", value: email, setter: setEmail, type: "email" },
          ].map(({ label, value, setter, type }) => (
            <div key={label} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          ))}
        </div>

        {/* Parken volgen kaart */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Parken Volgen</h2>
          <div className="grid grid-cols-2 gap-3">
            {PARKEN.map((park) => (
              <ParkButton
                key={park}
                park={park}
                gevolgd={gevolgdeParken.includes(park)}
                onToggle={togglePark}
              />
            ))}
          </div>
        </div>

        {/* Opslaan knop */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Opslaan..." : "Opslaan"}
        </button>

        {/* Succes of foutmelding */}
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}