import ParkButton from "./ParkButton";

// Lijst van beschikbare parken
const PARKEN = ["Efteling", "Disneyland Paris", "Europa-Park", "Phantasialand", "Walibi Holland", "Toverland"];

// Toont de parken volgen kaart met toggle knoppen
export default function ParkenKaart({ gevolgdeParken, onToggle }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Parken Volgen</h2>
      <div className="grid grid-cols-2 gap-3">
        {PARKEN.map((park) => (
          <ParkButton
            key={park}
            park={park}
            gevolgd={gevolgdeParken.includes(park)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}