// Toont een statistiek blokje met een label, waarde en kleur
export default function StatCard({ label, value, color }) {
  return (
    <div className={`bg-${color}-50 rounded-xl p-4 text-center`}>
      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}