// Toont de instellingen kaart met username en email invoervelden
export default function InstellingenKaart({ profiel, onChange }) {
  const velden = [
    { label: "Username", veld: "username", type: "text" },
    { label: "Email", veld: "email", type: "email" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Instellingen</h2>

      {/* Loop over de invoervelden */}
      {velden.map(({ label, veld, type }) => (
        <div key={veld} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            value={profiel[veld]}
            onChange={(e) => onChange(veld, e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      ))}
    </div>
  );
}