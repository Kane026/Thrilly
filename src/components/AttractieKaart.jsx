// Toont een attractie met een vinkje en datum wanneer je erin bent geweest
export default function AttractieKaart({ attractie, is_gedaan, datum, onClick }) {
  let kaartKleur = "border-gray-100 hover:border-purple-200";
  let vinkjeKleur = "border-gray-300";
  let tekstKleur = "text-gray-700";

  if (is_gedaan) {
    kaartKleur = "border-purple-300 bg-purple-50";
    vinkjeKleur = "border-purple-500 bg-purple-500";
    tekstKleur = "text-purple-700";
  }

  return (
    <button
      onClick={() => onClick(attractie.id)}
      className={`w-full flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border text-left mb-3 transition-all ${kaartKleur}`}
    >
      {/* Vinkje cirkel */}
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${vinkjeKleur}`}>
        {is_gedaan && <span className="text-white text-xs">✓</span>}
      </div>

      <div>
        <p className={`font-medium ${tekstKleur}`}>{attractie.naam}</p>
        {/* Datum tonen als de attractie gedaan is */}
        {is_gedaan && datum && (
          <p className="text-xs text-purple-400 mt-0.5">
            Gedaan op {new Date(datum).toLocaleDateString("nl-NL")}
          </p>
        )}
      </div>
    </button>
  );
}