import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Header from "../components/Header";
import ProfielKaart from "../components/ProfielKaart";
import InstellingenKaart from "../components/InstellingenKaart";
import ParkenKaart from "../components/ParkenKaart";

export default function AccountPage() {
  // De ingelogde gebruiker vanuit Supabase
  const [user, setUser] = useState(null);

  // Alle profielgegevens in één object bewaren
  const [profiel, setProfiel] = useState({
    username: "",        // De gebruikersnaam
    email: "",           // Het emailadres
    avatar_url: "",      // De link naar de profielfoto
    gevolgde_parken: [], // De parken die de gebruiker volgt
  });

  // Het fotobestand dat de gebruiker heeft geselecteerd
  const [avatarBestand, setAvatarBestand] = useState(null);

  // Bezig = true als we aan het opslaan zijn (voor de laadknop)
  const [bezig, setBezig] = useState(false);

  // De melding die we tonen na het opslaan (succes of fout)
  const [melding, setMelding] = useState("");

  // Het aantal posts van de gebruiker voor de statistieken
  const [aantalPosts, setAantalPosts] = useState(0);

  // Roep laadGebruiker aan zodra de pagina laadt
  useEffect(() => {
    laadGebruiker();
  }, []);

  // Haalt de ingelogde gebruiker, zijn profiel en aantal posts op uit Supabase
  async function laadGebruiker() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    // Haal het profiel op uit de profiles tabel
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Tel het aantal posts van deze gebruiker
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact" })
      .eq("user_id", user.id);

    // Zet de profielgegevens in de state
    setProfiel({
      username: data?.username || "",
      email: user.email,
      avatar_url: data?.avatar_url || "",
      gevolgde_parken: data?.gevolgde_parken || [],
    });

    setAantalPosts(count || 0);
  }

  // Wordt aangeroepen als de gebruiker een veld aanpast zoals username of email
  function wijzigVeld(veld, waarde) {
    setProfiel({ ...profiel, [veld]: waarde });
  }

  // Voegt een park toe aan de gevolgde lijst of verwijdert het
  function togglePark(park) {
    const al_gevolgd = profiel.gevolgde_parken.includes(park);

    const nieuweLijst = al_gevolgd
      ? profiel.gevolgde_parken.filter((p) => p !== park)
      : [...profiel.gevolgde_parken, park];

    setProfiel({ ...profiel, gevolgde_parken: nieuweLijst });
  }

  // Verwijdert de profielfoto uit de database en de lokale state
  async function verwijderAvatar() {
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setProfiel({ ...profiel, avatar_url: "" });
  }

  // Slaat alle profielwijzigingen op in Supabase
  async function slaOp() {
    setBezig(true);
    setMelding("");

    let nieuweUrl = profiel.avatar_url;

    // Als er een nieuw fotobestand is geselecteerd, upload het naar Supabase storage
    if (avatarBestand) {
      const pad = `${user.id}.${avatarBestand.name.split(".").pop()}`;

      // upsert: true zorgt dat een bestaand bestand wordt overschreven
      await supabase.storage.from("avatars").upload(pad, avatarBestand, { upsert: true });

      const { data } = supabase.storage.from("avatars").getPublicUrl(pad);

      // Voeg een timestamp toe zodat de browser de nieuwe foto laadt en niet de oude uit de cache
      nieuweUrl = data.publicUrl + "?t=" + Date.now();
    }

    // Als het emailadres is veranderd, stuur een verificatiemail
    if (profiel.email !== user.email) {
      await supabase.auth.updateUser({ email: profiel.email });
      setMelding("📧 Check je inbox om je nieuwe emailadres te bevestigen.");
      setBezig(false);
      return;
    }

    // Sla het profiel op in de database
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        username: profiel.username,
        avatar_url: nieuweUrl,
        gevolgde_parken: profiel.gevolgde_parken,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      // Toon de foutmelding als er iets mis gaat
      setMelding("❌ " + error.message);
    } else {
      // Update de lokale state met de nieuwe avatar URL
      setProfiel({ ...profiel, avatar_url: nieuweUrl });
      setAvatarBestand(null);
      setMelding("✅ Opgeslagen!");
    }

    setBezig(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-8">

        {/* Profielkaart met avatar, naam en statistieken */}
        <ProfielKaart
          profiel={profiel}
          aantalPosts={aantalPosts}
          onFileChange={(e) => setAvatarBestand(e.target.files[0])}
          onDelete={verwijderAvatar}
        />

        {/* Instellingen voor username en email */}
        <InstellingenKaart profiel={profiel} onChange={wijzigVeld} />

        {/* Parken volgen sectie */}
        <ParkenKaart gevolgdeParken={profiel.gevolgde_parken} onToggle={togglePark} />

        {/* Opslaan knop, uitgeschakeld tijdens het opslaan */}
        <button
          onClick={slaOp}
          disabled={bezig}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {bezig ? "Opslaan..." : "Opslaan"}
        </button>

        {/* Toon de melding na het opslaan */}
        {melding && <p className="mt-4 text-center text-sm">{melding}</p>}
      </div>
    </div>
  );
}