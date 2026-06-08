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

  const [image, setImage] = useState(null);


  const submitHandler = async (event) => {
    event.preventDefault();


    // variable om de URL van de afbeelding op te slaan (indien aanwezig)
    let imageUrl = null;

    // 1. Als er een afbeelding is, upload die eerst naar Storage
    if (image) {
        const fileName = `${session.sub}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, image);

    // als er een fout is bij het uploaden, log die dan en stop de functie
      if (uploadError) {
        console.error(uploadError);
        return;
        }

      const { data } = supabase.storage.from("posts").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    // 3. Sla de post op in de database
    const { error } = await supabase.from("posts").insert({
    user_id: session.sub,
    content: content,
    image_url: imageUrl, // null als er geen afbeelding was
    });

    if (!error) {
    setContent("");
    setImage(null);
    fetchPosts();
    }
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
    <input type="file"
     accept="image/*"
     onChange={(e) => setImage(e.target.files[0])}
    />
    <button>Post!</button>
   </form>
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
  );
}