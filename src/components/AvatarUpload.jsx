import defaultAvatar from "../assets/default-avatar.png";

// Toont de profielfoto met een upload knop en optionele verwijder knop
export default function AvatarUpload({ avatarUrl, onFileChange, onDelete }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Profielfoto of standaard avatar als er geen foto is */}
        <img
          src={avatarUrl || defaultAvatar}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        {/* Upload knop rechtonder de foto */}
        <label className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer text-sm">
          +
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </label>
      </div>
      {/* Verwijder knop alleen tonen als er een foto is */}
      {avatarUrl && (
        <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
          🗑 Verwijderen
        </button>
      )}
    </div>
  );
}