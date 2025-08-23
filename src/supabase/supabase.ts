import { createClient, type Session } from "@supabase/supabase-js";
import { useLayoutEffect, useState } from "react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default supabase;

export function useSession() {
  const [session, setSession] = useState<Session | undefined>(undefined);

  useLayoutEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session ?? undefined));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session ?? undefined)
    );

    return subscription.unsubscribe;
  }, []);

  return session;
}

export async function signInWithDiscord() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: window.location.origin,
      scopes: "identify email",
    },
  });
  if (error) console.error(error);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error(error);
}
