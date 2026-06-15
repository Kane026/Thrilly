// Knop om een park te volgen of te ontvolgen
export default function ParkButton({ park, gevolgd, onToggle }) {
  return (
    <button
      onClick={() => onToggle(park)}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
        gevolgd
          ? "border-purple-400 bg-purple-50 text-purple-700"
          : "border-gray-200 text-gray-600 hover:border-purple-300"
      }`}
    >
      {park}
      {/* Vinkje tonen als het park gevolgd wordt */}
      {gevolgd && <span className="text-purple-500">✓</span>}
    </button>
  );
}