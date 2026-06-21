// Toont de fabrikant en beschrijving van een attractie
export default function AttractieInfo({ fabrikant, beschrijving }) {
  return (
    <div className="mt-0.5">

      {/* Naam van de fabrikant */}
      {fabrikant && (
        <p className="text-xs font-bold text-gray-500">{fabrikant}</p>
      )}

      {/* Korte beschrijving van de attractie */}
      {beschrijving && (
        <p className="text-xs text-gray-400">{beschrijving}</p>
      )}

    </div>
  );
}