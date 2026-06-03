export default function Post({user_id, content, date, onDelete, currentUserId}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-gray-800 mb-3">{content}</p>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>{user_id}</span>
        <span>{new Date(date).toLocaleDateString("nl-NL")}</span>
      </div>
      {currentUserId === user_id && (
        <button
          onClick={onDelete}
          className="mt-3 text-red-500 text-sm hover:text-red-700"
        >
          Verwijderen
        </button>
      )}
    </div>
  );
}