import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Header from "../components/Header";
import ProfielKaart from "../components/ProfielKaart";
import InstellingenKaart from "../components/InstellingenKaart";
import ParkenKaart from "../components/ParkenKaart";
import PrivacyKaart from "../components/PrivacyKaart";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [profiel, setProfiel] = useState({
    username: "",
    email: "",
    avatar_url: "",
    gevolgde_parken: [],
    posts_zichtbaar: "iedereen",
    foto_zichtbaar: "iedereen",
  });
  const [avatarBestand, setAvatarBestand] = useState(null);
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");
  const [aantalPosts, setAantalPosts] = useState(0);

  useEffect(() => {
    laadGebruiker();
  }, []);

  async function laadGebruiker() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    const { count } = await supabase.from("posts").select("id", { count: "exact" }).eq("user_id", user.id);

    setProfiel({
      username: data?.username || "",
      email: user.email,
      avatar_url: data?.avatar_url || "",
      gevolgde_parken: data?.gevolgde_parken || [],
      posts_zichtbaar: data?.posts_zichtbaar || "iedereen",
      foto_zichtbaar: data?.foto_zichtbaar || "iedereen",
    });

    setAantalPosts(count || 0);
  }

  function wijzigVeld(veld, waarde) {
    setProfiel({ ...profiel, [veld]: waarde });
  }

  function togglePark(park) {
    const al_gevolgd = profiel.gevolgde_parken.includes(park);
    const nieuweLijst = al_gevolgd
      ? profiel.gevolgde_parken.filter((p) => p !== park)
      : [...profiel.gevolgde_parken, park];
    setProfiel({ ...profiel, gevolgde_parken: nieuweLijst });
  }

  async function verwijderAvatar() {
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setProfiel({ ...profiel, avatar_url: "" });
  }

  async function slaOp() {
    setBezig(true);
    setMelding("");

    let nieuweUrl = profiel.avatar_url;

    if (avatarBestand) {
      const pad = `${user.id}.${avatarBestand.name.split(".").pop()}`;
      await supabase.storage.from("avatars").upload(pad, avatarBestand, { upsert: true });
      const { data } = supabase.storage.from("avatars").getPublicUrl(pad);
      nieuweUrl = data.publicUrl + "?t=" + Date.now();
    }

    if (profiel.email !== user.email) {
      await supabase.auth.updateUser({ email: profiel.email });
      setMelding("📧 Check je inbox om je nieuwe emailadres te bevestigen.");
      setBezig(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        username: profiel.username,
        avatar_url: nieuweUrl,
        gevolgde_parken: profiel.gevolgde_parken,
        posts_zichtbaar: profiel.posts_zichtbaar,
        foto_zichtbaar: profiel.foto_zichtbaar,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setMelding("❌ " + error.message);
    } else {
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
        <ProfielKaart profiel={profiel} aantalPosts={aantalPosts} onFileChange={(e) => setAvatarBestand(e.target.files[0])} onDelete={verwijderAvatar} />
        <InstellingenKaart profiel={profiel} onChange={wijzigVeld} />
        <ParkenKaart gevolgdeParken={profiel.gevolgde_parken} onToggle={togglePark} />
        <PrivacyKaart profiel={profiel} onChange={wijzigVeld} />

        <button onClick={slaOp} disabled={bezig} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {bezig ? "Opslaan..." : "Opslaan"}
        </button>

        {melding && <p className="mt-4 text-center text-sm">{melding}</p>}
      </div>
    </div>
  );
}