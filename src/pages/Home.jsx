import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../supabase";
import Post from "../components/Post";

export default function Home() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const { session, loading } = useSession();

  const submitHandler = async (event) => {
    event.preventDefault();
    const { error } = await supabase.from("posts").insert({
      user_id: session.sub,
      content: content
    });
    if (!error) setContent("");
    fetchPosts();
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <Header />
      <form onSubmit={submitHandler} className="mb-8">
        <textarea
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-white rounded-lg p-3 text-gray-800 resize-none"
          placeholder="Wat wil je delen?"
        />
        <button className="mt-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold">
          Post!
        </button>
      </form>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            user_id={post.user_id}
            content={post.content}
            date={post.created_at}
            currentUserId={session?.sub}
            onDelete={
              post.user_id === session?.sub ? () => handleDelete(post.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}