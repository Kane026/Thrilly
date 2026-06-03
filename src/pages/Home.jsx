import { Routes, Route } from "react-router";
import Header from "../components/Header";
import { useState } from "react";
import {useSession} from "../hooks/useSession";
import {supabase} from "../supabase";
import { useEffect } from "react";
import Post from "../components/Post";

export default function Home() {

  const [content, setContent] = useState("");
  
  const [posts, setPosts] = useState([]);

  const {session, loading} = useSession();


  const submitHandler = async (event) => {
    event.preventDefault();

  const {error} = await supabase.from("posts").insert({
    user_id: session.sub, 
    content: content
  });

  if (!error) setContent("");

  fetchPosts();

};

  const fetchPosts = async () => {
    const {data, error} = await supabase.from("posts").select("*").order("created_at", {ascending: false});

    if (!error) setPosts(data);
  }

  useEffect(() => {
    fetchPosts();
  })

const handleDelete = async (id) => {
  const {error} = await supabase.from("posts").delete().eq("id", id);

  if (!error) fetchPosts();
};



  return(
    <div>
   <Header />
   <h1>Home page</h1>

   <form onSubmit={submitHandler}>
    <textarea
      rows="4"
      value={content}
      className="bg-white rounded"
      onChange={(e) => setContent(e.target.value)}
    />
    <button>Post!</button>
   </form>
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
   



  );


}