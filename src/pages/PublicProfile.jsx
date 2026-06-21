import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { supabase } from "../supabase";
import Header from "../components/Header";
import defaultAvatar from "../assets/default-avatar.png";

export default function PublicProfile() {
  const { id } = useParams();

  const [ikZelf, setIkZelf] = useState(null);
  const [profiel, setProfiel] = useState(null);
  const [volgIk, setVolgIk] = useState(false);
  const [aantalVolgers, setAantalVolgers] = useState(0);

  useEffect(() => {
    laadPagina();
  }, [id]);

  async function laadPagina() {
    // Haal de ingelogde gebruiker op
    const { data: { user } } = await supabase.auth.getUser();
    setIkZelf(user);

    // Haal het profiel op van deze pagina
    const { data } = await supabase.from("profiles").select("*").eq("user_id", id).single(); 
    setProfiel(data);

    // Kijk of ik deze persoon al volg
    const { data: volgData } = await supabase.from("volgers").select("id").eq("volger_id", user.id).eq("gevolgde_id", id).single();
    if (volgData) {
      setVolgIk(true);
    }

    // Tel het aantal volgers
    const { count } = await supabase.from("volgers").select("id", { count: "exact" }).eq("gevolgde_id", id); 
    setAantalVolgers(count || 0); 
  }

  async function toggleVolgen() {
    if (volgIk) { 
      // Ontvolgen
      await supabase.from("volgers").delete().eq("volger_id", ikZelf.id).eq("gevolgde_id", id);
      setVolgIk(false);
      setAantalVolgers(aantalVolgers - 1);
    } else {
      // Volgen
      await supabase.from("volgers").insert({ volger_id: ikZelf.id, gevolgde_id: id });
      setVolgIk(true);
      setAantalVolgers(aantalVolgers + 1);  
    }
  }

  if (!profiel) return <p>Profiel laden...</p>;

  // Kijk of dit mijn eigen profiel is
  const eigenProfiel = ikZelf?.id === id;

  // Toon standaard avatar als foto alleen voor volgers is en ik hem niet volg
  let fotoTonen = profiel.avatar_url || defaultAvatar;
  if (profiel.foto_zichtbaar === "volgers" && !volgIk && !eigenProfiel) {
    fotoTonen = defaultAvatar;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-6">
              {/* Profielfoto, standaard als privacy dat vereist */}
              <img src={fotoTonen} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profiel.username || "Gebruiker"}</h1>
                {profiel.bio && <p className="text-gray-500 text-sm">{profiel.bio}</p>}
                <p className="text-gray-400 text-sm mt-1">{aantalVolgers} volgers</p>
              </div>
            </div>

            {/* Volgen knop, alleen zichtbaar als het niet mijn eigen profiel is */}
            {!eigenProfiel && (
              <button
                onClick={toggleVolgen}
                className={`px-6 py-2 rounded-xl font-semibold text-sm ${volgIk ? "bg-gray-100 text-gray-600" : "bg-purple-600 text-white"}`}
              >
                {volgIk ? "Ontvolgen" : "Volgen"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}