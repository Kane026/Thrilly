import { Routes, Route } from "react-router";
import Header from "../components/Header";
import { useState } from "react";
import {useSession} from "../hooks/useSession";
import {supabase} from "../supabase";

export default function Home() {

  const [content, setContent] = useState("");

  const session = useSession();

  const submitHandler = async (event) => {
    event.preventDefault();

  const {error} = await supabase.from("posts").insert({
    user_id: session.sub, 
    content: content
  });

  if (!error) setContent("");

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
    </div>
   



  );


}