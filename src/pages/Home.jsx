import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../supabase";
import Post from "../components/Post";

export default function Home() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(null);
  const { session, loading } = useSession();

  const submitHandler = async (event) => {
    event.preventDefault();

    let imageUrl = null;

    if (image) {
      const fileName = `${session.sub}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, image);

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
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (!error) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
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
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Post
              key={post.id}
              user_id={post.user_id}
              content={post.content}
              date={post.created_at}
              imageUrl={post.image_url}
              currentUserId={session?.sub}
              onDelete={
                post.user_id === session?.sub ? () => handleDelete(post.id) : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}