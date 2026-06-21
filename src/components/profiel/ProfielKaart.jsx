import StatCard from "../shared/StatCard";
import AvatarUpload from "./AvatarUpload";

// Toont de profielkaart met avatar, naam, email en statistieken
export default function ProfielKaart({ profiel, aantalPosts, onFileChange, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
      <div className="flex items-center gap-6">
        {/* Avatar met upload en verwijder functie */}
        <AvatarUpload
          avatarUrl={profiel.avatar_url}
          onFileChange={onFileChange}
          onDelete={onDelete}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profiel.username || "Gebruiker"}</h1>
          <p className="text-gray-500">{profiel.email}</p>
        </div>
      </div>

      {/* Statistieken rij */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <StatCard label="Parken Gevolgd" value={profiel.gevolgde_parken.length} color="purple" />
        <StatCard label="Posts" value={aantalPosts} color="pink" />
        <StatCard label="Reacties" value={0} color="blue" />
      </div>
    </div>
  );
}