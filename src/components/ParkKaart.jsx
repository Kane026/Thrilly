// Toont een park als klikbare kaart
export default function ParkKaart({ park, onClick }) {
  return (
    <button
      onClick={() => onClick(park)}
      className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-left hover:border-purple-300 transition-all mb-3"
    >
      <p className="font-semibold text-gray-800">{park}</p>
      <p className="text-sm text-gray-400 mt-1">Klik om achtbanen te bekijken</p>
    </button>
  );
}