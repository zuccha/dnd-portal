import { createClient } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";

//------------------------------------------------------------------------------
// Supabase
//------------------------------------------------------------------------------

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default supabase;

//------------------------------------------------------------------------------
// Query Client
//------------------------------------------------------------------------------

export const supabaseQueryClient = new QueryClient();
