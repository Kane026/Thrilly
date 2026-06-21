import Header from "../components/layout/Header";
import { useState, useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../supabase";
import Post from "../components/feed/Post";
import { useSearchParams } from "react-router-dom";

export default function Home() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(null);
  const { session, loading } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") || "";

  const filteredPosts = posts.filter((post) =>
  post.content?.toLowerCase().includes(query.toLowerCase())
);

  // Wacht tot session beschikbaar is voordat we posts ophalen
  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session]);

  async function fetchPosts() {
    // Haal alle posts op
    const { data: allePosts } = await supabase
      .from("posts")
      .select("*, likes(*), comments(*)")
      .order("created_at", { ascending: false });

    // Haal op wie ik volg
    const { data: volgData } = await supabase
      .from("volgers")
      .select("gevolgde_id")
      .eq("volger_id", session.sub);

    // Maak een lijst van gevolgde user ids
    const volgIds = [];
    for (let i = 0; i < volgData.length; i++) {
      volgIds.push(volgData[i].gevolgde_id);
    }

    // Haal privacy instellingen op
    const { data: profielen } = await supabase
      .from("profiles")
      .select("user_id, posts_zichtbaar");

    // Filter posts op basis van privacy instelling
    const zichtbarePosts = [];
    for (let i = 0; i < allePosts.length; i++) {
      const post = allePosts[i];

      // Eigen post altijd tonen
      if (post.user_id === session.sub) {
        zichtbarePosts.push(post);
        continue;
      }

      // Zoek het profiel van de poster
      let profiel = null;
      for (let j = 0; j < profielen.length; j++) {
        if (profielen[j].user_id === post.user_id) {
          profiel = profielen[j];
          break;
        }
      }

      // Als posts alleen voor volgers zijn, check of ik hem volg
      if (profiel && profiel.posts_zichtbaar === "volgers") {
        if (volgIds.includes(post.user_id)) {
          zichtbarePosts.push(post);
        }
      } else {
        zichtbarePosts.push(post);
      }
    }

    setPosts(zichtbarePosts);
  }

  async function submitHandler(event) {
    event.preventDefault();

    let imageUrl = null;

    if (image) {
      const fileName = `${session.sub}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from("posts").upload(fileName, image);

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      const { data } = supabase.storage.from("posts").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: session.sub,
      content: content,
      image_url: imageUrl,
    });

    if (!error) {
      setContent("");
      setImage(null);
      fetchPosts();
    }
  }

  async function handleDelete(id) {
    // Zoek de post om de afbeelding URL te vinden
    const post = posts.find((p) => p.id === id);

    // Als er een afbeelding is, verwijder die eerst uit storage
    if (post.image_url) {
      const bestandsnaam = post.image_url.split("/").pop().split("?")[0];
      await supabase.storage.from("posts").remove([bestandsnaam]);
    }

    // Verwijder daarna de post zelf
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) fetchPosts();
  }

  async function toggleLike(post) {
    const bestaand = post.likes.find((like) => like.user_id === session.sub);
    if (bestaand) {
      await supabase.from("likes").delete().eq("id", bestaand.id);
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: session.sub });
    }
    fetchPosts();
  }

  async function handleCommentSubmit(postId, commentContent) {
    await supabase.from("comments").insert({
      post_id: postId,
      user_id: session.sub,
      content: commentContent,
    });
    fetchPosts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <input
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setSearchParams({ search: e.target.value })}
        />

        {/* Post aanmaken */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <form onSubmit={submitHandler}>
            <textarea
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-50 rounded-lg p-3 text-gray-700 resize-none outline-none text-sm"
              placeholder="Deel je pretpark beleving..."
            />
            <div className="flex justify-between items-center mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-sm text-gray-500"
              />
              <button className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 font-semibold text-sm">
                Posten
              </button>
            </div>
          </form>
        </div>

        {/* Lijst van posts */}
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <Post
              key={post.id}
              user_id={post.user_id}
              content={post.content}
              date={post.created_at}
              imageUrl={post.image_url}
              currentUserId={session?.sub}
              onDelete={post.user_id === session?.sub ? () => handleDelete(post.id) : undefined}
              initiallikes={post.likes}
              onToggleLike={() => toggleLike(post)}
              initialComments={post.comments}
              onCommentSubmit={(commentContent) => handleCommentSubmit(post.id, commentContent)}
              session={session}
            />
          ))}
        </div>
      </div>
    </div>
  );
}