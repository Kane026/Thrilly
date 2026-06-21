import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import defaultAvatar from "../assets/default-avatar.png";

export default function Post({ user_id, content, date, onDelete, currentUserId, imageUrl, initiallikes, onToggleLike, initialComments, onCommentSubmit,  session }) {
  const [profile, setProfile] = useState(null);
  const [likes, setLikes] = useState(initiallikes || []);
  const [comments, setComments] = useState(initialComments || []);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    setLikes(initiallikes || []);
  }, [initiallikes]);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  // Haal de username en avatar op van de poster
  useEffect(() => {
    if (!user_id) return;
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", user_id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user_id]);

  const submitComment = async () => {
    if (!commentContent) return;
    await onCommentSubmit(commentContent);
    setCommentContent("");
  };


  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        {/* Profielfoto of standaard avatar */}
        <img
          src={profile?.avatar_url || defaultAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          {/* Username of fallback */}
          <p className="font-semibold text-gray-800 text-sm">
            {profile?.username || "Gebruiker"}
          </p>
          <p className="text-xs text-gray-400">{new Date(date).toLocaleDateString("nl-NL")}</p>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{content}</p>

      {imageUrl && (
        <img src={imageUrl} alt="post afbeelding" className="mt-3 rounded-lg w-full object-cover" />
      )}

      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={onToggleLike}
          className="px-4 py-1 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
        >
          {likes.some((like) => like.user_id === session?.sub) ? "Unlike" : "Like"} · {likes.length}
        </button>

      {currentUserId === user_id && (
        <button onClick={onDelete} className="mt-3 text-red-400 text-xs hover:text-red-600">
          Verwijderen
        </button>
      )}

    </div>
      <div className="mt-4">
  <h4 className="font-semibold text-gray-800 mb-2">Reacties</h4>

  {comments.map((comment) => (
    <div key={comment.id} className="text-sm text-gray-700 mb-1">
      <span className="font-semibold">{comment.profiles?.username || "Gebruiker"}</span>: {comment.content}
    </div>
  ))}

  <div className="flex gap-2 mt-2">
    <input
      type="text"
      value={commentContent}
      onChange={(e) => setCommentContent(e.target.value)}
      placeholder="Schrijf een reactie..."
      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none"
    />
    <button
      onClick={submitComment}
      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
    >
      Stuur
    </button>
  </div>
</div>
    </div>
  );
}