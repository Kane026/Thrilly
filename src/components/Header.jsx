import { supabase } from "../supabase";

export default function Header() {

    return(

        <button onClick={() => supabase.auth.signOut()}>Logout</button>
    );

}