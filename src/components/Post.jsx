import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import defaultAvatar from "../assets/default-avatar.png";

export default function Post({ user_id, content, date, onDelete, currentUserId, imageUrl, initiallikes, onToggleLike, initialComments, onCommentSubmit, session }) {
  const [profile, setProfile] = useState(null);
  const [likes, setLikes] = useState(initiallikes || []);
  const [comments, setComments] = useState(initialComments || []);
  const [commentContent, setCommentContent] = useState("");
  const [volgIk, setVolgIk] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setLikes(initiallikes || []); }, [initiallikes]);
  useEffect(() => { setComments(initialComments || []); }, [initialComments]);

  // Haal profiel op van de poster inclusief privacy instelling
  useEffect(() => {
    if (!user_id) return;
    supabase.from("profiles").select("username, avatar_url, foto_zichtbaar").eq("user_id", user_id).single().then(({ data }) => setProfile(data));

    // Kijk of ik deze persoon volg
    if (session?.sub && user_id !== session?.sub) {
      supabase.from("volgers").select("id").eq("volger_id", session.sub).eq("gevolgde_id", user_id).single().then(({ data }) => {
        if (data) setVolgIk(true);
      });
    }
  }, [user_id, session]);

  async function submitComment() {
    if (!commentContent) return;
    await onCommentSubmit(commentContent);
    setCommentContent("");
  }

  const heeftGeliked = likes.some((like) => like.user_id === session?.sub);

  // Toon standaard avatar als foto alleen voor volgers is en ik hem niet volg
  let fotoTonen = profile?.avatar_url || defaultAvatar;
  const eigenPost = user_id === session?.sub;
  if (profile?.foto_zichtbaar === "volgers" && !volgIk && !eigenPost) {
    fotoTonen = defaultAvatar;
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">

      {/* Gebruiker info */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={fotoTonen}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
          onClick={() => navigate(`/profiel/${user_id}`)}
        />
        <div>
          <p
            className="font-semibold text-gray-800 text-sm cursor-pointer hover:text-purple-600"
            onClick={() => navigate(`/profiel/${user_id}`)}
          >
            {profile?.username || "Gebruiker"}
          </p>
          <p className="text-xs text-gray-400">{new Date(date).toLocaleDateString("nl-NL")}</p>
        </div>
      </div>

      {/* Post inhoud */}
      <p className="text-gray-700 mb-3">{content}</p>

      {/* Foto als die er is */}
      {imageUrl && (
        <img src={imageUrl} alt="post afbeelding" className="mt-3 rounded-lg w-full object-cover" />
      )}

      {/* Like en verwijder knoppen */}
      <div className="flex items-center gap-4 mt-3">
        <button onClick={onToggleLike} className="px-4 py-1 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700">
          {heeftGeliked ? "Unlike" : "Like"} · {likes.length}
        </button>
        {currentUserId === user_id && (
          <button onClick={onDelete} className="text-red-400 text-xs hover:text-red-600">
            Verwijderen
          </button>
        )}
      </div>

      {/* Reacties */}
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
          <button onClick={submitComment} className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
            Stuur
          </button>
        </div>
      </div>
    </div>
  );
}