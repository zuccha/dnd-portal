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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: Infinity,
    },
  },
});
