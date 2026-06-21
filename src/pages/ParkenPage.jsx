import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Header from "../components/layout/Header";
import ParkKaart from "../components/parken/ParkKaart";
import AttractieKaart from "../components/parken/AttractieKaart";

export default function ParkenPage() {
  const [user, setUser] = useState(null);
  const [gevolgdeParken, setGevolgdeParken] = useState([]);
  const [huidigPark, setHuidigPark] = useState(null);
  const [attracties, setAttracties] = useState([]);
  const [gedaan, setGedaan] = useState({});

  useEffect(() => {
    laadGebruiker();
  }, []);

  // Haal de gebruiker en zijn gevolgde parken op 
  async function laadGebruiker() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data } = await supabase
      .from("profiles")
      .select("gevolgde_parken")
      .eq("user_id", user.id)
      .single();

    if (data && data.gevolgde_parken) {
      setGevolgdeParken(data.gevolgde_parken);
    } else {
      setGevolgdeParken([]);
    }
  }

  // Haal de attracties en gedane achtbanen op van het gekozen park
  async function openPark(park) {
    setHuidigPark(park);

    const { data: attractieData } = await supabase
      .from("attracties")
      .select("*")
      .eq("park", park);

    if (attractieData) {
      setAttracties(attractieData);
    } else {
      setAttracties([]);
    }

    // Haal gedaan rijen op inclusief de datum
    const { data: gedaanData } = await supabase
      .from("gedaan")
      .select("attractie_id, datum")
      .eq("user_id", user.id);

    // Sla gedaan op als object: { attractie_id: datum }
    const gedaanObject = {};
    if (gedaanData) {
      for (let i = 0; i < gedaanData.length; i++) {
        gedaanObject[gedaanData[i].attractie_id] = gedaanData[i].datum;
      }
    }
    setGedaan(gedaanObject);
  }

  // Vink een attractie aan of uit
  async function toggleAttractie(attractieId) { 
    if (gedaan[attractieId]) { 
      // Al gedaan, dus verwijderen
      await supabase 
        .from("gedaan")
        .delete() 
        .eq("user_id", user.id)
        .eq("attractie_id", attractieId);

      const nieuwGedaan = { ...gedaan }; 
      delete nieuwGedaan[attractieId];
      setGedaan(nieuwGedaan);
    } else {
      // Nog niet gedaan, dus toevoegen en datum ophalen
      const { data } = await supabase
        .from("gedaan")
        .insert({ user_id: user.id, attractie_id: attractieId })
        .select("datum")
        .single();

      const nieuwGedaan = { ...gedaan };
      nieuwGedaan[attractieId] = data.datum;
      setGedaan(nieuwGedaan);
    }
  }

  // Tel hoeveel attracties al gedaan zijn
  let aantalGedaan = 0;
  for (let i = 0; i < attracties.length; i++) { 
    if (gedaan[attracties[i].id]) {
      aantalGedaan++;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-8">

        {/* Parkenoverzicht */}
        {!huidigPark && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mijn Parken</h1>

            {gevolgdeParken.length === 0 && (
              <p className="text-gray-500">Je volgt nog geen parken. Ga naar je profiel om parken toe te voegen!</p>
            )}

            {gevolgdeParken.map((park) => (
              <ParkKaart key={park} park={park} onClick={openPark} />
            ))}
          </div>
        )}

        {/* Attractielijst van het gekozen park */}
        {huidigPark && (
          <div>
            <button onClick={() => setHuidigPark(null)} className="text-purple-600 text-sm mb-6 hover:underline">
              ← Terug naar parken
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{huidigPark}</h1>
            <p className="text-gray-500 text-sm mb-6">{aantalGedaan} / {attracties.length} gedaan</p>

            {attracties.map((attractie) => (
              <AttractieKaart
                key={attractie.id}
                attractie={attractie}
                is_gedaan={!!gedaan[attractie.id]}
                datum={gedaan[attractie.id]}
                onClick={toggleAttractie}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}