// Toont de privacy instellingen voor posts en profielfoto
export default function PrivacyKaart({ profiel, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy</h2>

      {/* Wie kan mijn posts zien */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Wie kan mijn posts zien?</label>
        <select
          value={profiel.posts_zichtbaar}
          onChange={(e) => onChange("posts_zichtbaar", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
        >
          <option value="iedereen">Iedereen</option>
          <option value="volgers">Alleen volgers</option>
        </select>
      </div>

      {/* Wie kan mijn profielfoto zien */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wie kan mijn profielfoto zien?</label>
        <select
          value={profiel.foto_zichtbaar}
          onChange={(e) => onChange("foto_zichtbaar", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
        >
          <option value="iedereen">Iedereen</option>
          <option value="volgers">Alleen volgers</option>
        </select>
      </div>
    </div>
  );
}