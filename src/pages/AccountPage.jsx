import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Header from "../components/Header";
import ProfielKaart from "../components/ProfielKaart";
import InstellingenKaart from "../components/InstellingenKaart";
import ParkenKaart from "../components/ParkenKaart";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [profiel, setProfiel] = useState({
    username: "",
    email: "",
    avatar_url: "",
    gevolgde_parken: [],
  });
  const [avatarBestand, setAvatarBestand] = useState(null);
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");
  const [aantalPosts, setAantalPosts] = useState(0);

  useEffect(() => {
    laadGebruiker();
  }, []);

  // Haalt de ingelogde gebruiker, zijn profiel en postcount op
  async function laadGebruiker() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfiel({
        username: data.username || "",
        email: user.email,
        avatar_url: data.avatar_url || "",
        gevolgde_parken: data.gevolgde_parken || [],
      });
    }

    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact" })
      .eq("user_id", user.id);

    setAantalPosts(count || 0);
  }

  // Werkt één veld bij in het profiel object
  function wijzigVeld(veld, waarde) {
    setProfiel((prev) => ({ ...prev, [veld]: waarde }));
  }

  // Zet een park aan of uit in de gevolgde parken lijst
  function togglePark(park) {
    setProfiel((prev) => ({
      ...prev,
      gevolgde_parken: prev.gevolgde_parken.includes(park)
        ? prev.gevolgde_parken.filter((p) => p !== park)
        : [...prev.gevolgde_parken, park],
    }));
  }

  // Slaat alle profielwijzigingen op in Supabase
  async function slaOp() {
    setBezig(true);
    setMelding("");

    try {
      let nieuweAvatarUrl = profiel.avatar_url;

      // Upload nieuw avatarbestand als dat geselecteerd is
      if (avatarBestand) {
        const pad = `${user.id}.${avatarBestand.name.split(".").pop()}`;
        await supabase.storage.from("avatars").upload(pad, avatarBestand, { upsert: true });
        const { data } = supabase.storage.from("avatars").getPublicUrl(pad);
        nieuweAvatarUrl = data.publicUrl + "?t=" + Date.now();
      }

      // Stuur verificatiemail als email gewijzigd is
      if (profiel.email !== user.email) {
        await supabase.auth.updateUser({ email: profiel.email });
        setMelding("📧 Verificatiemail verstuurd! Check je inbox om je nieuwe emailadres te bevestigen.");
        setBezig(false);
        return;
      }

      // Sla profiel op in de database
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          username: profiel.username,
          avatar_url: nieuweAvatarUrl,
          gevolgde_parken: profiel.gevolgde_parken,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;
      setProfiel((prev) => ({ ...prev, avatar_url: nieuweAvatarUrl }));
      setAvatarBestand(null);
      setMelding("✅ Opgeslagen!");
    } catch (fout) {
      setMelding("❌ " + fout.message);
    }

    setBezig(false);
  }

  // Verwijdert de profielfoto uit de database
  async function verwijderAvatar() {
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setProfiel((prev) => ({ ...prev, avatar_url: "" }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-8">

        {/* Profielkaart met avatar en statistieken */}
        <ProfielKaart
          profiel={profiel}
          aantalPosts={aantalPosts}
          onFileChange={(e) => setAvatarBestand(e.target.files[0])}
          onDelete={verwijderAvatar}
        />

        {/* Instellingen voor username en email */}
        <InstellingenKaart
          profiel={profiel}
          onChange={wijzigVeld}
        />

        {/* Parken volgen sectie */}
        <ParkenKaart
          gevolgdeParken={profiel.gevolgde_parken}
          onToggle={togglePark}
        />

        {/* Opslaan knop */}
        <button
          onClick={slaOp}
          disabled={bezig}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {bezig ? "Opslaan..." : "Opslaan"}
        </button>

        {/* Succes, fout of verificatiemelding */}
        {melding && (
          <p className={`mt-4 text-center text-sm ${melding.startsWith("📧") ? "text-blue-500" : ""}`}>
            {melding}
          </p>
        )}
      </div>
    </div>
  );
}