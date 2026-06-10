export default function Post({ user_id, content, date, onDelete, currentUserId }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
          {user_id?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{user_id}</p>
          <p className="text-xs text-gray-400">{new Date(date).toLocaleDateString("nl-NL")}</p>
        </div>
      </div>
      <p className="text-gray-700 mb-3">{content}</p>
      {currentUserId === user_id && (
        <button
          onClick={onDelete}
          className="text-red-400 text-xs hover:text-red-600"
        >
          Verwijderen
        </button>
      )}
    </div>
  );
}